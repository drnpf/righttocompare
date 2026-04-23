/**
 * Keyword-based sentiment analyzer for phone reviews and discussions.
 * Scans text for phone-related topics and classifies them as positive or negative.
 * Returns sentiment tags like "+camera", "-battery", "+performance".
 */
export interface ISentimentTag {
  topic: string;
  sentiment: "positive" | "negative";
  label: string; // e.g. "+camera" or "-battery"
}

export interface ISentimentItem {
  topic: string;
  count: number;
}

export interface ISentimentSummary {
  pros: ISentimentItem[];
  cons: ISentimentItem[];
  totalAnalyzed: number;
}
