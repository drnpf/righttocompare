import { User } from "firebase/auth";
import { AppUser } from "../types/userTypes";

const API_URL = "http://localhost:5000/api/users"; // CHANGE LATER ON PRODUCTION

/**
 * Bridges the Frontend and Backend. Sends Firebase ID token to backend.
 * Backend verifies the token and upon successful verification, user
 * data retrieves or creeates the user's profile in MongoDB.
 * @param firebaseUser The user object from Firebase Auth
 * @returns The AppUser object, or null if failed
 */
export const syncUserWithBackend = async (firebaseUser: User | null) => {
  if (!firebaseUser) return null;

  try {
    // Gets token from Firebase user and sending HTTP req to backend for syncing
    const token = await firebaseUser.getIdToken(true);
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

/**
 * Retrieves the user's profile data from the backend.
 * Should be called on page refresh to restore user session or when
 * no need to update/write into the database.
 * @param uid The Firebase UID of the user
 * @param token The Firebase Auth ID token (for security)
 * @returns The AppUser object, or null if failed
 */
export const getUserProfile = async (uid: string, token: string) => {
  try {
    const response = await fetch(`${API_URL}/${uid}`, {
      method: "GET",
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
    console.log("Backend Retrieval Success:", userData);
    return userData;
  } catch (error) {
    console.error("Error getting profile:", error);
    return null;
  }
};

/**
 * Updates the user's profile in the backend.
 * @param uid The Firebase UID of the user
 * @param token The Firebase Auth ID token (for security)
 * @param updates The partial data to update (displayName, preferences, wishlist).
 * @returns The updated AppUser object, or null if failed
 */
export const updateUserProfile = async (uid: string, token: string, updates: Partial<AppUser>) => {
  try {
    const response = await fetch(`${API_URL}/${uid}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        displayName: updates.displayName,
        preferences: updates.preferences,
        wishlist: updates.wishlist,
      }),
    });

    // Handles failed update with backend
    if (!response.ok) {
      throw new Error("Failed to update user profile");
    }

    // Returns the updated user data
    const userData = await response.json();
    console.log("Backend Update Success:", userData);
    return userData;
  } catch (error) {
    console.error("Backend Update Error:", error);
    return null;
  }
};

// ADD USER RELATED BRIDGES HERE
