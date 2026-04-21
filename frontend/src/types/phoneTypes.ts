import { CategoryRatings } from "../components/MultiRatingInput";
import { ReviewData } from "./reviewTypes";
import { SentimentSummary } from "./sentimentTypes";

// ------------------------------------------------------------
// | PHONE DATA OBJECT
// ------------------------------------------------------------
// --- Building Blocks ---
export interface QuickSpec {
  icon: any;
  label: string;
  value: string;
}

export interface CarrierCompatibility {
  name: string;
  compatible: boolean;
  notes?: string;
}

// --- Phone Data Object ---
/**
 * Contains only base data on a phone.
 */
export interface PhoneSummary {
  id: string;
  name: string;
  manufacturer: string;
  price: string;
  images: {
    main: string;
  };
}

/**
 * Contains only necessary data and and the most
 * important specs that users might want to see. This class
 * is used for the catalog page card objects.
 */
export interface PhoneCard extends PhoneSummary {
  releaseDate: string;
  quickSpecs: QuickSpec[];
}

/**
 * Contains full phone specification on a specific phone. This class is used
 * for the phone spec sheet on the phone spec and phone comparison page.
 */
export interface PhoneSpecification extends PhoneCard {
  categories: Record<string, Record<string, string | number>>;
  carrierCompatibility: CarrierCompatibility[];
}

/**
 * Contains metadata as a result of social features, on RTC, of the phone.
 */
export interface PhoneCommunity {
  totalReviews: number;
  aggregateRating: number;
  categoryAverages: CategoryRatings;
}

/**
 * The complete phone data object. Contains full phone specification and
 * all social data on the phone.
 */
export interface PhoneData extends PhoneSpecification, PhoneCommunity {}

// ------------------------------------------------------------
// | PAGINATION
// ------------------------------------------------------------
/**
 * Pagination class to contain pagination metadata from backend on
 * all metadata involving phones including total number of pages,
 * what the current page is, how many items per page is being sent,
 * is there a next page, and is there a previous page.
 */
export interface PaginationMetaData {
  totalItems: number;
  totalPages: number;
  currentPage: number;
  itemsPerPage: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

/**
 * Interface to handle response from backend with phone card data
 * and pagination metadata
 */
export interface PaginatedPhoneResponse {
  phones: PhoneCard[];
  pagination: PaginationMetaData;
}
