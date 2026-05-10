import mongoose, { Schema, Document } from "mongoose";
import { ICategoryRatings } from "./Review";
import { ISentimentSummary } from "./Sentiment";

export interface IPhoneReference {
  id: string;
  name: string;
  manufacturer: string;
}

export interface IPhoneSummary extends IPhoneReference {
  price: number;
  images: {
    main: string;
  };
}

export interface IPhoneCard extends IPhoneSummary {
  releaseDate: Date;
  specs: {
    display: {
      screenSizeInches: number;
      technology: string;
    };
    camera: {
      mainMegapixels: number;
    };
    performance: {
      processor: string;
      ram: { options: number[] };
      storageOptions: number[]; // i.e. [256GB, 512GB, 1TB = 1024GB]
    };
    battery: {
      capacitymAh: number;
    };
  };
}

export interface IPhone extends IPhoneCard, Document {
  specs: IPhoneCard["specs"] & {
    display: IPhoneCard["specs"]["display"] & {
      resolution: string;
      refreshRateHz: number;
      peakBrightnessNits: number;
      protection?: string;
      pixelDensityPpi?: number;
      screenToBodyRatioPercent?: number;
    };
    performance: IPhoneCard["specs"]["performance"] & {
      cpu: string;
      gpu: string;
      ram: { technology: string };
      expandableStorage?: boolean;
      operatingSystem: string;
      upgradability?: string;
    };
    benchmarks: {
      geekbenchSingleCore: number;
      geekbenchMultiCore: number;
      antutuScore: number;
    };
    camera: IPhoneCard["specs"]["camera"] & {
      ultrawideMegapixels?: number;
      telephotoMegapixels?: number;
      frontMegapixels: number;
      features?: string[]; // i.e. ["Night Mode", "8K Video"]
    };
    design: {
      dimensionsMm: string;
      weightGrams: number;
      buildMaterials?: string; // i.e. "Aluminum frame, Gorilla Glass Victus+ front and back"
      colorsAvailable: string[]; // i.e. ["Phantom Black", "Green", "Lavender", "Cream"]
    };
    battery: IPhoneCard["specs"]["battery"] & {
      chargingSpeedW: number;
      batteryType: string;
      wirelessCharging: boolean;
      chargingTimeHours?: number;
    };
    connectivity: {
      has5G: boolean;
      has4GLte?: boolean;
      bluetoothVersion: string;
      hasNfc: boolean;
      headphoneJack: boolean;
    };
    networkBands?: {
        bands2G?: string[];
        bands3G?: string[];
        bands4G?: string[];
        bands5G?: string[];
    };
    audio: {
      speakers: string; // i.e.e "Stereo speakers tuned by AKG"
      hasHeadphoneJack: boolean;
      audioFeatures?: string[]; // i.e. ["Dolby Atmos", "32-bit/384kHz audio"]
    };
    sensors: {
      fingerprint: string; // i.e. "Ultrasonic under-display"
      faceRecognition: boolean;
      accelerometer: boolean;
      gyroscope: boolean;
      proximity: boolean;
      compass: boolean;
      barometer: boolean;
    };
  };
  carrierCompatibility: {
    name: string;
    compatible: boolean;
    notes?: string;
  }[];

  // Review metadata
  totalReviews: number;
  aggregateRating: number;
  categoryAverages: ICategoryRatings;

  // Review sentiment metadata
  sentimentSummary: ISentimentSummary;
}

// Phone Schema
const PhoneSchema: Schema = new Schema<IPhone>(
  {
    id: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    manufacturer: { type: String, required: true },
    releaseDate: { type: Date, required: true },
    price: { type: Number, required: true },
    images: {
      main: { type: String, required: true },
      // If we have front, back, side images we can add those fields here with the image/path
    },
    sentimentSummary: {
      pros: [
        {
          topic: { type: String, required: true },
          count: { type: Number, required: true },
        },
      ],
      cons: [
        {
          topic: { type: String, required: true },
          count: { type: Number, required: true },
        },
      ],
      totalAnalyzed: { type: Number, default: 0 },
    },
    totalReviews: { type: Number, default: 0 },
    aggregateRating: { type: Number, default: 0 },
    categoryAverages: {
      camera: { type: Number, default: 0 },
      battery: { type: Number, default: 0 },
      design: { type: Number, default: 0 },
      performance: { type: Number, default: 0 },
      value: { type: Number, default: 0 },
    },
    specs: {
      display: {
        screenSizeInches: { type: Number, required: true },
        resolution: { type: String, required: true },
        technology: { type: String },
        refreshRateHz: { type: Number, default: 60 },
        peakBrightnessNits: { type: Number },
        protection: { type: String },
        pixelDensityPpi: { type: Number },
        screenToBodyRatioPercent: { type: Number },
      },
      performance: {
        processor: { type: String, required: true },
        cpu: { type: String },
        gpu: { type: String },
        ram: {
          options: [{ type: Number }],
          technology: { type: String },
        },
        storageOptions: [{ type: Number }],
        expandableStorage: { type: Boolean },
        operatingSystem: { type: String },
        upgradability: { type: String },
      },
      benchmarks: {
        geekbenchSingleCore: { type: Number },
        geekbenchMultiCore: { type: Number },
        antutuScore: { type: Number },
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
        batteryType: { type: String },
        wirelessCharging: { type: Boolean, default: false },
        chargingTimeHours: { type: Number },
      },
      design: {
        dimensionsMm: { type: String }, // "i.e. 123.4 x 75.6 x 8.9 mm"
        weightGrams: { type: Number },
        buildMaterials: { type: String }, // "i.e Aluminum frame, Gorilla Glass Victus+ front and back"
        colorsAvailable: [{ type: String }], // i.e. ["Phantom Black", "Green", "Lavender", "Cream"]
      },
      connectivity: {
        has5G: { type: Boolean, required: true },
        has4GLte: { type: Boolean },
        bluetoothVersion: { type: String, required: true },
        hasNfc: { type: Boolean, required: true },
        headphoneJack: { type: Boolean, required: true },
      },
      networkBands: {
        bands2G: [{ type: String }],
        bands3G: [{ type: String }],
        bands4G: [{ type: String }],
        bands5G: [{ type: String }],
      },
      audio: {
        speakers: { type: String },
        hasHeadphoneJack: { type: Boolean },
        audioFeatures: [{ type: String }],
      },
      sensors: {
        fingerprint: { type: String }, // "i.e. Ultrasonic under-display"
        faceRecognition: { type: Boolean },
        accelerometer: { type: Boolean },
        gyroscope: { type: Boolean },
        proximity: { type: Boolean },
        compass: { type: Boolean },
        barometer: { type: Boolean },
      },
    },
    carrierCompatibility: [
      {
        name: { type: String, required: true },
        compatible: { type: Boolean, required: true },
        notes: { type: String },
      },
    ],
  },
  {
    timestamps: true,
    collection: "phones",
  },
);

export default mongoose.model<IPhone>("Phone", PhoneSchema);
