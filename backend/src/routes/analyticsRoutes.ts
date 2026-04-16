import { Router } from "express";
import * as comparisonController from "../controllers/analyticsController";

const router = Router();

/**
 * Log a new comparison view count
 * @route POST /api/analytics/compare
 */
router.post("/compare", comparisonController.logComparison);

/**
 * Get a list of the most popular comparisons for the trending tab
 * @route GET /api/analytics/trending
 */
router.post("/trending", comparisonController.getTrending);

export default router;
