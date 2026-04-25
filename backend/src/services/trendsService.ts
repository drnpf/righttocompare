import Review from "../models/Review";
import Phone from "../models/Phone";
import { GlobalTrendsResponse, TickerData, VibeShiftResponse } from "../types/trendTypes";
import { calculateDynamicSummary } from "../utils/sentimentUtils";

/**
 * Aggregates platform-wide data to show market momentum and brand performance. Processes
 * a certain number of months of data to generate dual-faceted report. The number of months
 * can be set as long as there is enough data for it.
 * @param months The number of months to look back (default = 6 months)
 * @returns A GlobalTrendsResponse containing monthly momentum and brand-specific radar data.
 */
export const getGlobalTrends = async (months: number = 6): Promise<GlobalTrendsResponse> => {
  // Determining how many months to pull data back till
  const dateLimit = new Date();
  dateLimit.setMonth(dateLimit.getMonth() - months);

  // Getting global momentum and brand momentum trends
  const results = await Review.aggregate([
    { $match: { date: { $gte: dateLimit } } }, // Filters list to only be within our date limit
    {
      $facet: {
        // Gets platform-wide market momentum data
        momentum: [
          {
            // Gets aggregated average (of avg rating of phones) grouped by month
            $group: {
              _id: { $dateToString: { format: "%Y-%m", date: "$date" } },
              avgRating: { $avg: "$rating" },
              count: { $sum: 1 },
            },
          },
          { $sort: { _id: 1 } }, // Sorts in ascending order by date
          { $project: { month: "$_id", avgRating: { $round: ["$avgRating", 2] }, count: 1, _id: 0 } },
        ],

        // Gets platform-wide brand performance data
        brandRadar: [
          {
            $lookup: {
              from: "phones",
              localField: "phoneId",
              foreignField: "id",
              as: "phone",
            },
          },
          { $unwind: "$phone" },
          {
            // Gets aggregated average (of avg rating of phones) grouped by manufacturer
            $group: {
              _id: "$phone.manufacturer",
              avgRating: { $avg: "$rating" },
              reviewCount: { $sum: 1 },
            },
          },
          { $sort: { avgRating: -1 } }, // Sorts in descending by average rating
          { $project: { brand: "$_id", avgRating: { $round: ["$avgRating", 2] }, reviewCount: 1, _id: 0 } },
        ],
      },
    },
  ]);
  return results[0] as GlobalTrendsResponse;
};

export const getTickerData = async (days: number = 30): Promise<TickerData[]> => {
  // Determining how many days to pull data back till
  const dateLimit = new Date();
  dateLimit.setDate(dateLimit.getDate() - days);

  // Getting ticker data
  return await Review.aggregate([
    { $match: { date: { $gte: dateLimit } } }, // Filters list to only be within our date limit
    { $unwind: "$sentimentTags" },
    // Gets count of all sentiment tags
    {
      $group: {
        _id: "$sentimentTags",
        velocity: { $sum: 1 },
      },
    },
    { $sort: { velocity: -1 } }, // Sorts in descending order
    { $limit: 15 }, // Only keep top 15 sentiment tags
    { $project: { tag: "$_id", velocity: 1, _id: 0 } },
  ]);
};

export const getPhoneVibeShift = async (
  phoneId: string,
  recentDays: number = 30,
): Promise<VibeShiftResponse | null> => {
  // Checking if phone exists
  const phone = await Phone.findOne({ id: phoneId }).lean();
  if (!phone) return null;

  // Determining how many days to pull data back till
  const dateLimit = new Date();
  dateLimit.setDate(dateLimit.getDate() - recentDays);

  // Getting vibe shift for current phone
  const results = await Review.aggregate([
    { $match: { phoneId } }, // Filters to the current phone
    {
      $facet: {
        // Groups the current phone's all time performance by each month
        timeline: [
          {
            $group: {
              _id: { $dateToString: { format: "%Y-%m", date: "$date" } },
              avgRating: { $avg: "$rating" },
            },
          },
          { $sort: { _id: 1 } },
          { $project: { date: "$_id", avgRating: { $round: ["$avgRating", 2] }, _id: 0 } },
        ],
        // Just the tags from the most recent reviews
        recentReviews: [{ $match: { date: { $gte: dateLimit } } }, { $project: { sentimentTags: 1 } }],
      },
    },
  ]);

  const timeline = results[0].timeline;
  // Use our helper to turn raw tags into a Pros/Cons summary
  const recentSummary = calculateDynamicSummary(results[0].recentReviews);

  return {
    timeline,
    currentVibe: recentSummary,
  };
};
