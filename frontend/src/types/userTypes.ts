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
    preferredBrands: string[];
    budget: {
      min: number;
      max: number;
    };
    notifications: {
      priceAlerts: boolean;
      newReleases: boolean;
      deals: boolean;
      featureUpdates: boolean;
    };
    notificationChannels: {
      email: boolean;
      push: boolean;
    };
  };
  wishlist: string[];
}
