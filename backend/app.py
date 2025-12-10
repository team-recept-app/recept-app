from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_jwt_extended import create_access_token, jwt_required, JWTManager, get_jwt_identity
from db import init_db, query_one, query_all, execute, get_average_rating, now_iso
from models import from_json_list, to_json_list
from werkzeug.security import check_password_hash, generate_password_hash
from datetime import timedelta

app = Flask(__name__)
CORS(app)

app.config["JWT_SECRET_KEY"] = "nagyon-titkos-receptek-kulcsa-ne-add-ki!"
app.config["JWT_ACCESS_TOKEN_EXPIRES"] = timedelta(hours=24)
jwt = JWTManager(app)


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

    user_row = query_one("SELECT id, password_hash FROM users WHERE email = ?", (email,))

    if user_row and check_password_hash(user_row["password_hash"], password):
        access_token = create_access_token(identity=str(user_row["id"]))
        return jsonify(access_token=access_token)
    else:
        return jsonify({"msg": "Helytelen email vagy jelszó"}), 401

@app.route("/register", methods=["POST"])
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

@app.route("/recipes", methods=["GET"])
def list_recipes():
    search = request.args.get("q")
    include_allergens = request.args.get("allergens")  # e.g. "GL,MI"
    exclude_allergens = request.args.get("exclude")    # e.g. "EG,PN"

    params = []
    where_clauses = []

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

    # --- Group joined results by recipe_id ---
    recipes_dict = {}
    for row in recipes_rows:
        rid = row["id"]
        if rid not in recipes_dict:
            recipe = {key: row[key] for key in row.keys() if not key.startswith("allergen_")}
            recipe["ingredients"] = from_json_list(recipe["ingredients"])
            recipe["steps"] = from_json_list(recipe["steps"])
            recipe["allergens"] = []
            recipe["image_url"] = f"http://localhost:8000/static/images/{recipe["image_url"]}"
            recipe["average_rating"] = get_average_rating(rid)
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



if __name__ == "__main__":
    init_db()
    app.run(host="127.0.0.1", port=8000, debug=True)