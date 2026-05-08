import { ISentimentSummary } from "../models/Sentiment";

/**
 * Utility to transform raw review sentiment tags into a structured Pros/Cons summary.
 * Used across the review service and trends service to ensure consistent sentiment reporting.
 * @param reviews Array of review documents or objects containing sentimentTags
 * @returns A structured ISentimentSummary object
 */
export function calculateDynamicSummary(reviews: any[]): ISentimentSummary {
  const proCounts: Record<string, number> = {};
  const conCounts: Record<string, number> = {};
  const allTopics = new Set<string>();

  reviews.forEach((r) => {
    r.sentimentTags?.forEach((tag: string) => {
      const isPos = tag.startsWith("+");
      const topic = tag.slice(1);
      allTopics.add(topic);
      if (isPos) proCounts[topic] = (proCounts[topic] || 0) + 1;
      else conCounts[topic] = (conCounts[topic] || 0) + 1;
    });
  });

  return {
    pros: Array.from(allTopics)
      .filter((t) => proCounts[t])
      .map((t) => ({ topic: t, count: proCounts[t] }))
      .sort((a, b) => b.count - a.count),
    cons: Array.from(allTopics)
      .filter((t) => conCounts[t])
      .map((t) => ({ topic: t, count: conCounts[t] }))
      .sort((a, b) => b.count - a.count),
    totalAnalyzed: reviews.length,
  };
}
