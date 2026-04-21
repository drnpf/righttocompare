import mongoose, { Schema, Document } from "mongoose";

export interface IPriceHistory extends Document {
    phoneId: string;
    amount: number;
    currency: string;
    source?: string;
    raw?: string;
    recordedAt: Date;
}

const PriceHistorySchema: Schema = new Schema<IPriceHistory>(
    {
        phoneId: { type: String, required: true, index: true },
        amount: { type: Number, required: true },
        currency: { type: String, required: true, default: "USD" },
        source: { type: String, default: "manual" },
        raw: { type: String },
        recordedAt: { type: Date, required: true, default: Date.now },
    },
    {
        collection: "price_history",
    },
);

PriceHistorySchema.index({ phoneId: 1, recordedAt: -1 });

export default mongoose.model<IPriceHistory>("PriceHistory", PriceHistorySchema);