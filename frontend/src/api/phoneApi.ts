import { PhoneData } from "../types/phoneTypes";
import { mapBackendToFrontend } from "../utils/dataMappers";

const API_URL = "http://localhost:5001/api/phones"; // CHANGE LATER ON PRODUCTION

/**
 * Fetches the full catalog of phones from the backend.
 * @returns A list of PhoneData objects containing the phone data
 */
export const getAllPhones = async (
  page: number = 1,
  limit: number = 5,
): Promise<{ phones: PhoneData[]; total: number }> => {
  try {
    // Fetching phones from a certain page
    const response = await fetch(`${API_URL}?page=${page}&limit=${limit}`);

    // Handles failed sync with backend
    if (!response.ok) throw new Error(`Failed to fetch full phone catalog: ${response.statusText}`);

    // Mapping raw JSON data to frontend PhoneData type
    const rawJson = await response.json();
    const mappedPhones = rawJson.data.map((dbPhone: any) => mapBackendToFrontend(dbPhone)); // Maps each JSON to a phone object
    return { phones: mappedPhones, total: rawJson.total };
  } catch (error) {
    console.error("Error fetching phones from backend:", error);
    return { phones: [], total: 0 };
  }
};

/**
 * Fetches the details of a single phone by its ID from the backend.
 * @param id The ID of the phone to fetch
 * @returns A PhoneData object containing the phone details, or null if not found
 */
export const getPhoneById = async (id: string): Promise<PhoneData | null> => {
  try {
    const response = await fetch(`${API_URL}/${id}`);

    // Handles failed syncs with backend
    if (response.status === 404) return null;
    if (!response.ok) throw new Error("Phone details fetch failed");

    // Mapping the single phone object
    const rawPhone = await response.json();
    return mapBackendToFrontend(rawPhone);
  } catch (error) {
    console.error(`Error in getPhoneById (${id}):`, error);
    return null;
  }
};
