const CHATBOT_API_URL = process.env.CHATBOT_API_URL || "http://127.0.0.1:8000/chat";

export async function getChatbotReply(sessionId: string, message: string) {
    const response = await fetch(CHATBOT_API_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            session_id: sessionId,
            message,
        }),
    });

    if (!response.ok) {
        const text = await response.text();
        throw new Error(`Chatbot service failed: ${text}`);
    }

    return response.json();
}