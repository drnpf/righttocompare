import mongoose from "mongoose";

export interface IUser {
  name: string;
  email: string;
  passwordHash: string;
  role: "user" | "admin";
  createdAt: Date;
}

const UserSchema = new mongoose.Schema<IUser>({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ["user", "admin"], default: "user" },
  createdAt: { type: Date, default: Date.now }
});

// TODO: add profile preferences (budget, brands, notifications)

export const User = mongoose.model<IUser>("User", UserSchema);
