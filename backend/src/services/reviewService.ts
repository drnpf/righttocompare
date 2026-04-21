import Phone, { IPhone } from "../models/Phone";
import { IReview, ICategoryRatings } from "src/models/Review";
import { analyzeSentiment } from "../utils/sentimentAnalyzer";

export type ReviewSortType = "newest" | "oldest" | "helpful";

export interface ReviewFilterOptions {
  sentiments?: string[];
  sortBy?: ReviewSortType;
}

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
  },
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
  const maxId = phone.reviews.length > 0 ? Math.max(...phone.reviews.map((r) => r.id)) : 0;
  const newReviewId = maxId + 1;

  // Auto-detect sentiment tags from review title + text
  const sentimentTags = analyzeSentiment(`${reviewData.title} ${reviewData.review}`).map((t) => t.label);

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
  recalculatePhoneMetadata(phone);
  await phone.save();
  return phone;
};

/**
 * Retrieves all reviews for a phone with pagination and aggregate ratings.
 * @param phoneId The unique string ID of the phone
 * @param page Page number (1-indexed)
 * @param limit Number of reviews per page
 * @param options Filter and sort options to retrieve phone page by
 * @returns Object with reviews array, pagination info, and aggregate ratings
 */
export const getReviewsForPhone = async (
  phoneId: string,
  page: number = 1,
  limit: number = 10,
  options: ReviewFilterOptions = {},
): Promise<{
  reviews: IReview[];
  totalReviews: number;
  totalPages: number;
  currentPage: number;
  aggregateRating: number;
  categoryAverages: ICategoryRatings;
} | null> => {
  const { sentiments = [], sortBy = "newest" } = options; // Default options
  const skip = (page - 1) * limit; // # of pages to skip

  // Defining sort stage
  const sortStage: any = {};
  if (sortBy === "newest") sortStage["reviews.date"] = -1;
  else if (sortBy === "oldest") sortStage["reviews.date"] = 1;
  else if (sortBy === "helpful") sortStage["reviews.helpful"] = -1;

  // Defining sentiment filter
  const sentimentMatch = sentiments.length > 0 ? { "reviews.sentimentTags": { $all: sentiments } } : {};

  // Querying MongoDB for phone
  const results = await Phone.aggregate([
    { $match: { id: phoneId } },
    { $unwind: "$reviews" },
    { $match: sentimentMatch },
    { $sort: sortStage },
    {
      $facet: {
        paginatedResults: [{ $skip: skip }, { $limit: limit }, { $replaceRoot: { newRoot: "$reviews" } }],
        totalCount: [{ $count: "count" }],
      },
    },
  ]);

  // If no reviews then fetch for global phone stats
  if (!results[0] || results[0].paginatedResults.length === 0) {
    const phone = await Phone.findOne({ id: phoneId }, { aggregateRating: 1, categoryAverages: 1 });
    if (!phone) return null;
    return {
      reviews: [],
      totalReviews: 0,
      totalPages: 0,
      currentPage: page,
      aggregateRating: phone.aggregateRating,
      categoryAverages: phone.categoryAverages,
    };
  }

  // Getting paginated reviews with all filters/sorts applied
  const reviews = results[0].paginatedResults;
  const totalReviews = results[0].totalCount[0]?.count || 0;
  const phoneStats = await Phone.findOne({ id: phoneId }, { aggregateRating: 1, categoryAverages: 1 });

  return {
    reviews,
    totalReviews,
    totalPages: Math.ceil(totalReviews / limit),
    currentPage: page,
    aggregateRating: phoneStats?.aggregateRating || 0,
    categoryAverages: phoneStats?.categoryAverages || {
      camera: 0,
      battery: 0,
      design: 0,
      performance: 0,
      value: 0,
    },
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
  voteType: "helpful" | "notHelpful",
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
export const removeReview = async (phoneId: string, reviewId: number, userId: string): Promise<boolean> => {
  const phone = await Phone.findOne({ id: phoneId });
  if (!phone) return false;

  const reviewIndex = phone.reviews.findIndex((r) => r.id === reviewId);
  if (reviewIndex === -1) return false;

  // Check if user owns the review
  if (phone.reviews[reviewIndex].userId !== userId) {
    throw new Error("Not authorized to delete this review");
  }

  phone.reviews.splice(reviewIndex, 1);
  recalculatePhoneMetadata(phone);
  await phone.save();
  return true;
};

/**
 * Gets a single review by ID.
 * @param phoneId The unique string ID of the phone
 * @param reviewId The ID of the review
 * @returns The review, or null if not found
 */
export const getReviewById = async (phoneId: string, reviewId: number): Promise<IReview | null> => {
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
  phoneId: string,
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

const recalculatePhoneMetadata = (phone: IPhone): void => {
  const totalReviews = phone.reviews.length;
  phone.totalReviews = totalReviews;

  // Handling case of 0 reviews
  if (totalReviews === 0) {
    phone.aggregateRating = 0;
    phone.categoryAverages = { camera: 0, battery: 0, design: 0, performance: 0, value: 0 };
    return;
  }

  // Calculating totals across all categories
  const totals = phone.reviews.reduce(
    (acc, r) => ({
      camera: acc.camera + r.categoryRatings.camera,
      battery: acc.battery + r.categoryRatings.battery,
      design: acc.design + r.categoryRatings.design,
      performance: acc.performance + r.categoryRatings.performance,
      value: acc.value + r.categoryRatings.value,
    }),
    { camera: 0, battery: 0, design: 0, performance: 0, value: 0 },
  );

  // Updating averages rounded to 1 decimal place
  phone.categoryAverages = {
    camera: Number((totals.camera / totalReviews).toFixed(1)),
    battery: Number((totals.battery / totalReviews).toFixed(1)),
    design: Number((totals.design / totalReviews).toFixed(1)),
    performance: Number((totals.performance / totalReviews).toFixed(1)),
    value: Number((totals.value / totalReviews).toFixed(1)),
  };

  // Updating overall aggregate ratings for all categories
  const avg = phone.categoryAverages;
  phone.aggregateRating = Number(
    ((avg.camera + avg.battery + avg.design + avg.performance + avg.value) / 5).toFixed(1),
  );
};
