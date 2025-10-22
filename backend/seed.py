from db import init_db, query_one, query_all, execute, now_iso, get_average_rating
from models import to_json_list
from werkzeug.security import generate_password_hash

USERS = [
    {"email": "user1@example.com", "name": "Anna", "password": "password1"},
    {"email": "user2@example.com", "name": "Béla", "password": "password2"},
    {"email": "admin@example.com", "name": "Admin", "password": "adminpass"},
]

RECIPES = [
    {
        "title": "Gulyásleves",
        "summary": "Klasszikus magyar marhahúsleves.",
        "ingredients": ["marhahús", "burgonya", "sárgarépa", "hagyma", "pirospaprika"],
        "steps": ["Pirítsd a hagymát.", "Add hozzá a húst és a fűszereket.", "Öntsd fel vízzel és főzd puhára."],
        "category": "Levesek",
        "allergens": ["nincs"],
        "image_url": "gulyas.jpg",
        "author_email": "user1@example.com",
    },
    {
        "title": "Csirkepaprikás galuskával",
        "summary": "Finom paprikás csirke, nokedlivel.",
        "ingredients": ["csirkecomb", "hagyma", "pirospaprika", "tejföl", "liszt", "tojás"],
        "steps": ["Készítsd el a pörkölt alapot.", "Főzd a csirkét pirosra.", "Habard be a tejföllel.",
                  "Főzd ki a galuskát."],
        "category": "Főételek",
        "allergens": ["tej", "tojás", "glutén"],
        "image_url": "csirkepaprikas.jpg",
        "author_email": "admin@example.com",
    },
]


def ensure_user(email: str, name: str, password: str) -> int:
    user = query_one("SELECT id FROM users WHERE email = ?", (email,))
    if user:
        return user['id']

    password_hash = generate_password_hash(password)

    execute(
        "INSERT INTO users (email, name, password_hash, created_at) VALUES (?, ?, ?, ?)",
        (email, name, password_hash, now_iso()),
    )
    return query_one("SELECT id FROM users WHERE email = ?", (email,))['id']


def ensure_recipes():
    count = query_one("SELECT COUNT(*) AS c FROM recipes")['c']
    if count > 0:
        return

    for r in RECIPES:
        author = query_one("SELECT id FROM users WHERE email = ?", (r["author_email"],))
        if not author:
            continue
        author_id = author["id"]

        execute(
            """INSERT INTO recipes
               (title, summary, ingredients, steps, category, allergens, image_url, author_id, created_at)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)""",
            (
                r["title"],
                r["summary"],
                to_json_list(r["ingredients"]),
                to_json_list(r["steps"]),
                r["category"],
                to_json_list(r["allergens"]),
                r["image_url"],
                author_id,
                now_iso(),
            ),
        )


def main():
    init_db()

    ids = []
    for u in USERS:
        uid = ensure_user(u["email"], u["name"], u["password"])
        ids.append(uid)

    ensure_recipes()

    execute("INSERT OR REPLACE INTO ratings (user_id, recipe_id, rating) VALUES (?, ?, ?)", (1, 2, 5))
    execute("INSERT OR REPLACE INTO ratings (user_id, recipe_id, rating) VALUES (?, ?, ?)", (3, 2, 4))

    users = query_all("SELECT id, email, name FROM users ORDER BY id")
    recipes = query_all("SELECT id, title, author_id FROM recipes ORDER BY id")

    print("Seed kész.")
    print("\n--- Felhasználók ---")
    for u in users:
        print(f"  - #{u['id']} {u['name']} <{u['email']}>")
    print("\n--- Receptek ---")
    for r in recipes:
        avg_rating = get_average_rating(r['id'])
        print(f"  - #{r['id']} {r['title']} (Author ID: {r['author_id']}, Átlag Értékelés: {avg_rating})")


if __name__ == "__main__":
    main()