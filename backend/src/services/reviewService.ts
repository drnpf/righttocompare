import Phone, { IPhone } from "../models/Phone";
import Review, { IReview, ICategoryRatings } from "../models/Review";
import { analyzeSentiment } from "../utils/sentimentAnalyzer";
import { ISentimentItem, ISentimentSummary } from "../models/Sentiment";

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
): Promise<IReview | null> => {
  const phone = await Phone.findOne({ id: phoneId });
  if (!phone) return null;

  // Check if user already has a review for this phone
  const existingReview = await Review.findOne({ phoneId: phoneId, userId: reviewData.userId });
  if (existingReview) throw new Error("User has already reviewed this phone");

  // Calculate overall rating from category ratings
  const { camera, battery, design, performance, value } = reviewData.categoryRatings;
  const overallRating = Number(((camera + battery + design + performance + value) / 5).toFixed(1));

  // Auto-detect sentiment tags from review title + text
  const sentimentTags = analyzeSentiment(`${reviewData.title} ${reviewData.review}`).map((t) => t.label);

  const newReview = new Review({
    phoneId: phoneId,
    userId: reviewData.userId,
    userName: reviewData.userName,
    rating: overallRating,
    categoryRatings: reviewData.categoryRatings,
    date: new Date(),
    title: reviewData.title,
    review: reviewData.review,
    sentimentTags: sentimentTags,
    helpful: 0,
    notHelpful: 0,
    helpfulVoters: [],
    notHelpfulVoters: [],
  });
  const savedReview = await newReview.save();
  await syncPhoneMetaData(phoneId);
  return savedReview;
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

  // Defining query for obtaining review of phone with certain sentiments
  const query: any = { phoneId };
  if (sentiments.length > 0) query.sentimentTags = { $all: sentiments };

  // Defining sort stage
  const sortStage: any = {};
  if (sortBy === "newest") sortStage["reviews.date"] = -1;
  else if (sortBy === "oldest") sortStage["reviews.date"] = 1;
  else if (sortBy === "helpful") sortStage["reviews.helpful"] = -1;

  // Executing query for getting review page
  const reviews = await Review.find(query).skip(skip).limit(limit).lean();

  // Getting phone metadata
  const phoneStats = await Phone.findOne(
    { id: phoneId },
    { totalReviews: 1, aggregateRating: 1, categoryAverages: 1 },
  ).lean();
  if (!phoneStats) return null;

  return {
    reviews: reviews,
    totalReviews: phoneStats?.totalReviews,
    totalPages: Math.ceil(phoneStats?.totalReviews / limit),
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
  reviewId: number,
  userId: string,
  voteType: "helpful" | "notHelpful",
): Promise<IReview | null> => {
  // Fetching review from database for updating
  const review = await Review.findById(reviewId);
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
  return await review.save();
};

/**
 * Removes a review from a phone document.
 * @param phoneId The unique string ID of the phone
 * @param reviewId The ID of the review to delete
 * @param userId The Firebase UID of the user requesting deletion
 * @returns True if deleted, false if not found or not authorized
 */
export const removeReview = async (phoneId: number, reviewId: number, userId: string): Promise<IReview | null> => {
  // Fetching review from the backend
  const review = await Review.findById(reviewId);
  if (!review) return null;

  const phone = await Phone.findOne({ id: phoneId });
  if (!phone) return null;
  // Check if user owns the review
  if (review.userId !== userId) throw new Error("Not authorized to delete this review");

  recalculateSentimentData(phone);
  return review;
};

/**
 * Gets a single review by ID.
 * @param phoneId The unique string ID of the phone
 * @param reviewId The ID of the review
 * @returns The review, or null if not found
 */
export const getReviewById = async (phoneId: string, reviewId: number): Promise<IReview | null> => {
  const phone = await Phone.findOne({ id: phoneId }).lean();
  if (!phone) return null;
  return phone.reviews.find((r) => r.id === reviewId) || null;
};

/**
 * Gets a sentiment summary (pros/cons) for a phone based on all review sentiment tags.
 * @param phoneId The unique string ID of the phone
 * @returns Pros and cons with frequency counts, or null if phone not found
 */
export const getSentimentSummary = async (phoneId: string): Promise<ISentimentSummary | null> => {
  const phone = await Phone.findOne({ id: phoneId }).select("sentimentSummary").lean();
  if (!phone) return null;
  return phone.sentimentSummary;
};

/**
 * Helper function for recalculating the current phone's review sentiment summary data.
 * It determines which topics are considered pros and cons and determines how many review
 * entries are considered pro (or con) for a specific topic.
 * @param phone The phone to have the sentiment summary recalculated/reanalyzed.
 */
const recalculateSentimentData = (phone: IPhone): void => {
  const totalReviews = phone.reviews.length;
  phone.totalReviews = totalReviews;

  // Handling case of 0 reviews
  if (totalReviews === 0) {
    phone.aggregateRating = 0;
    phone.categoryAverages = { camera: 0, battery: 0, design: 0, performance: 0, value: 0 };
    phone.sentimentSummary = { pros: [], cons: [], totalAnalyzed: 0 };
    return;
  }

  // Calculating totals across all categories
  const totals = phone.reviews.reduce(
    (acc, r) => ({
      camera: acc.camera + (r.categoryRatings?.camera || 0),
      battery: acc.battery + (r.categoryRatings?.battery || 0),
      design: acc.design + (r.categoryRatings?.design || 0),
      performance: acc.performance + (r.categoryRatings?.performance || 0),
      value: acc.value + (r.categoryRatings?.value || 0),
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

  // Updating sentiment calculations
  const DOMINANCE_RATIO = 1.5; // Ratio a topic must dominate in pros/cons to be counted as a pro/con
  const proCounts: Record<string, number> = {};
  const conCounts: Record<string, number> = {};
  const allTopics = new Set<string>();

  // Extracting topics from sentiment tags and counting all pros and cons for each topic
  for (const review of phone.reviews) {
    review.sentimentTags?.forEach((tag) => {
      const isPos = tag.startsWith("+");
      const topic = tag.slice(1);
      allTopics.add(topic);
      if (isPos) proCounts[topic] = (proCounts[topic] || 0) + 1;
      else conCounts[topic] = (conCounts[topic] || 0) + 1;
    });
  }

  const pros: ISentimentItem[] = [];
  const cons: ISentimentItem[] = [];

  // Checking which topics are pros or cons
  allTopics.forEach((topic) => {
    const pCount = proCounts[topic] || 0;
    const cCount = conCounts[topic] || 0;
    const ratio = (Math.max(pCount, cCount) + 1) / (Math.min(pCount, cCount) + 1);

    // If pro/con count ratio does not meet dominance ratio then those topics will just count as mixed
    if (ratio < DOMINANCE_RATIO) return;

    // Categorizing topic as pro or con
    if (pCount > cCount) pros.push({ topic, count: pCount });
    else if (cCount > pCount) cons.push({ topic, count: cCount });
  });

  // Saving filtered results
  phone.sentimentSummary = {
    pros: pros.sort((a, b) => b.count - a.count),
    cons: cons.sort((a, b) => b.count - a.count),
    totalAnalyzed: totalReviews,
  };
};
