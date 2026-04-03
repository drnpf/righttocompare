from dataclasses import dataclass, asdict
from datetime import datetime, timezone
from typing import Any, Dict, Optional, List


@dataclass
class ScrapeOutput:
    source: str
    url: str
    sourceId: str
    scrapedAt: datetime

    extracted: Dict[str, Any]
    raw: Dict[str, Any]

    status: str = "new"

    def to_mongo(self) -> dict:
        d = asdict(self)
        # Ensure timezone-aware datetime
        if d.get("scrapedAt") and d["scrapedAt"].tzinfo is None:
            d["scrapedAt"] = d["scrapedAt"].replace(tzinfo=timezone.utc)
        return d


def now_utc() -> datetime:
    return datetime.now(timezone.utc)
