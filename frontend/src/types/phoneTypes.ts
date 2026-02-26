export interface PhoneImageSet {
  main: string;
}

export interface Phone {
  _id?: string; // MongoDB id
  id: string; // slug / URL id
  name: string;
  brand: string;
  releaseDate?: string;
  price: number;
  images: PhoneImageSet;
  specs: {
    display: {
      screenSizeInches: number;
      resolution: string;
      technology?: string;
      refreshRateHz?: number;
      peakBrightnessNits?: number;
      protection?: string;
      pixelDensityPpi?: number;
      screenToBodyRatioPercent?: number;
    };
    performance: {
      processor: string;
      cpu?: string;
      gpu?: string;
      ram: {
        options: number[];
        technology?: string;
      };
      storageOptions: number[];
      expandableStorage?: boolean;
      operatingSystem?: string;
      upgradability?: string;
    };
    benchmarks?: {
      geekbenchSingleCore?: number;
      geekbenchMultiCore?: number;
      antutuScore?: number;
    };
    camera: {
      mainMegapixels: number;
      ultrawideMegapixels?: number;
      telephotoMegapixels?: number;
      frontMegapixels?: number;
      features: string[];
    };
    design?: {
      dimensionsMm?: string;
      weightGrams?: number;
      buildMaterials?: string;
      colorsAvailable?: string[];
    };
    battery: {
      capacitymAh: number;
      chargingSpeedW?: number;
      batteryType?: string;
      wirelessCharging?: boolean;
      chargingTimeHours?: number;
    };
    connectivity: {
      has5G?: boolean;
      has4GLte?: boolean;
      bluetoothVersion?: string;
      hasNfc?: boolean;
      headphoneJack?: boolean;
    };
    audio?: {
      speakers?: string;
      hasHeadphoneJack?: boolean;
      audioFeatures?: string[];
    };
    sensors?: {
      fingerprint?: string;
      faceRecognition?: boolean;
      accelerometer?: boolean;
      gyroscope?: boolean;
      proximity?: boolean;
      compass?: boolean;
      barometer?: boolean;
    };
  };
}
