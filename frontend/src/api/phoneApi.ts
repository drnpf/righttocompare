import { PhoneData, PhoneCard, PaginatedPhoneResponse } from "../types/phoneTypes";
import { mapJsonToPhoneData, mapJsonToPhoneCard } from "../utils/dataMappers";

const API_URL = "http://localhost:5001/api/phones"; // CHANGE LATER ON PRODUCTION

// Constants
export const DEFAULT_PHONE_LIMIT = 12; // Default phones per page

/**
 * Fetches a phone page from MongoDB given the specified page and number of
 * phones per page. If a search query is included, a page of phones, containing
 * the searched queries, will be returned.
 * @param page The page number to retrieve (PAGE INDEX STARTS AT 1)
 * @param limit The number of phones to retrieve per page
 * @param options (optional) An array of options that can be used apply to search
 *  - search: string query to search phone by
 *  - manufacturer: array of manufacturers to filter phones by
 *  - minPrice: minimum price to filter out phones by their price
 *  - maxPrice: maximum price to filter out phones by their price
 *  - sortBy: string indicating how to sort phone listing
 * @returns A list of PhoneData objects containing the phone data
 */
export const getPhonePage = async (
  page: number = 1,
  limit: number = DEFAULT_PHONE_LIMIT,
  options: {
    search?: string;
    manufacturer?: string[];
    minPrice?: number;
    maxPrice?: number;
    sortBy?: string;
  },
): Promise<PaginatedPhoneResponse> => {
  try {
    // Creating backend API URL with parameters for phone API
    const params = new URLSearchParams();
    params.append("page", page.toString());
    params.append("limit", limit.toString());
    if (options.search) params.append("search", options.search);
    options.manufacturer?.forEach((m) => params.append("manufacturer", m));
    if (options.minPrice != null) params.append("minPrice", options.minPrice.toString());
    if (options.maxPrice != null) params.append("maxPrice", options.maxPrice.toString());
    if (options.sortBy) params.append("sortBy", options.sortBy);

    // Fetching phones from a page with options applied such as search query, filters, and sorts
    const url = `${API_URL}?${params.toString()}`;
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
        totalItems: 0,
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
    if (!response.ok) throw new Error(`Phone details fetch failed: ${response.status}`);

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
    if (!response.ok) throw new Error(`Phone card details fetch failed: ${response.status}`);

    // Mapping the single phone object
    const rawPhone = await response.json();
    return mapJsonToPhoneCard(rawPhone);
  } catch (error) {
    console.error(`Error in getPhoneById (${id}):`, error);
    return null;
  }
};

/**
 * Fetches all unique manufacturers into a list from the backend.
 * @returns A string list containing all unique manufacturers in the database.
 */
export const getManufacturers = async (): Promise<string[]> => {
  const response = await fetch(`${API_URL}/manufacturers`);
  if (!response.ok) throw new Error(`Manufacturer failed to fetch: ${response.status}`);
  return await response.json();
};
