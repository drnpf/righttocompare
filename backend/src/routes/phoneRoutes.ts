import { Router } from "express";
import * as phoneController from "../controllers/phoneController";

const router = Router();

// --- PUBLIC ROUTES ---
/**
 * Get a list of all unique manufacturers
 * @route GET /api/phones/manufacturers
 */
router.get("/manufacturers", phoneController.getManufacturers);

/**
 * Get multiple full phone data by IDs
 * @route GET /api/phones/batch?ids=id1,id2,id3
 */
router.get("/batch", phoneController.getPhoneBatch);

/**
 * Get multiple phone summaries by IDs
 * @route GET /api/phones/summaries?ids=id1,id2,id3
 */
router.get("/summaries", phoneController.getPhoneSummaries);

/**
 * Get a single phone summary item by ID
 * @route GET /api/phones/summary/:id
 */
router.get("/summary/:id", phoneController.getPhoneSummaryById);

/**
 * Get a single phone card by ID
 * @route GET /api/phones/card/:id
 */
router.get("/card/:id", phoneController.getPhoneCardById);

/**
 * Get price history for a single phone by ID
 * @route GET /api/phones/:id/price-history
 */
router.get("/:id/price-history", phoneController.getPhonePriceHistory);

/**
 * Get price summary for a single phone by ID
 * @route GET /api/phones/:id/price-summary
 */
router.get("/:id/price-summary", phoneController.getPhonePriceSummary);

/**
 * Get a single phone by ID
 * @route GET /api/phones/:id
 */
router.get("/:id", phoneController.getPhoneById);

/**
 * Get all phones
 * @route GET /api/phones
 */
router.get("/", phoneController.getPhonePage);

// --- ADMIN ROUTES --- (maybe we can add some middleware to separate admin and public routes later)
/**
 * Create a new phone
 * @route POST /api/phones
 */
router.post("/", phoneController.createPhone);

/**
 * Update an existing phone by ID
 * @route PUT /api/phones/:id
 */
router.put("/:id", phoneController.updatePhone);

/**
 * Delete a phone by ID
 * @route DELETE /api/phones/:id
 */
router.delete("/:id", phoneController.deletePhone);

export default router;
