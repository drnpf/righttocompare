import os
import requests

FIREBASE_WEB_API_KEY = os.getenv("FIREBASE_WEB_API_KEY")

def get_firebase_id_token(email, password):
    """Logs into Firebase ONCE to get a long-lived token."""
    url = f"https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key={FIREBASE_WEB_API_KEY}"
    payload = {"email": email, "password": password, "returnSecureToken": True}
    
    response = requests.post(url, json=payload)
    if response.status_code == 200:
        return response.json().get("idToken")
    else:
        print(f"   Login Failed for {email}: {response.json().get('error', {}).get('message')}")
        return None
