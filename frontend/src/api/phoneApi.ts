import { PhoneSummary, PhoneData, PhoneCard, PaginatedPhoneResponse } from "../types/phoneTypes";
import { mapJsonToPhoneData, mapJsonToPhoneSummary, mapJsonToPhoneCard } from "../utils/mappers/phoneDataMappers";

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
 *  - ram: a list of ram size options to filter by
 *  - storage: a list of storage options to filter by
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
    ram?: number[];
    storage?: number[];
    sortBy?: string;
  },
): Promise<PaginatedPhoneResponse> => {
  try {
    // Creating backend API URL with parameters for phone API
    const params = new URLSearchParams();
    params.append("page", page.toString());
    params.append("limit", limit.toString());

    // Searching
    if (options.search) params.append("search", options.search);

    // Manufacturer filtering
    options.manufacturer?.forEach((m) => params.append("manufacturer", m));

    // Price filtering
    if (options.minPrice != null) params.append("minPrice", options.minPrice.toString());
    if (options.maxPrice != null) params.append("maxPrice", options.maxPrice.toString());

    // RAM and Storage filtering
    options.ram?.forEach((r) => params.append("ram", r.toString()));
    options.storage?.forEach((s) => params.append("storage", s.toString()));

    // Sorting
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
 * Fetches the full phone data of a multple phone by their IDs from the backend.
 * @param id The ID of the phone to fetch
 * @returns An array of PhoneData objects containing full details on each phone.
 */
export const getPhoneBatch = async (ids: string[]): Promise<PhoneData[]> => {
  // Handles no phones to fetch
  if (!ids || ids.length == 0) return [];

  // Fetching for full phone data objects from backend
  try {
    const url = `${API_URL}/batch?ids=${ids.join(",")}`;
    const response = await fetch(url);

    // Handles failed syncs with backend
    if (!response.ok) throw new Error(`Batch fetch failed: ${response.status}`);

    // Mapping array of JSON objects to PhoneData type
    const rawPhone = await response.json();
    return (rawPhone as any[]).map((item) => mapJsonToPhoneData(item));
  } catch (error) {
    console.error("Error in getPhoneBatch:", error);
    return [];
  }
};

/**
 * Fetches the phone summary data of a multple phone by their IDs from the backend. Only
 * contains essential information (id, name, price, image, price) on each phone.
 * @param id The ID of the phone to fetch
 * @returns An array of PhoneSummary objects containing few/important details on each phone.
 */
export const getPhoneSummaries = async (ids: string[]): Promise<PhoneSummary[]> => {
  // Handles no phones to fetch
  if (!ids || ids.length == 0) return [];

  // Fetching for phone summaries from backend
  try {
    const url = `${API_URL}/summaries?ids=${ids.join(",")}`;
    const response = await fetch(url);

    // Handles failed syncs with backend
    if (!response.ok) throw new Error(`Batch summary fetch failed: ${response.status}`);

    // Mapping array of JSON objects to PhoneSummary type
    const rawPhone = await response.json();
    return (rawPhone as any[]).map((item) => mapJsonToPhoneSummary(item));
  } catch (error) {
    console.error("Error in getPhoneSummaries:", error);
    return [];
  }
};

/**
 * Fetches the phone summary data of a single phone by its ID from the backend. Only
 * contains essential information (id, name, price, image, price).
 * @param id The ID of the phone to fetch
 * @returns A PhoneSummary object containing few/important details on a phone,
 * or null if not found
 */
export const getPhoneSummaryById = async (id: string): Promise<PhoneSummary | null> => {
  try {
    const response = await fetch(`${API_URL}/summary/${id}`);

    // Handles failed syncs with backend
    if (response.status === 404) return null;
    if (!response.ok) throw new Error(`Comparison cart item details fetch failed: ${response.status}`);

    // Mapping the single phone object
    const rawPhone = await response.json();
    return mapJsonToPhoneSummary(rawPhone);
  } catch (error) {
    console.error(`Error in getPhoneSummaryById (${id}):`, error);
    return null;
  }
};

/**
 * Fetches the phone card of a single phone by its ID from the backend. Contains essential
 * information as well as quick specs.
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

// =======================
// Simon's admin CRUD 
// =======================

/**
 * Create a new phone (admin only)
 * @param phone The phone data to create
 * @param token Firebase auth token
 */
export async function createPhone(phone: any, token: string): Promise<any> {
  const res = await fetch(API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(phone),
  });

  if (!res.ok) {
    const msg = await safeError(res);
    throw new Error(msg);
  }
  return res.json();
}

/**
 * Update an existing phone by ID (admin only)
 * @param id The phone ID to update
 * @param phone The updated phone data
 * @param token Firebase auth token
 */
export async function updatePhone(id: string, phone: any, token: string): Promise<any> {
  const res = await fetch(`${API_URL}/${encodeURIComponent(id)}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(phone),
  });

  if (!res.ok) {
    const msg = await safeError(res);
    throw new Error(msg);
  }
  return res.json();
}

/**
 * Delete a phone by ID (admin only)
 * @param id The phone ID to delete
 * @param token Firebase auth token
 */
export async function deletePhone(id: string, token: string): Promise<void> {
  const res = await fetch(`${API_URL}/${encodeURIComponent(id)}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    const msg = await safeError(res);
    throw new Error(msg);
  }
}

async function safeError(res: Response): Promise<string> {
  try {
    const body = await res.json();
    return body?.message || `Request failed (${res.status})`;
  } catch {
    return `Request failed (${res.status})`;
  }
}