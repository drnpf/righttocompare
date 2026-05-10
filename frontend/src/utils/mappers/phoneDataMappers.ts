import { Smartphone, Camera, Cpu, Battery, HardDrive, Layers } from "lucide-react";
import { PhoneData, PhoneCard, PhoneSummary, PhoneSpecification } from "../../types/phoneTypes";
import { ReviewMetaData } from "../../types/reviewTypes";

/**
 * Maps raw phone data JSON to lightweight PhoneSummary object.
 * @param dbPhone The raw phone object from the database
 * @returns The formatted phone summary data
 */
export const mapJsonToPhoneSummary = (dbPhone: any): PhoneSummary => {
  return {
    id: dbPhone.id,
    name: dbPhone.name,
    manufacturer: dbPhone.manufacturer,
    price: typeof dbPhone.price === "number" ? `$${dbPhone.price.toLocaleString()}` : dbPhone.price || "N/A",
    images: dbPhone.images || { main: "" },
  };
};

/**
 * Maps raw phone data JSON to PhoneCard object used for the catalog
 * page cards.
 * @param dbPhone The raw phone object from the database
 * @returns The formatted phone card data with icons mapped with the quick specs
 */
export const mapJsonToPhoneCard = (dbPhone: any): PhoneCard => {
  const { specs } = dbPhone;

  return {
    ...mapJsonToPhoneSummary(dbPhone),
    releaseDate: dbPhone.releaseDate
      ? new Date(dbPhone.releaseDate).toLocaleDateString("en-US", {
          month: "long",
          year: "numeric",
        })
      : "Unknown Release",

    // Quick specs for the spec summary on top of spec page
    quickSpecs: [
      { icon: Cpu, label: "Processor", value: specs.performance.processor },
      { icon: Layers, label: "Memory", value: `${specs.performance.ram.options.join("/")}GB RAM` },
      {
        icon: HardDrive,
        label: "Storage",
        value: specs.performance.storageOptions.map((s: number) => (s >= 1024 ? "1TB" : `${s}GB`)).join(" / "),
      },
      { icon: Smartphone, label: "Display", value: `${specs.display.screenSizeInches}" ${specs.display.technology}` },
      { icon: Camera, label: "Main Cam", value: `${specs.camera.mainMegapixels}MP` },
      { icon: Battery, label: "Battery", value: `${specs.battery.capacitymAh} mAh` },
    ],
    hotSignals: dbPhone.hotSignals,
  };
};

/**
 * Maps raw phone data JSON to PhoneSpecification object used for the specification page
 * and comparison page. Contains full specifications of the phone.
 * @param dbPhone The raw phone object from the database
 * @returns The formatted phone data object containing full phone specifications
 */
export const mapJsonToPhoneSpecification = (dbPhone: any): PhoneSpecification => {
  const { specs } = dbPhone;

  return {
    ...mapJsonToPhoneCard(dbPhone), // Mapping the base line specs of phone to phone data
    // Section for the detailed specs table. ADD MORE SPECS AS NEEDED
    categories: {
      display: {
        "Screen Size": `${specs.display.screenSizeInches} inches`,
        Resolution: specs.display.resolution,
        Technology: specs.display.technology,
        "Refresh Rate": `${specs.display.refreshRateHz}Hz`,
        "Peak Brightness": `${specs.display.peakBrightnessNits} nits`,
        Protection: specs.display.protection || "N/A",
        "Pixel Density": `${specs.display.pixelDensityPpi} ppi`,
      },
      performance: {
        Processor: specs.performance.processor,
        RAM: `${specs.performance.ram.options.join(" / ")}GB ${specs.performance.ram.technology}`,
        Storage: `${specs.performance.storageOptions.join(" / ")}GB`,
        "Operating System": specs.performance.operatingSystem,
        "Expandable Storage": specs.performance.expandableStorage ? "Yes" : "No",
      },
      benchmarks: {
        "GeekBench Single-Core": specs.benchmarks.geekbenchSingleCore.toLocaleString(),
        "GeekBench Multi-Core": specs.benchmarks.geekbenchMultiCore.toLocaleString(),
        "AnTuTu Score": specs.benchmarks.antutuScore.toLocaleString(),
      },
      camera: {
        "Main Camera": `${specs.camera.mainMegapixels} MP`,
        "Ultra Wide": specs.camera.ultrawideMegapixels ? `${specs.camera.ultrawideMegapixels} MP` : "N/A",
        Telephoto: specs.camera.telephotoMegapixels ? `${specs.camera.telephotoMegapixels} MP` : "N/A",
        "Front Camera": `${specs.camera.frontMegapixels} MP`,
        Features: specs.camera.features?.join(", ") || "Standard",
      },
      battery: {
        Capacity: `${specs.battery.capacitymAh} mAh`,
        "Charging Speed": `${specs.battery.chargingSpeedW}W`,
        "Wireless Charging": specs.battery.wirelessCharging ? "Yes" : "No",
        "Battery Type": specs.battery.batteryType,
      },
      design: {
        Dimensions: specs.design.dimensionsMm,
        Weight: `${specs.design.weightGrams} grams`,
        Build: specs.design.buildMaterials || "N/A",
        Colors: specs.design.colorsAvailable.join(", "),
      },
      connectivity: {
        "5G": specs.connectivity.has5G ? "Yes" : "No",
        Bluetooth: specs.connectivity.bluetoothVersion,
        NFC: specs.connectivity.hasNfc ? "Yes" : "No",
        "Headphone Jack": specs.connectivity.headphoneJack ? "Yes" : "No",
      },
      sensors: {
        Biometrics: specs.sensors.fingerprint,
        "Face Recognition": specs.sensors.faceRecognition ? "Yes" : "No",
        Barometer: specs.sensors.barometer ? "Yes" : "No",
      },
    },
    carrierCompatibility: dbPhone.carrierCompatibility || [],
  };
};

/** Maps raw phone data JSON to ReviewMetaData object. Handles user reviews
 * and aggregated of sentiment summary.
 * @param dbPhone The raw phone JSON object from the database
 * @returns The community and sentiment data
 */
export const mapJsonToReviewMetadata = (dbPhone: any): ReviewMetaData => {
  return {
    totalReviews: dbPhone.totalReviews ?? 0,
    aggregateRating: dbPhone.aggregateRating ?? 0,
    categoryAverages: dbPhone.categoryAverages || {
      camera: 0,
      battery: 0,
      design: 0,
      performance: 0,
      value: 0,
    },
    sentimentSummary: dbPhone.sentimentSummary || { pros: [], cons: [], totalAnalyzed: 0 },
  };
};

/**
 * The primary mapper for the full phone data. Contains full specifications and social data
 * on the phone.
 * @param dbPhone The raw phone JSON object from the database
 * @returns The full phone data containing specification and social data (i.e reviews)
 */
export const mapJsonToPhoneData = (dbPhone: any): PhoneData => {
  return {
    ...mapJsonToPhoneSpecification(dbPhone),
    ...mapJsonToReviewMetadata(dbPhone),
  };
};
