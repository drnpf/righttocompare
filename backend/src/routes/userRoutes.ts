import express, { Router } from "express";
import { syncUser, getUser, updateUser, sendTestNotificationEmail } from "../controllers/userController";
import { protect } from "../middleware/authentication";

const router: Router = express.Router();

/**
 * Sync user data from Firebase to MongoDB
 * @route POST /api/users/sync
 */
router.post("/sync", protect, syncUser);

/**
 * Gets user profile data from MongoDB
 * @route GET/api/users/:uid
 */
router.get("/:uid", protect, getUser);

/**
 * Update user profile data in MongoDB
 * @route PUT /api/users/:uid
 */
router.put("/:uid", protect, updateUser);

/**
 * Send a test notification email immediately for the specified user
 * @route POST /api/users/:uid/notifications/test-digest
 */
router.post("/:uid/notifications/test-digest", sendTestNotificationEmail);

// Add more routes here related to USER

export default router;
