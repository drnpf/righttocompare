import os
import requests

def get_firebase_id_token(email, password):
    api_key = os.getenv("FIREBASE_WEB_API_KEY")
    
    if not api_key:
        print("   Error: FIREBASE_WEB_API_KEY is None in helper!")
        return None

    """Logs into Firebase ONCE to get a long-lived token."""
    url = f"https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key={api_key}"
    payload = {"email": email, "password": password, "returnSecureToken": True}
    
    response = requests.post(url, json=payload)
    if response.status_code == 200:
        return response.json().get("idToken")
    else:
        print(f"   Login Failed for {email}: {response.json().get('error', {}).get('message')}")
        return None