import { PhoneData, PhoneCard, PaginatedPhoneResponse } from "../types/phoneTypes";
import { mapJsonToPhoneData, mapJsonToPhoneCard } from "../utils/dataMappers";

const API_URL = "http://localhost:5001/api/phones"; // CHANGE LATER ON PRODUCTION

// Constants
export const DEFAULT_PHONE_LIMIT = 12; // Default phones per page

/**
 * Fetches a phone page from MongoDB given the specified page and number of
 * phones per page. If a search query is included, a page of phones, containing
 * the searched queries, will be returned.
 * @param page
 * @param limit
 * @param search
 * @returns A list of PhoneData objects containing the phone data
 */
export const getPhonePage = async (
  page: number = 1,
  limit: number = DEFAULT_PHONE_LIMIT,
  search: string = "",
): Promise<PaginatedPhoneResponse> => {
  try {
    // Fetching phones from a certain page and with search keyword (if any)
    const url = `${API_URL}?page=${page}&limit=${limit}&search=${encodeURIComponent(search)}`;
    const response = await fetch(url);

    // Handles failed sync with backend
    if (!response.ok) throw new Error(`Failed to fetch phone page: ${response.statusText}`);

    // Mapping raw JSON data to frontend PhoneData type
    const rawJson = await response.json();
    const mappedPhones = rawJson.data.map((dbPhone: any) => mapJsonToPhoneCard(dbPhone)); // Maps each JSON to a phone card object
    return { phones: mappedPhones, pagination: rawJson.pagination };
  } catch (error) {
    console.error("Error fetching phones from backend:", error);
    return {
      phones: [],
      pagination: {
        totalPages: 0,
        currentPage: 1,
        itemsPerPage: DEFAULT_PHONE_LIMIT,
        hasNextPage: false,
        hasPrevPage: false,
      },
    };
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
    return mapJsonToPhoneData(rawPhone);
  } catch (error) {
    console.error(`Error in getPhoneById (${id}):`, error);
    return null;
  }
};

/**
 * Fetches the phone card of a single phone by its ID from the backend.
 * @param id The ID of the phone to fetch
 * @returns A PhoneCard object containing few/important details on a phone,
 * or null if not found
 */
export const getPhoneCardById = async (id: string): Promise<PhoneCard | null> => {
  try {
    const response = await fetch(`${API_URL}/card/${id}`);

    // Handles failed syncs with backend
    if (response.status === 404) return null;
    if (!response.ok) throw new Error("Phone details fetch failed");

    // Mapping the single phone object
    const rawPhone = await response.json();
    return mapJsonToPhoneCard(rawPhone);
  } catch (error) {
    console.error(`Error in getPhoneById (${id}):`, error);
    return null;
  }
};
