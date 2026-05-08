from pydantic import BaseModel, Field
from typing import List, Dict, Any
from .prefs import PreferenceProfile

class ChatState(BaseModel):
    session_id: str
    profile: PreferenceProfile = Field(default_factory=PreferenceProfile)
    last_results: List[Dict[str, Any]] = Field(default_factory=list)