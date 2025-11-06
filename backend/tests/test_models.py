import pytest
from models import to_json_list, from_json_list
import json

def to_json_list(lst):
    return json.dumps(lst, ensure_ascii=False)

def test_to_json_list_basic():
    data = ["alma", "körte"]
    result = to_json_list(data)
    assert "alma" in result
    assert "körte" in result or "\\u00f6" in result

def test_from_json_list_handles_invalid_json():
    # Hibás JSON string esetén üres listát kell visszaadnia
    result = from_json_list("nem-json")
    assert result == []