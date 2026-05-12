import ComparisonAnalytics, { IPopularComparisons } from "../models/Analytics";
import { ComparisonViewLog } from "../models/ComparisonViewLog";
import { findPhoneSummaries } from "./phoneService";

/**
 * Adds/updates the comparison's view count by 1. The IDs are sorted
 * to make sure we do not have duplicate comparisons (if the compared
 * phone's IDs were added without sorting). Records requesting user's
 * IP to view log.
 * @param phoneIds Array of strings that are phone IDs
 *      i.e. ["apple-15", "google-8"]
 * @param clientId Requesting user's client ID (their session ID generated on frontend
 * or in local storage)
 */
export const recordComparisonView = async (phoneIds: string[], clientId: string): Promise<void> => {
  // Checking that there are at least 2 phones to add the comparison
  if (!phoneIds || phoneIds.length < 2) return;

  // Sorting phone IDs and creating search key
  const sortedIds = [...phoneIds].sort();
  const key = sortedIds.join("_");

  try {
    // Attempting to record current requestor's session ID to having viewed object
    await ComparisonViewLog.create({ clientId: clientId, comparisonKey: key });

    // Updating the comparison's view count by 1 or adding it if does not exist
    await ComparisonAnalytics.findOneAndUpdate(
      { comparisonKey: key },
      {
        $inc: { views: 1 }, // Increments the view
        $setOnInsert: { phoneIds: sortedIds }, // Used for new comparison inserted
        $set: { lastCompared: new Date() }, // Updates last view/compared date
      },
      { upsert: true },
    );
  } catch (error: any) {
    // If error 11000 in recording requestor IP then user has already viewed
    if (error.code === 11000) {
      console.log(`ANALYTICS: Duplicate view ignored for client: ${clientId}`);
      return;
    }
    console.error("ANALYTICS (ERROR): Failed to record view of comparison:", error.message);
  }
};

/**
 * Fetches most popular comparison within a specified time window.
 * @param days Number of days to look back for comparisons (i.e. 7-within a week; 30-within a month)
 * @param limit Max number of comparison/results to return
 * @returns An array of popular comparison objects (sorted by view counts to measure popularity)
 */
export const getPopularComparisons = async (days: number = 30, limit: number = 5): Promise<IPopularComparisons[]> => {
  // Establishing the time window to get comparison data in
  const timeWindow = new Date();
  timeWindow.setDate(timeWindow.getDate() - days);

  // Fetching for comparison data from backend that are within time window
  const popularComparisons = await ComparisonAnalytics.find({
    lastCompared: { $gte: timeWindow }, // Getting compares within time windows
  })
    .sort({ views: -1 }) // Sorts by most popular/most views
    .limit(limit);

  // Getting phone summaries of phones in popular comparisons
  return await Promise.all(
    popularComparisons.map(async (record) => {
      const summaries = await findPhoneSummaries(record.phoneIds);
      return {
        phones: summaries,
      };
    }),
  );
};
