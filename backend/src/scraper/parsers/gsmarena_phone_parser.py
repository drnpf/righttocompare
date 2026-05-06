import re
from typing import Any, Dict, Optional, Tuple

from bs4 import BeautifulSoup

from ..models import ScrapeOutput, now_utc
from ..utils.slug import gsmarena_source_id_from_url
from ..utils.dates import parse_gsmarena_announced
from ..utils.http import HttpClient


def _parse_spec_tables(soup: BeautifulSoup) -> Dict[str, Dict[str, str]]:
    """
    Returns a dict like:
    {
      "Launch": {"Announced": "2023, September", "Status": "..."},
      "Platform": {...},
      ...
    }
    """
    out: Dict[str, Dict[str, str]] = {}
    for table in soup.select("table"):
        th = table.find("th")
        section = th.get_text(strip=True) if th else None
        if not section:
            continue

        sec: Dict[str, str] = {}
        for row in table.select("tr"):
            ttl = row.select_one("td.ttl")
            nfo = row.select_one("td.nfo")
            if not ttl or not nfo:
                continue
            key = ttl.get_text(" ", strip=True)
            val = nfo.get_text(" ", strip=True)
            if key and val:
                sec[key] = val

        if sec:
            out[section] = sec

    return out

def quick_get_tables(http: HttpClient, url: str) -> Dict[str, Dict[str, str]]:
    """
    Fetch and parse spec tables only (fast-ish) for filtering/sorting.
    """
    html = http.get_text(url)
    soup = BeautifulSoup(html, "lxml")
    return _parse_spec_tables(soup)


def is_phone_only_device(raw_tables: Dict[str, Dict[str, str]], model_name: Optional[str] = None) -> bool:
    """
    Phones-only filter:
    - Exclude obvious non-phones by name (ipad/tablet/watch/etc.)
    - Exclude large displays (tablets) by screen size threshold
    - Require some cellular tech markers (keeps out Wi-Fi-only devices)
    """
    # 1) Name-based denylist (very effective for Apple)
    if model_name:
        name = model_name.lower()
        deny = ["ipad", "watch", "tab", "tablet", "macbook", "laptop"]
        if any(d in name for d in deny):
            return False

    # 2) Screen size threshold (phones typically <= ~7.5")
    display = raw_tables.get("Display", {}) or {}
    size_str = display.get("Size") or ""
    size_in = _extract_display_size_inches(size_str)
    if size_in is not None and size_in > 7.5:
        return False

    # 3) Cellular marker check (keep the old idea, but not alone)
    network = raw_tables.get("Network", {}) or {}
    tech = (network.get("Technology") or "").lower()
    if not tech:
        return False

    phone_markers = ["gsm", "cdma", "umts", "hspa", "lte", "5g", "evdo"]
    return any(m in tech for m in phone_markers)


def _title_brand_model(soup: BeautifulSoup) -> Tuple[Optional[str], Optional[str]]:
    h1 = soup.select_one("h1.specs-phone-name-title") or soup.select_one("h1")
    if not h1:
        return None, None
    full = h1.get_text(" ", strip=True).strip()
    parts = full.split()
    brand = parts[0] if parts else None
    model = full
    return brand, model


def _extract_battery_mah(raw_battery_type: Optional[str]) -> Optional[int]:
    if not raw_battery_type:
        return None
    m = re.search(r"(\d{3,5})\s*mAh", raw_battery_type, flags=re.IGNORECASE)
    return int(m.group(1)) if m else None


def _extract_refresh_rate(display_type: Optional[str]) -> Optional[int]:
    if not display_type:
        return None
    m = re.search(r"(\d{2,3})\s*Hz", display_type, flags=re.IGNORECASE)
    return int(m.group(1)) if m else None


def _extract_display_size_inches(display_size: Optional[str]) -> Optional[float]:
    """
    GSMArena 'Size' often looks like:
      '6.1 inches, 91.3 cm2 (~87.1% screen-to-body ratio)'
    We'll parse the leading float.
    """
    if not display_size:
        return None
    m = re.search(r"(\d+(?:\.\d+)?)\s*inches", display_size, flags=re.IGNORECASE)
    return float(m.group(1)) if m else None


def _infer_has5g(raw_tables: Dict[str, Dict[str, str]]) -> bool:
    """
    Best-effort detection: check Network->Technology or Network->5G bands.
    """
    network = raw_tables.get("Network", {}) or {}
    tech = (network.get("Technology") or "").lower()
    if "5g" in tech:
        return True
    bands_5g = (network.get("5G bands") or "").lower()
    return ("5g" in bands_5g) or ("n" in bands_5g and len(bands_5g) > 0)


# ---------------- PRICE EXTRACTION ----------------

_CURRENCY_CODES = {"USD", "EUR", "GBP", "INR", "CNY", "JPY", "KRW", "AUD", "CAD"}


def _parse_prices_multi(price_raw: str) -> list[dict]:
    """
    Parses strings like:
      "$ 417.18 / C$ 719.00 / £ 450.00 / € 572.89"
      "About 999 USD"
      "€ 1,199.00"
    Returns a list of {amount, currency} entries.
    """
    import re

    s = price_raw.strip()

    # Normalize weird thin spaces that GSMArena sometimes uses
    s = s.replace("\u2009", " ").replace("\u202f", " ")
    s = re.sub(r"\s+", " ", s)

    parts = [p.strip() for p in s.split("/") if p.strip()]
    out: list[dict] = []

    for p in parts:
        currency = None

        # detect currency from symbols / prefixes
        if "C$" in p:
            currency = "CAD"
        elif "A$" in p:
            currency = "AUD"
        elif "€" in p:
            currency = "EUR"
        elif "£" in p:
            currency = "GBP"
        elif "₹" in p:
            currency = "INR"
        elif "¥" in p:
            currency = "JPY"
        elif "$" in p:
            currency = "USD"

        # detect 3-letter code too (e.g., "999 USD")
        mcode = re.search(r"\b([A-Z]{3})\b", p)
        if mcode and mcode.group(1) in _CURRENCY_CODES:
            currency = mcode.group(1)

        # amount
        mamt = re.search(r"(\d[\d,]*(?:\.\d+)?)", p)
        if not mamt:
            continue
        amt_str = mamt.group(1).replace(",", "")
        try:
            amount = float(amt_str)
        except ValueError:
            continue

        out.append({"amount": amount, "currency": currency})

    # If nothing matched, just return an empty list.
    # The raw price string is still preserved in _extract_price().
    if not out:
        return []

    return out


def _extract_price(raw_tables: Dict[str, Dict[str, str]]) -> Optional[dict]:
    misc = raw_tables.get("Misc", {}) or {}
    price_raw = misc.get("Price")
    if not price_raw:
        return None

    prices = _parse_prices_multi(price_raw)

    return {
        "type": "msrp_or_estimate",
        "raw": price_raw,
        "prices": prices,  # list of {amount, currency}
    }

def _extract_network_bands(raw_tables: Dict[str, Dict[str, str]]) -> dict:
    network = raw_tables.get("Network", {}) or {}

    return {
        "bands2G": network.get("2G bands"),
        "bands3G": network.get("3G bands"),
        "bands4G": network.get("4G bands"),
        "bands5G": network.get("5G bands"),
    }


def _extract_benchmarks(raw_tables: Dict[str, Dict[str, str]]) -> dict:
    tests = raw_tables.get("Tests", {}) or {}

    benchmark_text = " ".join(str(v) for v in tests.values())

    antutu = None
    geekbench = None

    antutu_match = re.search(
        r"AnTuTu[:\s]*([\d,]+)",
        benchmark_text,
        flags=re.IGNORECASE,
    )
    if antutu_match:
        antutu = int(antutu_match.group(1).replace(",", ""))

    geekbench_match = re.search(
        r"GeekBench[:\s]*([\d,]+)",
        benchmark_text,
        flags=re.IGNORECASE,
    )
    if geekbench_match:
        geekbench = int(geekbench_match.group(1).replace(",", ""))

    return {
        "antutu": antutu,
        "geekbench": geekbench,
        "raw": tests,
    }


# ---------------- MAIN PARSE ----------------

def parse_phone_page(http: HttpClient, url: str) -> ScrapeOutput:
    html = http.get_text(url)
    soup = BeautifulSoup(html, "lxml")

    raw_tables = _parse_spec_tables(soup)
    brand, model_name = _title_brand_model(soup)

    launch = raw_tables.get("Launch", {}) or {}
    announced_str = launch.get("Announced")
    announced_dt = parse_gsmarena_announced(announced_str)

    platform = raw_tables.get("Platform", {}) or {}
    display = raw_tables.get("Display", {}) or {}
    battery = raw_tables.get("Battery", {}) or {}

    extracted: Dict[str, Any] = {
        "brand": brand,
        "modelName": model_name,
        "os": platform.get("OS"),
        "has5g": _infer_has5g(raw_tables),

        "chipset": platform.get("Chipset"),
        "batteryMah": _extract_battery_mah(battery.get("Type")),
        "refreshRateHz": _extract_refresh_rate(display.get("Type")),
        "displaySizeIn": _extract_display_size_inches(display.get("Size")),

        # helpful for sorting/debugging
        "announcedRaw": announced_str,
        "announcedParsed": announced_dt.isoformat() if announced_dt else None,

        "networkBands": _extract_network_bands(raw_tables),
        "benchmarks": _extract_benchmarks(raw_tables),
    }

    price_obj = _extract_price(raw_tables)
    if price_obj:
        extracted["price"] = price_obj

    return ScrapeOutput(
        source="gsmarena",
        url=url,
        sourceId=gsmarena_source_id_from_url(url),
        scrapedAt=now_utc(),
        extracted=extracted,
        raw=raw_tables,
        status="new",
    )


def quick_get_announced_for_sort(http: HttpClient, url: str) -> Optional[str]:
    """
    Lightweight fetch for sorting: returns Launch->Announced.
    """
    html = http.get_text(url)
    soup = BeautifulSoup(html, "lxml")
    raw_tables = _parse_spec_tables(soup)
    launch = raw_tables.get("Launch", {}) or {}
    return launch.get("Announced")

def is_phone_like(raw_tables: Dict[str, Dict[str, str]]) -> bool:
    network = raw_tables.get("Network", {}) or {}
    tech = (network.get("Technology") or "").lower()
    # Phones nearly always have cellular tech listed; Wi-Fi-only tablets often won't.
    return any(x in tech for x in ["gsm", "cdma", "lte", "hspa", "5g", "evdo", "umts"])
