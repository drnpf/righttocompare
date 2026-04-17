import { PopularComparison } from "../types/analyticsTypes";
import { mapJsonToPopularComparison } from "../utils/analyticsDataMappers";

const API_URL = "http://localhost:5001/api/analytics"; // CHANGE LATER ON PRODUCTION

/**
 * Sends the list of phone IDs to the backend to log a comparison view.
 * @param phoneIds Array of unique phone IDs being compared.
 */
export const logComparison = async (phoneIds: string[]): Promise<void> => {
  try {
    // Attempting to log the comparison being viewed
    const response = await fetch(`${API_URL}/compare`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phoneIds }),
    });

    // Logging that analytics failed on backend
    if (!response.ok) console.warn("Analytics log failed.");
  } catch (error) {
    console.error("Analytics error:", error);
  }
};

/**
 * Fetches a list of the most popular comparisons.
 * @param days The number of days to include comparisons from
 * @param limit Maximum number of comparison results to pull
 * @returns A list of PopularComparison objects
 */
export const getPopularComparisons = async (days: number, limit: number): Promise<PopularComparison[]> => {
  try {
    const url = `${API_URL}/popular?days=${days}&limit=${limit}`;
    const response = await fetch(url);

    // Handles failed connection to backend
    if (!response.ok) throw new Error(`Popular comparions fetch failed: ${response.status}`);

    // Mapping each PhoneSummary objects to their respective comparisons
    const rawData = await response.json();
    return rawData.map((item: any) => mapJsonToPopularComparison(item));
  } catch (error) {
    console.error("Error fetching popular comparisons:", error);
    return [];
  }
};
