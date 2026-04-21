import os
import random
from pymongo import MongoClient
from dotenv import load_dotenv
from datetime import datetime, timedelta

load_dotenv()
MONGO_URI = os.getenv("MONGO_URI")
DB_NAME = os.getenv("DB_NAME")

# --- DATA POOLS FOR DYNAMIC GENERATION ---
USERNAMES = ["TechVibe", "AndroidKing", "iPhonist", "SpecHunter", "BudgetBuyer", "MobilePro", "GamerX", "ReviewBot404", "PixelPusher"]

FRAGMENTS = {
    "camera": {
        "pos": ["The camera is absolute fire.", "Night mode is surprisingly crisp.", "Best zoom I've used on a phone.", "The colors are very natural.", "Video stabilization is top-tier."],
        "neg": ["The shutter lag is annoying.", "Photos look a bit washed out.", "The zoom gets grainy past 10x.", "Macro mode is basically useless.", "Focus hunting in low light is bad."]
    },
    "battery": {
        "pos": ["Easily a two-day phone.", "Charging is lightning fast.", "The standby time is incredible.", "Battery holds up well under 5G."],
        "neg": ["I have to charge it twice a day.", "It drains fast while gaming.", "Charging speed is stuck in 2018.", "The battery percentage drops like a rock."]
    },
    "performance": {
        "pos": ["Blazing fast performance.", "Handles Rocket League with zero frame drops.", "Multitasking is a breeze with this much RAM.", "The chip is a beast."],
        "neg": ["It stutters when opening the camera.", "Gets uncomfortably hot during CoD.", "UI lag is noticeable after an hour.", "Aggressive RAM management kills apps."]
    },
    "design": {
        "pos": ["The titanium finish feels premium.", "Thin bezels look futuristic.", "Design is sleek and minimal.", "Hand feel is great, not too heavy."],
        "neg": ["It's a fingerprint magnet.", "The camera bump is massive.", "Feels a bit hollow/plastic-y.", "Very slippery without a case."]
    }
}

def generate_review():
    # Randomly pick 2-3 categories to talk about
    categories = random.sample(list(FRAGMENTS.keys()), k=random.randint(2, 3))
    text_parts = []
    tags = []
    
    # Randomly decide if this user is a "Fan", "Hater", or "Critic"
    persona = random.choices(['fan', 'hater', 'critic'], weights=[40, 20, 40])[0]

    for cat in categories:
        if persona == 'fan':
            sentiment = 'pos' if random.random() > 0.1 else 'neg'
        elif persona == 'hater':
            sentiment = 'neg' if random.random() > 0.2 else 'pos'
        else:
            sentiment = random.choice(['pos', 'neg'])
        
        text_parts.append(random.choice(FRAGMENTS[cat][sentiment]))
        tags.append(f"{'+' if sentiment == 'pos' else '-'}{cat}")

    return " ".join(text_parts), tags, persona

def mass_seed(reviews_per_phone=50):
    client = MongoClient(MONGO_URI)
    db = client[DB_NAME]
    phones_collection = db.phones

    phones = list(phones_collection.find({}, {"id": 1, "name": 1}))
    
    for phone in phones:
        generated_reviews = []
        total_rating_sum = 0
        
        for i in range(reviews_per_phone):
            text, tags, persona = generate_review()
            
            # Persona-based base rating
            base = 4 if persona == 'fan' else 2 if persona == 'hater' else 3
            
            cat_ratings = {
                "camera": max(1, min(5, base + random.randint(-1, 1))),
                "battery": max(1, min(5, base + random.randint(-1, 1))),
                "design": max(1, min(5, base + random.randint(-1, 1))),
                "performance": max(1, min(5, base + random.randint(-1, 1))),
                "value": max(1, min(5, base + random.randint(-1, 1))),
            }
            
            avg_rating = sum(cat_ratings.values()) / 5
            total_rating_sum += avg_rating

            generated_reviews.append({
                "id": random.randint(1000000, 9999999),
                "userName": f"{random.choice(USERNAMES)}_{random.randint(10, 99)}",
                "rating": round(avg_rating, 1),
                "categoryRatings": cat_ratings,
                "date": (datetime.now() - timedelta(days=random.randint(0, 365))).strftime("%B %d, %Y"),
                "title": f"My {phone['name']} Experience",
                "review": text,
                "helpful": random.randint(0, 100),
                "notHelpful": random.randint(0, 20),
                "sentimentTags": tags
            })

        # Update phone with new aggregates
        phones_collection.update_one(
            {"id": phone["id"]},
            {
                "$set": {
                    "reviews": generated_reviews,
                    "totalReviews": reviews_per_phone,
                    "aggregateRating": round(total_rating_sum / reviews_per_phone, 1)
                }
            }
        )
        print(f"Injected {reviews_per_phone} reviews for {phone['name']}")

    client.close()

if __name__ == "__main__":
    mass_seed(reviews_per_phone=100) # Bump this up as high as you want
