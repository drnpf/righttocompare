import re
from datetime import datetime
from typing import Optional

_MONTHS = {
    "jan": 1, "january": 1,
    "feb": 2, "february": 2,
    "mar": 3, "march": 3,
    "apr": 4, "april": 4,
    "may": 5,
    "jun": 6, "june": 6,
    "jul": 7, "july": 7,
    "aug": 8, "august": 8,
    "sep": 9, "sept": 9, "september": 9,
    "oct": 10, "october": 10,
    "nov": 11, "november": 11,
    "dec": 12, "december": 12,
}


def parse_gsmarena_announced(text: Optional[str]) -> Optional[datetime]:
    """
    Examples seen on GSMArena:
      - "2023, September"
      - "2024, January 17"
      - "2022, May"
      - "Not announced yet"
    Returns a naive datetime (UTC assumed later) suitable for sorting.
    """
    if not text:
        return None

    t = text.strip()
    if not t or "not announced" in t.lower():
        return None

    # normalize commas
    t = t.replace(",", " ")
    t = re.sub(r"\s+", " ", t).strip()

    # Try patterns:
    # 1) YYYY Month DD
    m = re.match(r"^(?P<y>\d{4}) (?P<mon>[A-Za-z]+) (?P<d>\d{1,2})$", t)
    if m:
        y = int(m.group("y"))
        mon = _month_num(m.group("mon"))
        d = int(m.group("d"))
        if mon:
            return datetime(y, mon, d)

    # 2) YYYY Month
    m = re.match(r"^(?P<y>\d{4}) (?P<mon>[A-Za-z]+)$", t)
    if m:
        y = int(m.group("y"))
        mon = _month_num(m.group("mon"))
        if mon:
            return datetime(y, mon, 1)

    # 3) YYYY only
    m = re.match(r"^(?P<y>\d{4})$", t)
    if m:
        y = int(m.group("y"))
        return datetime(y, 1, 1)

    return None


def _month_num(mon: str) -> Optional[int]:
    key = mon.strip().lower()
    return _MONTHS.get(key)
