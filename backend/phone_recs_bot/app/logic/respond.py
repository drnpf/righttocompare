from app.models.prefs import PreferenceProfile


def missing_questions(p: PreferenceProfile) -> list[str]:
    qs = []
    if p.budget.max_amount is None:
        qs.append("What’s your max budget (USD)?")
    if p.platform is None:
        qs.append("Do you prefer iPhone (iOS) or Android — or either is fine?")
    if not p.priorities:
        qs.append("What matters most: camera, battery, performance, display, or value?")
    return qs


# -------------------------
# USER VIEW FORMAT
# -------------------------
def build_user_view(profile: PreferenceProfile, docs: list[dict]) -> dict:
    recs = []

    for i, d in enumerate(docs, 1):
        e = d.get("extracted") or {}

        recs.append({
            "rank": i,
            "brand": e.get("brand", "Unknown"),
            "model": e.get("modelName", "Unknown"),
            "score": d.get("_score"),
            "why": d.get("_why", [])[:3],
            "link": d.get("url"),
        })

    return {
        "summary": "Here are the best phones based on your preferences.",
        "recommendations": recs,
        "next_step": "Want me to refine results (e.g., best camera or best battery)?"
    }


# -------------------------
# DEVELOPER VIEW FORMAT
# -------------------------
def build_dev_view(profile: PreferenceProfile, docs: list[dict]) -> dict:
    return {
        "parsed_preferences": {
            "budget": profile.budget.max_amount,
            "platform": profile.platform,
            "priorities": list(profile.priorities),
            "must_5g": profile.must_5g,
            "must_nfc": profile.must_nfc
        },
        "candidate_count": len(docs),
        "top_results": [
            {
                "model": (d.get("extracted") or {}).get("modelName"),
                "score": d.get("_score"),
                "score_breakdown": d.get("_score_breakdown"),
            }
            for d in docs[:5]
        ],
        "scoring_model": "weighted_sum_v2"
    }


# -------------------------
# MAIN RESPONSE BUILDER
# -------------------------
def make_reply(profile: PreferenceProfile, top_docs: list[dict]) -> dict:
    qs = missing_questions(profile)

    # 🔹 Ask clarifying questions
    if qs:
        return {
            "user_view": {
                "summary": "I need a bit more info before recommending.",
                "questions": qs[:2]
            },
            "developer_view": {
                "state": "missing_preferences",
                "missing_fields": qs
            }
        }

    # 🔹 No results
    if not top_docs:
        return {
            "user_view": {
                "summary": "No phones matched your constraints.",
                "suggestion": "Try increasing your budget or relaxing a requirement."
            },
            "developer_view": {
                "state": "no_results"
            }
        }

    # 🔹 Normal response
    return {
        "user_view": build_user_view(profile, top_docs),
        "developer_view": build_dev_view(profile, top_docs)
    }