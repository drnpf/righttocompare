import { GlobalTrendsResponse, TickerData, VibeShiftResponse } from "../types/trendTypes";

const API_URL = "http://localhost:5001/api/trends"; // CHANGE LATER ON PRODUCTION

export const getGlobalTrends = async (months: number = 6): Promise<GlobalTrendsResponse> => {
  const response = await fetch(`${API_URL}/global?months=${months}`);
  if (!response.ok) throw new Error("Failed to fetch global trends");
  return await response.json();
};

export const getTickerData = async (days: number = 30): Promise<TickerData[]> => {
  const response = await fetch(`${API_URL}/ticker?days=${days}`);
  if (!response.ok) throw new Error("Failed to fetch ticker data");
  return await response.json();
};

export const getPhoneVibeShift = async (phoneId: string, days: number = 30): Promise<VibeShiftResponse> => {
  const response = await fetch(`${API_URL}/${phoneId}?days=${days}`);
  if (!response.ok) throw new Error("Failed to fetch vibe shift");
  return await response.json();
};
