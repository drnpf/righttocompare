import mongoose, { Document, Schema } from "mongoose";

export interface IUser extends Document {
  firebaseUid: string;
  email: string;
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
      budgetMin: { type: Number, default: 0 },
      budgetMax: { type: Number, default: 2000 },
      brands: { type: [String], default: [] },
      notifications: {
        priceAlerts: { type: Boolean, default: true },
        newReleases: { type: Boolean, default: true },
      },
      notificationsChannels: {
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
