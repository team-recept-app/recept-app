# Csak azt importáljuk, amit tesztelünk
from models import from_json_list

def test_from_json_list_mukodese():
    """
    Ez a teszt ellenőrzi, hogy a 'from_json_list'
    JSON szövegből helyesen csinál-e Python listát.
    """
    
    # Bemenet: Egy JSON szöveg
    my_json_string = '["alma", "körte", 123, true]'
    
    # Várt kimenet: Egy Python lista
    # (Figyeld meg, hogy a 'true' (JSON) 'True' (Python) lesz)
    expected_list = ["alma", "körte", 123, True]

    # Futtatás és ellenőrzés
    assert from_json_list(my_json_string) == expected_list


def test_from_json_list_ures_esetek():
    """
    Ez a teszt ellenőrzi, hogy a függvény
    jól kezeli-e az üres vagy hibás adatokat.
    """
    
    # Ha üres szöveget kap, üres listát várunk
    assert from_json_list("") == []
    
    # Ha None-t kap, üres listát várunk
    assert from_json_list(None) == []
    
    # Ha hibás, nem-JSON szöveget kap,
    # a try-except blokk miatt szintén üres listát várunk
    assert from_json_list("ez nem egy json") == []