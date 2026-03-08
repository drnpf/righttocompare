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
  releaseDate: Date;
  price: number;
  images: {
    main: string;
    // Add 'front', 'back', or 'side' here later if we got those pics
  };
  specs: {
    display: {
      screenSizeInches: number;
      resolution: string;
      technology: string; // OLED, AMOLED, etc.
      refreshRateHz: number;
      peakBrightnessNits: number;
      protection?: string;
      pixelDensityPpi?: number;
      screenToBodyRatioPercent?: number;
    };
    performance: {
      processor: string;
      cpu: string;
      gpu: string;
      ram: {
        options: number[];
        technology: string;
      };
      storageOptions: number[]; // [256GB, 512GB, 1TB = 1024GB] -- let's use numbers probably easier to sort/compare
      expandableStorage?: boolean;
      operatingSystem: string;
      upgradability?: string;
    };
    benchmarks: {
      geekbenchSingleCore: number;
      geekbenchMultiCore: number;
      antutuScore: number;
    };
    camera: {
      mainMegapixels: number;
      ultrawideMegapixels?: number;
      telephotoMegapixels?: number;
      frontMegapixels: number;
      features?: string[]; // ["Night Mode", "8K Video"]
    };
    design: {
      dimensionsMm: string; // "165.1 x 75.6 x 8.9 mm"
      weightGrams: number;
      buildMaterials?: string; // "Aluminum frame, Gorilla Glass Victus+ front and back"
      colorsAvailable: string[]; // ["Phantom Black", "Green", "Lavender", "Cream"]
    };
    battery: {
      capacitymAh: number;
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
    audio: {
      speakers: string; // "Stereo speakers tuned by AKG"
      hasHeadphoneJack: boolean;
      audioFeatures?: string[]; // ["Dolby Atmos", "32-bit/384kHz audio"]
    };
    sensors: {
      fingerprint: string; // "Ultrasonic under-display"
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
  reviews: IReview[];
}

// Phone Schema
const PhoneSchema: Schema = new Schema<IPhone>(
  {
    id: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    brand: { type: String, required: true },
    releaseDate: { type: Date, required: true },
    price: { type: Number, required: true },
    images: {
      main: { type: String, required: true },
      // If we have 'front', 'back', 'side' images we can add those fields here with the image/path
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
        dimensionsMm: { type: String }, // "165.1 x 75.6 x 8.9 mm"
        weightGrams: { type: Number },
        buildMaterials: { type: String }, // "Aluminum frame, Gorilla Glass Victus+ front and back"
        colorsAvailable: [{ type: String }], // ["Phantom Black", "Green", "Lavender", "Cream"]
      },
      connectivity: {
        has5G: { type: Boolean, required: true },
        has4GLte: { type: Boolean },
        bluetoothVersion: { type: String, required: true },
        hasNfc: { type: Boolean, required: true },
        headphoneJack: { type: Boolean, required: true },
      },
      audio: {
        speakers: { type: String },
        hasHeadphoneJack: { type: Boolean },
        audioFeatures: [{ type: String }],
      },
      sensors: {
        fingerprint: { type: String }, // "Ultrasonic under-display"
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
  },
);

export default mongoose.model<IPhone>("Phone", PhoneSchema);
