export interface Review {
  id: number;
  userName: string;
  rating: number;
  categoryRatings: {
    camera: number;
    battery: number;
    design: number;
    performance: number;
    value: number;
  };
  date: string;
  title: string;
  review: string;
  helpful: number;
  notHelpful: number;
}

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
  reviews: Review[];
}
