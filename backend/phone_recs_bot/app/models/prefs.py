from pydantic import BaseModel, Field
from typing import Optional, List

class Budget(BaseModel):
    max_amount: Optional[float] = None
    currency: str = "USD"

class PreferenceProfile(BaseModel):
    # Core
    budget: Budget = Field(default_factory=Budget)
    platform: Optional[str] = None  # "ios" | "android" | None
    priorities: List[str] = Field(default_factory=list)  # camera, battery, display, performance, value

    # Simple must-haves (match your extracted fields)
    must_5g: Optional[bool] = None
    must_nfc: Optional[bool] = None
    min_refresh_hz: Optional[int] = None
    min_display_in: Optional[float] = None
    max_display_in: Optional[float] = None

    weights: dict[str, float] = {
        "camera": 0.3,
        "battery": 0.3,
        "display": 0.3,
        "performance": 0.3,
        "value": 0.3,
    }

    # Avoid
    avoid_brands: List[str] = Field(default_factory=list)

    # Optional
    notes: List[str] = Field(default_factory=list)