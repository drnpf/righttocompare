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
 * @param options (optional) An array of options that can be used apply to search
 *  - search: string query to search phone by
 *  - brand: array of brands to filter phones by
 *  - minPrice: minimum price to filter out phones by their price
 *  - maxPrice: maximum price to filter out phones by their price
 *  - sortBy: string indicating how to sort phone listing
 * @returns An object containing the list of phone JSON objects and the total
 * number of phones in the database.
 */
export const findPhonePage = async (
  page: number,
  limit: number,
  options: {
    search?: string;
    brand?: string[];
    minPrice?: number;
    maxPrice?: number;
    sortBy?: string;
  },
): Promise<{ phones: IPhone[]; total: number }> => {
  // Validating page and limit parameters
  const safePage = Math.max(1, page); // Ensures page is at least 1
  const safeLimit = Math.max(1, limit); // Ensures limit is at least 1

  // Calculating # of phones to skip
  const skip = (safePage - 1) * safeLimit;

  // Creating the search query object for searching in MongoDB
  let query: any = {};
  if (options.search) {
    // Searches name and manufacturer for the phones containing search string (case-insensitive)
    query.$or = [
      { name: { $regex: options.search, $options: "i" } },
      { manufacturer: { $regex: options.search, $options: "i" } },
    ];
  }

  // Filtering query by brand
  if (options.brand && options.brand.length > 0) {
    query.manufacturer = { $in: options.brand };
  }

  // Filtering query by price range
  if (options.minPrice !== undefined || options.maxPrice !== undefined) {
    query.price = {};
    if (options.minPrice !== undefined) query.price.$gte = options.minPrice;
    if (options.maxPrice !== undefined) query.price.$lte = options.maxPrice;
  }

  // Sorting results
  const SORT_STRATEGIES: Record<string, Record<string, 1 | -1>> = {
    price_asc: { price: 1 },
    price_desc: { price: -1 },
    name_asc: { name: 1 },
    name_desc: { name: -1 },
    newest: { releaseDate: -1 },
  };

  // Gets sort strategy from argument if it exist otherwise fallback to newest if garbage input
  const sortOrder = SORT_STRATEGIES[options.sortBy || "newest"] || SORT_STRATEGIES.newest;

  // Fetching list of phone JSON objects on a certain page and # of phones in list
  const [phones, total] = await Promise.all([
    Phone.find(query).sort(sortOrder).skip(skip).limit(safeLimit).select(PHONE_CARD_PROJECTION).lean(), // RETURNS PLAIN JSON OBJECTS
    Phone.countDocuments(query),
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
