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



@admin_allergens_bp.route("", methods=["GET"])
@jwt_required()
def admin_list_allergens():
    if not require_admin():
        return jsonify({"msg": "Admin access required"}), 403

    rows = query_all("""
        SELECT id, code, name, description
        FROM allergens
        ORDER BY code ASC
    """)

    return jsonify({"allergens": [dict(r) for r in rows]})


@admin_allergens_bp.route("", methods=["POST"])
@jwt_required()
def admin_create_allergen():
    if not require_admin():
        return jsonify({"msg": "Admin access required"}), 403

    data = request.get_json() or {}
    code = data.get("code")
    name = data.get("name")
    description = data.get("description")

    if not code or not name:
        return jsonify({"msg": "Missing fields (code, name)"}), 400

    if query_one("SELECT id FROM allergens WHERE code = ?", (code,)):
        return jsonify({"msg": "Allergen code already exists"}), 409

    execute(
        "INSERT INTO allergens (code, name, description) VALUES (?, ?, ?)",
        (code.upper(), name, description),
    )

    return jsonify({"msg": "Allergen created"}), 201


@admin_allergens_bp.route("/<int:allergen_id>", methods=["PUT"])
@jwt_required()
def admin_update_allergen(allergen_id):
    if not require_admin():
        return jsonify({"msg": "Admin access required"}), 403

    data = request.get_json() or {}
    fields = []
    params = []

    if "code" in data:
        fields.append("code = ?")
        params.append(data["code"].upper())

    if "name" in data:
        fields.append("name = ?")
        params.append(data["name"])

    if "description" in data:
        fields.append("description = ?")
        params.append(data["description"])

    if not fields:
        return jsonify({"msg": "No fields to update"}), 400

    params.append(allergen_id)

    execute(
        f"UPDATE allergens SET {', '.join(fields)} WHERE id = ?",
        tuple(params),
    )

    return jsonify({"msg": "Allergen updated"})


@admin_allergens_bp.route("/<int:allergen_id>", methods=["DELETE"])
@jwt_required()
def admin_delete_allergen(allergen_id):
    if not require_admin():
        return jsonify({"msg": "Admin access required"}), 403

    execute("DELETE FROM allergens WHERE id = ?", (allergen_id,))
    return jsonify({"msg": "Allergen deleted"})
