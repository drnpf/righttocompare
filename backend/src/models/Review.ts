import mongoose, { Document, Schema } from "mongoose";

// Interfaces for review and ratings
export interface ICategoryRatings {
  camera: number;
  battery: number;
  design: number;
  performance: number;
  value: number;
}

export interface IReview extends Document {
  phoneId: string;
  userId: string; // Firebase UID
  userName: string;
  rating: number; // 1-5 (calculated average from categoryRatings)
  categoryRatings: ICategoryRatings;
  date: Date;
  title: string;
  review: string;
  sentimentTags: string[]; // e.g. ["+camera", "-battery", "+performance"]
  helpful: number;
  notHelpful: number;
  helpfulVoters: string[]; // User IDs who voted helpful
  notHelpfulVoters: string[]; // User IDs who voted not helpful
}

const ReviewSchema: Schema = new Schema<IReview>(
  {
    phoneId: { type: String, required: true, index: true },
    userId: { type: String, required: true },
    userName: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    categoryRatings: {
      camera: { type: Number, required: true },
      battery: { type: Number, required: true },
      design: { type: Number, required: true },
      performance: { type: Number, required: true },
      value: { type: Number, required: true },
    },
    date: { type: Date, default: Date.now, index: true },
    title: { type: String, required: true },
    review: { type: String, required: true },
    sentimentTags: { type: [String], default: [] },
    helpful: { type: Number, default: 0 },
    notHelpful: { type: Number, default: 0 },
    helpfulVoters: { type: [String], default: [] },
    notHelpfulVoters: { type: [String], default: [] },
  },
  { timestamps: true },
);

export default mongoose.model<IReview>("Review", ReviewSchema);
