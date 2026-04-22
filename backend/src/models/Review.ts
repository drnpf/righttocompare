// Interfaces for review and ratings
export interface ICategoryRatings {
  camera: number;
  battery: number;
  design: number;
  performance: number;
  value: number;
}

export interface IReview {
  id: number;
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

export interface ISentimentItem {
  topic: string;
  count: number;
}

export interface ISentimentSummary {
  pros: ISentimentItem[];
  cons: ISentimentItem[];
  totalAnalyzed: number;
  lastUpdated?: Date;
}
