def test_health_check(client):
    """1. TESZT: Működik-e a /health végpont?"""
    
    # A robot "megnyitja" a /health oldalt
    rv = client.get('/health')
    
    # Ellenőrizzük, hogy a válasz "200 OK" volt-e
    assert rv.status_code == 200
    
    # Ellenőrizzük, hogy a tartalma a várt {"ok": True} volt-e
    assert rv.json == {"ok": True}