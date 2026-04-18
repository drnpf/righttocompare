/**
 * Structured glossary of technical definitions for phone specifications.
 * Each entry has a plain-language definition plus a practical buying tip.
 * Used by hover tooltips and the searchable Glossary Modal.
 */

export interface GlossaryEntry {
  definition: string;
  tip: string;
  category: string;
}

export const specGlossary: Record<string, GlossaryEntry> = {
  // Display
  "Screen Size": {
    definition: "The diagonal measurement of the display in inches. Larger screens are better for media and gaming, while smaller screens are more portable.",
    tip: "Sweet spot: 6.1\"–6.7\" balances usability and pocketability. Anything above 6.8\" is a phablet.",
    category: "display",
  },
  "Resolution": {
    definition: "The number of pixels on the screen (width × height). Higher resolution means sharper text and images.",
    tip: "FHD+ (1080p) is sharp enough for most uses. QHD+ (1440p) is noticeably sharper at close range.",
    category: "display",
  },
  "Technology": {
    definition: "The display panel type. AMOLED/OLED offer perfect blacks and vibrant colors; LCD is more affordable but less contrast-rich.",
    tip: "AMOLED/OLED is strongly preferred — it saves battery on dark mode and delivers richer colors.",
    category: "display",
  },
  "Refresh Rate": {
    definition: "How many times per second the screen updates. Higher rates make scrolling and animations smoother.",
    tip: "90Hz is noticeably better than 60Hz. 120Hz is the current premium standard for fluid interactions.",
    category: "display",
  },
  "Peak Brightness": {
    definition: "The maximum brightness level the screen can reach, measured in nits. Higher values mean better visibility in direct sunlight.",
    tip: "Aim for 1000+ nits for outdoor use. 1500+ nits is excellent for bright sunlight visibility.",
    category: "display",
  },
  "Protection": {
    definition: "The type of protective glass covering the screen. Protects against scratches and drops.",
    tip: "Gorilla Glass Victus and Ceramic Shield are the strongest options currently available.",
    category: "display",
  },
  "Pixel Density": {
    definition: "Pixels per inch (ppi). Higher values mean sharper displays that are harder to distinguish individual pixels on.",
    tip: "Above 400 ppi is very sharp. The human eye typically can't distinguish pixels above ~500 ppi.",
    category: "display",
  },
  "Screen-to-Body Ratio": {
    definition: "The percentage of the front face that is actually screen. Higher percentages mean smaller bezels.",
    tip: "85%+ is considered good. Most modern flagships reach 88–93%.",
    category: "display",
  },

  // Performance
  "Processor": {
    definition: "The main chip that powers the phone — the 'brain' handling all computing tasks and determining overall performance.",
    tip: "Apple A-series and Qualcomm Snapdragon 8 Gen series are top-tier. Avoid chips more than 2 generations old.",
    category: "performance",
  },
  "Chipset": {
    definition: "The main processor that powers the phone, handling computing, graphics, modem, and AI tasks.",
    tip: "Apple A-series and Qualcomm Snapdragon 8 Gen series are top-tier. Avoid chips more than 2 generations old.",
    category: "performance",
  },
  "CPU": {
    definition: "Central Processing Unit — the core architecture and clock speed. Determines how fast your phone executes tasks.",
    tip: "Clock speed alone isn't everything; architecture generation matters more. Newer generation = better efficiency.",
    category: "performance",
  },
  "GPU": {
    definition: "Graphics Processing Unit — handles rendering for games and visual effects. Better GPUs mean smoother gaming.",
    tip: "Important if you game. The Adreno (Snapdragon) and Apple GPU series lead the Android and iOS markets respectively.",
    category: "performance",
  },
  "RAM": {
    definition: "Random Access Memory — temporary storage for running apps. More RAM allows more apps open simultaneously without slowdown.",
    tip: "8GB handles everyday multitasking well. 12GB+ is ideal for heavy multitasking and future-proofing.",
    category: "performance",
  },
  "Storage": {
    definition: "Internal storage capacity for apps, photos, and files. More storage means more content without running out of space.",
    tip: "128GB is the minimum for most users. 256GB+ is recommended if you shoot lots of photos or video.",
    category: "performance",
  },
  "Expandable Storage": {
    definition: "Whether you can add a microSD card for additional storage. Most flagship phones no longer support this.",
    tip: "If offered, it's a great bonus. Most 2024+ flagships have dropped it — check before assuming.",
    category: "performance",
  },
  "Operating System": {
    definition: "The software platform running the phone. Android and iOS are the two main options, each with distinct app ecosystems.",
    tip: "iOS offers longer software support (5–6 years). Android flagships now promise 4–7 years of updates.",
    category: "performance",
  },
  "Upgradability": {
    definition: "How long the manufacturer promises software updates. Longer support keeps your phone secure and feature-current.",
    tip: "Prioritize phones with 4+ years of OS updates and 5+ years of security patches.",
    category: "performance",
  },

  // Benchmarks
  "AnTuTu v10": {
    definition: "Overall performance benchmark measuring CPU, GPU, memory, and UX performance combined.",
    tip: "1,000,000+ is flagship. 700,000–999,999 is upper mid-range. Below 500,000 shows in daily use.",
    category: "benchmarks",
  },
  "AnTuTu Score": {
    definition: "Overall performance benchmark — higher scores indicate faster, more powerful devices.",
    tip: "1,000,000+ is flagship. 700,000–999,999 is upper mid-range. Below 500,000 shows in daily use.",
    category: "benchmarks",
  },
  "GeekBench 6 Single-Core": {
    definition: "Measures single-threaded CPU performance, which affects everyday tasks like app launches and browsing.",
    tip: "Higher is better. 2000+ is strong; Apple chips typically lead this metric.",
    category: "benchmarks",
  },
  "GeekBench 6 Multi-Core": {
    definition: "Measures multi-threaded CPU performance for demanding tasks like video editing and heavy multitasking.",
    tip: "Higher is better. 5000+ is solid for a flagship-tier experience.",
    category: "benchmarks",
  },
  "Geekbench Score": {
    definition: "Measures CPU performance in real-world tasks. Single-core reflects daily tasks; multi-core reflects heavy workloads.",
    tip: "Compare both single and multi-core scores — a high multi-core with a weak single-core won't feel as snappy.",
    category: "benchmarks",
  },
  "3DMark Wild Life Extreme": {
    definition: "Graphics benchmark for gaming performance at 1440p. Higher scores indicate better sustained gaming capabilities.",
    tip: "3000+ is excellent for mobile gaming. Sustained scores matter more than peak — check for throttling.",
    category: "benchmarks",
  },
  "3DMark Solar Bay": {
    definition: "Ray tracing graphics benchmark. Tests advanced rendering capabilities for the most demanding mobile games.",
    tip: "A newer and more demanding test. Higher scores mean better support for next-gen mobile graphics.",
    category: "benchmarks",
  },
  "GFXBench Manhattan 3.1": {
    definition: "GPU benchmark measuring graphics performance in frames per second. Higher fps means smoother gaming.",
    tip: "60+ fps sustained is the target for smooth gaming. Watch for fps drops under thermal load.",
    category: "benchmarks",
  },
  "GFXBench Car Chase": {
    definition: "Advanced GPU benchmark testing sustained graphics performance under heavy load.",
    tip: "A better indicator of real gaming performance than peak scores, as it stresses the GPU longer.",
    category: "benchmarks",
  },
  "PCMark Work 3.0": {
    definition: "Measures real-world productivity performance including web browsing, video editing, and photo editing.",
    tip: "10,000+ is a strong productivity score. Great for comparing work-focused devices.",
    category: "benchmarks",
  },

  // Camera
  "Main Camera": {
    definition: "The primary rear camera. MP = megapixels (resolution), f-number = aperture (lower is better for low light), OIS = optical stabilization.",
    tip: "A large sensor (1/1.3\" or bigger) and wide aperture (f/1.7 or lower) matter more than megapixel count alone.",
    category: "camera",
  },
  "Periscope Telephoto": {
    definition: "A telephoto camera using folded optics for high-quality optical zoom, typically 5× or more.",
    tip: "5× optical zoom is the sweet spot. 10× periscope cameras offer stunning reach but require good light.",
    category: "camera",
  },
  "Telephoto": {
    definition: "A zoom camera using optical lenses to magnify subjects without quality loss.",
    tip: "Optical zoom always beats digital zoom. Even a 2× or 3× optical zoom makes a meaningful difference.",
    category: "camera",
  },
  "Ultra Wide": {
    definition: "A camera with a very wide field of view (typically 120°) for landscapes, interiors, and group photos.",
    tip: "Look for autofocus on the ultra-wide — useful for macro shots. More MP means less cropping flexibility.",
    category: "camera",
  },
  "Front Camera": {
    definition: "The selfie camera. Higher MP means more detail, but aperture and autofocus also matter.",
    tip: "Autofocus on the front camera makes a big difference for video calls and selfie sharpness.",
    category: "camera",
  },
  "Video Recording": {
    definition: "Maximum video resolution and framerate. 4K@60fps is ideal for high quality; 8K for future-proofing.",
    tip: "4K@30fps is good for most users. 4K@60fps gives buttery smooth video. 8K is mostly for bragging rights.",
    category: "camera",
  },
  "Camera Features": {
    definition: "Additional camera capabilities like HDR (better dynamic range), night mode, and optical stabilization.",
    tip: "Night mode and OIS have the biggest real-world impact on everyday photo quality.",
    category: "camera",
  },
  "Aperture": {
    definition: "The opening that lets light into the camera. Lower f-numbers mean a wider opening and more light.",
    tip: "f/1.7 or lower is excellent for low-light photography. f/2.8+ is a noticeable step down.",
    category: "camera",
  },
  "Optical Zoom": {
    definition: "True zoom using physical lenses, maintaining image quality. Digital zoom just crops and enlarges, reducing quality.",
    tip: "Always prefer optical zoom over digital. Even 2× optical preserves far more detail than digital zoom.",
    category: "camera",
  },
  "OIS": {
    definition: "Optical Image Stabilization — physically stabilizes the camera sensor to reduce blur from hand shake.",
    tip: "Essential for low-light photos and smooth video. IBIS (in-body) stabilization is the premium version.",
    category: "camera",
  },

  // Battery
  "Capacity": {
    definition: "Battery size in milliampere-hours (mAh). Larger capacity generally means longer battery life.",
    tip: "4500+ mAh is good for all-day use. Efficiency of the chipset matters as much as raw capacity.",
    category: "battery",
  },
  "Charging": {
    definition: "Fast charging wattage for wired charging. Higher wattage means faster charging from 0–100%.",
    tip: "65W+ charges in under an hour. 120W+ charges in ~20 minutes. Check if the charger is included in the box.",
    category: "battery",
  },
  "Wireless Charging": {
    definition: "Charges your phone by placing it on a charging pad without cables.",
    tip: "15W+ wireless is the current standard. MagSafe (Apple) and Qi2 offer better alignment and efficiency.",
    category: "battery",
  },
  "Reverse Wireless": {
    definition: "Allows your phone to wirelessly charge other devices (like earbuds) by placing them on the back.",
    tip: "Useful for charging earbuds or a friend's phone in a pinch. Typically 4.5W — not a primary charging method.",
    category: "battery",
  },
  "Charging Time": {
    definition: "How long it takes to charge the battery from empty to a certain percentage.",
    tip: "Under 60 minutes for a full charge is excellent. Under 30 minutes (with fast charger) is flagship-tier.",
    category: "battery",
  },
  "Battery Type": {
    definition: "The chemistry of the battery. Li-Ion and Li-Po are standard. Most modern phones have non-removable batteries.",
    tip: "Silicon-carbon batteries (newer tech) offer higher density — look for them in 2024+ flagships.",
    category: "battery",
  },

  // Design
  "Dimensions": {
    definition: "Physical size of the phone in millimeters (height × width × thickness). Affects pocketability and one-handed use.",
    tip: "Under 8mm thin is very sleek. Under 74mm wide fits most hands for one-handed use comfortably.",
    category: "design",
  },
  "Weight": {
    definition: "How heavy the phone is in grams. Lighter phones are more comfortable for extended use.",
    tip: "Under 185g feels light. 185–210g is typical flagship. Above 220g may cause fatigue during long sessions.",
    category: "design",
  },
  "Materials": {
    definition: "What the phone body is made of. Premium materials like titanium and aluminum feel better but may be pricier.",
    tip: "Titanium > Aluminum > Plastic for premium feel. Matte glass backs resist fingerprints better than glossy.",
    category: "design",
  },
  "Colors": {
    definition: "Available color options for the phone body. Purely aesthetic — choose what you like.",
    tip: "Lighter colors show scratches less. Darker colors highlight fingerprints more. A case changes everything anyway.",
    category: "design",
  },
  "Water Resistance": {
    definition: "IP rating for water protection. Indicates how well the phone resists water ingress.",
    tip: "IP67 handles splashes and brief submersion. IP68 is rated for 1.5m for 30 minutes — better for swimming.",
    category: "design",
  },
  "Dust Resistance": {
    definition: "IP rating for dust protection. IP6X means completely dust-tight.",
    tip: "IP6X dust resistance is the top level — all modern flagships with an IP rating have this.",
    category: "design",
  },
  "IP68 Rating": {
    definition: "Water and dust resistance rating. Dust-tight and survives submersion in up to 1.5m of water for 30 minutes.",
    tip: "Great for poolside or rain. Not designed for ocean submersion — salt water can degrade seals faster.",
    category: "design",
  },
  "S Pen": {
    definition: "Samsung's built-in stylus for Galaxy Ultra series. Enables drawing, note-taking, and precise navigation.",
    tip: "Only found in Samsung Galaxy S Ultra and Fold series. Unique differentiator with no Android equivalent.",
    category: "design",
  },

  // Connectivity
  "5G": {
    definition: "Fifth-generation cellular network offering faster speeds and lower latency than 4G.",
    tip: "Sub-6GHz 5G has wide coverage. mmWave 5G is much faster but has very short range. Check your carrier's coverage.",
    category: "connectivity",
  },
  "4G LTE": {
    definition: "Fourth-generation cellular network. Still widely used and offers reliable speeds in most areas.",
    tip: "Still essential — 5G coverage is patchy in many areas. Make sure the phone supports your carrier's LTE bands.",
    category: "connectivity",
  },
  "Wi-Fi": {
    definition: "Wireless internet connectivity standard. Wi-Fi 6/6E/7 offer faster speeds and better performance in crowded environments.",
    tip: "Wi-Fi 6E adds the 6GHz band for less interference. Wi-Fi 7 offers the best speeds but needs a compatible router.",
    category: "connectivity",
  },
  "Wi-Fi 6E": {
    definition: "Wi-Fi standard adding the uncrowded 6GHz band. Faster and less congested than standard Wi-Fi 6.",
    tip: "A great upgrade if your router supports 6GHz. Speeds up downloads and reduces lag in busy Wi-Fi environments.",
    category: "connectivity",
  },
  "Bluetooth": {
    definition: "Wireless technology for connecting accessories like headphones and speakers.",
    tip: "Bluetooth 5.3+ offers better range and multi-device connections. LE Audio improves wireless headphone quality.",
    category: "connectivity",
  },
  "NFC": {
    definition: "Near Field Communication — enables contactless payments and quick device pairing by tapping.",
    tip: "Essential for tap-to-pay (Apple Pay, Google Pay). Also used for transit cards and smart tags.",
    category: "connectivity",
  },
  "USB": {
    definition: "Physical charging and data port. USB-C is the modern standard across Android; iPhones moved to USB-C in 2023.",
    tip: "USB 3.2 / Thunderbolt enables fast data transfer and video output. USB 2.0 is only useful for charging.",
    category: "connectivity",
  },
  "GPS": {
    definition: "Global Positioning System for navigation and location services. Multiple satellite systems improve accuracy.",
    tip: "More satellite systems supported (GPS, GLONASS, Galileo, BeiDou) means faster lock and better rural accuracy.",
    category: "connectivity",
  },
  "UWB": {
    definition: "Ultra-Wideband — enables centimeter-precise spatial awareness for features like directional sharing and tracking.",
    tip: "Used for Precision Finding with AirTags, spatial AirDrop, and digital car keys. Growing ecosystem.",
    category: "connectivity",
  },
  "5G Bands": {
    definition: "The specific 5G radio frequencies your phone supports. More bands means better 5G compatibility worldwide.",
    tip: "Check your carrier's 5G bands before buying. An unlocked phone may lack band support for MVNO carriers.",
    category: "connectivity",
  },

  // Audio
  "Speakers": {
    definition: "Built-in speakers for calls, media, and alerts. Stereo (two speakers) provides better sound than mono.",
    tip: "Stereo speakers tuned by Dolby Atmos, Harman, or Dirac deliver noticeably better media audio.",
    category: "audio",
  },
  "3.5mm Jack": {
    definition: "Traditional headphone port. Most modern flagship phones have removed this in favor of wireless or USB-C audio.",
    tip: "If you use wired headphones frequently, this is a significant factor. USB-C adapters are a workaround but add inconvenience.",
    category: "audio",
  },
  "Audio Features": {
    definition: "Additional audio capabilities like spatial audio, hi-res codec support, and premium tuning.",
    tip: "Dolby Atmos and spatial audio make a real difference for movies and music with supported content.",
    category: "audio",
  },
  "Hi-Res Audio": {
    definition: "Support for high-resolution audio formats (24-bit/96kHz+) that preserve more detail than standard MP3.",
    tip: "Only audible with hi-res headphones and hi-res content. Useful for audiophiles with quality wired earphones.",
    category: "audio",
  },

  // Sensors
  "Fingerprint": {
    definition: "Biometric sensor for unlocking. Ultrasonic sensors work when wet and are more secure; optical sensors are faster but require dry fingers.",
    tip: "Ultrasonic in-display (Qualcomm) is the most secure. Side-mounted capacitive sensors are the fastest overall.",
    category: "sensors",
  },
  "Face Unlock": {
    definition: "Uses front camera to recognize your face for unlocking. 3D systems are more secure than 2D camera-based.",
    tip: "Apple Face ID (3D) is the gold standard. Android 2D face unlock is fast but less secure — avoid for banking apps.",
    category: "sensors",
  },
  "Accelerometer": {
    definition: "Detects phone orientation and movement. Enables auto-rotate, step counting, and fitness tracking.",
    tip: "Universal in all smartphones. Required for fitness apps, AR experiences, and screen rotation.",
    category: "sensors",
  },
  "Gyroscope": {
    definition: "Measures rotational movement. Essential for augmented reality apps and advanced gaming controls.",
    tip: "Required for AR apps (like Pokemon Go) and in-game gyroscope aiming. Missing on some budget phones.",
    category: "sensors",
  },
  "Proximity": {
    definition: "Detects when the phone is near your face during calls, turning off the screen to prevent accidental touches.",
    tip: "Present on all modern smartphones. Virtual proximity sensors (software-based) occasionally have responsiveness issues.",
    category: "sensors",
  },
  "Compass": {
    definition: "Digital magnetometer for navigation and orientation. Detects magnetic north for map apps.",
    tip: "Required for accurate map orientation. Missing on a few ultra-budget devices — check if navigation is important to you.",
    category: "sensors",
  },
  "Barometer": {
    definition: "Measures atmospheric air pressure. Improves GPS altitude accuracy and can provide weather data.",
    tip: "Nice to have for hikers and weather enthusiasts. Also used by some fitness apps for floor-counting.",
    category: "sensors",
  },
  "SAR Value": {
    definition: "Specific Absorption Rate — measures radio frequency energy absorbed by the body from the phone. Regulated by governments.",
    tip: "All phones sold legally must stay below regulatory limits (1.6 W/kg in the US). Differences within legal limits are negligible.",
    category: "sensors",
  },
};

/**
 * Flat map of spec name → definition string.
 * Used by tooltip components throughout the app.
 */
export const specTooltips: Record<string, string> = Object.fromEntries(
  Object.entries(specGlossary).map(([key, entry]) => [key, entry.definition])
);
