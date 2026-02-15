import { Response } from "express";
import { AuthRequest } from "../middleware/authMiddleware";
import * as UserService from "../services/userService";

/**
 * Sync Firebase User to MongoDB (for Retrieval or Creation).
 * Checks if user exists in MongoDB based on Firebase UID from token.
 * If exists, returns the user profile; otherwise, creates a new user document.
 * @route POST /api/users/sync
 * @param req Express Request with Firebase User data
 * @param res Express Response
 * @return The user profile data
 */
export const syncUser = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const firebaseUser = req.user;

    // Ensures middleware verified token
    if (!firebaseUser) {
      res.status(401).json({ message: "No user data found" });
      return;
    }

    // Extracting uid, email, and name from token
    const { uid, email, name } = firebaseUser;
    if (!email) {
      console.error(`User sync failed for UID: ${uid}. Email is missing from Firebase token.`);
      res.status(400).json({ message: "Email required for profile creation" });
      return;
    }

    // Asking UserService to check if user exists
    let user = await UserService.findUserByUid(uid);
    console.log(`Looking for user with UID: ${uid}`);
    if (user) {
      console.log(`User found: ${email}`);
      user = await UserService.updateUser(user, name);
      res.status(200).json(user);
      return;
    }

    // Check if user exists by email (in case UID changed)
    user = await UserService.findUserByEmail(email);
    if (user) {
      console.log(`User found by email, but UID mismatch. DB UID: ${user.firebaseUid}, Token UID: ${uid}`);
      // Update the UID to match Firebase
      user.firebaseUid = uid;
      user = await UserService.updateUser(user, name);
      res.status(200).json(user);
      return;
    }

    // Asking UserService to create a new user
    console.log(`Creating new user: ${email}`);
    user = await UserService.createUser(uid, email, name);
    res.status(201).json(user);
  } catch (error) {
    console.error("Error in syncUser:", error);
    res.status(500).json({ message: "Server Error syncing user" });
  }
};

/**
 * Retrieves a user's profile data from MongoDB database.
 * @route GET /api/users/:uid
 * @param req Express Request with Firebase User data
 * @param res Express Response
 * @returns The user profile data
 */
export const getUser = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const tokenUid = req.user?.uid; // Who is logged in (from Token)
    const uid = req.params.uid; // Who the edit is attempted on (from URL)

    // Authorization check of URL uid from request against the token uid
    if (tokenUid !== uid) {
      res.status(403).json({ message: "Forbidden: You can only view your own profile" });
      return;
    }

    // Asking UserService to fetch the user
    const user = await UserService.findUserByUid(uid);
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }
    res.status(200).json(user); // User found; 200 = OK (in http requests)
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ message: "Server error fetching user" });
  }
};

/**
 * Updates an existing user's profile.
 * @route PUT /api/users/:uid
 * @param req Express Request with Firebase User data
 * @param res Express Response
 * @returns The updated user profile data
 */
export const updateUser = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const tokenUid = req.user?.uid; // Who is logged in (from Token)
    const paramUid = req.params.uid; // Who the edit is attempted on (from URL)

    // Authorization check of URL uid from request against the token uid
    if (tokenUid !== paramUid) {
      res.status(403).json({ message: "Forbidden: You can only edit your own profile" });
      return;
    }

    // Prepping update data and only allowing specific fields to be updated for security
    const { displayName, preferences, wishlist } = req.body;
    const updateData: any = {};
    if (displayName) updateData.displayName = displayName;
    if (preferences) updateData.preferences = preferences;
    if (wishlist) updateData.wishlist = wishlist;

    // Calling UserService updating function
    const updatedUser = await UserService.updateUserProfile(paramUid, updateData);
    if (!updatedUser) {
      res.status(404).json({ message: "User not found" });
      return;
    }
    res.status(200).json(updatedUser);
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ message: "Server Error updating user" });
  }
};
