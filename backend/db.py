import sqlite3
from pathlib import Path
from datetime import datetime
from typing import Any, List, Tuple

DB_PATH = Path(__file__).parent / "db.sqlite"


def get_conn() -> sqlite3.Connection:
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    conn = get_conn()
    cur = conn.cursor()

    cur.execute("""
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        name TEXT NOT NULL,
        is_admin  INTEGER NOT NULL DEFAULT 0,
        password_hash TEXT NOT NULL,
        created_at TEXT NOT NULL,
        reset_token TEXT,
        reset_token_expires_at INTEGER
        
    );
    """)

    cur.execute("""
    CREATE TABLE IF NOT EXISTS recipes (
        id INTEGER PRIMARY KEY,
        title TEXT NOT NULL,
        summary TEXT,
        ingredients TEXT,
        steps TEXT,
        category TEXT,
        image_url TEXT,
        author_id INTEGER NOT NULL,
        created_at TEXT NOT NULL,
        FOREIGN KEY(author_id) REFERENCES users(id)
    );
    """)

    cur.execute("""
    CREATE TABLE IF NOT EXISTS allergens (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        code TEXT UNIQUE NOT NULL,
        name TEXT NOT NULL,
        description TEXT
    );
    """)

    cur.execute("""
    CREATE TABLE IF NOT EXISTS recipe_allergens (
        recipe_id INTEGER NOT NULL,
        allergen_id INTEGER NOT NULL,
        PRIMARY KEY (recipe_id, allergen_id),
        FOREIGN KEY (recipe_id) REFERENCES recipes (id) ON DELETE CASCADE,
        FOREIGN KEY (allergen_id) REFERENCES allergens (id) ON DELETE CASCADE
    );
    """)

    cur.execute("""
    CREATE TABLE IF NOT EXISTS ratings (
        user_id INTEGER NOT NULL,
        recipe_id INTEGER NOT NULL,
        rating INTEGER NOT NULL,
        PRIMARY KEY (user_id, recipe_id),
        FOREIGN KEY(user_id) REFERENCES users(id),
        FOREIGN KEY(recipe_id) REFERENCES recipes(id),
        CHECK (rating >= 1 AND rating <= 5)
    );
    """)

    cur.execute("""
    CREATE TABLE IF NOT EXISTS favorites (
        user_id INTEGER NOT NULL,
        recipe_id INTEGER NOT NULL,
        PRIMARY KEY (user_id, recipe_id),
        FOREIGN KEY(user_id) REFERENCES users(id),
        FOREIGN KEY(recipe_id) REFERENCES recipes(id)
    );
    """)

    conn.commit()
    conn.close()


def execute(sql: str, params: Tuple = ()) -> None:
    conn = get_conn()
    cur = conn.cursor()
    cur.execute(sql, params)
    conn.commit()
    conn.close()


def query_all(sql: str, params: Tuple = ()) -> List[sqlite3.Row]:
    conn = get_conn()
    cur = conn.cursor()
    cur.execute(sql, params)
    rows = cur.fetchall()
    conn.close()
    return rows


def query_one(sql: str, params: Tuple = ()) -> sqlite3.Row | None:
    conn = get_conn()
    cur = conn.cursor()
    cur.execute(sql, params)
    row = cur.fetchone()
    conn.close()
    return row


def now_iso() -> str:
    return datetime.now().isoformat()


def get_average_rating(recipe_id: int) -> float | None:
    sql = "SELECT AVG(rating) AS avg_rating FROM ratings WHERE recipe_id = ?"
    row = query_one(sql, (recipe_id,))

    if row and row['avg_rating'] is not None:
        return round(row['avg_rating'], 2)
    return None