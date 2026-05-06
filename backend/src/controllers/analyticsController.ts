import { Request, Response } from "express";
import * as analyticsService from "../services/analyticsService";

/**
 * Logs a new comparison view count. This is triggered whenever a user
 * views a specific comparison on the frontend.
 * @route POST /api/analytics/compare
 * @param req The Express request object containing 'phoneIds' in the body
 * @param res The Express response object
 * @returns 204 No Content on success
 */
export const logComparison = async (req: Request, res: Response) => {
  // Getting requesting client session ID for view log
  const clientId = req.body.clientId ?? "MISSING_CLIENT_ID";
  if (clientId === "MISSING_CLIENT_ID") {
    console.warn(`WARNING: Analytics request from a client from IP. ${req.ip}`);
  }

  try {
    // Checking that there are at least 2 phone IDs to update a comparison
    const phoneIds = req.body.phoneIds;
    if (!phoneIds || !Array.isArray(phoneIds) || phoneIds.length < 2) {
      return res.status(400).json({ message: "Invalid request. A comparison requires at least 2 valid phone IDs." });
    }

    // Logging the comparison view
    await analyticsService.recordComparisonView(phoneIds, clientId);
    res.status(204).send();
  } catch (error) {
    console.error("Error logging comparison:", error);
    res.status(500).json({ error: "Server error logging comparison." });
  }
};

/**
 * Fetches the most popular comparisons within a specified time window.
 * @route GET /api/analytics/trending
 * @param req The Express request object containing 'days' and 'limit' query params
 * @param res The Express response object
 * @returns An array of trending comparison objects (hydrated with phone summaries)
 */
export const getTrending = async (req: Request, res: Response) => {
  try {
    // Extracting query parameters
    const days = req.query.days ? parseInt(req.query.days as string) : 30; // default is 30 days for recency of comparison being viewed
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 5; // default is 5 days for how many comparison data are pulled

    // Getting trending comparisons data
    const trending = await analyticsService.getPopularComparisons(days, limit);
    res.status(200).json(trending);
  } catch (error) {
    console.error("Error fetching popular comparisons data:", error);
    res.status(500).json({ error: "Server error fetching popular comparison data." });
  }
};
