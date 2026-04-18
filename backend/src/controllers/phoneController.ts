import { Request, Response } from "express";
import * as phoneService from "../services/phoneService";

/**
 * Fetches a paginated list of phones. Supports parameters for page number and
 * limit per page. The response includes pagination metadata which indicates:
 *    - totalPages: The total number of pages available based on the total
 *      number of phones and the limit per page.
 *    - currentPage: The current page number being retrieved.
 *    - itemsPerPage: The number of phones returned per page (the limit).
 *    - hasNextPage: A boolean indicating if there is a next page available.
 *    - hasPrevPage: A boolean indicating if there is a previous page available.
 * This function also allows for searching of phone by a string query and returns
 * a specified number of matching search results.
 * @route GET /api/phones
 * @param req The Express request object which may contain 'page' and 'limit'
 * query parameters for pagination
 * @param res The Express response object
 * @returns A JSON response containing list of phones and pagination metadata
 */
export const getPhonePage = async (req: Request, res: Response) => {
  try {
    // Setting default values and limits for pagination
    const MAX_LIMIT = 50; // Limiting number of phones per page to prevent DDoS or memory issues
    const DEFAULT_LIMIT = 12; // Default limit if not specified of phones per page
    const PAGE_DEFAULT = 1; // Default page if not specified

    // Input sanitization for findAllPhones function
    const page = parseInt(req.query.page as string) || PAGE_DEFAULT;
    const limit = Math.min(parseInt(req.query.limit as string) || DEFAULT_LIMIT, MAX_LIMIT);
    const search = (req.query.search as string) || "";
    const sortBy = (req.query.sortBy as string) || "newest";

    // Sanitization of max and min price
    const minPrice = req.query.minPrice ? parseFloat(req.query.minPrice as string) : undefined;
    const maxPrice = req.query.maxPrice ? parseFloat(req.query.maxPrice as string) : undefined;

    // Sanitization of brands if multiple brands chosen
    let manufacturer: string[] = [];
    if (req.query.manufacturer) {
      manufacturer = Array.isArray(req.query.manufacturer)
        ? (req.query.manufacturer as string[])
        : [req.query.manufacturer as string];
    }

    // Searching for phones with options applied (if any)
    const { phones, total } = await phoneService.findPhonePage(page, limit, {
      search,
      manufacturer,
      minPrice,
      maxPrice,
      sortBy,
    });

    // Returning a list of phones with pagination metadata
    res.status(200).json({
      success: true,
      message: "Phones retrieved successfully",
      data: phones,
      pagination: {
        totalItems: total,
        totalPages: Math.ceil(total / limit), // Calculates total # of pages
        currentPage: page,
        itemsPerPage: limit,
        hasNextPage: page * limit < total, // Checks if theoretical # of phones exceeds actual # of phones
        hasPrevPage: page > 1,
      },
    });
  } catch (err) {
    console.error("Error fetching phones:", err);
    res.status(500).json({ success: false, message: "Server error fetching phones" });
  }
};

/**
 * Fetches a specific phone using its ID.
 * @route GET /api/phones/:id
 * @param req The Express request object containing the 'id' param
 * @param res The Express response object
 * @returns The phone data
 */
export const getPhoneById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const phone = await phoneService.findPhoneById(id);
    if (!phone) {
      return res.status(404).json({ message: `Phone with ID '${id}' not found` });
    }
    res.status(200).json(phone);
  } catch (error) {
    console.error(`Error fetching phone ${req.params.id}:`, error);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * Fetches multiple full phone objects by their IDs.
 * @route GET /api/phones/batch
 * @param req The Express request object containing the 'id' param
 * @param res The Express response object
 * @returns
 */
export const getPhoneBatch = async (req: Request, res: Response) => {
  try {
    const idsString = req.query.ids as string;

    // Handles case of no IDs passed to request parameter
    if (!idsString) {
      return res.status(400).json({ message: "Missing 'ids' query parameter" });
    }

    // Putting IDs into array
    const ids = idsString.split(",");

    // Limiting number of full phone specs to retrieve
    if (ids.length > 3) {
      return res.status(400).json({ message: "Maximum of 3 phones allowed for batch retrieval" });
    }
    const phones = await phoneService.findPhonesById(ids);
    res.status(200).json(phones);
  } catch (error) {
    console.error("Error fetching phone batch:", error);
    res.status(500).json({ message: "Server error fetching phone batch" });
  }
};

/**
 * Fetches multiple phone summaries in a single request.
 * @route GET /api/phones/summaries
 * @param req The Express request object containing the 'id' param
 * @param res The Express response object
 * @returns The phone summary data array (only contains essential data on phone)
 * containing summary of each phone requested
 */
export const getPhoneSummaries = async (req: Request, res: Response) => {
  try {
    const idsString = req.query.ids as string;
    if (!idsString) {
      return res.status(400).json({ message: "Missing 'ids' query parameter" });
    }
    const ids = idsString.split(",");
    const summaries = await phoneService.findPhoneSummaries(ids);
    res.status(200).json(summaries);
  } catch (error) {
    console.error("Error fetching batch phone summaries:", error);
    res.status(500).json({ message: "Server error fetching summaries" });
  }
};

/**
 * Fetches phone summary of a single phone in a single request.
 * @route GET /api/phones/summary/:id
 * @param req The Express request object containing the 'id' param
 * @param res The Express response object
 * @returns The phone summary data (only contains essential data on phone)
 */
export const getPhoneSummaryById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const phoneSummary = await phoneService.findPhoneSummaryById(id);
    if (!phoneSummary) {
      return res.status(404).json({ message: `Phone Summary with ID '${id}' not found` });
    }
    res.status(200).json(phoneSummary);
  } catch (error) {
    console.error(`Error fetching phone ${req.params.id}:`, error);
    res.status(500).json({ message: "Server error fetching phone summary" });
  }
};

/**
 * Fetches a specific phone card using its ID.
 * @route GET /api/phones/card/:id
 * @param req The Express request object containing the 'id' param
 * @param res The Express response object
 * @returns The phone card data contains essential information and quick specs.
 */
export const getPhoneCardById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const phoneCard = await phoneService.findPhoneCardById(id);
    if (!phoneCard) {
      return res.status(404).json({ message: `Phone Card with ID '${id}' not found` });
    }
    res.status(200).json(phoneCard);
  } catch (error) {
    console.error(`Error fetching phone ${req.params.id}:`, error);
    res.status(500).json({ message: "Server error fetching phone card" });
  }
};

/**
 * Fetches a list of all unique manufacturers.
 * @route GET /api/phones/manufacturers
 * @param req The Express request object
 * @param res The Express response object containing manufacturers
 * @returns A list of unique manufacturers
 */
export const getManufacturers = async (req: Request, res: Response) => {
  try {
    const manufacturers = await phoneService.getAllManufacturers();
    res.status(200).json(manufacturers.sort());
  } catch (error) {
    console.error("Error fetching manufacturers:", error);
    res.status(500).json({ message: "Error fetching manufacturers" });
  }
};

/**
 * Creates a new phone. The 'id' field is auto-generated by the model if omitted.
 * @route POST /api/phones
 * @param req The Express request object containing phone data in the body
 * @param res The Express response object
 * @returns The created phone object
 */
export const createPhone = async (req: Request, res: Response) => {
  try {
    // Validation the schema just incase there are missing fields
    if (!req.body.name || !req.body.manufacturer) {
      return res.status(400).json({ message: "Missing required fields: name, manufacturer" });
    }

    const newPhone = await phoneService.createNewPhone(req.body);
    res.status(201).json(newPhone);
  } catch (error: any) {
    console.error("Error creating phone:", error);

    // Handling duplicate key error
    if (error.code === 11000) {
      return res.status(409).json({ message: "A phone with this ID already exists." });
    }
    res.status(500).json({ message: "Server error creating phone" });
  }
};

/**
 * Updates an existing phone's details.
 * @route PUT /api/phones/:id
 * @param req - The Express request object containing 'id' param and update data
 * @param res - The Express response object
 * @returns The updated phone object
 */
export const updatePhone = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updatedPhone = await phoneService.updatePhoneById(id, req.body);

    if (!updatedPhone) {
      return res.status(404).json({ message: "Phone not found for update" });
    }

    res.status(200).json(updatedPhone);
  } catch (error) {
    console.error("Error updating phone:", error);
    res.status(500).json({ message: "Server error updating phone" });
  }
};

/**
 * Removes a phone from the database
 * @route DELETE /api/phones/:id
 * @param req The Express request object containing the 'id' param
 * @param res - The Express response object
 * @returns A success message or a 404 error
 */
export const deletePhone = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const success = await phoneService.deletePhoneById(id);

    if (!success) {
      return res.status(404).json({ message: "Phone not found for deletion" });
    }

    res.status(200).json({ message: "Phone deleted successfully" });
  } catch (error) {
    console.error("Error deleting phone:", error);
    res.status(500).json({ message: "Server error deleting phone" });
  }
};
