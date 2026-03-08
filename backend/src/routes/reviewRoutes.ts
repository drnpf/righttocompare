import { Router } from "express";
import {
  createReview,
  getReviews,
  voteOnReview,
  deleteReview,
} from "../controllers/reviewController";
import { protect } from "../middleware/authMiddleware";

const router = Router();

/**
 * Get all reviews for a phone (with pagination)
 * @route GET /api/phones/:phoneId/reviews
 * @query page - Page number (default: 1)
 * @query limit - Reviews per page (default: 10)
 */
router.get("/:phoneId/reviews", getReviews);

/**
 * Create a new review for a phone
 * @route POST /api/phones/:phoneId/reviews
 * @body title - Review title (5-100 chars)
 * @body review - Review text (20-2000 chars)
 * @body categoryRatings - { camera, battery, design, performance, value } (1-5 each)
 */
router.post("/:phoneId/reviews", protect, createReview);

/**
 * Vote on a review (helpful or not helpful)
 * @route PUT /api/phones/:phoneId/reviews/:reviewId/vote
 * @body voteType - 'helpful' or 'notHelpful'
 */
router.put("/:phoneId/reviews/:reviewId/vote", protect, voteOnReview);

/**
 * Delete a review (user can only delete their own)
 * @route DELETE /api/phones/:phoneId/reviews/:reviewId
 */
router.delete("/:phoneId/reviews/:reviewId", protect, deleteReview);

export default router;
