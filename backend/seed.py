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
        "steps": [
            "Pirítsd a hagymát.",
            "Add hozzá a húst és a fűszereket.",
            "Öntsd fel vízzel és főzd puhára."
        ],
        "category": "Levesek",
        "image_url": "gulyas.jpg",
        "author_email": "user1@example.com",
    },
    {
        "title": "Csirkepaprikás galuskával",
        "summary": "Finom paprikás csirke, nokedlivel.",
        "ingredients": ["csirkecomb", "hagyma", "pirospaprika", "tejföl", "liszt", "tojás"],
        "steps": [
            "Készítsd el a pörkölt alapot.",
            "Főzd a csirkét pirosra.",
            "Habard be a tejföllel.",
            "Főzd ki a galuskát."
        ],
        "category": "Főételek",
        "image_url": "csirkepaprikas.jpg",
        "author_email": "admin@example.com",
    },
    {
        "title": "Lecsó kolbásszal",
        "summary": "Egyszerű, nyári magyar étel friss paprikából és paradicsomból.",
        "ingredients": ["paprika", "paradicsom", "vöröshagyma", "kolbász", "tojás"],
        "steps": [
            "Pirítsd meg a hagymát.",
            "Add hozzá a felkarikázott kolbászt és a paprikát.",
            "Tedd bele a paradicsomot és főzd össze.",
            "Törd bele a tojásokat, ha szereted."
        ],
        "category": "Főételek",
        "image_url": "lecso.jpg",
        "author_email": "user2@example.com",
    },
    {
        "title": "Hortobágyi palacsinta",
        "summary": "Húsos palacsinta paprikás szósszal leöntve.",
        "ingredients": ["liszt", "tojás", "tej", "darált hús", "pirospaprika", "tejföl"],
        "steps": [
            "Süss palacsintákat.",
            "Készítsd el a tölteléket pörkölt alapból.",
            "Töltsd meg és tekerd fel a palacsintákat.",
            "Öntsd le paprikás-tejfölös szósszal és süsd össze."
        ],
        "category": "Főételek",
        "image_url": "hortobagyi.jpg",
        "author_email": "user1@example.com",
    },
    {
        "title": "Rakott krumpli",
        "summary": "Klasszikus magyar egytálétel kolbásszal és tojással.",
        "ingredients": ["burgonya", "tojás", "kolbász", "tejföl", "vaj"],
        "steps": [
            "Főzd meg a krumplit és a tojásokat.",
            "Rétegezd a krumplit, tojást, kolbászt és tejfölt.",
            "Süsd össze a sütőben aranybarnára."
        ],
        "category": "Főételek",
        "image_url": "rakottkrumpli.jpg",
        "author_email": "user2@example.com",
    },
    {
        "title": "Töltött káposzta",
        "summary": "Savanyú káposztába töltött darált hús, füstölt ízekkel.",
        "ingredients": ["savanyú káposzta", "darált hús", "rizs", "fűszerek", "szalonna"],
        "steps": [
            "Keverd össze a húst a rizzsel és fűszerekkel.",
            "Töltsd a káposztalevelekbe.",
            "Rendezd fazékba és főzd lassan, paprikás lében."
        ],
        "category": "Főételek",
        "image_url": "toltottkaposzta.jpg",
        "author_email": "admin@example.com",
    },
    {
        "title": "Húsleves gazdagon",
        "summary": "Minden vasárnap alapja: zöldséges marhahúsleves.",
        "ingredients": ["marhahús", "sárgarépa", "fehérrépa", "zeller", "karalábé", "tészta"],
        "steps": [
            "Tisztítsd meg a zöldségeket.",
            "Tedd fel a húst hideg vízben főni.",
            "Lassan főzd, majd add hozzá a zöldségeket.",
            "Tálald főtt tésztával."
        ],
        "category": "Levesek",
        "image_url": "husleves.jpg",
        "author_email": "user1@example.com",
    },
    {
        "title": "Somlói galuska",
        "summary": "Csábító magyar desszert piskótával, dióval és csokoládéöntettel.",
        "ingredients": ["piskóta", "dió", "mazsola", "csokoládé", "tejszín"],
        "steps": [
            "Rétegezd a piskótát, diót és mazsolát.",
            "Locsold meg csokoládéöntettel.",
            "Tálaláskor adj hozzá tejszínhabot."
        ],
        "category": "Desszertek",
        "image_url": "somloi.jpg",
        "author_email": "admin@example.com",
    },
    {
        "title": "Palacsinta",
        "summary": "Egyszerű, klasszikus palacsinta lekvárral vagy nutellával.",
        "ingredients": ["liszt", "tojás", "tej", "cukor", "olaj"],
        "steps": [
            "Keverd össze az alapanyagokat.",
            "Süsd ki forró serpenyőben.",
            "Töltsd meg ízlés szerint."
        ],
        "category": "Desszertek",
        "image_url": "palacsinta.jpg",
        "author_email": "user2@example.com",
    },
    {
        "title": "Paprikás krumpli",
        "summary": "Gyors és laktató étel burgonyából, kolbásszal.",
        "ingredients": ["burgonya", "kolbász", "pirospaprika", "hagyma"],
        "steps": [
            "Pirítsd meg a hagymát és a kolbászt.",
            "Add hozzá a paprikát, majd a felkockázott krumplit.",
            "Öntsd fel vízzel és főzd puhára."
        ],
        "category": "Főételek",
        "image_url": "paprikaskrumpli.jpg",
        "author_email": "user1@example.com",
    },
]

ALLERGENS = [
    ("GL", "Glutén", "Tartalmaz búzát, árpát, rozst, zabot, tönkölyt vagy ezek hibridjeit"),
    ("CR", "Rákfélék", "Tartalmaz rákféléket, például garnélát, homárt vagy rákot"),
    ("EG", "Tojás", "Tartalmaz tojást vagy tojást tartalmazó terméket"),
    ("FI", "Hal", "Tartalmaz halat vagy halból készült terméket"),
    ("PN", "Földimogyoró", "Tartalmaz földimogyorót vagy földimogyoró-alapú összetevőt"),
    ("SO", "Szója", "Tartalmaz szóját vagy szójából származó terméket"),
    ("MI", "Tej", "Tartalmaz tejet vagy tejterméket"),
    ("NU", "Diófélék", "Tartalmaz mandulát, mogyorót, diót, kesudiót, pekándiót stb."),
    ("CE", "Zeller", "Tartalmaz zellert vagy zellerből készült összetevőt"),
    ("MU", "Mustár", "Tartalmaz mustárt vagy mustárt tartalmazó terméket"),
    ("SE", "Szezámmag", "Tartalmaz szezámmagot vagy szezámolajat"),
    ("SU", "Kén-dioxid és szulfitok", "Tartalmaz kén-dioxidot vagy szulfitokat (10 mg/kg felett)"),
    ("LU", "Csillagfürt", "Tartalmaz csillagfürtöt vagy abból készült terméket"),
    ("MO", "Puhatestűek", "Tartalmaz puhatestűeket, például kagylót, tintahalat vagy polipot")
]

RECIPE_ALLERGENS = [
    # (recipe_id, allergen_code)
    (1, "GL"),  # Gulyásleves – liszt a rántásban
    (1, "CE"),  # Gulyásleves – zeller

    (2, "GL"),  # Csirkepaprikás – liszt a galuskában
    (2, "EG"),  # Csirkepaprikás – tojás a galuskában
    (2, "MI"),  # Csirkepaprikás – tejföl

    (3, "EG"),  # Lecsó – tojás hozzáadható
    (3, "PN"),  # Lecsó – egyes kolbászok mogyoróolajat tartalmazhatnak (lehetséges allergén)

    (4, "GL"),  # Hortobágyi palacsinta – palacsinta tészta (liszt)
    (4, "EG"),  # Hortobágyi palacsinta – tojás
    (4, "MI"),  # Hortobágyi palacsinta – tej, tejföl

    (5, "EG"),  # Rakott krumpli – főtt tojás
    (5, "MI"),  # Rakott krumpli – tejföl, vaj

    (6, "CE"),  # Töltött káposzta – zeller a fűszerezésben
    (6, "SU"),  # Töltött káposzta – savanyú káposzta tartalmazhat szulfitokat

    (7, "CE"),  # Húsleves – zeller
    (7, "GL"),  # Húsleves – tészta (búzaliszt)

    (8, "GL"),  # Somlói galuska – piskóta (liszt)
    (8, "EG"),  # Somlói galuska – tojás
    (8, "MI"),  # Somlói galuska – tejszín
    (8, "NU"),  # Somlói galuska – dió

    (9, "GL"),  # Palacsinta – liszt
    (9, "EG"),  # Palacsinta – tojás
    (9, "MI"),  # Palacsinta – tej

    (10, "GL"),  # Paprikás krumpli – kolbász tartalmazhat lisztet
]

RATINGS = [
    (1, 2, 5),
    (3, 2, 4),
]


FAVORITES = [
    # user_id, recipe_id
    (1, 1),  # Anna kedvencei
    (1, 4),
    (1, 8),

    (2, 3),  # Béla kedvencei
    (2, 5),

    (3, 2),  # Admin kedvencei
    (3, 6),
    (3, 10),
]


def ensure_users():
    """Seeds the users table if it's empty."""
    count = query_one("SELECT COUNT(*) AS c FROM users")['c']
    if count > 0:
        return

    for u in USERS:
        password_hash = generate_password_hash(u["password"])
        execute(
            "INSERT INTO users (email, name, password_hash, created_at) VALUES (?, ?, ?, ?)",
            (u["email"], u["name"], password_hash, now_iso()),
        )

    print("✅ Users seeded.")

def ensure_allergens():
    """Seeds the allergens table if it's empty."""
    count = query_one("SELECT COUNT(*) AS c FROM allergens")['c']
    if count > 0:
        return

    for code, name, description in ALLERGENS:
        execute(
            "INSERT INTO allergens (code, name, description) VALUES (?, ?, ?)",
            (code, name, description),
        )

    print("✅ Allergens seeded.")


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
               (title, summary, ingredients, steps, category, image_url, author_id, created_at)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?)""",
            (
                r["title"],
                r["summary"],
                to_json_list(r["ingredients"]),
                to_json_list(r["steps"]),
                r["category"],
                r["image_url"],
                author_id,
                now_iso(),
            ),
        )

def ensure_recipe_allergens():
    """Seeds the recipe_allergens junction table if it's empty."""
    count = query_one("SELECT COUNT(*) AS c FROM recipe_allergens")['c']
    if count > 0:
        return

    for recipe_id, allergen_code in RECIPE_ALLERGENS:
        allergen = query_one("SELECT id FROM allergens WHERE code = ?", (allergen_code,))
        if not allergen:
            continue

        execute(
            "INSERT INTO recipe_allergens (recipe_id, allergen_id) VALUES (?, ?)",
            (recipe_id, allergen["id"]),
        )

    print("✅ Recipe–Allergen links seeded.")

def ensure_ratings():
    """Seeds the ratings table if it's empty."""
    count = query_one("SELECT COUNT(*) AS c FROM ratings")['c']
    if count > 0:
        return

    for user_id, recipe_id, rating in RATINGS:
        execute(
            "INSERT OR REPLACE INTO ratings (user_id, recipe_id, rating) VALUES (?, ?, ?)",
            (user_id, recipe_id, rating),
        )

    print("✅ Ratings seeded.")


def ensure_favorites():
    """Seeds the favorites table if it's empty."""
    count = query_one("SELECT COUNT(*) AS c FROM favorites")['c']
    if count > 0:
        return

    for user_id, recipe_id in FAVORITES:
        execute(
            "INSERT INTO favorites (user_id, recipe_id) VALUES (?, ?)",
            (user_id, recipe_id),
        )

    print("✅ Favorites seeded.")


def main():
    init_db()

    ensure_users()
    ensure_allergens()
    ensure_recipes()
    ensure_recipe_allergens()
    ensure_ratings()
    ensure_favorites()

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