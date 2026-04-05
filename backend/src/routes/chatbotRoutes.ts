import { Router } from "express";
import {
    postChatbotMessage,
    getChatbotLogs,
    getChatbotSessionLogs,
} from "../controllers/chatbotController";

const router = Router();

router.post("/", postChatbotMessage);
router.get("/logs", getChatbotLogs);
router.get("/logs/:sessionId", getChatbotSessionLogs);

export default router;