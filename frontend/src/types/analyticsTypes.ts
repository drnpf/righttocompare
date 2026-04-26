import { PhoneSummary } from "./phoneTypes";

// ------------------------------------------------------------
// | POPULAR COMPARISONS
// ------------------------------------------------------------
/**
 * An interface to store the phone data in the comparison to use for the popular
 * comparison cards on the popular comparison page.
 */
export interface PopularComparison {
  phones: PhoneSummary[];
}
