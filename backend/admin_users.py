from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from werkzeug.security import generate_password_hash

from db import query_one, query_all, execute, now_iso

admin_users_bp = Blueprint("admin_users", __name__, url_prefix="/admin/users")
#@admin_users_bp.route("", methods=["OPTIONS"])
#@admin_users_bp.route("/<int:user_id>", methods=["OPTIONS"])
#def admin_users_options(user_id=None):
#    return "", 200


def require_admin():
    user_id = get_jwt_identity()
    user = query_one("SELECT is_admin FROM users WHERE id = ?", (user_id,))
    if not user or user["is_admin"] != 1:
        return False
    return True


@admin_users_bp.route("", methods=["GET"])
@jwt_required()
def admin_list_users():
    if not require_admin():
        return jsonify({"msg": "Admin access required"}), 403

    rows = query_all("""
        SELECT id, email, name, is_admin, created_at
        FROM users
        ORDER BY id ASC
    """)

    users = [dict(row) for row in rows]
    return jsonify({"users": users})


@admin_users_bp.route("", methods=["POST"])
@jwt_required()
def admin_create_user():
    if not require_admin():
        return jsonify({"msg": "Admin access required"}), 403

    data = request.get_json() or {}

    email = data.get("email")
    name = data.get("name")
    password = data.get("password")
    is_admin = int(data.get("is_admin", 0))

    if not email or not name or not password:
        return jsonify({"msg": "Missing fields"}), 400

    if query_one("SELECT id FROM users WHERE email = ?", (email,)):
        return jsonify({"msg": "Email already exists"}), 409

    execute("""
        INSERT INTO users (email, name, password_hash, is_admin, created_at)
        VALUES (?, ?, ?, ?, ?)
    """, (
        email,
        name,
        generate_password_hash(password),
        is_admin,
        now_iso()
    ))

    return jsonify({"msg": "User created"}), 201


@admin_users_bp.route("/<int:user_id>", methods=["PUT"])
@jwt_required()
def admin_update_user(user_id):
    current_user_id = int(get_jwt_identity())

    if not require_admin():
        return jsonify({"msg": "Admin access required"}), 403

    data = request.get_json() or {}

    if (
        user_id == current_user_id
        and "is_admin" in data
        and int(data["is_admin"]) == 0
    ):
        return jsonify({
            "msg": "Saját admin jogosultság nem vonható vissza."
        }), 400



    fields = []
    params = []

    if "name" in data:
        fields.append("name = ?")
        params.append(data["name"])

    if "is_admin" in data:
        fields.append("is_admin = ?")
        params.append(int(data["is_admin"]))

    if "password" in data and data["password"]:
        fields.append("password_hash = ?")
        params.append(generate_password_hash(data["password"]))

    if not fields:
        return jsonify({"msg": "No fields to update"}), 400

    params.append(user_id)

    execute(
        f"UPDATE users SET {', '.join(fields)} WHERE id = ?",
        tuple(params)
    )

    return jsonify({"msg": "User updated"})


@admin_users_bp.route("/<int:user_id>", methods=["DELETE"])
@jwt_required()
def admin_delete_user(user_id):
    if not require_admin():
        return jsonify({"msg": "Admin access required"}), 403

    execute("DELETE FROM users WHERE id = ?", (user_id,))
    return jsonify({"msg": "User deleted"})