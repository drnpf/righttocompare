import mongoose, { Schema, Document } from "mongoose";
import { IPhoneSummary } from "./Phone";

export interface ITrendingComparisons {
  views: number;
  lastCompared: Date;
  phones: IPhoneSummary[];
}

export interface IComparisonAnalytics extends Document {
  comparisonKey: string; // The comparison ID which is just going to be a sorted concat of phone IDs
  phoneIds: string[]; // Phone IDs being compared
  views: number; // Number of views this comparison has had
  lastCompared: Date; // Date of last compared
}

const ComparisonAnalyticsSchema: Schema = new Schema(
  {
    comparisonKey: { type: String, required: true, unique: true, index: true },
    phoneIds: { type: [String], required: true },
    views: { type: Number, default: 0 },
    lastCompared: { type: Date, default: Date.now() },
  },
  { timestamps: true }, // Date of creation/or last update on Mongo
);

// Sorts comparisons by highest view
ComparisonAnalyticsSchema.index({ views: -1 });

export default mongoose.model<IComparisonAnalytics>("ComparisonAnalytics", ComparisonAnalyticsSchema);
