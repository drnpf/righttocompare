import { Router } from "express";
import { getAllPhones, getPhoneById, createPhone, updatePhone, deletePhone } from "../controllers/phoneController";
import { protect } from "../middleware/authMiddleware";
import { requireAdmin } from "../middleware/adminMiddleware";

const router = Router();

// --- PUBLIC ROUTES ---
/**
 * Get all phones
 * @route GET /api/phones
 */
router.get("/", getAllPhones);

/**
 * Get a single phone by ID
 * @route GET /api/phones/:id
 */
router.get("/:id", getPhoneById);

// --- ADMIN ROUTES --- (maybe we can add some middleware to separate admin and public routes later)
/**
 * Create a new phone
 * @route POST /api/phones
 */
router.post("/", protect, requireAdmin, createPhone);

/**
 * Update an existing phone by ID
 * @route PUT /api/phones/:id
 */
router.put("/:id", protect, requireAdmin, updatePhone);

/**
 * Delete a phone by ID
 * @route DELETE /api/phones/:id
 */
router.delete("/:id", protect, requireAdmin, deletePhone);

export default router;
