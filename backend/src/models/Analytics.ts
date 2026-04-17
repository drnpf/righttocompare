import mongoose, { Schema, Document } from "mongoose";
import { IPhoneSummary } from "./Phone";

/**
 * The Popular Comparisons object to contain information on the phones in a comparison.
 */
export interface IPopularComparisons {
  phones: IPhoneSummary[];
}

/**
 * The Comparison Analytics document schema on MongoDB.
 */
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
  { timestamps: true, collection: "comparison_analytics" },
);

// Sorts comparisons by highest view
ComparisonAnalyticsSchema.index({ views: -1 });

export default mongoose.model<IComparisonAnalytics>("ComparisonAnalytics", ComparisonAnalyticsSchema);
