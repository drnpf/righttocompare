import { CategoryRatings } from "../components/MultiRatingInput";
import { ReviewData } from "../components/ReviewCard";

const API_URL = "http://localhost:5001/api/phones"; // CHANGE LATER ON PRODUCTION

export interface ReviewsResponse {
  reviews: ReviewData[];
  totalReviews: number;
  totalPages: number;
  currentPage: number;
}

/**
 * Fetches reviews for a phone with pagination.
 * @param phoneId The phone ID (e.g., "galaxy-s24-ultra")
 * @param page Page number (default: 1)
 * @param limit Reviews per page (default: 10)
 * @returns Reviews data with pagination info
 */
export const getPhoneReviews = async (
  phoneId: string,
  page: number = 1,
  limit: number = 10
): Promise<ReviewsResponse | null> => {
  try {
    const response = await fetch(
      `${API_URL}/${phoneId}/reviews?page=${page}&limit=${limit}`
    );

    if (response.status === 404) {
      return null;
    }

    if (!response.ok) {
      throw new Error("Failed to fetch reviews");
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching reviews:", error);
    return null;
  }
};

/**
 * Submits a new review for a phone.
 * @param phoneId The phone ID
 * @param reviewData The review data (title, review text, category ratings)
 * @param token Firebase auth token
 * @returns The created review, or null if failed
 */
export const submitReview = async (
  phoneId: string,
  reviewData: {
    title: string;
    review: string;
    categoryRatings: CategoryRatings;
  },
  token: string
): Promise<ReviewData | null> => {
  try {
    const response = await fetch(`${API_URL}/${phoneId}/reviews`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(reviewData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to submit review");
    }

    return await response.json();
  } catch (error) {
    console.error("Error submitting review:", error);
    throw error;
  }
};

/**
 * Votes on a review (helpful or not helpful).
 * @param phoneId The phone ID
 * @param reviewId The review ID
 * @param voteType 'helpful' or 'notHelpful'
 * @param token Firebase auth token
 * @returns The updated review, or null if failed
 */
export const voteOnReview = async (
  phoneId: string,
  reviewId: number,
  voteType: "helpful" | "notHelpful",
  token: string
): Promise<ReviewData | null> => {
  try {
    const response = await fetch(
      `${API_URL}/${phoneId}/reviews/${reviewId}/vote`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ voteType }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to vote on review");
    }

    return await response.json();
  } catch (error) {
    console.error("Error voting on review:", error);
    throw error;
  }
};

/**
 * Deletes a review (user can only delete their own).
 * @param phoneId The phone ID
 * @param reviewId The review ID
 * @param token Firebase auth token
 * @returns True if deleted successfully
 */
export const deleteReview = async (
  phoneId: string,
  reviewId: number,
  token: string
): Promise<boolean> => {
  try {
    const response = await fetch(
      `${API_URL}/${phoneId}/reviews/${reviewId}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to delete review");
    }

    return true;
  } catch (error) {
    console.error("Error deleting review:", error);
    throw error;
  }
};
