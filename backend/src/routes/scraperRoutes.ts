import { Router } from "express";
import { runScraper } from "../controllers/scraperController";

const router = Router();

router.post("/run", runScraper);

export default router;