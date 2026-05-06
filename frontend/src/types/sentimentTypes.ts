// --- Building Blocks ---
export interface SentimentTopic {
  topic: string; // i.e. camera, battery
  count: number; // The count on positive/negative sentiment to topic
}

/**
 * Contains the sentiment on different aspects of a phone.
 */
export interface SentimentSummary {
  pros: SentimentTopic[];
  cons: SentimentTopic[];
  totalAnalyzed: number;
}

export type SentimentTag = string; // Tags like "+camera", "-price"
