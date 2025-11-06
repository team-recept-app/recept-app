import sqlite3
import pytest
from db import get_average_rating

@pytest.fixture
def setup_in_memory_db(monkeypatch):
    # Tesztadatbázis memória alapú SQLite-ban
    conn = sqlite3.connect(":memory:")
    conn.row_factory = sqlite3.Row
    cur = conn.cursor()
    cur.execute("""
        CREATE TABLE ratings (
            user_id INTEGER,
            recipe_id INTEGER,
            rating INTEGER
        )
    """)
    cur.executemany("INSERT INTO ratings VALUES (?, ?, ?)", [
        (1, 1, 5),
        (2, 1, 3),
        (3, 2, 4)
    ])
    conn.commit()

    # monkeypatch, hogy a db.get_conn() ezt a connectiont adja vissza
    def fake_get_conn():
        return conn

    monkeypatch.setattr("db.get_conn", fake_get_conn)
    yield conn
    conn.close()

def test_get_average_rating(setup_in_memory_db):
    avg = get_average_rating(1)
    assert avg == 4.0  # (5 + 3) / 2 = 4.0