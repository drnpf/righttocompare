import express from "express";
import { protect } from "../middleware/authentication";
import {
    getMyNotifications,
    markOneRead,
    markAllRead,
} from "../controllers/inAppNotificationController";

const router = express.Router();

router.get("/", protect, getMyNotifications);
router.patch("/read-all", protect, markAllRead);
router.patch("/:id/read", protect, markOneRead);

export default router;