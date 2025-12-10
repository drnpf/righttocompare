import { Response } from "express";
import { AuthRequest } from "../middleware/authMiddleware";
import * as UserService from "../services/userService";

/**
 * Sync Firebase User to MongoDB (for Retrieval or Creation).
 * Checks if user exists in MongoDB based on Firebase UID from token.
 * If exists, returns the user profile; otherwise, creates a new user document.
 * @route POST /api/auth/sync
 * @param req Express Request with Firebase User data
 * @param res Express Response
 */
export const syncUser = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const firebaseUser = req.user;

    // Ensures middleware verified token
    if (!firebaseUser) {
      res.status(401).json({ message: "No user data found" });
      return;
    }

    // Extracting uid, email, and name from token
    const { uid, email, name } = firebaseUser;

    // Asking UserService to check if user exists
    let user = await UserService.findUserByUid(uid);
    if (user) {
      console.log(`User found: ${email}`);
      user = await UserService.updateLastLogin(user);
      res.status(200).json(user);
      return;
    }

    // Asking UserService to create a new user
    console.log(`Creating new user: ${email}`);
    user = await UserService.createUser(uid, email!, name);
    res.status(201).json(user);
  } catch (error) {
    console.error("Error in syncUser:", error);
    res.status(500).json({ message: "Server Error syncing user" });
  }
};
