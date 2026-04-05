import Phone, { IPhone, IReview, ICategoryRatings } from "../models/Phone";
import { analyzeSentiment } from "../utils/sentimentAnalyzer";

/**
 * Adds a new review to a phone document.
 * @param phoneId The unique string ID of the phone
 * @param reviewData The review data to add
 * @returns The updated phone document, or null if phone not found
 */
export const addReviewToPhone = async (
  phoneId: string,
  reviewData: {
    userId: string;
    userName: string;
    categoryRatings: ICategoryRatings;
    title: string;
    review: string;
  }
): Promise<IPhone | null> => {
  const phone = await Phone.findOne({ id: phoneId });
  if (!phone) return null;

  // Check if user already has a review for this phone
  const existingReview = phone.reviews.find((r) => r.userId === reviewData.userId);
  if (existingReview) {
    throw new Error("User has already reviewed this phone");
  }

  // Calculate overall rating from category ratings
  const { camera, battery, design, performance, value } = reviewData.categoryRatings;
  const overallRating = Number(((camera + battery + design + performance + value) / 5).toFixed(1));

  // Generate new review ID
  const maxId = phone.reviews.length > 0
    ? Math.max(...phone.reviews.map((r) => r.id))
    : 0;
  const newReviewId = maxId + 1;

  // Auto-detect sentiment tags from review title + text
  const sentimentTags = analyzeSentiment(`${reviewData.title} ${reviewData.review}`)
    .map((t) => t.label);

  const newReview: IReview = {
    id: newReviewId,
    userId: reviewData.userId,
    userName: reviewData.userName,
    rating: overallRating,
    categoryRatings: reviewData.categoryRatings,
    date: new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }),
    title: reviewData.title,
    review: reviewData.review,
    sentimentTags,
    helpful: 0,
    notHelpful: 0,
    helpfulVoters: [],
    notHelpfulVoters: [],
  };

  phone.reviews.unshift(newReview);
  await phone.save();
  return phone;
};

/**
 * Retrieves all reviews for a phone with pagination and aggregate ratings.
 * @param phoneId The unique string ID of the phone
 * @param page Page number (1-indexed)
 * @param limit Number of reviews per page
 * @returns Object with reviews array, pagination info, and aggregate ratings
 */
export const getReviewsForPhone = async (
  phoneId: string,
  page: number = 1,
  limit: number = 10
): Promise<{
  reviews: IReview[];
  totalReviews: number;
  totalPages: number;
  currentPage: number;
  aggregateRating: number;
  categoryAverages: ICategoryRatings;
} | null> => {
  const phone = await Phone.findOne({ id: phoneId });
  if (!phone) return null;

  const allReviews = phone.reviews;
  const totalReviews = allReviews.length;
  const totalPages = Math.ceil(totalReviews / limit);
  const startIndex = (page - 1) * limit;
  const reviews = allReviews.slice(startIndex, startIndex + limit);

  // Compute aggregate rating and per-category averages from ALL reviews
  let aggregateRating = 0;
  let categoryAverages: ICategoryRatings = { camera: 0, battery: 0, design: 0, performance: 0, value: 0 };

  if (totalReviews > 0) {
    const totals = allReviews.reduce(
      (acc, r) => ({
        camera: acc.camera + r.categoryRatings.camera,
        battery: acc.battery + r.categoryRatings.battery,
        design: acc.design + r.categoryRatings.design,
        performance: acc.performance + r.categoryRatings.performance,
        value: acc.value + r.categoryRatings.value,
      }),
      { camera: 0, battery: 0, design: 0, performance: 0, value: 0 }
    );

    categoryAverages = {
      camera: Number((totals.camera / totalReviews).toFixed(1)),
      battery: Number((totals.battery / totalReviews).toFixed(1)),
      design: Number((totals.design / totalReviews).toFixed(1)),
      performance: Number((totals.performance / totalReviews).toFixed(1)),
      value: Number((totals.value / totalReviews).toFixed(1)),
    };

    aggregateRating = Number(
      ((categoryAverages.camera + categoryAverages.battery + categoryAverages.design + categoryAverages.performance + categoryAverages.value) / 5).toFixed(1)
    );
  }

  return {
    reviews,
    totalReviews,
    totalPages,
    currentPage: page,
    aggregateRating,
    categoryAverages,
  };
};

/**
 * Updates the vote count on a review (helpful or not helpful).
 * @param phoneId The unique string ID of the phone
 * @param reviewId The ID of the review to vote on
 * @param userId The Firebase UID of the voter
 * @param voteType 'helpful' or 'notHelpful'
 * @returns The updated review, or null if not found
 */
export const updateReviewVote = async (
  phoneId: string,
  reviewId: number,
  userId: string,
  voteType: "helpful" | "notHelpful"
): Promise<IReview | null> => {
  const phone = await Phone.findOne({ id: phoneId });
  if (!phone) return null;

  const review = phone.reviews.find((r) => r.id === reviewId);
  if (!review) return null;

  // Check if user already voted
  const hasVotedHelpful = review.helpfulVoters.includes(userId);
  const hasVotedNotHelpful = review.notHelpfulVoters.includes(userId);

  if (voteType === "helpful") {
    if (hasVotedHelpful) {
      // Remove helpful vote (toggle off)
      review.helpfulVoters = review.helpfulVoters.filter((id) => id !== userId);
      review.helpful = Math.max(0, review.helpful - 1);
    } else {
      // Add helpful vote
      if (hasVotedNotHelpful) {
        // Remove not helpful vote first
        review.notHelpfulVoters = review.notHelpfulVoters.filter((id) => id !== userId);
        review.notHelpful = Math.max(0, review.notHelpful - 1);
      }
      review.helpfulVoters.push(userId);
      review.helpful += 1;
    }
  } else {
    if (hasVotedNotHelpful) {
      // Remove not helpful vote (toggle off)
      review.notHelpfulVoters = review.notHelpfulVoters.filter((id) => id !== userId);
      review.notHelpful = Math.max(0, review.notHelpful - 1);
    } else {
      // Add not helpful vote
      if (hasVotedHelpful) {
        // Remove helpful vote first
        review.helpfulVoters = review.helpfulVoters.filter((id) => id !== userId);
        review.helpful = Math.max(0, review.helpful - 1);
      }
      review.notHelpfulVoters.push(userId);
      review.notHelpful += 1;
    }
  }

  await phone.save();
  return review;
};

/**
 * Removes a review from a phone document.
 * @param phoneId The unique string ID of the phone
 * @param reviewId The ID of the review to delete
 * @param userId The Firebase UID of the user requesting deletion
 * @returns True if deleted, false if not found or not authorized
 */
export const removeReview = async (
  phoneId: string,
  reviewId: number,
  userId: string
): Promise<boolean> => {
  const phone = await Phone.findOne({ id: phoneId });
  if (!phone) return false;

  const reviewIndex = phone.reviews.findIndex((r) => r.id === reviewId);
  if (reviewIndex === -1) return false;

  // Check if user owns the review
  if (phone.reviews[reviewIndex].userId !== userId) {
    throw new Error("Not authorized to delete this review");
  }

  phone.reviews.splice(reviewIndex, 1);
  await phone.save();
  return true;
};

/**
 * Gets a single review by ID.
 * @param phoneId The unique string ID of the phone
 * @param reviewId The ID of the review
 * @returns The review, or null if not found
 */
export const getReviewById = async (
  phoneId: string,
  reviewId: number
): Promise<IReview | null> => {
  const phone = await Phone.findOne({ id: phoneId });
  if (!phone) return null;

  return phone.reviews.find((r) => r.id === reviewId) || null;
};

/**
 * Gets a sentiment summary (pros/cons) for a phone based on all review sentiment tags.
 * @param phoneId The unique string ID of the phone
 * @returns Pros and cons with frequency counts, or null if phone not found
 */
export const getSentimentSummary = async (
  phoneId: string
): Promise<{
  pros: { topic: string; count: number }[];
  cons: { topic: string; count: number }[];
  totalReviews: number;
} | null> => {
  const phone = await Phone.findOne({ id: phoneId });
  if (!phone) return null;

  const proCounts: Record<string, number> = {};
  const conCounts: Record<string, number> = {};

  for (const review of phone.reviews) {
    const tags = review.sentimentTags || [];
    for (const tag of tags) {
      if (tag.startsWith("+")) {
        const topic = tag.slice(1);
        proCounts[topic] = (proCounts[topic] || 0) + 1;
      } else if (tag.startsWith("-")) {
        const topic = tag.slice(1);
        conCounts[topic] = (conCounts[topic] || 0) + 1;
      }
    }
  }

  const pros = Object.entries(proCounts)
    .map(([topic, count]) => ({ topic, count }))
    .sort((a, b) => b.count - a.count);

  const cons = Object.entries(conCounts)
    .map(([topic, count]) => ({ topic, count }))
    .sort((a, b) => b.count - a.count);

  return { pros, cons, totalReviews: phone.reviews.length };
};
