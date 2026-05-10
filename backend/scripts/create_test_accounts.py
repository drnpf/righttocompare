import os
import requests
import random
import string
import time
from dotenv import load_dotenv
from pathlib import Path

# Setup paths
SCRIPT_DIR = Path(__file__).resolve().parent
load_dotenv(SCRIPT_DIR.parent / ".env")

# --- CONFIG ---
FIREBASE_API_KEY = os.getenv("FIREBASE_WEB_API_KEY")
ACCOUNTS_FILE = SCRIPT_DIR / "data" / "test_accounts.txt"
FIREBASE_AUTH_URL = f"https://identitytoolkit.googleapis.com/v1/accounts:signUp?key={FIREBASE_API_KEY}"

def generate_random_password(length=12):
    characters = string.ascii_letters + string.digits + "!@#$%^&*"
    return ''.join(random.choice(characters) for i in range(length))

def create_accounts(count=40):
    if not FIREBASE_API_KEY:
        print("Error: FIREBASE_WEB_API_KEY not found in .env")
        return

    print(f"Starting creation of {count} test accounts...")
    
    # Ensure the data directory exists
    ACCOUNTS_FILE.parent.mkdir(parents=True, exist_ok=True)

    success_count = 0
    
    with open(ACCOUNTS_FILE, "a") as f:
        for i in range(count):
            # Generate a "realistic" test email
            random_id = ''.join(random.choices(string.ascii_lowercase + string.digits, k=5))
            email = f"tester_{random_id}@righttocompare.test"
            password = "TestPassword123!" # Keeping it consistent for easy manual login if needed

            payload = {
                "email": email,
                "password": password,
                "returnSecureToken": True
            }

            try:
                response = requests.post(FIREBASE_AUTH_URL, json=payload)
                
                if response.status_code == 200:
                    f.write(f"{email} {password}\n")
                    print(f" Created: {email}")
                    success_count += 1
                else:
                    error_msg = response.json().get('error', {}).get('message', 'Unknown Error')
                    print(f" Failed {email}: {error_msg}")
                    if "QUOTA_EXCEEDED" in error_msg:
                        print("Firebase quota hit. Stopping script.")
                        break
            
            except Exception as e:
                print(f" Request error: {e}")

            # Sleep briefly to avoid tripping automated bot detection
            time.sleep(0.5)

    print(f"\nDone! Added {success_count} accounts to {ACCOUNTS_FILE.name}")

if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser(description="Batch create Firebase test accounts.")
    parser.add_argument("--count", type=int, default=40, help="Number of accounts to create")
    args = parser.parse_args()

    create_accounts(args.count)
    