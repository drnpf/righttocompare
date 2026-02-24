import { Smartphone, Camera, Cpu, Battery, Ruler, Weight } from "lucide-react";
import { PhoneData } from "../types/phoneTypes";

export const mapBackendToFrontend = (dbPhone: any): PhoneData => {
  const { specs } = dbPhone;

  return {
    id: dbPhone.id,
    name: dbPhone.name,
    manufacturer: dbPhone.manufacturer, // Mapping backend 'manufacturer' to frontend 'brand'
    releaseDate: new Date(dbPhone.releaseDate).toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    }),
    price: `$${dbPhone.price.toLocaleString()}`,
    images: dbPhone.images,

    // Quick specs for the spec summary on top of spec page
    quickSpecs: [
      { icon: Smartphone, label: "Display", value: `${specs.display.screenSizeInches}" ${specs.display.technology}` },
      { icon: Camera, label: "Main Cam", value: `${specs.camera.mainMegapixels}MP` },
      { icon: Cpu, label: "Processor", value: specs.performance.processor },
      { icon: Battery, label: "Battery", value: `${specs.battery.capacitymAh} mAh` },
      { icon: Ruler, label: "Dimensions", value: specs.design.dimensionsMm },
      { icon: Weight, label: "Weight", value: `${specs.design.weightGrams}g` },
    ],

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
        // Add others as needed for the comparison table
      },
    },
    carrierCompatibility: dbPhone.carrierCompatibility || [],
    reviews: dbPhone.reviews || [],
  };
};
