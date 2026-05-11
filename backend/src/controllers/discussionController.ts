import { Response } from "express";
import { AuthRequest } from "../middleware/authentication";
import * as discussionService from "../services/discussionService";
import { analyzeSentiment } from "../utils/sentimentAnalyzer";
import { filterMultipleFields } from "../utils/contentFilter";

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

    // Content moderation — reject profanity and spam
    const contentCheck = filterMultipleFields([
      { name: "title", text: title },
      { name: "content", text: content },
    ]);
    if (!contentCheck.isClean) {
      return res.status(400).json({
        message: `${contentCheck.reason} in ${contentCheck.field}. Please revise and resubmit.`,
      });
    }

    const userId = req.user?.uid;
    const userName = req.user?.name || req.user?.email?.split("@")[0] || "Anonymous";

    if (!userId) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    // Analyzing sentiment tags before saving
    const sentimentResults = analyzeSentiment(content);
    const sentimentTags = sentimentResults.map((t) => t.label);

    const discussion = await discussionService.createDiscussion({
      authorId: userId,
      authorName: userName,
      authorAvatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(userName)}`,
      title: title.trim(),
      content: content.trim(),
      category: category || "Discussion",
      tags: Array.isArray(tags) ? tags : [],
      sentimentTags: sentimentTags,
      images: Array.isArray(images) ? images : [],
    });

    res.status(201).json(discussion);
  } catch (err) {
    console.error("Error creating discussion:", err);
    res.status(500).json({ message: "Server error creating discussion" });
  }
};

/**
 * Gets community-wide sentiment summary from all discussions and replies.
 * @route GET /api/discussions/sentiment
 */
export const getCommunitySentiment = async (req: AuthRequest, res: Response) => {
  try {
    const result = await discussionService.getCommunitySentiment();
    res.status(200).json(result);
  } catch (err) {
    console.error("Error fetching community sentiment:", err);
    res.status(500).json({ message: "Server error fetching sentiment" });
  }
};

/**
 * Gets the specific sentiment summary for a single discussion thread.
 * @route GET /api/discussions/:id/sentiment
 */
export const getThreadSentiment = async (req: AuthRequest, res: Response) => {
  try {
    const id = String(req.params.id);
    const sentiment = await discussionService.getThreadSentiment(id);
    if (!sentiment) return res.status(404).json({ message: "Discussion not found" });
    res.status(200).json(sentiment);
  } catch (err) {
    console.error("Error fetching thread sentiment:", err);
    res.status(500).json({ message: "Server error fetching thread sentiment" });
  }
};

/**
 * Gets paginated discussions with filtering and search.
 * @route GET /api/discussions
 */
export const getDiscussions = async (req: AuthRequest, res: Response) => {
  try {
    // Parsing URL for arguments
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const filter = (req.query.filter as "recent" | "trending" | "popular") || "trending";
    const search = req.query.search as string | undefined;

    // Helper function to parse multiple URL parameters
    const parseQueryParam = (param: any) => {
      if (!param) return undefined;
      return Array.isArray(param) ? (param as string[]) : (param as string).split(",");
    };
    const categories = parseQueryParam(req.query.categories);
    const sentimentTags = parseQueryParam(req.query.sentimentTags);

    // Fetching for discussion page with filters applied
    const result = await discussionService.getDiscussions(page, limit, filter, search, categories, sentimentTags);

    res.status(200).json(result);
  } catch (err) {
    console.error("Error fetching discussions:", err);
    res.status(500).json({ message: "Server error fetching discussions" });
  }
};

/**
 * Gets all discussions created by a specific user.
 * @route GET /api/discussions/user/:userId
 */
export const getUserDiscussions = async (req: AuthRequest, res: Response) => {
  try {
    const userId = String(req.params.userId);
    const discussions = await discussionService.getDiscussionsByUser(userId);
    res.status(200).json(discussions);
  } catch (err) {
    console.error("Error fetching user discussions:", err);
    res.status(500).json({ message: "Server error fetching user discussions" });
  }
};

/**
 * Gets a single discussion by ID.
 * @route GET /api/discussions/:id
 */
export const getDiscussion = async (req: AuthRequest, res: Response) => {
  try {
    const id = String(req.params.id);

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
    const id = String(req.params.id);
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
    const id = String(req.params.id);

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
    const id = String(req.params.id);

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
    const id = String(req.params.id);
    const { content, images, parentReplyId } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({ message: "Reply content is required" });
    }

    // Content moderation — reject profanity and spam
    const replyCheck = filterMultipleFields([
      { name: "reply", text: content },
    ]);
    if (!replyCheck.isClean) {
      return res.status(400).json({
        message: `${replyCheck.reason} in ${replyCheck.field}. Please revise and resubmit.`,
      });
    }

    const userId = req.user?.uid;
    const userName = req.user?.name || req.user?.email?.split("@")[0] || "Anonymous";

    if (!userId) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    // Analyzing sentiment tags before saving
    const sentimentResults = analyzeSentiment(content);
    const sentimentTags = sentimentResults.map((t) => t.label);

    const reply = await discussionService.addReply({
      discussionId: id,
      authorId: userId,
      authorName: userName,
      authorAvatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(userName)}`,
      content: content.trim(),
      sentimentTags,
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
    const replyId = String(req.params.replyId);
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
    const replyId = String(req.params.replyId);

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
