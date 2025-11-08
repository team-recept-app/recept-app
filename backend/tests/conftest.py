import pytest
from pathlib import Path

# Importáljuk az appot és a db modult
import app as flask_app
import db

@pytest.fixture(scope="function")
def client():
    """
    Egy alap teszt-kliens, adatbázis-kapcsolat NÉLKÜL.
    Tökéletes az egyszerű végpontokhoz, mint pl. /health.
    """
    flask_app.app.config["TESTING"] = True
    with flask_app.app.test_client() as test_client:
        yield test_client

@pytest.fixture(scope="function")
def empty_db_client(monkeypatch, tmp_path):
    """
    Egy teszt-kliens, ami egy ÜRES, ideiglenes adatbázist használ.
    Minden teszt tiszta, üres adatbázist kap.
    (Nem futtatja a seed.py-t!)
    """
    
    # 1. Hozzunk létre egy ideiglenes adatbázis fájlt
    temp_db_path = tmp_path / "test_db.sqlite"
    
    # 2. "Monkeypatching": felülírjuk az éles DB_PATH-t a teszt idejére
    # Így a 'db.py' (pl. init_db) már ezt fogja használni
    monkeypatch.setattr(db, "DB_PATH", temp_db_path)

    # 3. Állítsuk az appot "TESTING" módba
    flask_app.app.config["TESTING"] = True
    
    # 4. Hozzuk létre az ÜRES táblákat (pl. users, recipes)
    # FONTOS: Ez nem tölti fel adatokkal!
    db.init_db()

    # 5. Hozzuk létre a teszt klienst
    with flask_app.app.test_client() as test_client:
        yield test_client
    
    # 6. A teszt lefutása után a 'tmp_path' automatikusan törlődik