import { Request, Response } from "express";
import { getChatbotReply } from "../services/chatbotService";
import { logChatbotTurn } from "../services/botLogService";
import BotLog from "../models/BotLog";

export async function getChatbotLogs(req: Request, res: Response) {
    try {
        const logs = await BotLog.find({})
            .sort({ createdAt: -1 })
            .limit(50)
            .lean();

        return res.json(logs);
    } catch (error: any) {
        console.error("Get chatbot logs error:", error.message);
        return res.status(500).json({ error: "Failed to fetch chatbot logs" });
    }
}

export async function getChatbotSessionLogs(req: Request, res: Response) {
    try {
        const { sessionId } = req.params;

        const logs = await BotLog.find({ sessionId })
            .sort({ createdAt: 1 })
            .lean();

        return res.json(logs);
    } catch (error: any) {
        console.error("Get chatbot session logs error:", error.message);
        return res.status(500).json({ error: "Failed to fetch chatbot session logs" });
    }
}

export async function postChatbotMessage(req: Request, res: Response) {
    try {
        const { sessionId, message } = req.body;

        if (!sessionId || !message) {
            return res.status(400).json({
                error: "sessionId and message are required",
            });
        }

        const chatbotResponse = await getChatbotReply(sessionId, message);

        await logChatbotTurn({
            sessionId,
            message,
            chatbotResponse,
        });

        return res.json(chatbotResponse);
    } catch (error: any) {
        console.error("Chatbot controller error:", error.message);
        return res.status(500).json({
            error: "Failed to get chatbot response",
        });
    }
}