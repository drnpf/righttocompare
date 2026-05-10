import { Request, Response } from "express";
import * as trendsService from "../services/trendsService";

/**
 * Gets global momentum and brand radar data.
 * @route GET /api/trends/global
 * @param req The Express request object
 * @param res The Express response object
 * @returns
 */
export const getGlobalTrends = async (req: Request, res: Response) => {
  try {
    // Getting months from query parameters
    const months = parseInt(req.query.months as string) || 6; // Default is 6 months

    // Validating month; cannot request for negative months and past 2 years
    const validatedMonths = Math.min(Math.max(months, 1), 24);

    const trends = await trendsService.getGlobalTrends(validatedMonths);
    res.status(200).json(trends);
  } catch (error) {
    res.status(500).json({ message: "Error fetching global trends:", error });
  }
};

/**
 * Gets trending tags with live velocity to track what is a trending
 * @route GET /api/trends/ticker
 * @param req The Express request object
 * @param res The Express response object
 * @returns
 */
export const getTickerData = async (req: Request, res: Response) => {
  try {
    // Getting days from query parameters
    const days = parseInt(req.query.days as string) || 30; // Default is 30 days

    // Validating days; cannot request for negative days and past 1 years
    const validatedDays = Math.min(Math.max(days, 1), 365);

    const ticker = await trendsService.getTickerData(validatedDays);
    res.status(200).json(ticker);
  } catch (error) {
    res.status(500).json({ message: "Error fetching ticker data:", error });
  }
};

/**
 * Gets specific sentiment shift analysis for one device.
 * @route GET /api/trends/:phoneId
 * @param req The Express request object
 * @param res The Express response object
 * @returns
 */
export const getPhoneVibeShift = async (req: Request, res: Response) => {
  const phoneId = String(req.params.phoneId);
  try {
    // Getting days from query parameters
    const recentDays = parseInt(req.query.recentDays as string) || 30; // Default is 30 days

    // Validating days; cannot request for negative days and past 3 months
    const validatedDays = Math.min(Math.max(recentDays, 7), 90);
    const vibeShift = await trendsService.getPhoneVibeShift(phoneId, validatedDays);

    // Handling error case for trend for phone not found
    if (!vibeShift) return res.status(404).json({ message: `Trends for phone ${phoneId} not found.` });
    res.status(200).json(vibeShift);
  } catch (error) {
    res.status(500).json({ message: "Error fetching phone vibe shift:", error });
  }
};
