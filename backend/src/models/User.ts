import mongoose, { Document, Schema } from "mongoose";

export interface IUser extends Document {
  firebaseUid: string;
  email: string;
  displayName: string;
  role: "user" | "admin";
  lastLogin: Date;
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
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema: Schema = new Schema(
  {
    firebaseUid: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    displayName: { type: String, default: "User" },
    role: { type: String, enum: ["user", "admin"], default: "user" },
    lastLogin: { type: Date, default: Date.now },
    preferences: {
      priorityFeatures: {
        camera: { type: Number, min: 1, max: 5, default: 3 },
        battery: { type: Number, min: 1, max: 5, default: 3 },
        performance: { type: Number, min: 1, max: 5, default: 3 },
        display: { type: Number, min: 1, max: 5, default: 3 },
        design: { type: Number, min: 1, max: 5, default: 3 },
      },
      preferredBrands: { type: [String], default: [] },
      budget: {
        min: { type: Number, default: 0 },
        max: { type: Number, default: 2000 },
      },
      notifications: {
        priceAlerts: { type: Boolean, default: true },
        newReleases: { type: Boolean, default: true },
        deals: { type: Boolean, default: true },
        featureUpdates: { type: Boolean, default: true },
      },
      notificationChannels: {
        email: { type: Boolean, default: true },
        push: { type: Boolean, default: true },
      },
    },
    wishlist: { type: [String], default: [] },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IUser>("User", UserSchema);
