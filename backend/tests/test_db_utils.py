import re
from db import now_iso
from datetime import datetime

# Reguláris kifejezés, ami ellenőrzi az ISO 8601 formátumot 
# (pl. "2025-11-08T14:30:00.123456")
ISO_FORMAT_REGEX = r'^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?$'

def test_now_iso_format():
    """
    Ez a teszt ellenőrzi, hogy a db.now_iso() függvény
    megfelelő formátumú dátumot ad-e vissza.
    
    Ennek a tesztnek NINCS szüksége sem Flaskra, sem adatbázisra.
    """
    
    # 1. Lefuttatjuk a tesztelendő függvényt
    timestamp_string = now_iso()
    
    # 2. Ellenőrizzük, hogy az eredmény egy szöveg-e
    assert isinstance(timestamp_string, str)
    
    # 3. Ellenőrizzük, hogy a szöveg formátuma megfelel-e az ISO szabványnak
    assert re.match(ISO_FORMAT_REGEX, timestamp_string) is not None
    
    # 4. (Bónusz) Ellenőrizzük, hogy a dátum "hihető-e" 
    # (nem pl. 1970-ből való)
    assert timestamp_string.startswith("202")