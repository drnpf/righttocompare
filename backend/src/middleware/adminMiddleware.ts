import { Response, NextFunction } from "express";
import User from "../models/User";
import { AuthRequest } from "./authMiddleware";

/**
 * Makes sure user is an admin.
 * Requires `protect` to have already populated `req.user`.
 */
export const requireAdmin = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const firebaseUid = req.user?.uid;

    if (!firebaseUid) {
      return res.status(401).json({ message: "Not authorized" });
    }

    const dbUser = await User.findOne({ firebaseUid }).select("role");

    if (!dbUser) {
      return res.status(403).json({ message: "Forbidden" });
    }

    if (dbUser.role !== "admin") {
      return res.status(403).json({ message: "Admin access required" });
    }

    return next();
  } catch (err) {
    console.error("Error in requireAdmin middleware:", err);
    return res.status(500).json({ message: "Server error" });
  }
};