from app.db import get_collection
from app.config import settings
from app.models.prefs import PreferenceProfile

def _usd_min_from_doc(doc: dict) -> float | None:
    prices = (((doc.get("extracted") or {}).get("price") or {}).get("prices") or [])
    usd = [p for p in prices if p.get("currency") == "USD" and isinstance(p.get("amount"), (int, float))]
    if not usd:
        return None
    return float(min(p["amount"] for p in usd))

async def retrieve_candidates(profile: PreferenceProfile) -> list[dict]:
    col = get_collection()

    q: dict = {}

    # platform: inferred from extracted.os
    if profile.platform == "ios":
        q["extracted.os"] = {"$regex": r"\bios\b", "$options": "i"}
    elif profile.platform == "android":
        q["extracted.os"] = {"$regex": r"android", "$options": "i"}

    # must-have flags
    if profile.must_5g is True:
        q["extracted.has5g"] = True

    if profile.min_refresh_hz is not None:
        q["extracted.refreshRateHz"] = {"$gte": profile.min_refresh_hz}

    # display size range
    if profile.min_display_in is not None or profile.max_display_in is not None:
        rng = {}
        if profile.min_display_in is not None:
            rng["$gte"] = profile.min_display_in
        if profile.max_display_in is not None:
            rng["$lte"] = profile.max_display_in
        q["extracted.displaySizeIn"] = rng

    # avoid brands
    if profile.avoid_brands:
        q["extracted.brand"] = {"$nin": profile.avoid_brands}

    # pull a reasonable pool; budget filtering is tricky because prices are an array, so we filter after
    cursor = col.find(q).sort("scrapedAt", -1).limit(settings.max_candidates)
    docs = await cursor.to_list(length=settings.max_candidates)

    # post-filter budget by USD if available (MVP)
    if profile.budget.max_amount is not None and profile.budget.currency.upper() == "USD":
        filtered = []
        for d in docs:
            usd_min = _usd_min_from_doc(d)
            # If no USD price known, keep it but lower score later (so you still get options)
            if usd_min is None or usd_min <= profile.budget.max_amount:
                filtered.append(d)
        docs = filtered

    return docs