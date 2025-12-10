import { User } from "firebase/auth";

const API_URL = "http://localhost:5000/api/users";

/**
 * Bridges the Frontend and Backend. Sends Firebase ID token to backend.
 * Backend verifies the token and upon successful verification, user
 * data retrieves or creeates the user's profile in MongoDB.
 * @param firebaseUser The user object from Firebase Auth
 * @returns The user profile (from MongoDB) containing their preferences, etc.
 */
export const syncUserWithBackend = async (firebaseUser: User | null) => {
  if (!firebaseUser) return null;

  try {
    // Gets token from Firebase user and sending HTTP req to backend for syncing
    const token = await firebaseUser.getIdToken();
    const response = await fetch(`${API_URL}/sync`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    // Handles failed sync with backend
    if (!response.ok) {
      throw new Error("Failed to sync user with backend");
    }

    // Returns user data
    const userData = await response.json();
    console.log("Backend Sync Success:", userData);
    return userData;
  } catch (error) {
    console.error("Backend Sync Error:", error);
    return null;
  }
};

// ADD USER RELATED BRIDGES HERE
