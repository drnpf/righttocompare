import { SentimentTag } from "./sentimentTypes";

// ------------------------------------------------------------
// | API RESPONSE INTERFACES
// ------------------------------------------------------------
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

// ------------------------------------------------------------
// | UI MODELS
// ------------------------------------------------------------
/**
 * Represents user-submitted report for moderation.
 */
export interface Report {
  id: string;
  itemId: string; // Discussion or Reply ID
  itemType: "discussion" | "reply";
  reason: string;
  details?: string;
  reportedBy: string;
  timestamp: number;
}

/**
 * UI Reply model as an adapter for ReplyResponse from API.
 */
export interface Reply {
  id: string;
  discussionId: string;
  content: string;
  author: string;
  authorId?: string; // Firebase UID (from API)
  authorAvatar: string;
  timestamp: number;
  upvotes: number;
  downvotes: number;
  upvoters?: string[];
  downvoters?: string[];
  images?: string[]; // Base64 encoded images
  parentReplyId?: string; // For threaded replies
  sentimentTags: SentimentTag[];
}

/**
 * UI Discussion model as an adapter for DiscussionResponse from API.
 */
export interface Discussion {
  id: string;
  title: string;
  content: string;
  author: string;
  authorId?: string; // Firebase UID (from API)
  authorAvatar: string;
  timestamp: number; // Unix timestamp
  category: string;
  tags: string[];
  images?: string[]; // Base64 encoded images
  upvotes: number;
  downvotes: number;
  upvoters?: string[];
  downvoters?: string[];
  replies: number;
  views: number;
  sentimentTags: SentimentTag[];
}
