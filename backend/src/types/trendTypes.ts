import { ISentimentSummary } from "../models/Sentiment";

/**
 * Represents the global market analysis of trends among
 * all phones.
 */
export interface GlobalTrendsResponse {
  // Historical performance of platform-wide average ratings
  momentum: {
    month: string;
    avgRating: number;
    count: number;
  }[];

  // Competitive analysis of manufacturers based on community feedback
  brandRadar: {
    brand: string;
    avgRating: number;
    reviewCount: number;
  }[];
}

/**
 * Individual data points for trending tickers. Used for
 * tracking real-sentiment velocity for some specific device topics.
 */
export interface TickerData {
  tag: string;
  velocity: number;
}

/**
 * Detailed sentiment and rating analysis for a specific device. Used for
 * visualizing how opinion on a phone has evolved over its lifecycle.
 */
export interface VibeShiftResponse {
  timeline: {
    date: string;
    avgRating: number;
  }[];
  currentVibe: ISentimentSummary; // Snapshot of device's current vibe among users
}
