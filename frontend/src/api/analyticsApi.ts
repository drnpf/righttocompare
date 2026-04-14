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
    if (!response.ok) {
      console.warn("Analytics log failed.");
    }
  } catch (error) {
    console.error("Analytics error:", error);
  }
};
