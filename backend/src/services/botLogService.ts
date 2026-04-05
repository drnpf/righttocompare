import BotLog from "../models/BotLog";

interface LogChatbotTurnParams {
    sessionId: string;
    userId?: string;
    message: string;
    chatbotResponse: any;
}

export async function logChatbotTurn({
    sessionId,
    userId,
    message,
    chatbotResponse,
}: LogChatbotTurnParams) {
    const userView = chatbotResponse?.user_view || {};
    const developerView = chatbotResponse?.developer_view || {};

    const logDoc = new BotLog({
        sessionId,
        userId,
        message,
        response: {
            summary: userView.summary,
            recommendations: userView.recommendations || [],
            next_step: userView.next_step,
            questions: userView.questions || [],
            suggestion: userView.suggestion,
        },
        developerTrace: {
            parsedPreferences: developerView.parsed_preferences,
            candidateCount: developerView.candidate_count,
            topResults: developerView.top_results || [],
            scoringModel: developerView.scoring_model,
            state: developerView.state,
            missingFields: developerView.missing_fields || [],
        },
    });

    return await logDoc.save();
}