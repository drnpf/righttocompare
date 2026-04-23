import { Router } from "express";
import * as trendsController from "../controllers/trendsController";

const router = Router();

/**
 * Gets global momentum and brand radar data.
 * @route GET /api/trends/global
 */
router.get("/global", trendsController.getGlobalTrends);

/**
 * Gets trending tags with live velocity to track what is a trending
 * issue/topic.
 * @route GET /api/trends/ticker
 */
router.get("/ticker", trendsController.getTickerData);

/**
 * Gets specific sentiment shift analysis for one device.
 * @route GET /api/trends/:phoneId
 */
router.get("/:phoneId", trendsController.getPhoneVibeShift);

export default router;
