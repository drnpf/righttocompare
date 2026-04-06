import mongoose, { Schema, Document } from "mongoose";

export interface IBotLog extends Document {
    sessionId: string;
    userId?: string;
    message: string;
    response: {
        summary?: string;
        recommendations?: any[];
        next_step?: string;
        questions?: string[];
        suggestion?: string;
    };
    developerTrace?: {
        parsedPreferences?: any;
        candidateCount?: number;
        topResults?: any[];
        scoringModel?: string;
        state?: string;
        missingFields?: string[];
    };
    createdAt: Date;
}

const BotLogSchema = new Schema<IBotLog>(
    {
        sessionId: { type: String, required: true, index: true },
        userId: { type: String, required: false, index: true },
        message: { type: String, required: true },

        response: {
            summary: { type: String },
            recommendations: { type: [Schema.Types.Mixed], default: [] },
            next_step: { type: String },
            questions: { type: [String], default: [] },
            suggestion: { type: String },
        },

        developerTrace: {
            parsedPreferences: { type: Schema.Types.Mixed },
            candidateCount: { type: Number },
            topResults: { type: [Schema.Types.Mixed], default: [] },
            scoringModel: { type: String },
            state: { type: String },
            missingFields: { type: [String], default: [] },
        },

        createdAt: { type: Date, default: Date.now },
    },
    {
        collection: "bot_log",
    }
);

export default mongoose.model<IBotLog>("BotLog", BotLogSchema);