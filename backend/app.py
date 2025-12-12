import secrets
import time

from flask import Flask, jsonify, request
from flask import send_from_directory
from flask_cors import CORS
from flask_jwt_extended import create_access_token, jwt_required, JWTManager, get_jwt_identity
from db import init_db, query_one, query_all, execute, get_average_rating, now_iso
from models import from_json_list, to_json_list
from werkzeug.security import check_password_hash, generate_password_hash
from datetime import timedelta
from admin_users import admin_users_bp
from users import users_bp
from admin_allergens import admin_allergens_bp


app = Flask(__name__)
app.register_blueprint(admin_users_bp)
app.register_blueprint(users_bp)
CORS(app)

app.config["JWT_SECRET_KEY"] = "nagyon-titkos-receptek-kulcsa-ne-add-ki!"
app.config["JWT_ACCESS_TOKEN_EXPIRES"] = timedelta(hours=24)
jwt = JWTManager(app)

@jwt.unauthorized_loader
def unauthorized_callback(reason):
    if request.method == "OPTIONS":
        return "", 200
    return jsonify(msg=reason), 401

@jwt.invalid_token_loader
def invalid_token_callback(reason):
    if request.method == "OPTIONS":
        return "", 200
    return jsonify(msg=reason), 422



@app.route("/api/images/<filename>")
def serve_image(filename):
    return send_from_directory("static/images", filename)


@app.route("/health", methods=["GET"])
def health():
    return jsonify({"ok": True})


@app.route("/login", methods=["POST"])
def login():
    data = request.get_json()
    email = data.get("email")
    password = data.get("password")

    if not email or not password:
        return jsonify({"msg": "Hiányzó email vagy jelszó"}), 400

    user_row = query_one("SELECT * FROM users WHERE email = ?", (email,))

    if user_row and check_password_hash(user_row["password_hash"], password):
        access_token = create_access_token(identity=str(user_row["id"]))
        return jsonify(
            access_token=access_token,
            user_id=user_row["id"],
            email=user_row["email"],
            name=user_row["name"],
            is_admin = user_row["is_admin"] if "is_admin" in user_row.keys() else 0
        )
    else:
        return jsonify({"msg": "Helytelen email vagy jelszó"}), 401
    


@app.route("/recipes", methods=["GET"])
@jwt_required()
def list_recipes():
    search = request.args.get("q")
    include_allergens = request.args.get("allergens")  # e.g. "GL,MI"
    exclude_allergens = request.args.get("exclude")    # e.g. "EG,PN"
    favorites_only = request.args.get("favorites") == "true"
    user_id = request.args.get("user_id")
    own = request.args.get("own") == "true"

    if not user_id:
        user_id = get_jwt_identity()

    params = []
    where_clauses = []

    # --- User filter ---
    if own:
        where_clauses.append("r.author_id = ?")
        params.append(user_id)


    # --- Favorites filter ---
    if favorites_only:
        where_clauses.append("r.id IN (SELECT recipe_id FROM favorites WHERE user_id = ?)")
        params.append(user_id)


    # --- Base search filter ---
    if search:
        wildcard = f"%{search}%"
        where_clauses.append("(r.title LIKE ? OR r.ingredients LIKE ? OR r.steps LIKE ? OR r.summary LIKE ?)")
        params.extend([wildcard, wildcard, wildcard, wildcard])
        
    # --- Base SELECT with joins ---
    base_query = """
        SELECT r.*, a.code AS allergen_code, a.name AS allergen_name, a.description AS allergen_description
        FROM recipes r
        LEFT JOIN recipe_allergens ra ON r.id = ra.recipe_id
        LEFT JOIN allergens a ON ra.allergen_id = a.id
    """

    # --- Inclusion filter (recipes containing certain allergens) ---
    if include_allergens:
        codes = [code.strip() for code in include_allergens.split(",") if code.strip()]
        placeholders = ",".join("?" for _ in codes)
        where_clauses.append(f"r.id IN ("
                             f"SELECT ra.recipe_id FROM recipe_allergens ra "
                             f"JOIN allergens a ON ra.allergen_id = a.id "
                             f"WHERE a.code IN ({placeholders})"
                             f")")
        params.extend(codes)

    # --- Exclusion filter (recipes without certain allergens) ---
    if exclude_allergens:
        codes = [code.strip() for code in exclude_allergens.split(",") if code.strip()]
        placeholders = ",".join("?" for _ in codes)
        where_clauses.append(f"r.id NOT IN ("
                             f"SELECT ra.recipe_id FROM recipe_allergens ra "
                             f"JOIN allergens a ON ra.allergen_id = a.id "
                             f"WHERE a.code IN ({placeholders})"
                             f")")
        params.extend(codes)

    # --- Combine WHERE clause if needed ---
    if where_clauses:
        base_query += " WHERE " + " AND ".join(where_clauses)

    base_query += " ORDER BY r.id DESC"

    recipes_rows = query_all(base_query, tuple(params))

     #--- Load user favorites if user_id is given ---
    user_favorites = set()
    fav_query = "SELECT recipe_id FROM favorites"
    if user_id:
        fav_query += f" WHERE user_id = {user_id}"
    fav_rows = query_all(fav_query)                    
                         
                          
    user_favorites = {row["recipe_id"] for row in fav_rows}


    # --- Group joined results by recipe_id ---
    recipes_dict = {}
    for row in recipes_rows:
        rid = row["id"]
        if rid not in recipes_dict:
            recipe = {key: row[key] for key in row.keys() if not key.startswith("allergen_")}
            recipe["ingredients"] = from_json_list(recipe["ingredients"])
            recipe["steps"] = from_json_list(recipe["steps"])
            recipe["allergens"] = []
            ##recipe["image_url"] = f"http://localhost:8000/static/images/{recipe["image_url"]}"
            recipe["average_rating"] = get_average_rating(rid)
            recipe["is_favorite"] = (rid in user_favorites)
            recipes_dict[rid] = recipe

        # Append allergen info if present
        if row["allergen_code"]:
            recipes_dict[rid]["allergens"].append({
                "code": row["allergen_code"],
                "name": row["allergen_name"],
                "description": row["allergen_description"],
            }
            )

    return jsonify({"recipes": list(recipes_dict.values())})



@app.route("/recipes", methods=["POST"])
@jwt_required()
def create_recipe():
    current_user_id = get_jwt_identity()
    data = request.get_json()

    if not data.get("title") or not data.get("ingredients") or not data.get("steps"):
        return jsonify({"msg": "Hiányzó kötelező mezők (title, ingredients, steps)."}), 400

    try:
        execute(
            """INSERT INTO recipes
               (title, summary, ingredients, steps, category, allergens, image_url, author_id, created_at)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)""",
            (
                data.get("title"),
                data.get("summary"),
                to_json_list(data.get("ingredients", [])),
                to_json_list(data.get("steps", [])),
                data.get("category"),
                to_json_list(data.get("allergens", [])),
                data.get("image_url"),
                current_user_id,
                now_iso(),
            ),
        )
        return jsonify({"msg": "Recept sikeresen megosztva."}), 201

    except Exception as e:
        return jsonify({"msg": f"Hiba a recept létrehozása közben: {str(e)}"}), 500


@app.route("/recipes/<int:recipe_id>/rate", methods=["POST"])
@jwt_required()
def rate_recipe(recipe_id):
    current_user_id = get_jwt_identity()
    data = request.get_json()
    rating = data.get("rating")

    if not rating or not (1 <= rating <= 5):
        return jsonify({"msg": "Az értékelésnek (rating) 1 és 5 közötti egész számnak kell lennie."}), 400

    execute(
        "INSERT OR REPLACE INTO ratings (user_id, recipe_id, rating) VALUES (?, ?, ?)",
        (current_user_id, recipe_id, rating),
    )

    new_avg = get_average_rating(recipe_id)

    return jsonify({
        "msg": "Értékelés sikeresen rögzítve/frissítve.",
        "recipe_id": recipe_id,
        "new_average_rating": new_avg
    }), 200


@app.route("/allergens", methods=["GET"])
def list_allergens():
    """
    Return the list of all allergens.
    Each allergen includes code, name, and description.
    """
    rows = query_all("SELECT id, code, name, description FROM allergens ORDER BY name ASC")
    allergens = [dict(row) for row in rows]

    if not allergens:
        return jsonify({"msg": "Nincsenek elérhető allergének."}), 404

    return jsonify({"allergens": allergens}), 200


@app.route("/favorites/<int:recipe_id>", methods=["POST"])
@jwt_required()
def add_favorite(recipe_id):
    user_id = int(get_jwt_identity())

    try:
        execute(
            "INSERT OR IGNORE INTO favorites (user_id, recipe_id) VALUES (?, ?)",
            (user_id, recipe_id),
        )
        return jsonify({"msg": "Favorit hozzáadva", "recipe_id": recipe_id}), 200

    except Exception as e:
        return jsonify({"msg": f"Hiba a kedvenc hozzáadásakor: {e}"}), 500
    

@app.route("/favorites/<int:recipe_id>", methods=["DELETE"])
@jwt_required()
def delete_favorite(recipe_id):
    user_id = int(get_jwt_identity())

    try:
        execute(
            "DELETE FROM favorites WHERE user_id = ? AND recipe_id = ?",
            (user_id, recipe_id),
        )
        return jsonify({"msg": "Favorit törölve", "recipe_id": recipe_id}), 200

    except Exception as e:
        return jsonify({"msg": f"Hiba a kedvenc törlésekor: {e}"}), 500


if __name__ == "__main__":
    init_db()
    app.run(host="127.0.0.1", port=8000, debug=True)