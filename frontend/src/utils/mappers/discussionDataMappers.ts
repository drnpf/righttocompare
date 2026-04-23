import { DiscussionResponse, Discussion, ReplyResponse, Reply } from "../../types/discussionTypes";
/**
 * Maps an API discussion response to the frontend Discussion interface.
 */
export const mapApiDiscussion = (d: DiscussionResponse): Discussion => {
  return {
    id: d._id,
    title: d.title,
    content: d.content,
    author: d.authorName,
    authorId: d.authorId,
    authorAvatar: d.authorAvatar,
    timestamp: new Date(d.createdAt).getTime(),
    category: d.category,
    tags: d.tags,
    images: d.images,
    upvotes: d.upvotes,
    downvotes: d.downvotes,
    upvoters: d.upvoters,
    downvoters: d.downvoters,
    replies: d.replyCount,
    views: d.views,
    sentimentTags: d.sentimentTags || [],
  };
};

/**
 * Maps an API reply response to the frontend Reply interface.
 */
export const mapApiReply = (r: ReplyResponse): Reply => {
  return {
    id: r._id,
    discussionId: r.discussionId,
    content: r.content,
    author: r.authorName,
    authorId: r.authorId,
    authorAvatar: r.authorAvatar,
    timestamp: new Date(r.createdAt).getTime(),
    upvotes: r.upvotes,
    downvotes: r.downvotes,
    upvoters: r.upvoters,
    downvoters: r.downvoters,
    images: r.images,
    parentReplyId: r.parentReplyId || undefined,
    sentimentTags: r.sentimentTags || [],
  };
};
