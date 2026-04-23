import requests
import json
import argparse
import sys

"""
Example command:
    python3 populate_discussion_database.py [YOUR_JWT_TOKEN]
"""

# --- CONFIGURATION ---
BASE_URL = "http://localhost:5001/api/discussions"

# Add new discussions here; this script was already ran with these discussion scenarios so it will make duplicates
SCENARIOS = [
    {
        "discussion": {
            "title": "The AMOLED screen is stunningly bright, but the zoom is blurry",
            "content": "I just got the device and the AMOLED screen is stunning. Colors are so vivid. However, the camera zoom is blurry at 10x.",
            "category": "Review",
            "tags": ["Display", "Camera"]
        },
        "replies": [
            "The 120hz refresh rate is so smooth! Definitely a premium display.",
            "I disagree about the camera, my night mode photos are crisp and sharp.",
            "The screen brightness is goated for outdoor use. Best display this year.",
            "Yeah, the telephoto lens is mediocre. Google still beats Samsung there."
        ]
    },
    {
        "discussion": {
            "title": "Fingerprint vs Face ID: Which biometric is more secure?",
            "content": "I switched from Android and find Face ID a bit slow. Is it really more secure? I miss the biometric speed of the fingerprint.",
            "category": "Discussion",
            "tags": ["Security", "Biometrics"]
        },
        "replies": [
            "Fingerprint is goated for speed, but Face ID is much more reliable with wet hands.",
            "Apple's encryption is solid. It feels very secure for banking apps.",
            "The biometric sensor on the back of the old models was better. Modern UI is buggy.",
            "Face ID is a no-brainer for me. It's fast and works every time."
        ]
    },
    {
        "discussion": {
            "title": "5G signal drops in Rosemead area?",
            "content": "I've been testing my phone around Rosemead and the 5G signal is terrible. It hardly connects to the wifi hotspot either.",
            "category": "Help",
            "tags": ["Connectivity", "Network"]
        },
        "replies": [
            "I've had the same issue! Bluetooth keeps disconnecting too. Super frustrating.",
            "My reception has been great near the mall. Maybe you have a faulty antenna?",
            "The wifi is snappy for me, but the 5G reception is definitely buggy in this patch.",
            "Signal is weak in some parts of the SGV. It's a dealbreaker for remote work."
        ]
    },
    {
        "discussion": {
            "title": "Is the base model overpriced and skip-worthy?",
            "content": "Looking at the specs, $899 feels like a dealbreaker. The price is way too high for just 128GB of storage.",
            "category": "Comparison",
            "tags": ["Value", "Price"]
        },
        "replies": [
            "Totally agree. It's overpriced and the storage is trash compared to the Pro.",
            "You're paying for the support and updates. The long-term value is better.",
            "I'd skip this one and wait for a sale. The bang for buck isn't there yet.",
            "It's expensive, but the titanium build feels premium and worth the money."
        ]
    },
    {
        "discussion": {
            "title": "Space Marine 2 Mobile: The GPU performance is a beast",
            "content": "I've been streaming games and the GPU handles everything at a high refresh rate. The speed is incredible and snappy.",
            "category": "Discussion",
            "tags": ["Gaming", "Performance"]
        },
        "replies": [
            "Gaming on this is a beast! No lag even in the swarm scenes.",
            "The thermal cooling is clutch. It doesn't overheat like my old phone.",
            "FPS stays rock solid. This is the goat of gaming phones right now.",
            "The audio from the stereo speakers is loud and crisp. Perfect for gaming."
        ]
    }
]
def seed_community(token):
    formatted_token = token if token.startswith("Bearer ") else f"Bearer {token}"
    
    headers = {
        "Authorization": formatted_token,
        "Content-Type": "application/json"
    }

    print(f"Initializing Discussion Seeder...")
    for scenario in SCENARIOS:
        try:
            # Creating Discussion
            disc_response = requests.post(
                BASE_URL, 
                headers=headers, 
                data=json.dumps(scenario["discussion"])
            )
            
            if disc_response.status_code != 201:
                print(f"Failed Discussion: {disc_response.status_code} - {disc_response.text}")
                continue
                
            discussion = disc_response.json()
            disc_id = discussion.get("_id")
            print(f"\nTHREAD: {discussion.get('title')} (ID: {disc_id})")
            print(f"   Generated Tags: {discussion.get('sentimentTags')}")

            # Create Replies
            reply_url = f"{BASE_URL}/{disc_id}/replies"
            for reply_text in scenario["replies"]:
                reply_payload = {"content": reply_text}
                
                rep_response = requests.post(
                    reply_url, 
                    headers=headers, 
                    data=json.dumps(reply_payload)
                )
                
                if rep_response.status_code == 201:
                    reply_data = rep_response.json()
                    print(f"   Reply added successfully -> Tags: {reply_data.get('sentimentTags')}")
                else:
                    print(f"   Failed Reply: {rep_response.status_code}")
                    
        except Exception as e:
            print(f"Error seeding scenario: {e}")

    print("\nSeeding complete.")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Seed the RightToCompare database with discussions.")
    parser.add_argument("token", help="Your Firebase JWT auth token needed. Get from web dev tool (F12) and check the Authorization header")
    
    args = parser.parse_args()
    
    if not args.token:
        print("Error: No token provided.")
        sys.exit(1)
        
    seed_community(args.token)