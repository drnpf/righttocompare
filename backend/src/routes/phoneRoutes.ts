import { Router } from "express";
import {
  getPhonePage,
  getPhoneById,
  getPhoneCardById,
  getManufacturers,
  getPhoneSummaries,
  getPhoneSummaryById,
  createPhone,
  updatePhone,
  deletePhone,
} from "../controllers/phoneController";

const router = Router();

// --- PUBLIC ROUTES ---
/**
 * Get a list of all unique manufacturers
 * @route GET /api/phones/manufacturers
 */
router.get("/manufacturers", getManufacturers);

/**
 * Get multiple phone summaries by IDs
 * @route GET /api/phones/summaries?ids=id1,id2,id3
 */
router.get("/summaries", getPhoneSummaries);

/**
 * Get a single phone summary item by ID
 * @route GET /api/phones/summary/:id
 */
router.get("/summary/:id", getPhoneSummaryById);

/**
 * Get a single phone card by ID
 * @route GET /api/phones/card/:id
 */
router.get("/card/:id", getPhoneCardById);

/**
 * Get a single phone by ID
 * @route GET /api/phones/:id
 */
router.get("/:id", getPhoneById);

/**
 * Get all phones
 * @route GET /api/phones
 */
router.get("/", getPhonePage);

// --- ADMIN ROUTES --- (maybe we can add some middleware to separate admin and public routes later)
/**
 * Create a new phone
 * @route POST /api/phones
 */
router.post("/", createPhone);

/**
 * Update an existing phone by ID
 * @route PUT /api/phones/:id
 */
router.put("/:id", updatePhone);

/**
 * Delete a phone by ID
 * @route DELETE /api/phones/:id
 */
router.delete("/:id", deletePhone);

export default router;
