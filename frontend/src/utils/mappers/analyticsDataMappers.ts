import { PopularComparison } from "../../types/analyticsTypes";
import { mapJsonToPhoneSummary } from "./phoneDataMappers";

/**
 * Maps a popular comparison raw JSON to contain phone summaries of phones
 * in the comparisons.
 * @param dbComparison The raw comparison JSON object from the analytics API
 * @returns A PopularComparison object containing an array of phone summaries.
 */
export const mapJsonToPopularComparison = (dbComparison: any): PopularComparison => {
  return {
    phones: (dbComparison.phones || []).map((phone: any) => mapJsonToPhoneSummary(phone)),
  };
};
