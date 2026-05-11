import mongoose, { Document, Schema } from "mongoose";

export interface IInAppNotification extends Document {
    userId: string;
    type: "price_drop";
    title: string;
    message: string;
    phoneId?: string;
    isRead: boolean;
    metadata?: {
        oldPrice?: number;
        newPrice?: number;
        dropPercent?: number;
    };
    createdAt: Date;
    updatedAt: Date;
}

const InAppNotificationSchema = new Schema<IInAppNotification>(
    {
        userId: { type: String, required: true, index: true },
        type: { type: String, enum: ["price_drop"], required: true },
        title: { type: String, required: true },
        message: { type: String, required: true },
        phoneId: { type: String },
        isRead: { type: Boolean, default: false, index: true },
        metadata: {
            oldPrice: Number,
            newPrice: Number,
            dropPercent: Number,
        },
    },
    {
        timestamps: true,
        collection: "in_app_notifications",
    },
);

InAppNotificationSchema.index({ userId: 1, isRead: 1, createdAt: -1 });

export default mongoose.model<IInAppNotification>(
    "InAppNotification",
    InAppNotificationSchema,
);