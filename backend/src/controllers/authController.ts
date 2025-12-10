import { Response } from "express";
import User from "../models/User";
import { AuthRequest } from "../middleware/authMiddleware";

/**
 * Sync Firebase User to MongoDB (for Retrieval or Creation).
 * Checks if user exists in MongoDB based on Firebase UID from token.
 * If exists, returns the user profile; otherwise, creates a new user document.
 * @route POST /api/auth/sync
 * @param req Express Request object with Firebase User data
 * @param res Express Response object
 */
export const syncUser = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const firebaseUser = req.user;

    // Ensures middleware verified token
    if (!firebaseUser) {
      res.status(401).json({ message: "No user data found in request" });
      return;
    }

    const { uid, email, name } = firebaseUser;

    // Check if user exists
    let user = await User.findOne({ firebaseUid: uid });
    if (user) {
      console.log(`User found: ${User}`);
      res.status(200).json(user);
      return;
    }

    // Creates a new user
    console.log(`Creating new user: ${email}`);
    user = await User.create({
      firebaseUid: uid,
      email: email,
      displayName: name || "User",
    });
    res.status(201).json(user);
  } catch (error) {
    console.error("Error in syncUser:", error);
    res.status(500).json({ message: "Server Error syncing user" });
  }
};
