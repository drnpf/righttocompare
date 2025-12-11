import { User as FirebaseUser } from "firebase/auth";

export interface AppUser {
  // Default fields from Firebase object
  uid: string;
  email: string | null;
  displayName: string | null;

  // The Firebase User object
  firebaseUser: FirebaseUser;

  // Fields from MongoDB User schema
  role: "user" | "admin";
  preferences: {
    priorityFeatures: {
      camera: number;
      battery: number;
      performance: number;
      display: number;
      design: number;
    };
    budgetMin: number;
    budgetMax: number;
    brands: string[];
    notifications: {
      priceAlerts: boolean;
      newReleases: boolean;
    };
    notificationChannels: {
      email: boolean;
      push: boolean;
    };
  };
  wishlist: string[];
}
