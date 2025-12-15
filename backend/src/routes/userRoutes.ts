import express, { Router } from "express";
import { syncUser, updateUser } from "../controllers/userController";
import { protect } from "../middleware/authMiddleware";

const router: Router = express.Router();

/**
 * @route   POST /api/users/sync
 * @desc    Sync user data from Firebase to MongoDB
 */
router.post("/sync", protect, syncUser);

/**
 * @route  PUT /api/users/:uid
 * @desc   Update user profile data in MongoDB
 */
router.put("/:uid", protect, updateUser);

// Add more routes here related to USER

export default router;
