import Phone, { IPhone, IPhoneSummary, IPhoneCard } from "../models/Phone";
import PriceHistory from "../models/PriceHistory";

const HOT_PRICE_DROP_THRESHOLD_PERCENT = 20;
const HOT_LOOKBACK_DAYS = 365;

/**
 * Projection for the PhoneSummary view. Only has essential fields for catalog grid and comparison cart
 */
const PHONE_SUMMARY_PROJECTION = {
  _id: 0,
  id: 1,
  name: 1,
  manufacturer: 1,
  price: 1,
  "images.main": 1,
};

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
  "specs.performance.processor": 1,
  "specs.performance.ram.options": 1,
  "specs.performance.storageOptions": 1,
  "specs.display.screenSizeInches": 1,
  "specs.display.technology": 1,
  "specs.camera.mainMegapixels": 1,
  "specs.battery.capacitymAh": 1,
};

/**
 * Retrieves phones from a specific page with a given limit per page and total
 * number of phones in the database. This function returns a list of phone
 * JSON objects (NOT Mongoose Documents). FOR READ-ONLY PURPOSES.
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
 * @returns An object containing the list of phone JSON objects and the total
 * number of phones in the database.
 */
export const findPhonePage = async (
  page: number,
  limit: number,
  options: {
    search?: string;
    manufacturer?: string[];
    minPrice?: number;
    maxPrice?: number;
    ram?: number[];
    storage?: number[];
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
    // Search query (on phone name and manufacturer)
    query.$or = [
      { name: { $regex: options.search, $options: "i" } },
      { manufacturer: { $regex: options.search, $options: "i" } },
    ];
  }

  // Manufacturer filter
  if (options.manufacturer && options.manufacturer.length > 0) {
    query.manufacturer = { $in: options.manufacturer };
  }

  // Price range filter
  if (options.minPrice !== undefined || options.maxPrice !== undefined) {
    query.price = {};
    if (options.minPrice !== undefined) query.price.$gte = options.minPrice;
    if (options.maxPrice !== undefined) query.price.$lte = options.maxPrice;
  }

  // RAM filter
  if (options.ram && options.ram.length > 0) {
    query["specs.performance.ram.options"] = { $in: options.ram };
  }

  // Storage filter
  if (options.storage && options.storage.length > 0) {
    query["specs.performance.storageOptions"] = { $in: options.storage };
  }

  // Sorting results (CAN ADD MORE SORTS HERE)
  const SORT_STRATEGIES: Record<string, Record<string, 1 | -1>> = {
    price_asc: { price: 1 },
    price_desc: { price: -1 },
    name_asc: { name: 1 },
    name_desc: { name: -1 },
    newest: { releaseDate: -1 },
    oldest: { releaseDate: 1 },
    rating_desc: { averageRating: -1 },
  };

  // Gets sort strategy from argument if it exist otherwise sort by newest if garbage input
  const sortOrder = SORT_STRATEGIES[options.sortBy || "newest"] || SORT_STRATEGIES.newest;

  // Fetching list of phone JSON objects on a certain page and # of phones in list
  const [phones, total] = await Promise.all([
    Phone.find(query).sort(sortOrder).skip(skip).limit(safeLimit).select(PHONE_CARD_PROJECTION).lean(), // RETURNS PLAIN JSON OBJECTS
    Phone.countDocuments(query),
  ]);
  return { phones, total };
};

export interface IHotPhoneCard extends IPhoneCard {
  hotSignals: {
    isNewRelease: boolean;
    hasPriceDrop: boolean;
    originalPrice: number | null;
    latestPrice: number | null;
    percentDrop: number | null;
  };
}

const buildPhoneQuery = (options: {
  search?: string;
  manufacturer?: string[];
  minPrice?: number;
  maxPrice?: number;
  ram?: number[];
  storage?: number[];
}) => {
  const query: any = {};

  if (options.search) {
    query.$or = [
      { name: { $regex: options.search, $options: "i" } },
      { manufacturer: { $regex: options.search, $options: "i" } },
    ];
  }

  if (options.manufacturer && options.manufacturer.length > 0) {
    query.manufacturer = { $in: options.manufacturer };
  }

  if (options.minPrice !== undefined || options.maxPrice !== undefined) {
    query.price = {};
    if (options.minPrice !== undefined) query.price.$gte = options.minPrice;
    if (options.maxPrice !== undefined) query.price.$lte = options.maxPrice;
  }

  if (options.ram && options.ram.length > 0) {
    query["specs.performance.ram.options"] = { $in: options.ram };
  }

  if (options.storage && options.storage.length > 0) {
    query["specs.performance.storageOptions"] = { $in: options.storage };
  }

  return query;
};

export const findHotPhonePage = async (
  page: number,
  limit: number,
  options: {
    search?: string;
    manufacturer?: string[];
    minPrice?: number;
    maxPrice?: number;
    ram?: number[];
    storage?: number[];
  },
): Promise<{ phones: IHotPhoneCard[]; total: number }> => {
  const safePage = Math.max(1, page);
  const safeLimit = Math.max(1, limit);
  const skip = (safePage - 1) * safeLimit;

  const query = buildPhoneQuery(options);
  const phones = (await Phone.find(query).select(PHONE_CARD_PROJECTION).lean()) as IPhoneCard[];

  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - HOT_LOOKBACK_DAYS);

  const phoneIds = phones.map((phone) => phone.id);
  const priceHistoryRows = await PriceHistory.find({ phoneId: { $in: phoneIds } })
    .sort({ phoneId: 1, recordedAt: 1 })
    .lean();

  const historyByPhoneId = new Map<string, typeof priceHistoryRows>();
  for (const row of priceHistoryRows) {
    const currentRows = historyByPhoneId.get(row.phoneId) || [];
    currentRows.push(row);
    historyByPhoneId.set(row.phoneId, currentRows);
  }

  const hotPhones = phones
    .map((phone) => {
      const releaseDate = new Date(phone.releaseDate);
      const isNewRelease = releaseDate >= cutoff;

      const history = historyByPhoneId.get(phone.id) || [];
      const oldest = history[0];
      const latest = history[history.length - 1];

      let originalPrice: number | null = null;
      let latestPrice: number | null = null;
      let percentDrop: number | null = null;
      let hasPriceDrop = false;

      if (
        oldest &&
        latest &&
        Number.isFinite(oldest.amount) &&
        Number.isFinite(latest.amount) &&
        oldest.amount > 0
      ) {
        originalPrice = oldest.amount;
        latestPrice = latest.amount;
        percentDrop = ((oldest.amount - latest.amount) / oldest.amount) * 100;
        hasPriceDrop = percentDrop >= HOT_PRICE_DROP_THRESHOLD_PERCENT;
      }

      return {
        ...phone,
        hotSignals: {
          isNewRelease,
          hasPriceDrop,
          originalPrice,
          latestPrice,
          percentDrop,
        },
      };
    })
    .filter((phone) => phone.hotSignals.isNewRelease || phone.hotSignals.hasPriceDrop)
    .sort((a, b) => {
      if (a.hotSignals.hasPriceDrop !== b.hotSignals.hasPriceDrop) {
        return a.hotSignals.hasPriceDrop ? -1 : 1;
      }

      const percentA = a.hotSignals.percentDrop ?? -1;
      const percentB = b.hotSignals.percentDrop ?? -1;
      if (percentA !== percentB) {
        return percentB - percentA;
      }

      return new Date(b.releaseDate).getTime() - new Date(a.releaseDate).getTime();
    });

  return {
    phones: hotPhones.slice(skip, skip + safeLimit),
    total: hotPhones.length,
  };
};

export interface IPriceHistoryPoint {
  month: string;
  price: number;
  recordedAt: Date;
}

export interface IPriceSummary {
  phoneId: string;
  currency: string;
  latestPrice: number | null;
  oldestPrice: number | null;
  changeAmount: number | null;
  changePercent: number | null;
  lowestPrice: number | null;
  lowestPriceMonth: string | null;
  latestRecordedAt: Date | null;
}

const formatMonth = (date: Date): string => {
  return date.toLocaleString("en-US", {
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
};

export const findPhonePriceHistoryById = async (id: string): Promise<IPriceHistoryPoint[]> => {
  const rows = await PriceHistory.find({ phoneId: id }).sort({ recordedAt: 1 }).lean();

  return rows.map((row) => ({
    month: formatMonth(new Date(row.recordedAt)),
    price: row.amount,
    recordedAt: new Date(row.recordedAt),
  }));
};

export const findPhonePriceSummaryById = async (id: string): Promise<IPriceSummary> => {
  const rows = await PriceHistory.find({ phoneId: id }).sort({ recordedAt: 1 }).lean();

  if (!rows.length) {
    return {
      phoneId: id,
      currency: "USD",
      latestPrice: null,
      oldestPrice: null,
      changeAmount: null,
      changePercent: null,
      lowestPrice: null,
      lowestPriceMonth: null,
      latestRecordedAt: null,
    };
  }

  const oldest = rows[0];
  const latest = rows[rows.length - 1];

  const prices = rows.map((r) => r.amount);
  const minPrice = Math.min(...prices);
  const minRow = rows.find((r) => r.amount === minPrice) || null;

  const changeAmount = latest.amount - oldest.amount;
  const changePercent = oldest.amount !== 0 ? (changeAmount / oldest.amount) * 100 : null;

  return {
    phoneId: id,
    currency: latest.currency || "USD",
    latestPrice: latest.amount,
    oldestPrice: oldest.amount,
    changeAmount,
    changePercent,
    lowestPrice: minPrice,
    lowestPriceMonth: minRow ? formatMonth(new Date(minRow.recordedAt)) : null,
    latestRecordedAt: new Date(latest.recordedAt),
  };
};

export interface ICreatePriceHistoryInput {
  amount: number;
  currency?: string;
  source?: string;
  raw?: string;
  recordedAt?: Date;
}

export const createPhonePriceHistoryEntry = async (id: string, input: ICreatePriceHistoryInput) => {
  const entry = new PriceHistory({
    phoneId: id,
    amount: input.amount,
    currency: input.currency || "USD",
    source: input.source || "admin-manual",
    raw: input.raw || `$${input.amount}`,
    recordedAt: input.recordedAt || new Date(),
  });

  return await entry.save();
};

/**
 * Finds a single phone by its ID. Returns a JSON object.
 * @param id The unique string ID of the phone
 * @returns The resultant phone data JSON object containing full specs.
 */
export const findPhoneById = async (id: string): Promise<IPhone | null> => {
  return await Phone.findOne({ id: id }).select("-reviews").lean();
};

/**
 * Finds multiple phone by their IDs. Returns a JSON object sorted according to
 * the order of the requesting string array of IDs.
 * @param id The list of unique string ID of the phone
 * @returns An array of phone data JSON objects containing full specs.
 */
export const findPhonesById = async (ids: string[]): Promise<IPhone[]> => {
  const phones = (await Phone.find({ id: { $in: ids } }).lean()) as any[];

  // Mapping phone objects to retain original ID list order
  return ids.map((requestedId) => phones.find((p) => p.id === requestedId)).filter((p): p is IPhone => p !== undefined);
};

/**
 * Finds multiple phone summaries by their IDs. Returns an array of JSON objects.
 * Performs batch retrieval of phone objects. This is used to populate Comparison Cart.
 * @param id The unique string ID of the phone
 * @returns The resultant phone data JSON object representing a phone summary.
 */
export const findPhoneSummaryById = async (id: string): Promise<IPhoneSummary | null> => {
  return await Phone.findOne({ id: id }).select(PHONE_SUMMARY_PROJECTION).lean();
};

/**
 * Finds multiple phone summaries by their IDs. Returns an array of JSON objects.
 * Performs batch retrieval of phone objects. This is used to populate Comparison Cart.
 * @param id The unique string ID of the phone
 * @returns An array of phone summary JSON objects
 */
export const findPhoneSummaries = async (ids: string[]): Promise<IPhoneSummary[]> => {
  const phones = (await Phone.find({ id: { $in: ids } })
    .select(PHONE_SUMMARY_PROJECTION)
    .lean()) as any[];

  // Mapping phone objects to retain original ID list order
  return ids
    .map((requestedId) => phones.find((p) => p.id === requestedId))
    .filter((p): p is IPhoneSummary => p !== undefined);
};

/**
 * Finds a single phone card by its ID. Returns a JSON object.
 * @param id The unique string ID of the phone
 * @returns The resultant phone data JSON object representing a phone card.
 */
export const findPhoneCardById = async (id: string): Promise<IPhoneCard | null> => {
  return await Phone.findOne({ id: id }).select(PHONE_CARD_PROJECTION).lean();
};

/**
 * Returns a list of all unique manufacturers.
 * @returns A list of strings with each string representing a manufacturer.
 */
export const getAllManufacturers = async (): Promise<string[]> => {
  return await Phone.distinct("manufacturer");
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
  return await Phone.findOneAndUpdate({ id: id }, updateData, { returnDocument: "after", runValidators: true });
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
