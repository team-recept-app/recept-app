import secrets
import time
from flask import Blueprint, Flask, jsonify, request
from flask import send_from_directory
from flask_cors import CORS
from flask_jwt_extended import create_access_token, jwt_required, JWTManager, get_jwt_identity
from db import init_db, query_one, query_all, execute, get_average_rating, now_iso
from models import from_json_list, to_json_list
from werkzeug.security import check_password_hash, generate_password_hash
from datetime import timedelta

users_bp = Blueprint("users", __name__, url_prefix="")


@users_bp.route("/me", methods=["GET"])
@jwt_required()
def me():
    user_id = get_jwt_identity()
    row = query_one("SELECT id, email, name FROM users WHERE id = ?", (user_id,))
    return jsonify({key: row[key] for key in row.keys()})

@users_bp.route("/register", methods=["POST"])
def register():
    """
    Create a new user account.
    Expected JSON:
      {
        "email": "user@example.com",
        "name": "Anna",
        "password": "secret123"
      }
    """
    data = request.get_json() or {}
    email = data.get("email")
    name = data.get("name")
    password = data.get("password")

    if not email or not name or not password:
        return jsonify({"msg": "Hiányzó mezők (email, name, password)."}), 400

    # 🔹 Check if user already exists
    existing = query_one("SELECT id FROM users WHERE email = ?", (email,))
    if existing:
        return jsonify({"msg": "Ez az email cím már regisztrálva van."}), 409

    password_hash = generate_password_hash(password)

    try:
        execute(
            "INSERT INTO users (email, name, password_hash, created_at) VALUES (?, ?, ?, ?)",
            (email, name, password_hash, now_iso()),
        )
    except Exception as e:
        return jsonify({"msg": f"Hiba a regisztráció során: {e}"}), 500

    new_user = query_one("SELECT id, email, name FROM users WHERE email = ?", (email,))
    if not new_user:
        return jsonify({"msg": "Hiba: az új felhasználó nem található a beszúrás után."}), 500

    return jsonify({
        "msg": "Sikeres regisztráció.",
        "user": {
            "id": new_user["id"],
            "email": new_user["email"],
            "name": new_user["name"]
        }
    }), 201



@users_bp.route("/forgot-password", methods=["POST"])
def forgot_password():
    
    email = request.get_json().get("email")

    user = query_one(
        "SELECT id FROM users WHERE email = ?",
        (email,)
    )

    # IMPORTANT: same response even if user does not exist
    if not user:
        return jsonify({"msg": "If the email exists, a reset link was sent"})

    reset_token = secrets.token_urlsafe(32)
    expiry = int(time.time()) + 30 * 60  # 30 minutes

    execute(
        "UPDATE users SET reset_token = ?, reset_token_expires_at = ? WHERE id = ?",
        (reset_token, expiry, user["id"])
    )

    reset_link = f"http://localhost:5173/reset-password?reset_token={reset_token}"

    send_email(
        to=email,
        subject="Password reset",
        body=f"Click here to reset your password:\n{reset_link}"
    )

    return jsonify({"msg": "If the email exists, a reset link was sent"})


@users_bp.route("/reset-password", methods=["POST"])
def reset_password():
    token = request.get_json().get("token")
    new_password = request.get_json().get("password")

    user = query_one(
        """
        SELECT id FROM users
        WHERE reset_token = ?
          AND reset_token_expires_at > ?
        """,
        (token, int(time.time()))
    )

    if not user:
        return jsonify({"msg": "Invalid or expired token"}), 400

    hashed = generate_password_hash(new_password)

    execute(
        """
        UPDATE users
        SET password_hash = ?, reset_token = NULL, reset_token_expires_at = NULL
        WHERE id = ?
        """,
        (hashed, user["id"])
    )

    return jsonify({"msg": "Password successfully reset"})


SMTP_HOST = "smtp.gmail.com"
SMTP_PORT = 587
SMTP_USER = "cipo.istvan@gmail.com"
SMTP_PASS = "ywsmvzpvpxnyjjgz"
FROM_EMAIL = SMTP_USER

import smtplib
from email.message import EmailMessage

def send_email(to: str, subject: str, body: str):
    msg = EmailMessage()
    msg["From"] = FROM_EMAIL
    msg["To"] = to
    msg["Subject"] = subject
    msg.set_content(body)

    with smtplib.SMTP(SMTP_HOST, SMTP_PORT) as server:
        server.starttls()
        server.login(SMTP_USER, SMTP_PASS)
        server.send_message(msg)