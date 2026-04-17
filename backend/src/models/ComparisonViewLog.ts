import { Schema, model } from "mongoose";

// ------------------------------------------------------------
// | CONFIGURATION CONSTANTS
// ------------------------------------------------------------
const COMPARISON_VIEWED_TTL = 30 * 60; // The time till the user can contribute to a comparison being viewed again

/**
 * Tracks IP of user who has contributed to views of a certain comparison
 * for a certain duration. The view is removed after that duration.
 */
const comparisonViewLogSchema = new Schema(
  {
    ip: { type: String, required: true },
    comparisonKey: { type: String, required: true },
    createdAt: { type: Date, default: Date.now, expires: COMPARISON_VIEWED_TTL },
  },
  { collection: "comparison_viewed_logs" },
);

// Storing database index sorted by IP and each IP's viewed comparison for fast lookup
comparisonViewLogSchema.index({ ip: 1, comparisonKey: 1 }, { unique: true });

export const ComparisonViewLog = model("ComparisonViewLog", comparisonViewLogSchema);
