import { CategoryRatings } from "../components/MultiRatingInput";
import { SentimentTag } from "./sentimentTypes";

/**
 * Represents full data structure for a phone review. Includes user-provided
 * ratings, content, community feedback and generated sentiment analysis.
 */
export interface ReviewData {
  id: number;
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
 * aggregated rating of all phones.
 */
export interface ReviewsResponse {
  reviews: ReviewData[];
  totalReviews: number;
  totalPages: number;
  currentPage: number;
  aggregateRating: number;
  categoryAverages: {
    camera: number;
    battery: number;
    design: number;
    performance: number;
    value: number;
  };
}
