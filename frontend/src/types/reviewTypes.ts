import { CategoryRatings } from "../components/MultiRatingInput";
import { SentimentSummary, SentimentTag } from "./sentimentTypes";

export type ReviewSortType = "newest" | "oldest" | "helpful";

/**
 * Contains review metadata of phone.
 */
export interface ReviewMetaData {
  totalReviews: number;
  aggregateRating: number;
  categoryAverages: CategoryRatings;
  sentimentSummary: SentimentSummary;
}

/**
 * Defines the criteria used to filter and sort reviews.
 * This interface is used by the API layer and the page components.
 */
export interface ReviewFilterOptions {
  sentiments?: SentimentTag[];
  sortBy?: ReviewSortType;
}

/**
 * Represents full data structure for a phone review. Includes user-provided
 * ratings, content, community feedback and generated sentiment analysis.
 */
export interface ReviewData {
  _id: string;
  phoneId: string;
  userId?: string;
  userName: string;
  rating: number;
  categoryRatings: CategoryRatings;
  date: string;
  title: string;
  review: string;
  helpful: number;
  notHelpful: number;
  helpfulVoters?: string[];
  notHelpfulVoters?: string[];
  sentimentTags: SentimentTag[];
}

/**
 * Represents pagination page for a phone's review section. Contains list of
 * review entries for a certain review page, and metadata on pagination and
 * aggregated rating of current phone.
 */
export interface ReviewsResponse extends ReviewMetaData {
  reviews: ReviewData[];
  totalPages: number;
  currentPage: number;
}

/**
 * For containing create/delete response metadata.
 */
export interface ReviewActionResponse {
  message?: string;
  review?: ReviewData;
  meta: ReviewMetaData;
}
