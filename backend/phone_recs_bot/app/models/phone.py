from pydantic import BaseModel
from typing import Optional, Dict, Any

class PhoneView(BaseModel):
    sourceId: str
    source: str
    url: str

    brand: Optional[str] = None
    modelName: Optional[str] = None
    os: Optional[str] = None
    has5g: Optional[bool] = None
    chipset: Optional[str] = None
    batteryMah: Optional[int] = None
    refreshRateHz: Optional[int] = None
    displaySizeIn: Optional[float] = None

    price_raw: Optional[str] = None
    price_min_usd: Optional[float] = None

    scrapedAt: Optional[str] = None

    # for debugging/explanations
    _score: Optional[float] = None
    _why: Optional[str] = None

    extra: Optional[Dict[str, Any]] = None