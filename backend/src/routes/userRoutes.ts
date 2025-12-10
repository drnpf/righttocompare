import express, { Router } from "express";
import { syncUser } from "../controllers/authController";
import { protect } from "../middleware/authMiddleware";

const router: Router = express.Router();

/**
 * @route   POST /api/users/sync
 * @desc    Sync user data from Firebase to MongoDB
 */
router.post("/sync", protect, syncUser);

// Add more routes here related to USER

export default router;
