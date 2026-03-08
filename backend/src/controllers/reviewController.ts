import { Response } from "express";
import { AuthRequest } from "../middleware/authMiddleware";
import * as reviewService from "../services/reviewService";

/**
 * Creates a new review for a phone.
 * @route POST /api/phones/:phoneId/reviews
 * @param req AuthRequest containing phoneId param and review data in body
 * @param res Express Response
 */
export const createReview = async (req: AuthRequest, res: Response) => {
  try {
    const { phoneId } = req.params;
    const { title, review, categoryRatings } = req.body;

    // Validate required fields
    if (!title || !review || !categoryRatings) {
      return res.status(400).json({
        message: "Missing required fields: title, review, categoryRatings",
      });
    }

    // Validate title length
    if (title.length < 5 || title.length > 100) {
      return res.status(400).json({
        message: "Title must be between 5 and 100 characters",
      });
    }

    // Validate review length
    if (review.length < 20 || review.length > 2000) {
      return res.status(400).json({
        message: "Review must be between 20 and 2000 characters",
      });
    }

    // Validate category ratings
    const categories = ["camera", "battery", "design", "performance", "value"];
    for (const category of categories) {
      const rating = categoryRatings[category];
      if (rating === undefined || rating < 1 || rating > 5) {
        return res.status(400).json({
          message: `Invalid rating for ${category}. Must be between 1 and 5`,
        });
      }
    }

    // Get user info from auth middleware
    const userId = req.user?.uid;
    const userName = req.user?.name || req.user?.email?.split("@")[0] || "Anonymous";

    if (!userId) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    const updatedPhone = await reviewService.addReviewToPhone(phoneId, {
      userId,
      userName,
      categoryRatings,
      title,
      review,
    });

    if (!updatedPhone) {
      return res.status(404).json({ message: "Phone not found" });
    }

    // Return the newly created review
    const newReview = updatedPhone.reviews[0];
    res.status(201).json(newReview);
  } catch (err: any) {
    if (err.message === "User has already reviewed this phone") {
      return res.status(409).json({ message: err.message });
    }
    console.error("Error creating review:", err);
    res.status(500).json({ message: "Server error creating review" });
  }
};

/**
 * Gets all reviews for a phone with pagination.
 * @route GET /api/phones/:phoneId/reviews
 * @param req Request containing phoneId param and optional page/limit query params
 * @param res Express Response
 */
export const getReviews = async (req: AuthRequest, res: Response) => {
  try {
    const { phoneId } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const result = await reviewService.getReviewsForPhone(phoneId, page, limit);

    if (!result) {
      return res.status(404).json({ message: "Phone not found" });
    }

    res.status(200).json(result);
  } catch (err) {
    console.error("Error fetching reviews:", err);
    res.status(500).json({ message: "Server error fetching reviews" });
  }
};

/**
 * Votes on a review (helpful or not helpful).
 * @route PUT /api/phones/:phoneId/reviews/:reviewId/vote
 * @param req AuthRequest containing phoneId and reviewId params, voteType in body
 * @param res Express Response
 */
export const voteOnReview = async (req: AuthRequest, res: Response) => {
  try {
    const { phoneId, reviewId } = req.params;
    const { voteType } = req.body;

    if (!voteType || !["helpful", "notHelpful"].includes(voteType)) {
      return res.status(400).json({
        message: "Invalid voteType. Must be 'helpful' or 'notHelpful'",
      });
    }

    const userId = req.user?.uid;
    if (!userId) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    const updatedReview = await reviewService.updateReviewVote(
      phoneId,
      parseInt(reviewId),
      userId,
      voteType
    );

    if (!updatedReview) {
      return res.status(404).json({ message: "Phone or review not found" });
    }

    res.status(200).json(updatedReview);
  } catch (err) {
    console.error("Error voting on review:", err);
    res.status(500).json({ message: "Server error voting on review" });
  }
};

/**
 * Deletes a user's own review.
 * @route DELETE /api/phones/:phoneId/reviews/:reviewId
 * @param req AuthRequest containing phoneId and reviewId params
 * @param res Express Response
 */
export const deleteReview = async (req: AuthRequest, res: Response) => {
  try {
    const { phoneId, reviewId } = req.params;

    const userId = req.user?.uid;
    if (!userId) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    const deleted = await reviewService.removeReview(
      phoneId,
      parseInt(reviewId),
      userId
    );

    if (!deleted) {
      return res.status(404).json({ message: "Review not found" });
    }

    res.status(200).json({ message: "Review deleted successfully" });
  } catch (err: any) {
    if (err.message === "Not authorized to delete this review") {
      return res.status(403).json({ message: err.message });
    }
    console.error("Error deleting review:", err);
    res.status(500).json({ message: "Server error deleting review" });
  }
};
