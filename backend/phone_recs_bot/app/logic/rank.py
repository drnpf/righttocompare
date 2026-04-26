from app.models.prefs import PreferenceProfile

def _usd_min(doc: dict) -> float | None:
    prices = (((doc.get("extracted") or {}).get("price") or {}).get("prices") or [])
    usd = [p for p in prices if p.get("currency") == "USD" and isinstance(p.get("amount"), (int, float))]
    if not usd:
        return None
    return float(min(p["amount"] for p in usd))

def _text_lower(x):
    return (x or "").lower()

def score(profile: PreferenceProfile, doc: dict) -> tuple[float, dict, list[str]]:
    e = doc.get("extracted") or {}
    raw = doc.get("raw") or {}

    why: list[str] = []

    # -------------------------
    # weights (simple version)
    # -------------------------
    weights = {
        "price": 1.0,
        "battery": 1.2 if "battery" in profile.priorities else 0.3,
        "display": 1.0 if "display" in profile.priorities else 0.3,
        "performance": 1.2 if "performance" in profile.priorities else 0.3,
        "camera": 1.0 if "camera" in profile.priorities else 0.3,
        "features": 0.5,
    }

    breakdown = {
        "price": 0,
        "battery": 0,
        "display": 0,
        "performance": 0,
        "camera": 0,
        "features": 0
    }

    # -------------------------
    # PRICE SCORE
    # -------------------------
    usd = _usd_min(doc)
    if profile.budget.max_amount and usd:
        if usd <= profile.budget.max_amount:
            # normalize: closer to budget = better (0–10)
            diff = profile.budget.max_amount - usd
            price_score = max(0, 10 - (diff / profile.budget.max_amount) * 10)
            breakdown["price"] = price_score
            why.append(f"within budget (${usd:,.0f})")
        else:
            breakdown["price"] = -10
    else:
        breakdown["price"] = -1

    # -------------------------
    # BATTERY
    # -------------------------
    mah = e.get("batteryMah") or 0
    if mah:
        battery_score = min(10, mah / 500)  # 5000 mAh ≈ 10
        breakdown["battery"] = battery_score
        if "battery" in profile.priorities:
            why.append(f"{mah} mAh battery")

    # -------------------------
    # DISPLAY
    # -------------------------
    hz = e.get("refreshRateHz") or 60
    display_score = min(10, hz / 12)  # 120Hz ≈ 10
    dtype = (((raw.get("Display") or {}).get("Type") or ""))
    if "oled" in _text_lower(dtype):
        display_score += 2
        why.append("OLED display")

    breakdown["display"] = display_score
    if hz >= 120:
        why.append(f"{hz}Hz display")

    # -------------------------
    # PERFORMANCE
    # -------------------------
    chipset = e.get("chipset") or ""
    perf_score = 2

    if "3 nm" in chipset:
        perf_score = 10
        why.append("high-end chipset (3 nm)")
    elif "4 nm" in chipset:
        perf_score = 8
        why.append("strong chipset (4 nm)")
    elif "5 nm" in chipset:
        perf_score = 6

    tests = (((raw.get("Our Tests") or {}).get("Performance") or ""))
    if "AnTuTu" in tests:
        perf_score += 1
        why.append("strong benchmark results")

    breakdown["performance"] = perf_score

    # -------------------------
    # CAMERA
    # -------------------------
    main = (((raw.get("Main Camera") or {}).get("Triple") or
            (raw.get("Main Camera") or {}).get("Dual") or ""))

    cam_score = 0
    if "OIS" in main or "ois" in main:
        cam_score += 5
        why.append("OIS on main camera")

    if "periscope" in _text_lower(main) or "telephoto" in _text_lower(main):
        cam_score += 3
        why.append("telephoto/periscope zoom")

    breakdown["camera"] = cam_score

    # -------------------------
    # FEATURES (5G, NFC)
    # -------------------------
    feature_score = 0

    if profile.must_5g and e.get("has5g"):
        feature_score += 3
        why.append("has 5G")

    if profile.must_nfc:
        nfc = (((raw.get("Comms") or {}).get("NFC") or ""))
        if "yes" in _text_lower(nfc):
            feature_score += 2
            why.append("has NFC")
        else:
            feature_score -= 2

    breakdown["features"] = feature_score

    # -------------------------
    # FINAL SCORE
    # -------------------------
    total = 0
    for k in breakdown:
        total += breakdown[k] * weights[k]

    return total, breakdown, why

def rank_candidates(profile: PreferenceProfile, docs: list[dict], top_k: int = 5) -> list[dict]:
    scored: list[dict] = []

    for d in docs:
        s, breakdown, why = score(profile, d)
        out = dict(d)

        out["_score"] = round(s, 2)
        out["_score_breakdown"] = breakdown
        out["_why"] = why

        scored.append(out)

    scored.sort(key=lambda x: x.get("_score", 0.0), reverse=True)
    return scored[:top_k]