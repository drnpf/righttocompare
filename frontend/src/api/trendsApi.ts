import { GlobalTrendsResponse, TickerData, VibeShiftResponse } from "../types/trendTypes";

const API_URL = "http://localhost:5001/api/trends"; // CHANGE LATER ON PRODUCTION

/**
 * Communicates with the global trends endpoint to retrieve platform-wide market
 * trends. Fetches both the macro sentiment trajectory and the manufacturer
 * performance rankings for the primary dashboard view.
 * @param months The number of months of historical data to aggregate (default = 6)
 * @returns A GlobalTrendsResponse containing the momentum chart and brand radar data.
 */
export const getGlobalTrends = async (months: number = 6): Promise<GlobalTrendsResponse> => {
  const response = await fetch(`${API_URL}/global?months=${months}`);
  if (!response.ok) throw new Error("Failed to fetch global trends");
  return await response.json();
};

/**
 * Acts as the data bridge for the live scrolling sentiment ticker. Requests
 * the highest-velocity sentiment tags within a specific recent window to
 * provide real-time community feedback on the frontend marquee.
 * @param days The recent day window used to calculate tag frequency (default = 30)
 * @returns An array of TickerData objects containing high-velocity sentiment tags.
 */
export const getTickerData = async (days: number = 30): Promise<TickerData[]> => {
  const response = await fetch(`${API_URL}/ticker?days=${days}`);
  if (!response.ok) throw new Error("Failed to fetch ticker data");
  return await response.json();
};

/**
 * Initiates a high-resolution deep dive into a specific device's community
 * standing. Retrieves a granular, month-over-month sentiment timeline and a
 * list of pros and cons based on recent review text analysis.
 * @param phoneId The unique slug or ID of the device to analyze.
 * @param days The time window used to generate the "Current Vibe" pro/con summary.
 * @returns A VibeShiftResponse containing the weekly trajectory and feature sentiment.
 */
export const getPhoneVibeShift = async (phoneId: string, days: number = 30): Promise<VibeShiftResponse> => {
  const response = await fetch(`${API_URL}/${phoneId}?days=${days}`);
  if (!response.ok) throw new Error("Failed to fetch vibe shift");
  return await response.json();
};
