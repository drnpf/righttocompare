import re
from app.models.prefs import PreferenceProfile

PRIORITY_KEYWORDS = {
    "camera": ["camera", "photos", "photography", "video", "recording", "pictures"],
    "battery": ["battery", "battery life", "endurance", "all day", "long battery"],
    "display": ["display", "screen", "oled", "amoled", "120hz", "refresh", "smooth"],
    "performance": ["fast", "performance", "gaming", "chipset", "lag", "powerful", "speed"],
    "value": ["value", "cheap", "best for the money", "deal", "budget", "affordable"],
}

BRANDS = [
    "apple", "samsung", "google", "xiaomi", "oneplus",
    "motorola", "sony", "asus", "huawei", "nokia"
]


def _detect_platform(text: str) -> str | None:
    t = text.lower()
    if "iphone" in t or "ios" in t:
        return "ios"
    if "android" in t:
        return "android"
    return None


def _extract_budget(text: str) -> float | None:
    """
    Matches:
      under $500
      <= 700
      max 900
      budget 450
      around 800
    """
    t = text.lower().replace(",", "")

    m = re.search(r"(under|max|budget|<=|less than|around|about)\s*\$?\s*(\d+(\.\d+)?)", t)
    if m:
        return float(m.group(2))

    m2 = re.search(r"\$?\s*(\d+(\.\d+)?)\s*(usd|dollars|\$)\b", t)
    if m2 and any(x in t for x in ["under", "max", "budget", "around", "about"]):
        return float(m2.group(1))

    return None


def _extract_refresh(text: str) -> int | None:
    t = text.lower()
    m = re.search(r"(\d{2,3})\s*hz", t)
    if m:
        return int(m.group(1))
    if "120hz" in t or "120 hz" in t:
        return 120
    if "90hz" in t or "90 hz" in t:
        return 90
    return None


def _extract_display_range(text: str) -> tuple[float | None, float | None]:
    """
    Matches:
      6.1 to 6.7 inches
      under 6.5 inches
      around 6.1
    """
    t = text.lower()

    m = re.search(r"(\d\.\d)\s*(to|-)\s*(\d\.\d)\s*(in|inch|inches)", t)
    if m:
        return float(m.group(1)), float(m.group(3))

    m2 = re.search(r"(under|below|max)\s*(\d\.\d)\s*(in|inch|inches)", t)
    if m2:
        return None, float(m2.group(2))

    m3 = re.search(r"(over|above|min)\s*(\d\.\d)\s*(in|inch|inches)", t)
    if m3:
        return float(m3.group(2)), None

    m4 = re.search(r"(around|about)\s*(\d\.\d)\s*(in|inch|inches)?", t)
    if m4:
        val = float(m4.group(2))
        return max(0.0, val - 0.2), val + 0.2

    return None, None


def _extract_avoid_brands(text: str) -> list[str]:
    t = text.lower()
    avoids = []
    for b in BRANDS:
        if re.search(rf"\b(no|not|avoid)\s+{re.escape(b)}\b", t):
            avoids.append(b.title())
    return avoids


def _extract_prefer_brands(text: str) -> list[str]:
    t = text.lower()
    prefers = []
    for b in BRANDS:
        if re.search(rf"\b(prefer|like|want|love)\s+{re.escape(b)}\b", t):
            prefers.append(b.title())
    return prefers


def _detect_must_flags(text: str) -> tuple[bool | None, bool | None, bool | None]:
    t = text.lower()
    must_5g = True if ("must have 5g" in t or "need 5g" in t or "require 5g" in t) else None
    must_nfc = True if ("must have nfc" in t or "need nfc" in t or "require nfc" in t) else None
    return must_5g, must_nfc, None


def _detect_priority_weights(text: str) -> dict[str, float]:
    t = text.lower()

    weights = {
        "camera": 0.3,
        "battery": 0.3,
        "display": 0.3,
        "performance": 0.3,
        "value": 0.3,
    }

    strong_words = ["best", "prioritize", "main", "focus", "important", "mostly", "primarily"]
    medium_words = ["good", "decent", "solid"]
    weak_words = ["okay", "fine"]

    for prio, keys in PRIORITY_KEYWORDS.items():
        for k in keys:
            if k in t:
                if any(w in t for w in strong_words):
                    weights[prio] = max(weights[prio], 1.0)
                elif any(w in t for w in medium_words):
                    weights[prio] = max(weights[prio], 0.7)
                elif any(w in t for w in weak_words):
                    weights[prio] = max(weights[prio], 0.5)
                else:
                    weights[prio] = max(weights[prio], 0.8)

    # special intent phrases
    if "gaming" in t or "game" in t:
        weights["performance"] = max(weights["performance"], 1.0)

    if "battery life" in t or "long battery" in t or "all day battery" in t:
        weights["battery"] = max(weights["battery"], 1.0)

    if "camera phone" in t or "best camera" in t:
        weights["camera"] = max(weights["camera"], 1.0)

    if "cheap" in t or "budget" in t or "affordable" in t:
        weights["value"] = max(weights["value"], 1.0)

    if "smooth display" in t or "oled" in t or "amoled" in t:
        weights["display"] = max(weights["display"], 0.9)

    return weights


def update_profile_from_text(profile: PreferenceProfile, message: str) -> PreferenceProfile:
    t = message.strip()
    low = t.lower()

    # platform
    plat = _detect_platform(t)
    if plat:
        profile.platform = plat

    # budget
    b = _extract_budget(t)
    if b is not None:
        profile.budget.max_amount = b

    # priorities + weights
    weights = _detect_priority_weights(t)
    profile.weights = weights

    for prio, w in weights.items():
        if w > 0.5 and prio not in profile.priorities:
            profile.priorities.append(prio)

    # must flags
    must_5g, must_nfc, _ = _detect_must_flags(t)
    if must_5g is not None:
        profile.must_5g = must_5g
    if must_nfc is not None:
        profile.must_nfc = must_nfc

    # refresh
    hz = _extract_refresh(t)
    if hz is not None:
        profile.min_refresh_hz = max(profile.min_refresh_hz or 0, hz)

    # size
    mn, mx = _extract_display_range(t)
    if mn is not None:
        profile.min_display_in = mn
    if mx is not None:
        profile.max_display_in = mx

    # avoid brands
    new_avoids = _extract_avoid_brands(t)
    for a in new_avoids:
        if a not in profile.avoid_brands:
            profile.avoid_brands.append(a)

    # optional preferred brands, only if your model supports it
    preferred = _extract_prefer_brands(t)
    if hasattr(profile, "preferred_brands"):
        for bname in preferred:
            if bname not in profile.preferred_brands:
                profile.preferred_brands.append(bname)

    # shorthand cues
    if "iphone" in low and "ios" not in low:
        profile.platform = "ios"
    elif "android phone" in low:
        profile.platform = "android"

    return profile