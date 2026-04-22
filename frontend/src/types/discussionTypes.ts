import { SentimentTag } from "./sentimentTypes";

/**
 * Represents a community discussion or question.
 */
export interface DiscussionResponse {
  _id: string;
  title: string;
  content: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  category: string;
  tags: string[];
  images: string[];
  upvotes: number;
  downvotes: number;
  upvoters: string[];
  downvoters: string[];
  replyCount: number;
  views: number;
  createdAt: string;
  updatedAt: string;
  sentimentTags: SentimentTag[];
}

/**
 * Represents a user's response or nested comments within a discussion.
 */
export interface ReplyResponse {
  _id: string;
  discussionId: string;
  content: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  images: string[];
  upvotes: number;
  downvotes: number;
  upvoters: string[];
  downvoters: string[];
  parentReplyId: string | null;
  createdAt: string;
  updatedAt: string;
  sentimentTags: SentimentTag[];
}

/**
 * A wrapper for paginated discussion search results.
 */
export interface DiscussionsListResponse {
  discussions: DiscussionResponse[];
  totalDiscussions: number;
  totalPages: number;
  currentPage: number;
}
