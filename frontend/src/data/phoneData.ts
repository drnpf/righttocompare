import { Smartphone, Camera, Cpu, Battery, Ruler, Weight } from "lucide-react";
import galaxyS24Image from "figma:asset/4561f1a435dc79c2ca0bd4aa332a210a40948a78.png";
import galaxyS25Image from "figma:asset/c677ba4036733b50cf4df2b9c6932db195bf7661.png";
import iphone16Image from "figma:asset/7243092b9d248569f9ed82517f0a760b59ebcb8a.png";
import pixel10Image from "figma:asset/97e15958dda8a68c72375b01cfb9d69534512ed8.png";

export interface Review {
  id: number;
  userId?: string; // Optional for mock data, required when fetched from API
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
  helpfulVoters?: string[];
  notHelpfulVoters?: string[];
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

export const phonesData: Record<string, PhoneData> = {
  "galaxy-s24-ultra": {
    id: "galaxy-s24-ultra",
    name: "Galaxy S24 Ultra",
    manufacturer: "Samsung",
    releaseDate: "January 2024",
    price: "$1,199",
    images: {
      main: galaxyS24Image
    },
    quickSpecs: [
      { icon: Smartphone, label: "Display", value: "6.8\" AMOLED, 120Hz" },
      { icon: Camera, label: "Camera", value: "200MP Main" },
      { icon: Cpu, label: "Processor", value: "Snapdragon 8 Gen 3" },
      { icon: Battery, label: "Battery", value: "5,000 mAh" },
      { icon: Ruler, label: "Dimensions", value: "162.3 x 79 x 8.6 mm" },
      { icon: Weight, label: "Weight", value: "232 grams" },
    ],
    categories: {
      display: {
        "Screen Size": "6.8 inches",
        "Resolution": "3120 x 1440 pixels (QHD+)",
        "Technology": "Dynamic AMOLED 2X",
        "Refresh Rate": "1-120Hz (adaptive)",
        "Peak Brightness": "2,600 nits",
        "Protection": "Corning Gorilla Armor",
        "Pixel Density": "505 ppi",
        "Screen-to-Body Ratio": "89.9%",
      },
      performance: {
        "Processor": "Qualcomm Snapdragon 8 Gen 3",
        "CPU": "Octa-core (1x3.39 GHz + 3x3.1 GHz + 2x2.9 GHz + 2x2.2 GHz)",
        "GPU": "Adreno 750",
        "RAM": "12GB LPDDR5X",
        "Storage": "256GB / 512GB / 1TB UFS 4.0",
        "Expandable Storage": "No",
        "Operating System": "Android 14, One UI 6.1",
        "Upgradability": "4 years OS updates, 7 years security",
      },
      benchmarks: {
        "GeekBench 6 Single-Core": "2,298",
        "GeekBench 6 Multi-Core": "7,157",
        "AnTuTu v10": "1,520,000",
        "3DMark Wild Life Extreme": "4,850",
        "3DMark Solar Bay": "8,200",
        "GFXBench Manhattan 3.1": "120 fps",
        "GFXBench Car Chase": "86 fps",
        "PCMark Work 3.0": "18,500",
      },
      camera: {
        "Main Camera": "200 MP, f/1.7, 24mm, PDAF, OIS",
        "Periscope Telephoto": "50 MP, f/3.4, 111mm, 5x optical zoom",
        "Telephoto": "10 MP, f/2.4, 67mm, 3x optical zoom",
        "Ultra Wide": "12 MP, f/2.2, 13mm, 120° FOV",
        "Front Camera": "12 MP, f/2.2, 26mm",
        "Video Recording": "8K@30fps, 4K@60fps, 1080p@240fps",
        "Camera Features": "LED flash, auto-HDR, panorama, Super Steady Video",
      },
      battery: {
        "Capacity": "5,000 mAh",
        "Charging": "45W wired fast charging",
        "Wireless Charging": "15W wireless charging",
        "Reverse Wireless": "4.5W reverse wireless charging",
        "Charging Time": "0-65% in 30 minutes (advertised)",
        "Battery Type": "Li-Ion, non-removable",
      },
      design: {
        "Dimensions": "162.3 x 79 x 8.6 mm",
        "Weight": "232 grams",
        "Materials": "Titanium frame, Gorilla Armor glass front, glass back",
        "Colors": "Titanium Gray, Titanium Black, Titanium Violet, Titanium Yellow",
        "Water Resistance": "IP68 (up to 1.5m for 30 min)",
        "Dust Resistance": "IP68 certified",
        "S Pen": "Yes, integrated",
      },
      connectivity: {
        "5G": "Yes, SA/NSA/Sub6/mmWave",
        "4G LTE": "Yes",
        "Wi-Fi": "Wi-Fi 7 (802.11be)",
        "Bluetooth": "5.3, A2DP, LE",
        "NFC": "Yes",
        "USB": "USB Type-C 3.2, DisplayPort support",
        "GPS": "Yes, with A-GPS, GLONASS, BDS, GALILEO",
        "UWB": "Ultra Wideband support",
      },
      audio: {
        "Speakers": "Stereo speakers (AKG tuned)",
        "3.5mm Jack": "No",
        "Audio Features": "32-bit/384kHz audio, Dolby Atmos",
        "Hi-Res Audio": "Yes",
      },
      sensors: {
        "Fingerprint": "Ultrasonic under-display",
        "Face Unlock": "Yes",
        "Accelerometer": "Yes",
        "Gyroscope": "Yes",
        "Proximity": "Yes",
        "Compass": "Yes",
        "Barometer": "Yes",
      },
    },
    carrierCompatibility: [
      {
        name: "Verizon",
        compatible: true,
        notes: "Full 5G support including mmWave and C-Band",
      },
      {
        name: "AT&T",
        compatible: true,
        notes: "Full 5G support with all bands",
      },
      {
        name: "T-Mobile",
        compatible: true,
        notes: "Full 5G support including Ultra Capacity",
      },
      {
        name: "US Cellular",
        compatible: true,
        notes: "Compatible with 5G and LTE networks",
      },
      {
        name: "Mint Mobile",
        compatible: true,
        notes: "Runs on T-Mobile network",
      },
      {
        name: "Cricket Wireless",
        compatible: true,
        notes: "Runs on AT&T network",
      },
      {
        name: "Metro by T-Mobile",
        compatible: true,
        notes: "Full network compatibility",
      },
      {
        name: "Visible",
        compatible: true,
        notes: "Runs on Verizon network",
      },
      {
        name: "Google Fi",
        compatible: true,
        notes: "Compatible with all network switching",
      },
      {
        name: "Xfinity Mobile",
        compatible: true,
        notes: "Uses Verizon network",
      },
    ],
    reviews: [
      {
        id: 1,
        userName: "John Smith",
        rating: 5,
        categoryRatings: {
          camera: 5,
          battery: 5,
          design: 5,
          performance: 5,
          value: 5,
        },
        date: "October 15, 2024",
        title: "Best flagship phone I've ever owned",
        review: "The Galaxy S24 Ultra is absolutely amazing. The camera quality is outstanding, especially in low light. The S Pen integration is seamless and the battery easily lasts me a full day of heavy use. The titanium build feels premium and the display is gorgeous.",
        helpful: 45,
        notHelpful: 3,
      },
      {
        id: 2,
        userName: "Sarah Johnson",
        rating: 4.5,
        categoryRatings: {
          camera: 5,
          battery: 4,
          design: 5,
          performance: 5,
          value: 3.5,
        },
        date: "October 10, 2024",
        title: "Excellent phone with minor drawbacks",
        review: "Love the performance and camera system. The snapdragon 8 gen 3 handles everything I throw at it. Only complaint is the price and lack of expandable storage. Otherwise, it's a fantastic device that I'd recommend to anyone looking for a premium flagship.",
        helpful: 32,
        notHelpful: 5,
      },
      {
        id: 3,
        userName: "Michael Chen",
        rating: 5,
        categoryRatings: {
          camera: 5,
          battery: 5,
          design: 5,
          performance: 5,
          value: 5,
        },
        date: "October 5, 2024",
        title: "Camera is a game changer",
        review: "As a photography enthusiast, this phone has exceeded my expectations. The 200MP main sensor captures incredible detail, and the zoom capabilities are mind-blowing. The AI processing makes every shot look professional. Worth every penny!",
        helpful: 28,
        notHelpful: 1,
      },
      {
        id: 4,
        userName: "Emily Rodriguez",
        rating: 4,
        categoryRatings: {
          camera: 4,
          battery: 4.5,
          design: 4,
          performance: 4.5,
          value: 3,
        },
        date: "September 28, 2024",
        title: "Solid upgrade from S22 Ultra",
        review: "Upgraded from the S22 Ultra and the improvements are noticeable. Better battery life, brighter screen, and faster performance. The new anti-reflective coating on the screen is a nice touch. Wish it came with faster charging though.",
        helpful: 19,
        notHelpful: 2,
      },
      {
        id: 5,
        userName: "David Park",
        rating: 5,
        categoryRatings: {
          camera: 5,
          battery: 5,
          design: 5,
          performance: 5,
          value: 5,
        },
        date: "September 20, 2024",
        title: "Perfect for productivity and creativity",
        review: "The S Pen makes this phone stand out from other flagships. I use it daily for note-taking and quick edits. Combined with the large, beautiful display and powerful specs, this is the ultimate productivity device in phone form.",
        helpful: 24,
        notHelpful: 0,
      },
    ],
  },
  "galaxy-s25": {
    id: "galaxy-s25",
    name: "Galaxy S25",
    manufacturer: "Samsung",
    releaseDate: "February 2025",
    price: "$899",
    images: {
      main: galaxyS25Image
    },
    quickSpecs: [
      { icon: Smartphone, label: "Display", value: "6.2\" Dynamic AMOLED" },
      { icon: Camera, label: "Camera", value: "50 MP Triple" },
      { icon: Cpu, label: "Processor", value: "Snapdragon 8 Gen 4" },
      { icon: Battery, label: "Battery", value: "4500 mAh" },
      { icon: Ruler, label: "Dimensions", value: "146.5 x 70.5 x 7.6 mm" },
      { icon: Weight, label: "Weight", value: "168 grams" },
    ],
    categories: {
      display: {
        "Screen Size": "6.2 inches",
        "Resolution": "2340 x 1080 pixels (FHD+)",
        "Technology": "Dynamic AMOLED 2X",
        "Refresh Rate": "1-120Hz (adaptive)",
        "Peak Brightness": "2,500 nits",
        "Protection": "Corning Gorilla Glass Victus 3",
        "Pixel Density": "416 ppi",
        "Screen-to-Body Ratio": "88.2%",
      },
      performance: {
        "Processor": "Qualcomm Snapdragon 8 Gen 4",
        "CPU": "Octa-core (1x3.4 GHz + 3x3.2 GHz + 4x2.3 GHz)",
        "GPU": "Adreno 830",
        "RAM": "8GB / 12GB LPDDR5X",
        "Storage": "128GB / 256GB / 512GB UFS 4.0",
        "Expandable Storage": "No",
        "Operating System": "Android 15, One UI 7",
        "Upgradability": "7 years OS updates, 7 years security",
      },
      benchmarks: {
        "GeekBench 6 Single-Core": "2,450",
        "GeekBench 6 Multi-Core": "7,600",
        "AnTuTu v10": "1,650,000",
        "3DMark Wild Life Extreme": "5,200",
        "3DMark Solar Bay": "9,100",
        "GFXBench Manhattan 3.1": "130 fps",
        "GFXBench Car Chase": "92 fps",
        "PCMark Work 3.0": "19,200",
      },
      camera: {
        "Main Camera": "50 MP, f/1.8, 24mm, Dual Pixel PDAF, OIS",
        "Telephoto": "10 MP, f/2.4, 67mm, 3x optical zoom, OIS",
        "Ultra Wide": "12 MP, f/2.2, 13mm, 120° FOV",
        "Front Camera": "12 MP, f/2.2, 26mm",
        "Video Recording": "8K@30fps, 4K@60fps, 1080p@240fps",
        "Camera Features": "LED flash, auto-HDR, panorama, Super Steady Video",
      },
      battery: {
        "Capacity": "4,500 mAh",
        "Charging": "25W wired fast charging",
        "Wireless Charging": "15W wireless charging",
        "Reverse Wireless": "4.5W reverse wireless charging",
        "Charging Time": "0-50% in 30 minutes (advertised)",
        "Battery Type": "Li-Ion, non-removable",
      },
      design: {
        "Dimensions": "146.5 x 70.5 x 7.6 mm",
        "Weight": "168 grams",
        "Materials": "Aluminum frame, Gorilla Glass Victus 3 front and back",
        "Colors": "Phantom Black, Cream, Violet, Green",
        "Water Resistance": "IP68 (up to 1.5m for 30 min)",
        "Dust Resistance": "IP68 certified",
        "S Pen": "No",
      },
      connectivity: {
        "5G": "Yes, SA/NSA/Sub6/mmWave",
        "4G LTE": "Yes",
        "Wi-Fi": "Wi-Fi 7 (802.11be)",
        "Bluetooth": "5.4, A2DP, LE",
        "NFC": "Yes",
        "USB": "USB Type-C 3.2, DisplayPort support",
        "GPS": "Yes, with A-GPS, GLONASS, BDS, GALILEO",
        "UWB": "Ultra Wideband support",
      },
      audio: {
        "Speakers": "Stereo speakers (AKG tuned)",
        "3.5mm Jack": "No",
        "Audio Features": "32-bit/384kHz audio, Dolby Atmos",
        "Hi-Res Audio": "Yes",
      },
      sensors: {
        "Fingerprint": "Ultrasonic under-display",
        "Face Unlock": "Yes",
        "Accelerometer": "Yes",
        "Gyroscope": "Yes",
        "Proximity": "Yes",
        "Compass": "Yes",
        "Barometer": "Yes",
      },
    },
    carrierCompatibility: [
      {
        name: "Verizon",
        compatible: true,
        notes: "Full 5G support including mmWave and C-Band",
      },
      {
        name: "AT&T",
        compatible: true,
        notes: "Full 5G support with all bands",
      },
      {
        name: "T-Mobile",
        compatible: true,
        notes: "Full 5G support including Ultra Capacity",
      },
      {
        name: "US Cellular",
        compatible: true,
        notes: "Compatible with 5G and LTE networks",
      },
      {
        name: "Mint Mobile",
        compatible: true,
        notes: "Runs on T-Mobile network",
      },
      {
        name: "Cricket Wireless",
        compatible: true,
        notes: "Runs on AT&T network",
      },
      {
        name: "Metro by T-Mobile",
        compatible: true,
        notes: "Full network compatibility",
      },
      {
        name: "Visible",
        compatible: true,
        notes: "Runs on Verizon network",
      },
      {
        name: "Google Fi",
        compatible: true,
        notes: "Compatible with all network switching",
      },
      {
        name: "Xfinity Mobile",
        compatible: true,
        notes: "Uses Verizon network",
      },
    ],
    reviews: [
      {
        id: 1,
        userName: "Alex Martinez",
        rating: 4.8,
        categoryRatings: {
          camera: 5,
          battery: 4.5,
          design: 5,
          performance: 5,
          value: 4.5,
        },
        date: "October 28, 2024",
        title: "Perfect compact flagship",
        review: "Finally, a compact flagship that doesn't compromise on features! The Galaxy S25 fits perfectly in one hand while delivering flagship performance. The camera is excellent, battery lasts all day, and the new chipset is blazingly fast.",
        helpful: 52,
        notHelpful: 2,
      },
      {
        id: 2,
        userName: "Jessica Lee",
        rating: 4.5,
        categoryRatings: {
          camera: 4.5,
          battery: 4,
          design: 5,
          performance: 5,
          value: 4,
        },
        date: "October 22, 2024",
        title: "Great upgrade from S23",
        review: "Upgraded from the S23 and loving the improvements. The screen is brighter, performance is noticeably faster, and battery life is better. The only downside is the price increase, but overall it's a solid upgrade.",
        helpful: 38,
        notHelpful: 4,
      },
    ],
  },
  "iphone-16": {
    id: "iphone-16",
    name: "iPhone 16",
    manufacturer: "Apple",
    releaseDate: "September 2024",
    price: "$799",
    images: {
      main: iphone16Image
    },
    quickSpecs: [
      { icon: Smartphone, label: "Display", value: "6.1\" Super Retina XDR" },
      { icon: Camera, label: "Camera", value: "48MP Dual" },
      { icon: Cpu, label: "Processor", value: "A18 Bionic" },
      { icon: Battery, label: "Battery", value: "3,561 mAh" },
      { icon: Ruler, label: "Dimensions", value: "147.6 x 71.6 x 7.8 mm" },
      { icon: Weight, label: "Weight", value: "170 grams" },
    ],
    categories: {
      display: {
        "Screen Size": "6.1 inches",
        "Resolution": "2556 x 1179 pixels",
        "Technology": "Super Retina XDR OLED",
        "Refresh Rate": "60Hz",
        "Peak Brightness": "2,000 nits (HDR), 1,000 nits (typical)",
        "Protection": "Ceramic Shield",
        "Pixel Density": "460 ppi",
        "Screen-to-Body Ratio": "86.4%",
      },
      performance: {
        "Processor": "Apple A18 Bionic",
        "CPU": "6-core (2 performance + 4 efficiency)",
        "GPU": "5-core Apple GPU",
        "RAM": "8GB",
        "Storage": "128GB / 256GB / 512GB NVMe",
        "Expandable Storage": "No",
        "Operating System": "iOS 18",
        "Upgradability": "5+ years of software updates",
      },
      benchmarks: {
        "GeekBench 6 Single-Core": "2,950",
        "GeekBench 6 Multi-Core": "7,200",
        "AnTuTu v10": "1,580,000",
        "3DMark Wild Life Extreme": "4,200",
        "3DMark Solar Bay": "7,800",
        "GFXBench Manhattan 3.1": "115 fps",
        "GFXBench Car Chase": "78 fps",
        "PCMark Work 3.0": "17,800",
      },
      camera: {
        "Main Camera": "48 MP, f/1.6, 26mm, sensor-shift OIS, PDAF",
        "Ultra Wide": "12 MP, f/2.4, 13mm, 120° FOV",
        "Front Camera": "12 MP, f/1.9, 23mm",
        "Video Recording": "4K@60fps, 1080p@240fps, Dolby Vision HDR",
        "Camera Features": "Photonic Engine, Deep Fusion, Smart HDR 5, Portrait mode",
        "Cinematic Mode": "4K@30fps with focus transitions",
        "Action Mode": "Advanced video stabilization",
      },
      battery: {
        "Capacity": "3,561 mAh",
        "Charging": "20W wired fast charging (USB-C)",
        "Wireless Charging": "15W MagSafe wireless charging",
        "Reverse Wireless": "No",
        "Charging Time": "0-50% in 30 minutes (with 20W+ adapter)",
        "Battery Type": "Li-Ion, non-removable",
      },
      design: {
        "Dimensions": "147.6 x 71.6 x 7.8 mm",
        "Weight": "170 grams",
        "Materials": "Aerospace-grade aluminum frame, Ceramic Shield front, glass back",
        "Colors": "Black, White, Pink, Teal, Ultramarine",
        "Water Resistance": "IP68 (up to 6m for 30 min)",
        "Dust Resistance": "IP68 certified",
        "Action Button": "Yes (customizable)",
      },
      connectivity: {
        "5G": "Yes, Sub-6GHz and mmWave",
        "4G LTE": "Yes, Gigabit LTE",
        "Wi-Fi": "Wi-Fi 6E (802.11ax)",
        "Bluetooth": "5.3",
        "NFC": "Yes (Apple Pay)",
        "USB": "USB-C (USB 2.0 speed)",
        "GPS": "Yes, with A-GPS, GLONASS, GALILEO, QZSS, BeiDou",
        "UWB": "Ultra Wideband chip (2nd gen)",
      },
      audio: {
        "Speakers": "Stereo speakers",
        "3.5mm Jack": "No",
        "Audio Features": "Spatial Audio, Dolby Atmos",
        "Hi-Res Audio": "Lossless audio support",
      },
      sensors: {
        "Fingerprint": "No",
        "Face Unlock": "Face ID (TrueDepth camera)",
        "Accelerometer": "Yes",
        "Gyroscope": "Yes",
        "Proximity": "Yes",
        "Compass": "Yes",
        "Barometer": "Yes",
      },
    },
    carrierCompatibility: [
      {
        name: "Verizon",
        compatible: true,
        notes: "Full 5G support including mmWave and C-Band",
      },
      {
        name: "AT&T",
        compatible: true,
        notes: "Full 5G support with all bands",
      },
      {
        name: "T-Mobile",
        compatible: true,
        notes: "Full 5G support including Ultra Capacity",
      },
      {
        name: "US Cellular",
        compatible: true,
        notes: "Compatible with 5G and LTE networks",
      },
      {
        name: "Mint Mobile",
        compatible: true,
        notes: "Runs on T-Mobile network",
      },
      {
        name: "Cricket Wireless",
        compatible: true,
        notes: "Runs on AT&T network",
      },
      {
        name: "Metro by T-Mobile",
        compatible: true,
        notes: "Full network compatibility",
      },
      {
        name: "Visible",
        compatible: true,
        notes: "Runs on Verizon network",
      },
      {
        name: "Google Fi",
        compatible: true,
        notes: "Compatible with all network switching",
      },
      {
        name: "Xfinity Mobile",
        compatible: true,
        notes: "Uses Verizon network",
      },
    ],
    reviews: [
      {
        id: 1,
        userName: "Jennifer Williams",
        rating: 4.7,
        categoryRatings: {
          camera: 5,
          battery: 4,
          design: 5,
          performance: 5,
          value: 4,
        },
        date: "October 20, 2024",
        title: "The best standard iPhone yet",
        review: "The iPhone 16 is a huge leap forward from the 15. The A18 chip is incredibly fast, the camera improvements are noticeable especially in low light, and the Action button is more useful than I expected. Battery life gets me through a full day easily. The switch to USB-C is also welcome!",
        helpful: 67,
        notHelpful: 5,
      },
      {
        id: 2,
        userName: "Robert Chen",
        rating: 4.5,
        categoryRatings: {
          camera: 4.5,
          battery: 4,
          design: 4.5,
          performance: 5,
          value: 4,
        },
        date: "October 15, 2024",
        title: "Solid upgrade with USB-C",
        review: "Finally, USB-C on iPhone! The performance is excellent, camera takes stunning photos, and the build quality feels premium as always. Only wish they included a 120Hz display at this price point. Still a great phone overall.",
        helpful: 43,
        notHelpful: 2,
      },
      {
        id: 3,
        userName: "Maria Garcia",
        rating: 5,
        categoryRatings: {
          camera: 5,
          battery: 5,
          design: 5,
          performance: 5,
          value: 5,
        },
        date: "October 8, 2024",
        title: "Perfect size and performance",
        review: "This is the perfect iPhone. Not too big, not too small, and the performance is absolutely top-tier. The camera produces professional-quality photos, and iOS 18 runs buttery smooth. Battery easily lasts me all day with moderate to heavy use. Highly recommend!",
        helpful: 58,
        notHelpful: 1,
      },
    ],
  },
  "pixel-10": {
    id: "pixel-10",
    name: "Pixel 10",
    manufacturer: "Google",
    releaseDate: "October 2024",
    price: "$699",
    images: {
      main: pixel10Image
    },
    quickSpecs: [
      { icon: Smartphone, label: "Display", value: "6.3\" OLED, 120Hz" },
      { icon: Camera, label: "Camera", value: "50MP Triple" },
      { icon: Cpu, label: "Processor", value: "Google Tensor G5" },
      { icon: Battery, label: "Battery", value: "4,700 mAh" },
      { icon: Ruler, label: "Dimensions", value: "149.5 x 70.8 x 8.1 mm" },
      { icon: Weight, label: "Weight", value: "186 grams" },
    ],
    categories: {
      display: {
        "Screen Size": "6.3 inches",
        "Resolution": "2424 x 1080 pixels (FHD+)",
        "Technology": "OLED (LTPO)",
        "Refresh Rate": "1-120Hz (adaptive)",
        "Peak Brightness": "2,400 nits",
        "Protection": "Corning Gorilla Glass Victus 2",
        "Pixel Density": "422 ppi",
        "Screen-to-Body Ratio": "87.8%",
      },
      performance: {
        "Processor": "Google Tensor G5",
        "CPU": "Octa-core (1x3.1 GHz + 3x2.8 GHz + 4x2.0 GHz)",
        "GPU": "Mali-G720 MP12",
        "RAM": "12GB LPDDR5X",
        "Storage": "128GB / 256GB / 512GB UFS 3.1",
        "Expandable Storage": "No",
        "Operating System": "Android 15",
        "Upgradability": "7 years of OS and security updates",
      },
      benchmarks: {
        "GeekBench 6 Single-Core": "2,100",
        "GeekBench 6 Multi-Core": "6,200",
        "AnTuTu v10": "1,120,000",
        "3DMark Wild Life Extreme": "3,400",
        "3DMark Solar Bay": "6,100",
        "GFXBench Manhattan 3.1": "95 fps",
        "GFXBench Car Chase": "68 fps",
        "PCMark Work 3.0": "15,800",
      },
      camera: {
        "Main Camera": "50 MP, f/1.7, 25mm, PDAF, OIS, Laser AF",
        "Ultra Wide": "48 MP, f/2.0, 126° FOV, Macro focus",
        "Telephoto": "48 MP, f/2.8, 5x optical zoom, OIS",
        "Front Camera": "10.5 MP, f/2.2, ultrawide",
        "Video Recording": "4K@60fps, 1080p@240fps",
        "Camera Features": "Night Sight, Magic Eraser, Photo Unblur, Real Tone, Super Res Zoom",
        "AI Features": "Best Take, Magic Editor, Video Boost",
      },
      battery: {
        "Capacity": "4,700 mAh",
        "Charging": "30W wired fast charging",
        "Wireless Charging": "23W wireless charging",
        "Reverse Wireless": "Battery Share (wireless power share)",
        "Charging Time": "0-50% in 30 minutes",
        "Battery Type": "Li-Ion, non-removable",
      },
      design: {
        "Dimensions": "149.5 x 70.8 x 8.1 mm",
        "Weight": "186 grams",
        "Materials": "Recycled aluminum frame, Gorilla Glass Victus 2 front and back",
        "Colors": "Obsidian, Porcelain, Bay, Rose",
        "Water Resistance": "IP68 (up to 1.5m for 30 min)",
        "Dust Resistance": "IP68 certified",
        "Camera Bar": "Redesigned horizontal camera bar",
      },
      connectivity: {
        "5G": "Yes, Sub-6GHz and mmWave",
        "4G LTE": "Yes",
        "Wi-Fi": "Wi-Fi 7 (802.11be)",
        "Bluetooth": "5.3",
        "NFC": "Yes",
        "USB": "USB Type-C 3.2",
        "GPS": "Yes, with A-GPS, GLONASS, GALILEO, QZSS, BeiDou",
        "UWB": "Ultra Wideband support",
      },
      audio: {
        "Speakers": "Stereo speakers",
        "3.5mm Jack": "No",
        "Audio Features": "Spatial Audio",
        "Hi-Res Audio": "Yes",
      },
      sensors: {
        "Fingerprint": "Under-display optical",
        "Face Unlock": "Yes",
        "Accelerometer": "Yes",
        "Gyroscope": "Yes",
        "Proximity": "Yes",
        "Compass": "Yes",
        "Barometer": "Yes",
      },
    },
    carrierCompatibility: [
      {
        name: "Verizon",
        compatible: true,
        notes: "Full 5G support including mmWave and C-Band",
      },
      {
        name: "AT&T",
        compatible: true,
        notes: "Full 5G support with all bands",
      },
      {
        name: "T-Mobile",
        compatible: true,
        notes: "Full 5G support including Ultra Capacity",
      },
      {
        name: "US Cellular",
        compatible: true,
        notes: "Compatible with 5G and LTE networks",
      },
      {
        name: "Mint Mobile",
        compatible: true,
        notes: "Runs on T-Mobile network",
      },
      {
        name: "Cricket Wireless",
        compatible: true,
        notes: "Runs on AT&T network",
      },
      {
        name: "Metro by T-Mobile",
        compatible: true,
        notes: "Full network compatibility",
      },
      {
        name: "Visible",
        compatible: true,
        notes: "Runs on Verizon network",
      },
      {
        name: "Google Fi",
        compatible: true,
        notes: "Optimized for Google Fi network",
      },
      {
        name: "Xfinity Mobile",
        compatible: true,
        notes: "Uses Verizon network",
      },
    ],
    reviews: [
      {
        id: 1,
        userName: "Thomas Anderson",
        rating: 4.9,
        categoryRatings: {
          camera: 5,
          battery: 5,
          design: 5,
          performance: 4.5,
          value: 5,
        },
        date: "October 25, 2024",
        title: "Best camera phone on the market",
        review: "The Pixel 10's camera is simply unmatched. The computational photography is incredible - every photo looks professional. The 7 years of updates guarantee is amazing, and the AI features are genuinely useful. Battery life is excellent too. This is the phone to beat in 2024!",
        helpful: 89,
        notHelpful: 3,
      },
      {
        id: 2,
        userName: "Lisa Thompson",
        rating: 4.6,
        categoryRatings: {
          camera: 5,
          battery: 4.5,
          design: 4.5,
          performance: 4.5,
          value: 4.5,
        },
        date: "October 18, 2024",
        title: "Pure Android experience at its finest",
        review: "Love the clean Android experience without bloatware. The camera is phenomenal, especially in night mode. Tensor G5 handles everything smoothly, though not quite as fast as the latest Snapdragon. The Magic Editor and AI features are game-changers. Great value for the price!",
        helpful: 64,
        notHelpful: 4,
      },
      {
        id: 3,
        userName: "David Kim",
        rating: 5,
        categoryRatings: {
          camera: 5,
          battery: 5,
          design: 5,
          performance: 5,
          value: 5,
        },
        date: "October 12, 2024",
        title: "Finally, a Pixel with great battery",
        review: "This is the Pixel we've been waiting for! The battery life is finally on par with competitors - I easily get a full day plus. The camera continues to be the best in the business, and the new design looks modern. The 7-year update promise seals the deal. Absolutely love it!",
        helpful: 72,
        notHelpful: 2,
      },
      {
        id: 4,
        userName: "Rachel Martinez",
        rating: 4.4,
        categoryRatings: {
          camera: 5,
          battery: 4,
          design: 4.5,
          performance: 4,
          value: 4.5,
        },
        date: "October 5, 2024",
        title: "Great phone with minor quirks",
        review: "The camera quality is outstanding and the AI features are genuinely useful. However, the Tensor chip can get a bit warm during heavy use. Battery life is good but not exceptional. Overall, it's a solid phone with the best camera experience and clean software.",
        helpful: 41,
        notHelpful: 7,
      },
    ],
  },
};
