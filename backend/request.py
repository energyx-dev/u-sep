from pydantic import BaseModel
from typing import Any, Dict

class EngineData(BaseModel):
    name: str
    item: Dict[str, Any]

class EngineRequest(BaseModel):
    before: EngineData
    after: EngineData