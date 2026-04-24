import { Discussion, Reply, IDiscussion, IReply } from "../models/Discussion";
import { ISentimentSummary, ISentimentTag } from "../models/Sentiment";
import { aggregateSentiment, analyzeSentiment } from "../utils/sentimentAnalyzer";

/**
 * Helper function that converts string tags to ISentimentTag items
 */
const parseTags = (tags: string[]): ISentimentTag[] => {
  return tags.map((label) => ({
    topic: label.slice(1),
    sentiment: label.startsWith("+") ? "positive" : "negative",
    label,
  }));
};

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
  sentimentTags: string[];
  images: string[];
}): Promise<IDiscussion> => {
  // Auto-detect sentiment tags from title + content
  const rawTags = analyzeSentiment(`${data.title} ${data.content}`);
  const sentimentTags = rawTags.map((t) => t.label);

  // Initialization of sentiment summary based on first post
  const sentimentSummary = aggregateSentiment([rawTags]);

  const discussion = new Discussion({
    title: data.title,
    content: data.content,
    authorId: data.authorId,
    authorName: data.authorName,
    authorAvatar: data.authorAvatar,
    category: data.category || "Discussion",
    tags: data.tags || [],
    sentimentTags,
    sentimentSummary,
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
  categories?: string[],
  sentimentTags?: string[],
): Promise<{
  discussions: IDiscussion[];
  totalDiscussions: number;
  totalPages: number;
  currentPage: number;
}> => {
  // Build query
  const query: any = {};

  // Searching logic
  if (search && search.trim()) {
    const searchRegex = new RegExp(search.trim(), "i");
    query.$or = [{ title: searchRegex }, { content: searchRegex }, { tags: searchRegex }];
  }

  // Category filtering
  if (categories && categories.length > 0) {
    query.category = { $in: categories };
  }

  // Sentiment tag filtering
  if (sentimentTags && sentimentTags.length > 0) {
    query.sentimentTags = { $all: sentimentTags };
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

  const discussions = await Discussion.find(query).sort(sort).skip(skip).limit(limit).lean();

  return {
    discussions,
    totalDiscussions,
    totalPages,
    currentPage: page,
  };
};

/**
 * Retrieves all discussions created by a specific user, sorted newest first.
 */
export const getDiscussionsByUser = async (authorId: string): Promise<IDiscussion[]> => {
  return Discussion.find({ authorId }).sort({ createdAt: -1 }).lean();
};

/**
 * Retrieves a single discussion by ID and increments view count.
 */
export const getDiscussionById = async (
  discussionId: string,
  incrementViews: boolean = true,
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
  voteType: "up" | "down",
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
export const deleteDiscussion = async (discussionId: string, userId: string): Promise<boolean> => {
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
  sentimentTags: string[];
  images: string[];
  parentReplyId?: string;
}): Promise<IReply> => {
  const discussion = await Discussion.findById(data.discussionId);
  if (!discussion) throw new Error("Discussion not found");

  // Auto-detect sentiment tags from reply content
  const rawTags = analyzeSentiment(data.content);
  const sentimentTags = rawTags.map((t) => t.label);

  const reply = new Reply({
    discussionId: discussion._id,
    content: data.content,
    authorId: data.authorId,
    authorName: data.authorName,
    authorAvatar: data.authorAvatar,
    images: data.images || [],
    sentimentTags,
    parentReplyId: data.parentReplyId || null,
  });

  await reply.save();

  // Increment reply count on the discussion
  discussion.replyCount += 1;

  // Recalculating thread sentiment on new reply being added
  const threadSentiment = await getThreadSentiment(discussion._id.toString());
  if (threadSentiment) discussion.sentimentSummary = threadSentiment;
  await discussion.save();
  return reply;
};

/**
 * Retrieves all replies for a discussion.
 */
export const getRepliesForDiscussion = async (discussionId: string): Promise<IReply[]> => {
  return Reply.find({ discussionId }).sort({ createdAt: 1 }).lean();
};

/**
 * Votes on a reply (upvote or downvote with toggle).
 */
export const voteOnReply = async (replyId: string, userId: string, voteType: "up" | "down"): Promise<IReply | null> => {
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
export const deleteReply = async (replyId: string, userId: string): Promise<boolean> => {
  const reply = await Reply.findById(replyId);
  if (!reply) return false;

  if (reply.authorId !== userId) throw new Error("Not authorized to delete this reply");

  // Removing reply
  const discussionId = reply.discussionId;
  await Reply.findByIdAndDelete(replyId);

  // Decrement reply count on the discussion and update sentiment summary
  const discussion = await Discussion.findById(discussionId);
  if (discussion) {
    discussion.replyCount = Math.max(0, discussion.replyCount - 1);

    // Recalculates sentiment summary with a reply gone
    const updatedSentiment = await getThreadSentiment(discussionId.toString());
    if (updatedSentiment) discussion.sentimentSummary = updatedSentiment;
    await discussion.save();
  }
  return true;
};

/**
 * Gets a sentiment summary across all discussions and replies.
 * Aggregates sentiment tags to show community-wide pros/cons.
 */
export const getCommunitySentiment = async (): Promise<ISentimentSummary> => {
  const discussions = await Discussion.find({}, { sentimentTags: 1 }).lean();
  const replies = await Reply.find({}, { sentimentTags: 1 }).lean();

  // Getting all sentiment tags from discussions and replies
  const allTagSets = [
    ...discussions.map((d) => parseTags(d.sentimentTags)),
    ...replies.map((r) => parseTags(r.sentimentTags)),
  ];
  const summary = aggregateSentiment(allTagSets);
  summary.totalAnalyzed = discussions.length; // Set total analyzed to number of discussions
  return summary;
};

/**
 * Gets the sentiment summary for a specific discussion thread. Sentiment summary
 * takes in account of all replies within the thread too.
 */
export const getThreadSentiment = async (discussionId: string): Promise<ISentimentSummary | null> => {
  // Getting discussion thread sentiment tags
  const discussion = await Discussion.findById(discussionId, { sentimentTags: 1 }).lean();
  if (!discussion) return null;

  const replies = await Reply.find({ discussionId }, { sentimentTags: 1 });

  // Fetching tags from discussion thread and replies into an aggregated set
  const opTags = parseTags(discussion.sentimentTags);
  const replyTagSets = replies.map((r) => parseTags(r.sentimentTags));
  const summary = aggregateSentiment([opTags, ...replyTagSets]);
  summary.totalAnalyzed = replies.length; // Set total analyzed to number of discussions
  return summary;
};
