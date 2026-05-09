import { Router } from "express";
import {
  createDiscussion,
  getDiscussions,
  getCommunitySentiment,
  getDiscussion,
  getUserDiscussions,
  voteOnDiscussion,
  deleteDiscussion,
  getReplies,
  createReply,
  voteOnReply,
  deleteReply,
  getThreadSentiment,
} from "../controllers/discussionController";
import { protect } from "../middleware/authentication";

const router = Router();

/**
 * Get paginated discussions with filtering and search
 * @route GET /api/discussions
 * @query page, limit, filter (recent|trending|popular), search, categories (comma-separated)
 */
router.get("/", getDiscussions);

/**
 * Get community-wide sentiment summary
 * @route GET /api/discussions/sentiment
 */
router.get("/sentiment", getCommunitySentiment);

/**
 * Get the sentiment summary for a specific discussion thread
 * @route GET /api/discussions/:id/sentiment
 */
router.get("/:id/sentiment", getThreadSentiment);

/**
 * Get all discussions by a specific user
 * @route GET /api/discussions/user/:userId
 */
router.get("/user/:userId", getUserDiscussions);

/**
 * Get a single discussion by ID (increments view count)
 * @route GET /api/discussions/:id
 */
router.get("/:id", getDiscussion);

/**
 * Create a new discussion
 * @route POST /api/discussions
 * @body title, content, category, tags, images
 */
router.post("/", protect, createDiscussion);

/**
 * Vote on a discussion (upvote or downvote)
 * @route PUT /api/discussions/:id/vote
 * @body voteType ('up' or 'down')
 */
router.put("/:id/vote", protect, voteOnDiscussion);

/**
 * Delete a discussion (author only)
 * @route DELETE /api/discussions/:id
 */
router.delete("/:id", protect, deleteDiscussion);

/**
 * Get all replies for a discussion
 * @route GET /api/discussions/:id/replies
 */
router.get("/:id/replies", getReplies);

/**
 * Add a reply to a discussion
 * @route POST /api/discussions/:id/replies
 * @body content, images, parentReplyId (optional)
 */
router.post("/:id/replies", protect, createReply);

/**
 * Vote on a reply (upvote or downvote)
 * @route PUT /api/discussions/replies/:replyId/vote
 * @body voteType ('up' or 'down')
 */
router.put("/replies/:replyId/vote", protect, voteOnReply);

/**
 * Delete a reply (author only)
 * @route DELETE /api/discussions/replies/:replyId
 */
router.delete("/replies/:replyId", protect, deleteReply);

export default router;
