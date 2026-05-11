import { Router } from "express";
import * as analyticsController from "../controllers/analyticsController";

const router = Router();

/**
 * Log a new comparison view count
 * @route POST /api/analytics/compare
 */
router.post("/compare", analyticsController.logComparison);

/**
 * Get a list of the most popular comparisons for the popular tab
 * @route GET /api/analytics/popular
 */
router.get("/popular", analyticsController.getTrending);

export default router;
