import Phone, { IPhone } from "../models/Phone";

/**
 * Projection for the PhoneCard view. Only has essential fields for catalog grid and comparison cart
 */
const PHONE_CARD_PROJECTION = {
  _id: 0,
  id: 1,
  name: 1,
  manufacturer: 1,
  releaseDate: 1,
  price: 1,
  "images.main": 1,
  "specs.display.screenSizeInches": 1,
  "specs.display.technology": 1,
  "specs.camera.mainMegapixels": 1,
  "specs.performance.processor": 1,
  "specs.battery.capacitymAh": 1,
  "specs.design.dimensionsMm": 1,
  "specs.design.weightGrams": 1,
};

/**
 * Retrieves phones from a specific page with a given limit per page and total
 * number of phones in the database. This function returns a list of phone
 * JSON objects (NOT Mongoose Documents). FOR READ-ONLY PURPOSES.
 * @param page The page number to retrieve (PAGE INDEX STARTS AT 1)
 * @param limit The number of phones to retrieve per page
 * @returns An object containing the list of phone JSON objects and the total
 * number of phones in the database.
 */
export const findPhonePage = async (page: number, limit: number): Promise<{ phones: IPhone[]; total: number }> => {
  // Validating page and limit parameters
  const safePage = Math.max(1, page); // Ensures page is at least 1
  const safeLimit = Math.max(1, limit); // Ensures limit is at least 1

  // Calculating # of phones to skip
  const skip = (safePage - 1) * safeLimit;

  // DEV NOTE: NEED TO ADD FILTERING CAPABILITIES LATER

  // Fetching list of phone JSON objects on a certain page and # of phones in list
  const [phones, total] = await Promise.all([
    Phone.find().skip(skip).limit(safeLimit).select(PHONE_CARD_PROJECTION).lean(), // RETURNS PLAIN JSON OBJECTS
    Phone.countDocuments(),
  ]);
  return { phones, total };
};

/**
 * Finds a single phone by its ID. Returns a JSON object.
 * @param id The unique string ID of the phone
 * @returns The resultant phone data JSON object containing full specs.
 */
export const findPhoneById = async (id: string): Promise<IPhone | null> => {
  const phone = await Phone.findOne({ id: id }).lean();
  return phone;
};

/**
 * Finds a single phone card by its ID. Returns a JSON object.
 * @param id The unique string ID of the phone
 * @returns The resultant phone data JSON object representing a phone card.
 */
export const findPhoneCardById = async (id: string): Promise<IPhone | null> => {
  const phone = await Phone.findOne({ id: id }).select(PHONE_CARD_PROJECTION).lean();
  return phone;
};

/**
 * Creates a new phone document in MongoDB
 * @param phoneData The phone object to be saved
 * @returns The newly created phone document
 */
export const createNewPhone = async (phoneData: Partial<IPhone>): Promise<IPhone> => {
  const phone = new Phone(phoneData);
  return await phone.save();
};

/**
 * Updates an existing phone by its ID
 * @param id The unique string ID of the phone
 * @param updateData An object containing the fields to update
 * @returns The updated phone document
 */
export const updatePhoneById = async (id: string, updateData: Partial<IPhone>): Promise<IPhone | null> => {
  const updatedPhone = await Phone.findOneAndUpdate({ id: id }, updateData, { new: true, runValidators: true });
  return updatedPhone;
};

/**
 * Deletes a phone from the database by its ID
 * @param id The unique string ID of the phone
 * @returns True if phone was deleted; false, otherwise
 */
export const deletePhoneById = async (id: string): Promise<boolean> => {
  const result = await Phone.findOneAndDelete({ id: id });
  return !!result; // Returns true if document was found and deleted
};
