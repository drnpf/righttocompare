import mongoose, { Schema, Document } from "mongoose";

// Interfaces (for Review and Phone)
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
  date: string;
  title: string;
  review: string;
  helpful: number;
  notHelpful: number;
  helpfulVoters: string[]; // User IDs who voted helpful
  notHelpfulVoters: string[]; // User IDs who voted not helpful
}

export interface IPhone extends Document {
  id: string; // The ID like galaxy-s24-ultra -- we're going to use this for url
  name: string;
  brand: string;
  releaseDate: string;
  price: number;
  images: {
    main: string;
    // Add 'front', 'back', or 'side' here later if we got those pics
  };
  specs: {
    display: {
      sizeInches: number;
      resolution: string;
      refreshRateHz: number;
      peakBrightnessNits: number;
      technology: string;
    };
    performance: {
      processor: string;
      ram: {
        options: number[];
        technology: string;
      };
      storageOptions: number[]; // [256GB, 512GB, 1TB = 1024GB] -- let's use numbers probably easier to sort/compare
      cpu: string;
      gpu: string;
    };
    camera: {
      mainMegapixels: number;
      ultrawideMegapixels?: number;
      telephotoMegapixels?: number;
      frontMegapixels: number;
      features: string[]; // ["Night Mode", "8K Video"]
    };
    battery: {
      capacitymAh: number;
      chargingSpeedW: number;
      wirelessCharging: boolean;
    };
    connectivity: {
      has5G: boolean;
      hasNfc: boolean;
      headphoneJack: boolean;
    };
  };
  reviews: IReview[];
}

// Phone Schema
const PhoneSchema: Schema = new Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    brand: { type: String, required: true },
    releaseDate: { type: String },
    price: { type: Number, required: true },
    images: {
      main: { type: String, required: true },
      // If we have 'front', 'back', 'side' images we can add those fields here with the image/path
    },
    specs: {
      display: {
        sizeInches: { type: Number, required: true },
        resolution: { type: String, required: true },
        refreshRateHz: { type: Number, default: 60 },
        peakBrightnessNits: { type: Number },
        technology: { type: String },
      },
      performance: {
        processor: { type: String, required: true },
        ram: {
          options: [{ type: Number }],
          technology: { type: String },
        },
        storageOptions: [{ type: Number }],
        cpu: { type: String },
        gpu: { type: String },
      },
      camera: {
        mainMegapixels: { type: Number, required: true },
        ultrawideMegapixels: { type: Number },
        telephotoMegapixels: { type: Number },
        frontMegapixels: { type: Number },
        features: [{ type: String }],
      },
      battery: {
        capacitymAh: { type: Number, required: true },
        chargingSpeedW: { type: Number },
        wirelessCharging: { type: Boolean, default: false },
      },
      connectivity: {
        has5G: { type: Boolean, default: true },
        hasNfc: { type: Boolean, default: true },
        headphoneJack: { type: Boolean, default: false },
      },
    },
    reviews: [
      {
        id: { type: Number, required: true },
        userId: { type: String, required: true },
        userName: { type: String, required: true },
        rating: { type: Number, required: true, min: 1, max: 5 },
        categoryRatings: {
          camera: { type: Number, required: true, min: 1, max: 5 },
          battery: { type: Number, required: true, min: 1, max: 5 },
          design: { type: Number, required: true, min: 1, max: 5 },
          performance: { type: Number, required: true, min: 1, max: 5 },
          value: { type: Number, required: true, min: 1, max: 5 },
        },
        date: { type: String, required: true },
        title: { type: String, required: true },
        review: { type: String, required: true },
        helpful: { type: Number, default: 0 },
        notHelpful: { type: Number, default: 0 },
        helpfulVoters: { type: [String], default: [] },
        notHelpfulVoters: { type: [String], default: [] },
      },
    ],
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IPhone>("Phone", PhoneSchema);
