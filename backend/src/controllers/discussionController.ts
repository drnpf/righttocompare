import { Response } from "express";
import { AuthRequest } from "../middleware/authMiddleware";
import * as discussionService from "../services/discussionService";

/**
 * Creates a new discussion.
 * @route POST /api/discussions
 */
export const createDiscussion = async (req: AuthRequest, res: Response) => {
  try {
    const { title, content, category, tags, images } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ message: "Title is required" });
    }

    if (!content || !content.trim()) {
      return res.status(400).json({ message: "Content is required" });
    }

    const userId = req.user?.uid;
    const userName = req.user?.name || req.user?.email?.split("@")[0] || "Anonymous";

    if (!userId) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    const discussion = await discussionService.createDiscussion({
      authorId: userId,
      authorName: userName,
      authorAvatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(userName)}`,
      title: title.trim(),
      content: content.trim(),
      category: category || "Discussion",
      tags: Array.isArray(tags) ? tags : [],
      images: Array.isArray(images) ? images : [],
    });

    res.status(201).json(discussion);
  } catch (err) {
    console.error("Error creating discussion:", err);
    res.status(500).json({ message: "Server error creating discussion" });
  }
};

/**
 * Gets paginated discussions with filtering and search.
 * @route GET /api/discussions
 */
export const getDiscussions = async (req: AuthRequest, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const filter = (req.query.filter as "recent" | "trending" | "popular") || "trending";
    const search = req.query.search as string | undefined;
    const categoriesParam = req.query.categories as string | undefined;
    const categories = categoriesParam ? categoriesParam.split(",") : undefined;

    const result = await discussionService.getDiscussions(
      page,
      limit,
      filter,
      search,
      categories
    );

    res.status(200).json(result);
  } catch (err) {
    console.error("Error fetching discussions:", err);
    res.status(500).json({ message: "Server error fetching discussions" });
  }
};

/**
 * Gets a single discussion by ID.
 * @route GET /api/discussions/:id
 */
export const getDiscussion = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const discussion = await discussionService.getDiscussionById(id);
    if (!discussion) {
      return res.status(404).json({ message: "Discussion not found" });
    }

    res.status(200).json(discussion);
  } catch (err) {
    console.error("Error fetching discussion:", err);
    res.status(500).json({ message: "Server error fetching discussion" });
  }
};

/**
 * Votes on a discussion (upvote or downvote).
 * @route PUT /api/discussions/:id/vote
 */
export const voteOnDiscussion = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { voteType } = req.body;

    if (!voteType || !["up", "down"].includes(voteType)) {
      return res.status(400).json({
        message: "Invalid voteType. Must be 'up' or 'down'",
      });
    }

    const userId = req.user?.uid;
    if (!userId) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    const discussion = await discussionService.voteOnDiscussion(id, userId, voteType);
    if (!discussion) {
      return res.status(404).json({ message: "Discussion not found" });
    }

    res.status(200).json(discussion);
  } catch (err) {
    console.error("Error voting on discussion:", err);
    res.status(500).json({ message: "Server error voting on discussion" });
  }
};

/**
 * Deletes a discussion (author only).
 * @route DELETE /api/discussions/:id
 */
export const deleteDiscussion = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const userId = req.user?.uid;
    if (!userId) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    const deleted = await discussionService.deleteDiscussion(id, userId);
    if (!deleted) {
      return res.status(404).json({ message: "Discussion not found" });
    }

    res.status(200).json({ message: "Discussion deleted successfully" });
  } catch (err: any) {
    if (err.message === "Not authorized to delete this discussion") {
      return res.status(403).json({ message: err.message });
    }
    console.error("Error deleting discussion:", err);
    res.status(500).json({ message: "Server error deleting discussion" });
  }
};

/**
 * Gets all replies for a discussion.
 * @route GET /api/discussions/:id/replies
 */
export const getReplies = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const replies = await discussionService.getRepliesForDiscussion(id);
    res.status(200).json(replies);
  } catch (err) {
    console.error("Error fetching replies:", err);
    res.status(500).json({ message: "Server error fetching replies" });
  }
};

/**
 * Adds a reply to a discussion.
 * @route POST /api/discussions/:id/replies
 */
export const createReply = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { content, images, parentReplyId } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({ message: "Reply content is required" });
    }

    const userId = req.user?.uid;
    const userName = req.user?.name || req.user?.email?.split("@")[0] || "Anonymous";

    if (!userId) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    const reply = await discussionService.addReply({
      discussionId: id,
      authorId: userId,
      authorName: userName,
      authorAvatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(userName)}`,
      content: content.trim(),
      images: Array.isArray(images) ? images : [],
      parentReplyId: parentReplyId || undefined,
    });

    res.status(201).json(reply);
  } catch (err: any) {
    if (err.message === "Discussion not found") {
      return res.status(404).json({ message: err.message });
    }
    console.error("Error creating reply:", err);
    res.status(500).json({ message: "Server error creating reply" });
  }
};

/**
 * Votes on a reply (upvote or downvote).
 * @route PUT /api/discussions/replies/:replyId/vote
 */
export const voteOnReply = async (req: AuthRequest, res: Response) => {
  try {
    const { replyId } = req.params;
    const { voteType } = req.body;

    if (!voteType || !["up", "down"].includes(voteType)) {
      return res.status(400).json({
        message: "Invalid voteType. Must be 'up' or 'down'",
      });
    }

    const userId = req.user?.uid;
    if (!userId) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    const reply = await discussionService.voteOnReply(replyId, userId, voteType);
    if (!reply) {
      return res.status(404).json({ message: "Reply not found" });
    }

    res.status(200).json(reply);
  } catch (err) {
    console.error("Error voting on reply:", err);
    res.status(500).json({ message: "Server error voting on reply" });
  }
};

/**
 * Deletes a reply (author only).
 * @route DELETE /api/discussions/replies/:replyId
 */
export const deleteReply = async (req: AuthRequest, res: Response) => {
  try {
    const { replyId } = req.params;

    const userId = req.user?.uid;
    if (!userId) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    const deleted = await discussionService.deleteReply(replyId, userId);
    if (!deleted) {
      return res.status(404).json({ message: "Reply not found" });
    }

    res.status(200).json({ message: "Reply deleted successfully" });
  } catch (err: any) {
    if (err.message === "Not authorized to delete this reply") {
      return res.status(403).json({ message: err.message });
    }
    console.error("Error deleting reply:", err);
    res.status(500).json({ message: "Server error deleting reply" });
  }
};
