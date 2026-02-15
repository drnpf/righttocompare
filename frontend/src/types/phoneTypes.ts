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

export interface PhoneData {
  id: string;
  name: string;
  manufacturer: string;
  releaseDate: string;
  price: string;
  images: {
    main: string;
  };
  quickSpecs: QuickSpec[];
  categories: Record<string, Record<string, string>>;
  carrierCompatibility: CarrierCompatibility[];
  reviews: ReviewData[];
}
