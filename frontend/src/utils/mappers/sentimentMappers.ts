import { SentimentSummary, SentimentTopic } from "../../types/sentimentTypes";

/**
 * Maps raw sentiment JSON from backend to SentimentSummary structure.
 * Used for top-level summary card on phone reviews and discussions.
 * @param json The raw sentiment JSON object from sentiment analyzer API
 * @returns Summary with pros, cons, and analysis count
 */
export const mapJsonToSentimentSummary = (json: any): SentimentSummary => {
  // Handles failed fetching and returns empty SentimentSummary structure
  if (!json) return { pros: [], cons: [], totalAnalyzed: 0 };

  // Mapping JSON sentiment object to SentimentTopic object
  const mapTopic = (item: any): SentimentTopic => ({
    topic: item.topic || "Unknown",
    count: typeof item.count === "number" ? item.count : 0,
  });

  // Mapping pros and cons count for each topic on specific set of reviews/or discussion thread
  return {
    pros: (json.pros || []).map(mapTopic),
    cons: (json.cons || []).map(mapTopic),
    totalAnalyzed: Number(json.totalAnalyzed || json.totalReviews) || 0,
  };
};
