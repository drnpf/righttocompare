import requests
import json

# --- CONFIGURATION ---
TOKEN = "PASTE_YOUR_JWT_TOKEN_HERE"
BASE_URL = "http://localhost:5001/api/discussions"

HEADERS = {
    "Authorization": f"Bearer {TOKEN}",
    "Content-Type": "application/json"
}

SCENARIOS = [
    {
        "discussion": {
            "title": "The S26 Ultra thermal management is a beast",
            "content": "Just spent 4 hours gaming on this thing. No throttling at all. The cooling system is impressive compared to last year's model.",
            "category": "Discussion",
            "tags": ["Samsung", "Gaming", "Thermals"]
        },
        "replies": [
            "I agree, the fps stays rock solid even in heavy zones.",
            "The heat is barely noticeable. Samsung really fixed the cooling.",
            "Finally a chip that doesn't throttle after 20 minutes of Genshin.",
            "It gets a bit warm near the camera, but performance is still snappy."
        ]
    },
    {
        "discussion": {
            "title": "iOS 19.4 Update: Is your battery okay?",
            "content": "My battery life is terrible since updating this morning. I've lost 30% in two hours just browsing. This software feels buggy.",
            "category": "Help",
            "tags": ["Apple", "iOS", "Battery"]
        },
        "replies": [
            "Same here, my drain is insane. Avoid this update for now.",
            "Charging feels slow too. Took 3 hours to get to full.",
            "Actually, my battery life has been great. Maybe try a hard reset?",
            "The update is fine for me, but the UI has some weird laggy spots."
        ]
    }
]

def seed_community():
    print("Initializing Community Seeder...")
    
    for scenario in SCENARIOS:
        try:
            # 1. Create Discussion
            disc_response = requests.post(
                BASE_URL, 
                headers=HEADERS, 
                data=json.dumps(scenario["discussion"])
            )
            
            if disc_response.status_code != 201:
                print(f"Failed Discussion: {disc_response.status_code} - {disc_response.text}")
                continue
                
            discussion = disc_response.json()
            disc_id = discussion.get("_id")
            print(f"\nTHREAD: {discussion.get('title')} (ID: {disc_id})")
            print(f"   Generated Tags: {discussion.get('sentimentTags')}")

            # 2. Create Replies
            reply_url = f"{BASE_URL}/{disc_id}/replies"
            for reply_text in scenario["replies"]:
                reply_payload = {"content": reply_text}
                
                rep_response = requests.post(
                    reply_url, 
                    headers=HEADERS, 
                    data=json.dumps(reply_payload)
                )
                
                if rep_response.status_code == 201:
                    reply_data = rep_response.json()
                    print(f"   Reply: {reply_text[:30]}... -> {reply_data.get('sentimentTags')}")
                else:
                    print(f"   Failed Reply: {rep_response.status_code}")
                    
        except Exception as e:
            print(f"Error seeding scenario: {e}")
    print("\nSeeding complete.")

if __name__ == "__main__":
    seed_community()