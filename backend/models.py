import json
from typing import List, Any

def to_json_list(data: List[Any]) -> str:
    if data is None:
        data = []
    return json.dumps(data, ensure_ascii=False)

def from_json_list(data: str) -> List[Any]:
    if not data:
        return []
    try:
        return json.loads(data)
    except json.JSONDecodeError:
        return []