import User, { IUser } from "../models/User";

/**
 * Finds a user by their Firebase UID.
 * Used to check if a user needs to be registered or logged in.
 * @param uid The unique ID provided by Firebase Auth
 * @returns The User document, if found, or null
 */
export const findUserByUid = async (uid: string): Promise<IUser | null> => {
  return await User.findOne({ firebaseUid: uid });
};

/**
 * Updates the last login timestamp for existing user to the current time.
 * Should be called every time user loggs in.
 * @param user The existing User document retrieved from database
 * @returns The saved/updated User document
 */
export const updateLastLogin = async (user: IUser): Promise<IUser> => {
  user.lastLogin = new Date();
  return await user.save();
};

/**
 * Creates a new user document in the database with default preferences.
 * @param uid The unique ID provided by Firebase Auth
 * @param email The user's email address
 * @param name  The User's display name for their Google/Firebase profile.
 * @returns The newly created User document
 */
export const createUser = async (
  uid: string,
  email: string,
  name?: string
): Promise<IUser> => {
  return await User.create({
    firebaseUid: uid,
    email: email,
    displayName: name || undefined,
    lastLogin: new Date(),
  });
};
