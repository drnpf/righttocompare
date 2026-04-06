import { TouchEventHandler } from "react";
import { ReviewData } from "../components/ReviewCard";

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

/**
 * Contains only necessary data on a phone and the most
 * important specs that users might want to see. This class
 * is used for the catalog page since it is lightweight.
 */
export interface PhoneCard {
  id: string;
  name: string;
  manufacturer: string;
  releaseDate: string;
  price: string;
  images: {
    main: string;
  };
  quickSpecs: QuickSpec[];
}

/**
 * The complete phone data class that contains all information
 * about a phone. This class is used for the phone spec sheet
 * and phone comparison page.
 */
export interface PhoneData extends PhoneCard {
  categories: Record<string, Record<string, string | number>>;
  carrierCompatibility: CarrierCompatibility[];
  reviews: ReviewData[];
}

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
