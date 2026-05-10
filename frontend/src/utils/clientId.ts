import { v4 as uuidv4 } from "uuid";

const CLIENT_ID_KEY = "rtc_client_id";

/**
 * Retrieves the client session ID from local storage if it exists. Otherwise,
 * it will create a session ID for the user. This lazily creates a session ID
 * if it does not exists and is needed for certain features (i.e. comparison
 * analytics view logging).
 * @returns The client session ID
 */
export const getClientId = (): string => {
  // Attempting to get client ID
  let id = localStorage.getItem(CLIENT_ID_KEY);

  // Generating client a new client ID if none found in local storage
  if (!id) {
    id = uuidv4();
    localStorage.setItem(CLIENT_ID_KEY, id);
  }
  return id;
};
