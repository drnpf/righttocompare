import { Discussion, Reply, IDiscussion, IReply } from "../models/Discussion";

/**
 * Creates a new discussion.
 */
export const createDiscussion = async (data: {
  authorId: string;
  authorName: string;
  authorAvatar: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  images: string[];
}): Promise<IDiscussion> => {
  const discussion = new Discussion({
    title: data.title,
    content: data.content,
    authorId: data.authorId,
    authorName: data.authorName,
    authorAvatar: data.authorAvatar,
    category: data.category || "Discussion",
    tags: data.tags || [],
    images: data.images || [],
  });

  await discussion.save();
  return discussion;
};

/**
 * Retrieves discussions with pagination, filtering, search, and sorting.
 */
export const getDiscussions = async (
  page: number = 1,
  limit: number = 20,
  filter: "recent" | "trending" | "popular" = "trending",
  search?: string,
  categories?: string[]
): Promise<{
  discussions: IDiscussion[];
  totalDiscussions: number;
  totalPages: number;
  currentPage: number;
}> => {
  // Build query
  const query: any = {};

  if (search && search.trim()) {
    const searchRegex = new RegExp(search.trim(), "i");
    query.$or = [
      { title: searchRegex },
      { content: searchRegex },
      { tags: searchRegex },
    ];
  }

  if (categories && categories.length > 0) {
    query.category = { $in: categories };
  }

  // Build sort
  let sort: any = {};
  switch (filter) {
    case "recent":
      sort = { createdAt: -1 };
      break;
    case "popular":
      // Sort by net score (upvotes - downvotes) then reply engagement
      sort = { upvotes: -1, replyCount: -1, views: -1 };
      break;
    case "trending":
    default:
      // Trending: recent + engagement (sort by creation date and engagement)
      sort = { createdAt: -1, upvotes: -1, replyCount: -1 };
      break;
  }

  const totalDiscussions = await Discussion.countDocuments(query);
  const totalPages = Math.ceil(totalDiscussions / limit);
  const skip = (page - 1) * limit;

  const discussions = await Discussion.find(query)
    .sort(sort)
    .skip(skip)
    .limit(limit);

  return {
    discussions,
    totalDiscussions,
    totalPages,
    currentPage: page,
  };
};

/**
 * Retrieves a single discussion by ID and increments view count.
 */
export const getDiscussionById = async (
  discussionId: string,
  incrementViews: boolean = true
): Promise<IDiscussion | null> => {
  const discussion = await Discussion.findById(discussionId);
  if (!discussion) return null;

  if (incrementViews) {
    discussion.views += 1;
    await discussion.save();
  }

  return discussion;
};

/**
 * Votes on a discussion (upvote or downvote with toggle).
 */
export const voteOnDiscussion = async (
  discussionId: string,
  userId: string,
  voteType: "up" | "down"
): Promise<IDiscussion | null> => {
  const discussion = await Discussion.findById(discussionId);
  if (!discussion) return null;

  const hasUpvoted = discussion.upvoters.includes(userId);
  const hasDownvoted = discussion.downvoters.includes(userId);

  if (voteType === "up") {
    if (hasUpvoted) {
      // Toggle off upvote
      discussion.upvoters = discussion.upvoters.filter((id) => id !== userId);
      discussion.upvotes = Math.max(0, discussion.upvotes - 1);
    } else {
      // Remove downvote if exists
      if (hasDownvoted) {
        discussion.downvoters = discussion.downvoters.filter((id) => id !== userId);
        discussion.downvotes = Math.max(0, discussion.downvotes - 1);
      }
      discussion.upvoters.push(userId);
      discussion.upvotes += 1;
    }
  } else {
    if (hasDownvoted) {
      // Toggle off downvote
      discussion.downvoters = discussion.downvoters.filter((id) => id !== userId);
      discussion.downvotes = Math.max(0, discussion.downvotes - 1);
    } else {
      // Remove upvote if exists
      if (hasUpvoted) {
        discussion.upvoters = discussion.upvoters.filter((id) => id !== userId);
        discussion.upvotes = Math.max(0, discussion.upvotes - 1);
      }
      discussion.downvoters.push(userId);
      discussion.downvotes += 1;
    }
  }

  await discussion.save();
  return discussion;
};

/**
 * Deletes a discussion and all its replies. Only the author can delete.
 */
export const deleteDiscussion = async (
  discussionId: string,
  userId: string
): Promise<boolean> => {
  const discussion = await Discussion.findById(discussionId);
  if (!discussion) return false;

  if (discussion.authorId !== userId) {
    throw new Error("Not authorized to delete this discussion");
  }

  // Delete all replies for this discussion
  await Reply.deleteMany({ discussionId: discussion._id });
  await Discussion.findByIdAndDelete(discussionId);
  return true;
};

/**
 * Adds a reply to a discussion.
 */
export const addReply = async (data: {
  discussionId: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  content: string;
  images: string[];
  parentReplyId?: string;
}): Promise<IReply> => {
  const discussion = await Discussion.findById(data.discussionId);
  if (!discussion) {
    throw new Error("Discussion not found");
  }

  const reply = new Reply({
    discussionId: discussion._id,
    content: data.content,
    authorId: data.authorId,
    authorName: data.authorName,
    authorAvatar: data.authorAvatar,
    images: data.images || [],
    parentReplyId: data.parentReplyId || null,
  });

  await reply.save();

  // Increment reply count on the discussion
  discussion.replyCount += 1;
  await discussion.save();

  return reply;
};

/**
 * Retrieves all replies for a discussion.
 */
export const getRepliesForDiscussion = async (
  discussionId: string
): Promise<IReply[]> => {
  return Reply.find({ discussionId }).sort({ createdAt: 1 });
};

/**
 * Votes on a reply (upvote or downvote with toggle).
 */
export const voteOnReply = async (
  replyId: string,
  userId: string,
  voteType: "up" | "down"
): Promise<IReply | null> => {
  const reply = await Reply.findById(replyId);
  if (!reply) return null;

  const hasUpvoted = reply.upvoters.includes(userId);
  const hasDownvoted = reply.downvoters.includes(userId);

  if (voteType === "up") {
    if (hasUpvoted) {
      reply.upvoters = reply.upvoters.filter((id) => id !== userId);
      reply.upvotes = Math.max(0, reply.upvotes - 1);
    } else {
      if (hasDownvoted) {
        reply.downvoters = reply.downvoters.filter((id) => id !== userId);
        reply.downvotes = Math.max(0, reply.downvotes - 1);
      }
      reply.upvoters.push(userId);
      reply.upvotes += 1;
    }
  } else {
    if (hasDownvoted) {
      reply.downvoters = reply.downvoters.filter((id) => id !== userId);
      reply.downvotes = Math.max(0, reply.downvotes - 1);
    } else {
      if (hasUpvoted) {
        reply.upvoters = reply.upvoters.filter((id) => id !== userId);
        reply.upvotes = Math.max(0, reply.upvotes - 1);
      }
      reply.downvoters.push(userId);
      reply.downvotes += 1;
    }
  }

  await reply.save();
  return reply;
};

/**
 * Deletes a reply. Only the author can delete.
 */
export const deleteReply = async (
  replyId: string,
  userId: string
): Promise<boolean> => {
  const reply = await Reply.findById(replyId);
  if (!reply) return false;

  if (reply.authorId !== userId) {
    throw new Error("Not authorized to delete this reply");
  }

  // Decrement reply count on the discussion
  await Discussion.findByIdAndUpdate(reply.discussionId, {
    $inc: { replyCount: -1 },
  });

  await Reply.findByIdAndDelete(replyId);
  return true;
};
