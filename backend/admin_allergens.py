from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from db import query_one, query_all, execute

admin_allergens_bp = Blueprint(
    "admin_allergens",
    __name__,
    url_prefix="/admin/allergens"
)


def require_admin():
    user_id = get_jwt_identity()
    user = query_one("SELECT is_admin FROM users WHERE id = ?", (user_id,))
    return bool(user and user["is_admin"] == 1)


