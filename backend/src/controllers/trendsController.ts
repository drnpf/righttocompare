import { Request, Response } from "express";

/**
 * Gets global momentum and brand radar data.
 * @route GET /api/trends/global
 * @param req The Express request object
 * @param res The Express response object
 * @returns
 */
export const getGlobalTrends = async (req: Request, res: Response) => {
  try {
    res.status(200).json({ message: "Global trends connected." });
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
    res.status(200).json({ message: "Ticker data endpoint connected." });
  } catch (error) {
    res.status(500).json({ message: "Error fetching global trends:", error });
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
  const { phoneId } = req.params;
  try {
    res.status(200).json({ message: `Vibe shift for ${phoneId} connected.` });
  } catch (error) {
    res.status(500).json({ message: "Error fetching phone vibe shift:", error });
  }
};
