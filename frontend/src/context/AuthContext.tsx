import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from "react";
import {
  User,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  updateProfile,
} from "firebase/auth";
import { auth } from "../firebase/config";
import { getUserProfile, syncUserWithBackend, updateUserProfile } from "../api/userApi";
import { AppUser } from "../types/userTypes";

interface AuthContextType {
  currentUser: AppUser | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [currentUser, setCurrentUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchAndSetUser = useCallback(async (user: User) => {
    try {
      const token = await user.getIdToken();

      // Trying to GET the user profile
      console.log("Attempting to fetch user profile...");
      let userData = await getUserProfile(user.uid, token);

      // Fallback to syncing the user profile if GET fails
      if (!userData) {
        console.warn("User missing in DB, attempting to sync...");
        userData = await syncUserWithBackend(user);
      }

      // Combines Firebase identity + MongoDB user profile data if user found
      if (userData) {
        const appUser: AppUser = {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          firebaseUser: user,
          role: userData.role,
          preferences: userData.preferences,
          wishlist: userData.wishlist,
        };
        setCurrentUser(appUser);
        console.log("Sync is complete. AppUser is ready.");
      } else {
        console.error("Backend sync failed. Logging out.");
        await firebaseSignOut(auth);
        setCurrentUser(null);
      }
    } catch (error) {
      console.error("AuthContext: Error in auth listener:", error);
      setCurrentUser(null);
    }
  }, []);

  // Sign up with email and password (and display name)
  async function signUp(email: string, password: string, name: string) {
    const userCredentials = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredentials.user;

    // Updating user display name upon sign up and forces sync with backend
    await updateProfile(user, { displayName: name });
    await user.reload();
    const token = await user.getIdToken(true);
    await updateUserProfile(user.uid, token, { displayName: name });
    setCurrentUser((prev) => {
      // Sets current user to the previous user with their new display name
      return prev ? { ...prev, displayName: name } : null;
    });
  }

  // Sign in with email and password
  async function signIn(email: string, password: string) {
    await signInWithEmailAndPassword(auth, email, password);
  }

  // Sign in with Google
  async function signInWithGoogle() {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
  }

  // Sign out
  async function signOut() {
    await firebaseSignOut(auth);
  }

  // Listen to auth state changes
  useEffect(() => {
    console.log("🔥 AuthContext: Setting up auth listener...");
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      // Case A: User is logged in
      if (user) {
        console.log("Firebase user detected. Starting backend sync...");
        await fetchAndSetUser(user);
      } else {
        // Case B: User is logged out
        console.log("User logged out");
        setCurrentUser(null);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    loading,
    signIn,
    signUp,
    signInWithGoogle,
    signOut,
  };

  return (
    <AuthContext.Provider value={value}>
      {loading ? (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "100vh",
            flexDirection: "column",
            gap: "16px",
          }}
        >
          <div
            style={{
              width: "48px",
              height: "48px",
              border: "4px solid #e5e5e5",
              borderTop: "4px solid #2c3968",
              borderRadius: "50%",
              animation: "spin 1s linear infinite",
            }}
          />
          <p style={{ color: "#666" }}>Loading...</p>
          <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
        </div>
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
}
