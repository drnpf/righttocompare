import express, { Router } from "express";
import { syncUser, getUser, updateUser } from "../controllers/userController";
import { protect } from "../middleware/authMiddleware";

const router: Router = express.Router();

/**
 * Sync user data from Firebase to MongoDB
 * @route   POST /api/users/sync
 */
router.post("/sync", protect, syncUser);

/**
 * Gets user profile data from MongoDB
 * @route  PUT /api/users/:uid
 */
router.get("/:uid", protect, getUser);

/**
 * Update user profile data in MongoDB
 * @route  PUT /api/users/:uid
 */
router.put("/:uid", protect, updateUser);

// Add more routes here related to USER

export default router;
