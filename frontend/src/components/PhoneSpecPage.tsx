import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Separator } from "./ui/separator";
import { Checkbox } from "./ui/checkbox";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "./ui/collapsible";
import { Star, Smartphone, Camera, Cpu, Battery, Ruler, Weight, Droplet, ChevronDown, ThumbsUp, ThumbsDown, X, Monitor, Wifi, Mic, HardDrive, Zap, Radio, BarChart3, Palette, Heart, Bell, Plus, Check, HelpCircle, DollarSign, PenSquare, TrendingDown, TrendingUp } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from "recharts";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Label } from "./ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { toast } from "sonner@2.0.3";
import { Toaster } from "./ui/sonner";
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "./ui/pagination";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip";
import { PartialStar } from "./PartialStar";
import RecentlyViewedPhones from "./RecentlyViewedPhones";
import SpecTableOfContents from "./SpecTableOfContents";
import ComparisonCart from "./ComparisonCart";
import { PhoneData, phonesData } from "../data/phoneData";
import { useParams, useNavigate } from "react-router-dom";

// Category icons mapping - minimalistic uniform color scheme
const categoryConfig: Record<string, { icon: any }> = {
  display: { icon: Monitor },
  performance: { icon: Cpu },
  benchmarks: { icon: BarChart3 },
  camera: { icon: Camera },
  battery: { icon: Battery },
  design: { icon: Palette },
  connectivity: { icon: Wifi },
  audio: { icon: Mic },
  sensors: { icon: Radio },
};

// Tooltips for all specifications
const specTooltips: Record<string, string> = {
  // Display
  "Screen Size": "The diagonal measurement of the display. Larger screens (6.5\"+ are better for media and gaming, while smaller screens are more portable.",
  "Resolution": "The number of pixels on the screen. Higher resolution means sharper text and images. QHD+ (1440p) is sharper than FHD+ (1080p).",
  "Technology": "The display panel type. AMOLED/OLED offer perfect blacks and vibrant colors, while LCD is more affordable but less contrast-rich.",
  "Refresh Rate": "How many times per second the screen updates. Higher rates (120Hz) make scrolling and animations smoother than standard 60Hz displays.",
  "Peak Brightness": "The maximum brightness level the screen can reach, measured in nits. Higher values (1500+ nits) mean better visibility in direct sunlight.",
  "Protection": "The type of protective glass covering the screen. Gorilla Glass and Ceramic Shield protect against scratches and drops.",
  "Pixel Density": "Pixels per inch (ppi). Higher values mean sharper displays. Anything above 400 ppi is very sharp and difficult to distinguish individual pixels.",
  "Screen-to-Body Ratio": "The percentage of the front that's actually screen. Higher percentages (85%+) mean smaller bezels and more immersive viewing.",
  
  // Performance
  "Processor": "The main chip that powers the phone. Think of it as the 'brain' that handles all computing tasks and determines overall performance.",
  "Chipset": "The main processor that powers the phone. Think of it as the 'brain' that handles all computing tasks and determines overall performance.",
  "CPU": "Central Processing Unit - the main processor core architecture and clock speed. Determines how fast your phone can execute tasks and run applications.",
  "GPU": "Graphics Processing Unit - handles graphics rendering for games and visual effects. Better GPUs mean smoother gaming and better visual performance.",
  "RAM": "Random Access Memory - temporary storage for running apps. More RAM (8GB+) allows you to run more apps simultaneously without slowdown.",
  "Storage": "Internal storage capacity for apps, photos, and files. More storage (256GB+) means you can store more content without running out of space.",
  "Expandable Storage": "Whether you can add a microSD card for additional storage. Most flagship phones no longer support expandable storage.",
  "Operating System": "The software platform that runs the phone. Android and iOS are the two main options, each with their own app ecosystems.",
  "Upgradability": "How long the manufacturer promises to provide software updates. Longer support (4+ years) means your phone stays secure and gets new features longer.",
  
  // Benchmarks
  "AnTuTu v10": "Overall performance benchmark measuring CPU, GPU, memory, and UX. Scores above 1 million are flagship-level performance.",
  "AnTuTu Score": "Overall performance benchmark. Higher scores indicate faster, more powerful devices. Scores above 1 million are considered flagship-level.",
  "GeekBench 6 Single-Core": "Measures single-threaded CPU performance for everyday tasks like browsing and scrolling. Higher is better.",
  "GeekBench 6 Multi-Core": "Measures multi-threaded CPU performance for demanding tasks like video editing. Higher scores mean better multitasking.",
  "Geekbench Score": "Measures CPU performance in real-world tasks. Single-core shows performance for everyday tasks, multi-core shows performance under heavy load.",
  "3DMark Wild Life Extreme": "Graphics benchmark for gaming performance. Higher scores indicate better gaming capabilities with smoother framerates.",
  "3DMark Solar Bay": "Ray tracing graphics benchmark. Tests advanced graphics capabilities for the most demanding mobile games.",
  "GFXBench Manhattan 3.1": "GPU benchmark measuring graphics performance. Higher fps means smoother gaming and better 3D performance.",
  "GFXBench Car Chase": "Advanced GPU benchmark. Tests sustained graphics performance under heavy load. Higher fps is better for gaming.",
  "PCMark Work 3.0": "Measures real-world productivity performance including web browsing, video editing, and photo editing.",
  
  // Camera
  "Main Camera": "The primary rear camera. MP = megapixels (resolution), f-number = aperture (lower is better for low light), OIS = optical stabilization.",
  "Periscope Telephoto": "A telephoto camera using periscope lens technology for high-quality optical zoom, typically 5x or more.",
  "Telephoto": "A zoom camera that uses optical lenses to magnify subjects without quality loss. Higher MP and optical zoom values are better.",
  "Ultra Wide": "A camera with a wide field of view (usually 120°) for landscape and group photos. Good for fitting more into the frame.",
  "Front Camera": "The selfie camera. Higher MP means more detail, but good low-light performance and wider angles also matter.",
  "Video Recording": "Maximum video resolution and framerate. 4K@60fps is ideal for high-quality videos, 8K for future-proofing.",
  "Camera Features": "Additional camera capabilities like HDR (better dynamic range), night mode, and stabilization features.",
  "Aperture": "The opening that lets light into the camera. Lower f-numbers (like f/1.7) mean wider openings, allowing more light for better low-light photos.",
  "Optical Zoom": "True zoom using physical lenses, maintaining image quality. Digital zoom just crops and enlarges, reducing quality.",
  "OIS": "Optical Image Stabilization - physically stabilizes the camera to reduce blur from hand shake, crucial for sharp photos and stable videos.",
  
  // Battery
  "Capacity": "Battery size in milliampere-hours (mAh). Larger capacity (4500+ mAh) generally means longer battery life, though efficiency also matters.",
  "Charging": "Fast charging wattage for wired charging. Higher wattage (45W+) means faster charging times from 0-100%.",
  "Wireless Charging": "Charges your phone by placing it on a charging pad without cables. Typically 15W or less, slower than wired but convenient.",
  "Reverse Wireless": "Allows your phone to wirelessly charge other devices (like earbuds) by placing them on the back of the phone.",
  "Charging Time": "How long it takes to charge the battery to a certain percentage. Faster is better for convenience.",
  "Battery Type": "The chemistry of the battery. Li-Ion and Li-Po are standard. Non-removable means you can't easily replace it yourself.",
  
  // Design
  "Dimensions": "Physical size of the phone in millimeters (height x width x thickness). Larger phones have bigger screens but are less pocketable.",
  "Weight": "How heavy the phone is in grams. Lighter phones (under 200g) are more comfortable to hold for extended periods.",
  "Materials": "What the phone is made of. Premium materials like titanium, aluminum, and glass feel better but may be more fragile than plastic.",
  "Colors": "Available color options for the phone body. Choice is purely aesthetic preference.",
  "Water Resistance": "IP rating for water protection. IP68 means safe in up to 1.5m of water for 30 minutes. Higher numbers are better.",
  "Dust Resistance": "IP rating for dust protection. IP6X means completely dust-tight, protecting internal components from particles.",
  "IP68 Rating": "Water and dust resistance rating. IP68 means dust-tight and can survive submersion in water up to 1.5 meters for 30 minutes.",
  "S Pen": "Samsung's stylus for Galaxy Note and Ultra series. Enables precise input for drawing, note-taking, and navigation.",
  
  // Connectivity
  "5G": "Fifth-generation cellular network. Offers faster speeds and lower latency than 4G. Sub6 has better coverage, mmWave has faster speeds.",
  "4G LTE": "Fourth-generation cellular network. Still widely used and offers good speeds in most areas.",
  "Wi-Fi": "Wireless internet connectivity standard. Wi-Fi 6/6E/7 offer faster speeds and better performance in crowded areas than older standards.",
  "Wi-Fi 6E": "Latest Wi-Fi standard offering faster speeds and less interference than older versions. Requires a compatible router to take full advantage.",
  "Bluetooth": "Wireless technology for connecting accessories like headphones and speakers. Version 5.0+ offers better range and stability.",
  "NFC": "Near Field Communication - enables contactless payments (like Apple/Google Pay) and quick pairing with compatible devices by tapping.",
  "USB": "Physical charging and data port. Type-C is the modern standard, with version 3.x offering faster data transfer than 2.0.",
  "GPS": "Global Positioning System for navigation and location services. Multiple systems (GPS, GLONASS, Galileo) improve accuracy.",
  "UWB": "Ultra Wideband - enables precise spatial awareness for features like AirTag-like tracking and directional AirDrop.",
  "5G Bands": "The specific 5G frequencies your phone supports. More bands mean better 5G connectivity in more locations worldwide.",
  
  // Audio
  "Speakers": "Built-in speakers for calls, media, and alerts. Stereo (two speakers) provides better sound than mono (one speaker).",
  "3.5mm Jack": "Traditional headphone port. Most modern phones have removed this in favor of wireless or USB-C audio.",
  "Audio Features": "Additional audio capabilities like spatial audio, hi-res codec support, and audio tuning by premium brands.",
  "Hi-Res Audio": "Support for high-resolution audio formats that preserve more detail than standard MP3. Requires compatible headphones to benefit.",
  
  // Sensors
  "Fingerprint": "Biometric sensor for unlocking. Ultrasonic is more secure and works when wet, optical is faster, side-mounted is very convenient.",
  "Face Unlock": "Uses front camera to recognize your face for unlocking. 3D systems (like Face ID) are more secure than 2D camera-based systems.",
  "Accelerometer": "Detects phone orientation and movement. Enables auto-rotate and fitness tracking features.",
  "Gyroscope": "Measures rotational movement. Essential for augmented reality apps and advanced gaming controls.",
  "Proximity": "Detects when the phone is near your face during calls to turn off the screen and prevent accidental touches.",
  "Compass": "Digital compass for navigation and orientation. Uses magnetometer to detect magnetic north.",
  "Barometer": "Measures air pressure. Can improve GPS altitude accuracy and provide weather information.",
  "SAR Value": "Specific Absorption Rate - measures radio frequency energy absorbed by the body. Lower values mean less radiation exposure.",
};

interface PhoneSpecPageProps {
  onNavigateToComparison?: (phoneIds: string[]) => void;
  comparisonPhoneIds?: string[];
  onComparisonChange?: (phoneIds: string[]) => void;
  recentlyViewedPhones?: string[];
  onAddToRecentlyViewed?: (phoneId: string) => void;
  onNavigateToCatalog?: () => void;
}

export default function PhoneSpecPage({ onNavigateToComparison, comparisonPhoneIds: externalComparisonIds, onComparisonChange, recentlyViewedPhones, onAddToRecentlyViewed, onNavigateToCatalog }: PhoneSpecPageProps) {
  // Routing
  const { phoneId } = useParams<{ phoneId: string }>();
  const navigate = useNavigate();

  // Find the phone data based on the ID from the URL
  const phoneData: PhoneData | undefined = phoneId ? phonesData[phoneId] : undefined;

  if (!phoneData) {
    return <div>Phone not found</div>;
  }

  const categories = Object.keys(phoneData.categories);
  
  // Calculate overall rating from user reviews
  const calculateOverallRating = () => {
    if (phoneData.reviews.length === 0) return 0;
    
    const totalRating = phoneData.reviews.reduce((sum, review) => {
      // Calculate average from category ratings for each review
      const reviewAvg = review.categoryRatings 
        ? (review.categoryRatings.camera + review.categoryRatings.battery + 
           review.categoryRatings.design + review.categoryRatings.performance + 
           review.categoryRatings.value) / 5
        : review.rating;
      return sum + reviewAvg;
    }, 0);
    
    return Number((totalRating / phoneData.reviews.length).toFixed(1));
  };
  
  const overallRating = calculateOverallRating();
  const ratingsCount = phoneData.reviews.length;
  
  // Initialize with all specs selected
  const initialSelectedSpecs: Record<string, string[]> = {};
  categories.forEach(category => {
    initialSelectedSpecs[category] = Object.keys(phoneData.categories[category as keyof typeof phoneData.categories]);
  });
  
  const [selectedSpecs, setSelectedSpecs] = useState<Record<string, string[]>>(initialSelectedSpecs);
  const [openCategories, setOpenCategories] = useState<Record<string, boolean>>({});
  const [isFilterOpen, setIsFilterOpen] = useState(true);
  const [isKeySpecsOpen, setIsKeySpecsOpen] = useState(true);
  const [isFullSpecsOpen, setIsFullSpecsOpen] = useState(true);
  const [isCarrierCompatOpen, setIsCarrierCompatOpen] = useState(true);
  const [isReviewsOpen, setIsReviewsOpen] = useState(true);
  const [isPriceTrackingOpen, setIsPriceTrackingOpen] = useState(true);
  const [helpfulClicks, setHelpfulClicks] = useState<Record<number, 'helpful' | 'notHelpful' | null>>({});
  const [reviews, setReviews] = useState(phoneData.reviews);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [newReview, setNewReview] = useState({
    userName: "",
    rating: 0,
    categoryRatings: {
      camera: 0,
      battery: 0,
      design: 0,
      performance: 0,
      value: 0,
    },
    title: "",
    review: "",
  });
  const [hoverRating, setHoverRating] = useState(0);
  const [hoverCategoryRating, setHoverCategoryRating] = useState<{ [key: string]: number }>({});
  const [expandedCategoryRatings, setExpandedCategoryRatings] = useState<{ [key: number]: boolean }>({});
  const [currentPage, setCurrentPage] = useState(1);
  const reviewsPerPage = 3;
  const reviewsSectionRef = useRef<HTMLDivElement>(null);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isPriceAlertOpen, setIsPriceAlertOpen] = useState(false);
  const [priceAlertEmail, setPriceAlertEmail] = useState("");
  const [targetPrice, setTargetPrice] = useState("");
  // Use external comparison state if provided, otherwise use local state
  const [localComparisonPhones, setLocalComparisonPhones] = useState<Array<{
    id: string;
    name: string;
    manufacturer: string;
    image: string;
    price: string;
  }>>([]);
  
  // Derive comparison phones from external IDs if provided
  const comparisonPhones = externalComparisonIds 
    ? externalComparisonIds.map(id => {
        const phoneData = (phonesData as any)[id];
        return phoneData ? {
          id: phoneData.id,
          name: phoneData.name,
          manufacturer: phoneData.manufacturer,
          image: phoneData.images.main,
          price: phoneData.price,
        } : null;
      }).filter(Boolean) as Array<{
        id: string;
        name: string;
        manufacturer: string;
        image: string;
        price: string;
      }>
    : localComparisonPhones;
  
  const setComparisonPhones = (phones: Array<{
    id: string;
    name: string;
    manufacturer: string;
    image: string;
    price: string;
  }>) => {
    if (onComparisonChange) {
      // Update external state with IDs only
      onComparisonChange(phones.map(p => p.id));
    } else {
      // Update local state
      setLocalComparisonPhones(phones);
    }
  };
  
  const [showComparisonCart, setShowComparisonCart] = useState(false);
  const [isCartMinimized, setIsCartMinimized] = useState(false);

  // Generate price history data (mock data for demonstration)
  const generatePriceHistory = () => {
    const currentPrice = parseFloat(phoneData.price.replace('$', '').replace(',', ''));
    const history = [];
    const monthsBack = 6;
    
    for (let i = monthsBack; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthName = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      
      // Generate price variation (random fluctuation around current price)
      let price;
      if (i === 0) {
        price = currentPrice; // Current month uses actual price
      } else {
        // Earlier prices tend to be higher, with some random variation
        const variation = (Math.random() - 0.3) * (currentPrice * 0.15);
        const baseIncrease = (i / monthsBack) * (currentPrice * 0.1);
        price = Math.round(currentPrice + baseIncrease + variation);
      }
      
      history.push({
        month: monthName,
        price: price,
      });
    }
    
    return history;
  };
  
  const priceHistory = generatePriceHistory();
  const currentPrice = parseFloat(phoneData.price.replace('$', '').replace(',', ''));
  const oldestPrice = priceHistory[0].price;
  const priceChange = currentPrice - oldestPrice;
  const priceChangePercent = ((priceChange / oldestPrice) * 100).toFixed(1);

  // Reset filters when phone changes
  useEffect(() => {
    const newSelectedSpecs: Record<string, string[]> = {};
    categories.forEach(category => {
      newSelectedSpecs[category] = Object.keys(phoneData.categories[category as keyof typeof phoneData.categories]);
    });
    setSelectedSpecs(newSelectedSpecs);
  }, [phoneData.id]);

  // Calculate pagination values
  const totalPages = Math.ceil(reviews.length / reviewsPerPage);
  const startIndex = (currentPage - 1) * reviewsPerPage;
  const endIndex = startIndex + reviewsPerPage;
  const currentReviews = reviews.slice(startIndex, endIndex);

  const handleLeaveReviewClick = () => {
    // Ensure reviews section is expanded
    setIsReviewsOpen(true);
    // Show the review form
    setShowReviewForm(true);
    // Scroll to the reviews section after a brief delay to allow the section to expand
    setTimeout(() => {
      reviewsSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  const toggleSpec = (category: string, specName: string) => {
    setSelectedSpecs(prev => {
      const categorySpecs = prev[category] || [];
      const newCategorySpecs = categorySpecs.includes(specName)
        ? categorySpecs.filter(s => s !== specName)
        : [...categorySpecs, specName];
      return { ...prev, [category]: newCategorySpecs };
    });
  };

  const toggleCategoryOpen = (category: string) => {
    setOpenCategories(prev => ({ ...prev, [category]: !prev[category] }));
  };

  const selectAllSpecs = () => {
    const allSpecs: Record<string, string[]> = {};
    categories.forEach(category => {
      allSpecs[category] = Object.keys(phoneData.categories[category as keyof typeof phoneData.categories]);
    });
    setSelectedSpecs(allSpecs);
  };

  const clearAllSpecs = () => {
    const emptySpecs: Record<string, string[]> = {};
    categories.forEach(category => {
      emptySpecs[category] = [];
    });
    setSelectedSpecs(emptySpecs);
  };

  const isCategoryFullySelected = (category: string) => {
    const allSpecs = Object.keys(phoneData.categories[category as keyof typeof phoneData.categories]);
    const selected = selectedSpecs[category] || [];
    return allSpecs.length === selected.length && allSpecs.length > 0;
  };

  const isCategoryPartiallySelected = (category: string) => {
    const selected = selectedSpecs[category] || [];
    return selected.length > 0 && !isCategoryFullySelected(category);
  };

  const toggleAllCategorySpecs = (category: string) => {
    const allSpecs = Object.keys(phoneData.categories[category as keyof typeof phoneData.categories]);
    const isFullySelected = isCategoryFullySelected(category);
    setSelectedSpecs(prev => ({
      ...prev,
      [category]: isFullySelected ? [] : allSpecs
    }));
  };

  const handleHelpfulClick = (reviewId: number, type: 'helpful' | 'notHelpful') => {
    setHelpfulClicks(prev => {
      const current = prev[reviewId];
      if (current === type) {
        // If already clicked, unclick it
        return { ...prev, [reviewId]: null };
      } else {
        // Click it (either from null or switching from the other type)
        return { ...prev, [reviewId]: type };
      }
    });
  };

  const handleSubmitReview = () => {
    const categoryRatings = newReview.categoryRatings;
    const allCategoryRatingsGiven = Object.values(categoryRatings).every(rating => rating > 0);
    
    if (!newReview.userName || !newReview.title || !newReview.review || !allCategoryRatingsGiven) {
      return;
    }

    // Calculate average rating from category ratings
    const averageRating = (
      categoryRatings.camera +
      categoryRatings.battery +
      categoryRatings.design +
      categoryRatings.performance +
      categoryRatings.value
    ) / 5;

    const reviewToAdd = {
      id: reviews.length + 1,
      userName: newReview.userName,
      rating: Math.round(averageRating * 2) / 2, // Round to nearest 0.5
      categoryRatings: { ...categoryRatings },
      date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
      title: newReview.title,
      review: newReview.review,
      helpful: 0,
      notHelpful: 0,
    };

    setReviews([reviewToAdd, ...reviews]);
    setCurrentPage(1); // Reset to first page after adding a review
    setNewReview({
      userName: "",
      rating: 0,
      categoryRatings: {
        camera: 0,
        battery: 0,
        design: 0,
        performance: 0,
        value: 0,
      },
      title: "",
      review: "",
    });
    setShowReviewForm(false);
  };

  const handleCancelReview = () => {
    if (window.confirm("Are you sure you want to cancel? Your review will not be saved.")) {
      setNewReview({
        userName: "",
        rating: 0,
        categoryRatings: {
          camera: 0,
          battery: 0,
          design: 0,
          performance: 0,
          value: 0,
        },
        title: "",
        review: "",
      });
      setShowReviewForm(false);
    }
  };

  const handleWishlistToggle = () => {
    setIsWishlisted(!isWishlisted);
    if (!isWishlisted) {
      toast.success(`${phoneData.name} added to wishlist!`);
    } else {
      toast.success(`${phoneData.name} removed from wishlist`);
    }
  };

  const handleSetPriceAlert = () => {
    if (!priceAlertEmail || !targetPrice) {
      toast.error("Please fill in all fields");
      return;
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(priceAlertEmail)) {
      toast.error("Please enter a valid email address");
      return;
    }

    // Validate price format
    const priceValue = parseFloat(targetPrice);
    if (isNaN(priceValue) || priceValue <= 0) {
      toast.error("Please enter a valid price");
      return;
    }

    toast.success(`Price alert set! We'll notify you at ${priceAlertEmail} when the price drops to $${priceValue}`);
    setIsPriceAlertOpen(false);
    setPriceAlertEmail("");
    setTargetPrice("");
  };

  const handleAddToComparison = () => {
    const currentPhone = {
      id: phoneData.id,
      name: phoneData.name,
      manufacturer: phoneData.manufacturer,
      image: phoneData.images.main,
      price: phoneData.price,
    };

    // Check if phone is already in comparison
    if (comparisonPhones.some(phone => phone.id === currentPhone.id)) {
      toast.error("Already in comparison", {
        description: "This phone is already added to your cart",
        duration: 3000,
      });
      return;
    }

    // Check if cart is full
    if (comparisonPhones.length >= 3) {
      toast.error("Comparison cart full", {
        description: "You can compare up to 3 phones at once",
        duration: 3000,
      });
      return;
    }

    setComparisonPhones([...comparisonPhones, currentPhone]);
    setShowComparisonCart(true);
    
    // Add to recently viewed
    if (onAddToRecentlyViewed) {
      onAddToRecentlyViewed(phoneData.id);
    }
    
    toast.success("Added to comparison", {
      description: `${phoneData.name} is ready to compare`,
      duration: 3000,
    });
  };

  const handleRemoveFromComparison = (phoneId: string) => {
    setComparisonPhones(comparisonPhones.filter(phone => phone.id !== phoneId));
    toast.success("Removed from comparison", {
      description: "Phone has been removed from your cart",
      duration: 2500,
    });
  };

  const handleCompare = () => {
    if (onNavigateToComparison) {
      const phoneIds = comparisonPhones.map(phone => phone.id);
      onNavigateToComparison(phoneIds);
    } else {
      toast.success("Opening comparison", {
        description: `Comparing ${comparisonPhones.length} phones...`,
        duration: 2500,
      });
    }
  };

  const handleCloseComparisonCart = () => {
    // Don't actually close the cart, just minimize it
    // The cart will automatically hide when there are no phones
    setShowComparisonCart(true);
  };

  return (
    <>
      <SpecTableOfContents specCategories={categories} />
      <div className="max-w-[1200px] xl:max-w-[1400px] 2xl:max-w-[1600px] mx-auto px-6 py-8">
        {/* 1. Phone Image & Overview */}
        <div id="overview" className="bg-white dark:bg-[#161b26] rounded-2xl shadow-sm p-8 mb-8">
        <div className="text-center mb-8">
          <p className="text-[#2c3968] dark:text-[#4a7cf6] mb-2">{phoneData.manufacturer}</p>
          <h1 className="dark:text-white mb-3">{phoneData.name}</h1>
          <div className="flex items-center justify-center gap-4">
            <Badge variant="secondary" className="bg-[#2c3968] text-white hover:bg-[#2c3968]/90">
              {phoneData.releaseDate}
            </Badge>
            <span className="text-[#2c3968]">{phoneData.price}</span>
          </div>
        </div>

        <div className="mb-8">
          {/* Wrapper for centered phone image with comparison button */}
          <div className="flex justify-center">
            <div className="relative inline-block">
              {/* Phone Image - Centered */}
              <div className="w-[700px]">
                <img
                  src={phoneData.images.main}
                  alt={phoneData.name}
                  className="w-full h-auto"
                />
              </div>
              
              {/* Browse Phone Catalog Section - Dashed Rectangle - Positioned to the right */}
              <div className="hidden xl:flex absolute top-1/2 -translate-y-1/2 left-[calc(100%-40px)] flex-col items-center justify-center border-2 border-dashed border-[#2c3968]/30 dark:border-[#4a7cf6]/30 bg-gradient-to-br from-[#2c3968]/5 to-transparent dark:from-[#4a7cf6]/5 w-52 group/catalog hover:border-[#2c3968]/50 dark:hover:border-[#4a7cf6]/50 transition-all duration-300 min-h-[400px] z-10 cursor-pointer" onClick={onNavigateToCatalog}>
                {/* Decorative Corner Accents */}
                <div className="absolute top-0 left-0 w-3 h-3 border-t-4 border-l-4 border-[#2c3968] rounded-tl-sm"></div>
                <div className="absolute top-0 right-0 w-3 h-3 border-t-4 border-r-4 border-[#2c3968] rounded-tr-sm"></div>
                <div className="absolute bottom-0 left-0 w-3 h-3 border-b-4 border-l-4 border-[#2c3968] rounded-bl-sm"></div>
                <div className="absolute bottom-0 right-0 w-3 h-3 border-b-4 border-r-4 border-[#2c3968] rounded-br-sm"></div>
                
                {/* Label */}
                <div className="absolute top-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1">
                  <span className="text-xs text-[#2c3968]/70 tracking-wide">CATALOG</span>
                </div>
                
                {/* Browse Button */}
                <button
                  className="group relative bg-white border-2 border-[#2c3968] text-[#2c3968] rounded-xl px-6 py-4 shadow-lg hover:bg-[#2c3968] hover:text-white transition-all duration-300 hover:scale-105 hover:shadow-2xl"
                  title="Browse Phone Catalog"
                >
                  <div className="flex flex-col items-center gap-2">
                    <div className="relative">
                      <Smartphone className="w-7 h-7 transition-transform group-hover:scale-110 duration-300" />
                    </div>
                    <span className="text-xs uppercase tracking-wider">Browse</span>
                  </div>
                  
                  {/* Pulse Animation on Hover */}
                  <div className="absolute inset-0 rounded-xl bg-[#2c3968] opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-300"></div>
                  
                  {/* Tooltip on hover */}
                  <div className="absolute right-full mr-3 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10">
                    <div className="bg-[#1e1e1e] text-white px-3 py-2 rounded-lg text-sm whitespace-nowrap shadow-lg">
                      Browse phone catalog
                      <div className="absolute left-full top-1/2 -translate-y-1/2 border-8 border-transparent border-l-[#1e1e1e]"></div>
                    </div>
                  </div>
                </button>
                
                {/* Bottom Label */}
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-center">
                  <span className="text-[10px] text-[#2c3968]/50 tracking-wide">ALL PHONES</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Overall Score */}
        <div className="flex justify-center">
          <div className="inline-block">
            <div className="flex items-center gap-3 justify-center">
              <div className="flex items-baseline">
                <span className="text-[#2c3968]">{overallRating}</span>
              </div>
              <div className="flex gap-1">
                {[...Array(5)].map((_, i) => {
                  const fillPercentage = Math.max(0, Math.min(1, overallRating - i));
                  return (
                    <PartialStar
                      key={i}
                      fillPercentage={fillPercentage}
                      fillColor="#2c3968"
                      strokeColor="#2c3968"
                    />
                  );
                })}
              </div>
              <span className="text-[#666]">({ratingsCount} {ratingsCount === 1 ? 'Rating' : 'Ratings'})</span>
            </div>
            <div className="text-center mt-2">
              <button
                onClick={handleLeaveReviewClick}
                className="text-[#2c3968] hover:underline cursor-pointer"
              >
                Leave a Review
              </button>
            </div>
            
            {/* Action Buttons - Top Row */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 mt-4 w-full sm:w-auto px-4 sm:px-0">
              <Button
                variant="outline"
                className={`border-2 ${isWishlisted ? 'bg-gradient-to-r from-[#2c3968] to-[#3d4b7d] text-white border-[#2c3968] hover:from-[#243059] hover:to-[#354368] shadow-lg hover:shadow-xl' : 'border-[#2c3968] text-[#2c3968] bg-white hover:bg-gradient-to-r hover:from-[#2c3968]/5 hover:to-[#2c3968]/10 shadow-md hover:shadow-lg'} w-full sm:w-auto transition-all duration-300 hover:scale-105 group`}
                onClick={handleWishlistToggle}
              >
                <Heart className={`w-4 h-4 mr-2 transition-transform group-hover:scale-110 ${isWishlisted ? 'fill-current' : ''}`} />
                <span className="hidden sm:inline">{isWishlisted ? 'In Wishlist' : 'Add to Wishlist'}</span>
                <span className="sm:hidden">{isWishlisted ? 'Wishlist' : 'Wishlist'}</span>
              </Button>
              
              <Dialog open={isPriceAlertOpen} onOpenChange={setIsPriceAlertOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="border-2 border-[#2c3968] text-[#2c3968] bg-white hover:bg-gradient-to-r hover:from-[#2c3968]/5 hover:to-[#2c3968]/10 shadow-md hover:shadow-lg w-full sm:w-auto transition-all duration-300 hover:scale-105 group">
                    <Bell className="w-4 h-4 mr-2 transition-transform group-hover:scale-110 group-hover:rotate-12" />
                    <span className="hidden sm:inline">Set Price Alert</span>
                    <span className="sm:hidden">Price Alert</span>
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle className="text-[#2c3968]">Set Price Alert</DialogTitle>
                    <DialogDescription>
                      Get notified when the {phoneData.name} drops to your target price.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="your@email.com"
                        value={priceAlertEmail}
                        onChange={(e) => setPriceAlertEmail(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="targetPrice">Target Price (USD)</Label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#666]">$</span>
                        <Input
                          id="targetPrice"
                          type="number"
                          placeholder="999"
                          className="pl-7"
                          value={targetPrice}
                          onChange={(e) => setTargetPrice(e.target.value)}
                        />
                      </div>
                      <p className="text-sm text-[#666]">Current price: {phoneData.price}</p>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsPriceAlertOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      className="bg-[#2c3968] hover:bg-[#2c3968]/90"
                      onClick={handleSetPriceAlert}
                    >
                      Set Alert
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
            
            {/* Add to Compare Button - Second Row */}
            <div className="flex justify-center mt-3 w-full px-4 sm:px-0">
              <Button
                className={
                  comparisonPhones.some(phone => phone.id === phoneData.id)
                    ? "bg-green-500 dark:bg-green-600 text-white hover:bg-green-600 dark:hover:bg-green-700 shadow-lg w-full sm:w-auto transition-all duration-300 cursor-default"
                    : "bg-gradient-to-r from-[#2c3968] to-[#3d4b7d] dark:from-[#4a7cf6] dark:to-[#5b8df7] text-white hover:from-[#243059] hover:to-[#354368] dark:hover:from-[#3d6be5] dark:hover:to-[#4a7cf6] shadow-lg hover:shadow-xl w-full sm:w-auto transition-all duration-300 hover:scale-105 group"
                }
                onClick={handleAddToComparison}
                disabled={comparisonPhones.some(phone => phone.id === phoneData.id)}
              >
                {comparisonPhones.some(phone => phone.id === phoneData.id) ? (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    Already in Compare
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4 mr-2 transition-transform group-hover:rotate-90" />
                    Add to Compare
                  </>
                )}
              </Button>
            </div>
            
            {/* Mobile Browse Phones Section - Shows below XL screens */}
            <div className="xl:hidden flex justify-center mt-6 px-4">
              <div className="relative flex flex-col items-center justify-center border-2 border-dashed border-[#2c3968]/30 dark:border-[#4a7cf6]/30 bg-gradient-to-br from-[#2c3968]/5 to-transparent dark:from-[#4a7cf6]/5 w-full max-w-md py-6 px-4 group/catalog hover:border-[#2c3968]/50 dark:hover:border-[#4a7cf6]/50 transition-all duration-300 rounded-lg cursor-pointer" onClick={onNavigateToCatalog}>
                {/* Decorative Corner Accents */}
                <div className="absolute top-0 left-0 w-2.5 h-2.5 border-t-3 border-l-3 border-[#2c3968] rounded-tl-sm"></div>
                <div className="absolute top-0 right-0 w-2.5 h-2.5 border-t-3 border-r-3 border-[#2c3968] rounded-tr-sm"></div>
                <div className="absolute bottom-0 left-0 w-2.5 h-2.5 border-b-3 border-l-3 border-[#2c3968] rounded-bl-sm"></div>
                <div className="absolute bottom-0 right-0 w-2.5 h-2.5 border-b-3 border-r-3 border-[#2c3968] rounded-br-sm"></div>
                
                {/* Top Label */}
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-xs text-[#2c3968]/70 tracking-wide">BROWSE PHONE CATALOG</span>
                </div>
                
                {/* Browse Button */}
                <button
                  className="group relative bg-white border-2 border-[#2c3968] text-[#2c3968] rounded-xl px-8 py-3 shadow-lg hover:bg-[#2c3968] hover:text-white transition-all duration-300 hover:scale-105 hover:shadow-2xl"
                  title="Browse Phone Catalog"
                >
                  <div className="flex items-center gap-3">
                    <Smartphone className="w-6 h-6 transition-transform group-hover:scale-110 duration-300" />
                    <span className="text-sm uppercase tracking-wider">Browse Phones</span>
                  </div>
                  
                  {/* Pulse Animation on Hover */}
                  <div className="absolute inset-0 rounded-xl bg-[#2c3968] opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-300"></div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Key Specifications */}
      <Collapsible open={isKeySpecsOpen} onOpenChange={setIsKeySpecsOpen}>
        <div id="key-specs" className="bg-white dark:bg-[#161b26] rounded-2xl shadow-sm p-8 mb-8">
          <div className="mb-6">
            <div className="flex items-center gap-3">
              <div>
                <h2 className="text-[#2c3968] dark:text-[#4a7cf6] mb-2">Key Specifications</h2>
                <div className="h-1 w-20 bg-[#2c3968] dark:bg-[#4a7cf6] rounded-full"></div>
              </div>
              <CollapsibleTrigger className="ml-2">
                <ChevronDown
                  className={`w-6 h-6 text-[#2c3968] dark:text-[#4a7cf6] transition-transform ${
                    isKeySpecsOpen ? "rotate-180" : ""
                  }`}
                />
              </CollapsibleTrigger>
            </div>
          </div>
          <CollapsibleContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4 xl:gap-5">
              {phoneData.quickSpecs.map((spec, idx) => (
                <div key={idx} className="border border-[#e0e0e0] dark:border-[#2d3548] rounded-lg p-4 min-w-0 dark:bg-[#1a1f2e]">
                  <div className="flex items-center gap-2 mb-2">
                    <spec.icon className="w-4 h-4 text-[#2c3968] dark:text-[#4a7cf6] flex-shrink-0" />
                    <p className="text-[#666] dark:text-[#a0a8b8] truncate">{spec.label}</p>
                  </div>
                  <p className="text-[#1e1e1e] dark:text-white">{spec.value}</p>
                </div>
              ))}
            </div>
          </CollapsibleContent>
        </div>
      </Collapsible>

      {/* 3. Price Tracking */}
      <Collapsible open={isPriceTrackingOpen} onOpenChange={setIsPriceTrackingOpen}>
        <div id="price-tracking" className="bg-white dark:bg-[#161b26] rounded-2xl shadow-sm p-8 mb-8">
          <div className="mb-6">
            <div className="flex items-center gap-3">
              <div>
                <h2 className="text-[#2c3968] dark:text-[#4a7cf6] mb-2">Price Tracking</h2>
                <div className="h-1 w-20 bg-[#2c3968] dark:bg-[#4a7cf6] rounded-full"></div>
              </div>
              <CollapsibleTrigger className="ml-2">
                <ChevronDown
                  className={`w-6 h-6 text-[#2c3968] dark:text-[#4a7cf6] transition-transform ${
                    isPriceTrackingOpen ? "rotate-180" : ""
                  }`}
                />
              </CollapsibleTrigger>
            </div>
          </div>
          <CollapsibleContent>
            <div className="space-y-6">
              {/* Current Price and Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gradient-to-br from-[#2c3968] to-[#3d4b7d] rounded-xl p-6 text-white">
                  <div className="flex items-center gap-2 mb-2">
                    <DollarSign className="w-5 h-5" />
                    <p className="text-sm opacity-90">Current Price</p>
                  </div>
                  <p className="text-3xl mb-1">{phoneData.price}</p>
                  <p className="text-xs opacity-75">As of {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                </div>
                
                <div className={`border-2 ${priceChange < 0 ? 'border-green-500 dark:border-green-400 bg-green-50 dark:bg-green-900/20' : 'border-red-500 dark:border-red-400 bg-red-50 dark:bg-red-900/20'} rounded-xl p-6`}>
                  <div className="flex items-center gap-2 mb-2">
                    {priceChange < 0 ? (
                      <TrendingDown className="w-5 h-5 text-green-600 dark:text-green-400" />
                    ) : (
                      <TrendingUp className="w-5 h-5 text-red-600 dark:text-red-400" />
                    )}
                    <p className="text-sm text-[#666] dark:text-[#a0a8b8]">6-Month Change</p>
                  </div>
                  <p className={`text-3xl mb-1 ${priceChange < 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                    {priceChange < 0 ? '-' : '+'}{Math.abs(priceChange).toFixed(0)}
                  </p>
                  <p className="text-xs text-[#666] dark:text-[#a0a8b8]">
                    {priceChange < 0 ? '' : '+'}{priceChangePercent}% from ${oldestPrice}
                  </p>
                </div>
                
                <div className="border-2 border-[#2c3968]/20 dark:border-[#4a7cf6]/30 bg-[#2c3968]/5 dark:bg-[#4a7cf6]/10 rounded-xl p-6">
                  <div className="flex items-center gap-2 mb-2">
                    <BarChart3 className="w-5 h-5 text-[#2c3968] dark:text-[#4a7cf6]" />
                    <p className="text-sm text-[#666] dark:text-[#a0a8b8]">Lowest Price</p>
                  </div>
                  <p className="text-3xl text-[#2c3968] dark:text-[#4a7cf6] mb-1">
                    ${Math.min(...priceHistory.map(h => h.price))}
                  </p>
                  <p className="text-xs text-[#666] dark:text-[#a0a8b8]">
                    In {priceHistory.find(h => h.price === Math.min(...priceHistory.map(p => p.price)))?.month}
                  </p>
                </div>
              </div>

              {/* Price Chart */}
              <div className="border border-[#e0e0e0] dark:border-[#2d3548] rounded-xl p-6 dark:bg-[#1a1f2e]">
                <h3 className="text-lg text-[#2c3968] dark:text-[#4a7cf6] mb-4">Price History (Last 6 Months)</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={priceHistory} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                    <XAxis 
                      dataKey="month" 
                      stroke="#666"
                      style={{ fontSize: '12px' }}
                    />
                    <YAxis 
                      stroke="#666"
                      style={{ fontSize: '12px' }}
                      tickFormatter={(value) => `$${value}`}
                    />
                    <RechartsTooltip 
                      contentStyle={{
                        backgroundColor: 'white',
                        border: '2px solid #2c3968',
                        borderRadius: '8px',
                        padding: '8px 12px'
                      }}
                      formatter={(value: any) => [`$${value}`, 'Price']}
                      labelStyle={{ color: '#2c3968', fontWeight: 'bold' }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="price" 
                      stroke="#2c3968" 
                      strokeWidth={3}
                      dot={{ fill: '#2c3968', r: 5 }}
                      activeDot={{ r: 7, fill: '#2c3968' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
                <p className="text-xs text-[#666] dark:text-[#a0a8b8] mt-4 text-center">
                  💡 Tip: Set a price alert above to get notified when the price drops to your target
                </p>
              </div>
            </div>
          </CollapsibleContent>
        </div>
      </Collapsible>

      {/* 4. Specification Filter */}
      <Collapsible open={isFilterOpen} onOpenChange={setIsFilterOpen}>
        <div id="filter-specs" className="bg-white dark:bg-[#161b26] rounded-2xl shadow-sm p-8 mb-8">
          <div className="flex items-start justify-between mb-6 gap-4">
            <div className="flex items-center gap-3 flex-1">
              <div>
                <h2 className="text-[#2c3968] dark:text-[#4a7cf6] mb-2">Filter Specifications</h2>
                <div className="h-1 w-20 bg-[#2c3968] dark:bg-[#4a7cf6] rounded-full"></div>
              </div>
              <CollapsibleTrigger className="ml-2">
                <ChevronDown
                  className={`w-6 h-6 text-[#2c3968] dark:text-[#4a7cf6] transition-transform ${
                    isFilterOpen ? "rotate-180" : ""
                  }`}
                />
              </CollapsibleTrigger>
            </div>
            <div className="flex gap-2">
              <button
                onClick={selectAllSpecs}
                className="text-[#2c3968] hover:underline"
              >
                Select All
              </button>
              <span className="text-[#666]">|</span>
              <button
                onClick={clearAllSpecs}
                className="text-[#2c3968] hover:underline"
              >
                Clear All
              </button>
            </div>
          </div>
          <CollapsibleContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((category) => {
            const specs = Object.keys(phoneData.categories[category as keyof typeof phoneData.categories]);
            const categorySelectedSpecs = selectedSpecs[category] || [];
            const config = categoryConfig[category] || { icon: Smartphone };
            const CategoryIcon = config.icon;
            const isFullySelected = isCategoryFullySelected(category);
            const isPartiallySelected = isCategoryPartiallySelected(category);
            
            return (
              <Collapsible
                key={category}
                open={openCategories[category]}
                onOpenChange={() => toggleCategoryOpen(category)}
              >
                <div className="group border border-[#e0e0e0] rounded-lg hover:border-[#2c3968]/20 transition-all duration-200 bg-white relative">
                  <div className="flex items-center justify-between p-4 cursor-pointer hover:bg-[#f7f9fc] transition-colors duration-200">
                    <div className="flex items-center gap-3 flex-1">
                      {/* Category Icon - minimalistic */}
                      <div className="w-9 h-9 rounded-lg bg-[#f5f7fa] flex items-center justify-center">
                        <CategoryIcon className="w-4 h-4 text-[#2c3968]" />
                      </div>
                      
                      <div className="flex-1">
                        <CollapsibleTrigger className="flex items-center gap-2 text-left w-full">
                          <span className="capitalize text-[#2c3968]">{category}</span>
                          {(isFullySelected || isPartiallySelected) && (
                            <Badge 
                              variant="secondary" 
                              className="text-xs px-2 py-0.5 bg-[#2c3968]/10 text-[#2c3968] border border-[#2c3968]/20"
                            >
                              {categorySelectedSpecs.length}/{specs.length}
                            </Badge>
                          )}
                        </CollapsibleTrigger>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {/* Checkbox */}
                      <div 
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleAllCategorySpecs(category);
                        }}
                        className="cursor-pointer"
                      >
                        <Checkbox
                          checked={isFullySelected}
                          className={isPartiallySelected ? "data-[state=checked]:bg-[#2c3968]/50" : ""}
                        />
                      </div>
                      
                      <CollapsibleTrigger>
                        <ChevronDown
                          className={`w-5 h-5 transition-all duration-200 ${
                            openCategories[category] ? "rotate-180 text-[#2c3968]" : "text-[#999]"
                          }`}
                        />
                      </CollapsibleTrigger>
                    </div>
                  </div>
                  
                  <CollapsibleContent>
                    <div className="absolute top-full left-0 right-0 z-50 border border-[#e0e0e0] rounded-lg bg-white shadow-lg mt-1">
                      <div className="bg-[#fafbfc] p-4 space-y-1 max-h-[300px] overflow-y-auto">
                        {specs.map((specName) => (
                          <div 
                            key={specName} 
                            className="flex items-center gap-3 py-2 px-3 rounded-md hover:bg-white transition-colors duration-150"
                          >
                            <Checkbox
                              checked={categorySelectedSpecs.includes(specName)}
                              onCheckedChange={() => toggleSpec(category, specName)}
                              id={`${category}-${specName}`}
                            />
                            <label
                              htmlFor={`${category}-${specName}`}
                              className="text-[#1e1e1e] cursor-pointer flex-1"
                            >
                              {specName}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CollapsibleContent>
                </div>
              </Collapsible>
            );
          })}
            </div>
          </CollapsibleContent>
        </div>
      </Collapsible>

      {/* 5. Full Specifications */}
      <Collapsible open={isFullSpecsOpen} onOpenChange={setIsFullSpecsOpen}>
        <Card id="full-specs" className="shadow-sm">
          <CardHeader>
            <div className="mb-6">
              <div className="flex items-center gap-3">
                <div>
                  <h2 className="text-[#2c3968] mb-2">Full Specifications</h2>
                  <div className="h-1 w-20 bg-[#2c3968] rounded-full"></div>
                </div>
                <CollapsibleTrigger className="ml-2">
                  <ChevronDown
                    className={`w-6 h-6 text-[#2c3968] transition-transform ${
                      isFullSpecsOpen ? "rotate-180" : ""
                    }`}
                  />
                </CollapsibleTrigger>
              </div>
            </div>
          </CardHeader>
          <CollapsibleContent>
            <CardContent>
          {Object.values(selectedSpecs).every(specs => specs.length === 0) ? (
            <div className="text-center py-12">
              <p className="text-[#666]">No specifications selected. Please select at least one specification to view.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {Object.entries(phoneData.categories)
                .filter(([category]) => {
                  const categorySelectedSpecs = selectedSpecs[category] || [];
                  return categorySelectedSpecs.length > 0;
                })
                .map(([category, specs], categoryIdx) => {
                  const categorySelectedSpecs = selectedSpecs[category] || [];
                  const filteredSpecs = Object.entries(specs).filter(([key]) => 
                    categorySelectedSpecs.includes(key)
                  );
                  
                  if (filteredSpecs.length === 0) return null;
                  
                  return (
                    <div key={category}>
                      {/* Category Header */}
                      <div id={`spec-${category}`} className="bg-gradient-to-r from-[#2c3968]/5 to-transparent border-l-4 border-[#2c3968] px-6 py-4 -mx-6 mb-6">
                        <h3 className="text-2xl text-[#2c3968] capitalize font-medium">{category}</h3>
                      </div>
                    
                      {/* Specifications List */}
                      <div className="space-y-4">
                        {filteredSpecs.map(([key, value], idx) => (
                          <div key={idx}>
                            <div className="grid md:grid-cols-3 gap-4 py-3">
                              <div className="md:col-span-1">
                                <div className="flex items-center gap-2">
                                  <p className="text-[#666]">{key}</p>
                                  {specTooltips[key] && (
                                    <TooltipProvider delayDuration={200}>
                                      <Tooltip>
                                        <TooltipTrigger asChild>
                                          <button 
                                            className="w-4 h-4 rounded-full bg-[#f5f7fa] hover:bg-[#2c3968]/10 flex items-center justify-center transition-colors duration-200 flex-shrink-0"
                                            type="button"
                                          >
                                            <HelpCircle className="w-3 h-3 text-[#2c3968]" />
                                          </button>
                                        </TooltipTrigger>
                                        <TooltipContent 
                                          side="right" 
                                          className="max-w-sm bg-white text-[#1e1e1e] border-2 border-[#2c3968]/20 shadow-xl px-4 py-3 rounded-xl"
                                          sideOffset={8}
                                        >
                                          <p className="text-sm leading-relaxed">{specTooltips[key]}</p>
                                        </TooltipContent>
                                      </Tooltip>
                                    </TooltipProvider>
                                  )}
                                </div>
                              </div>
                              <div className="md:col-span-2">
                                <p className="text-[#1e1e1e]">{value}</p>
                              </div>
                            </div>
                            {idx < filteredSpecs.length - 1 && (
                              <Separator className="bg-[#e0e0e0]" />
                            )}
                          </div>
                        ))}
                      </div>
                    
                      {/* Category Separator */}
                      {categoryIdx < Object.entries(phoneData.categories).filter(([category]) => {
                        const categorySelectedSpecs = selectedSpecs[category] || [];
                        return categorySelectedSpecs.length > 0;
                      }).length - 1 && (
                        <div className="mt-8" />
                      )}
                    </div>
                  );
                })}
            </div>
          )}
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      {/* 5. Carrier Compatibility */}
      <Collapsible open={isCarrierCompatOpen} onOpenChange={setIsCarrierCompatOpen}>
        <div id="carrier-compat" className="bg-white rounded-2xl shadow-sm p-8 mb-8 mt-8">
          <div className="mb-6">
            <div className="flex items-center gap-3">
              <div>
                <h2 className="text-[#2c3968] mb-2">Carrier Compatibility</h2>
                <div className="h-1 w-20 bg-[#2c3968] rounded-full"></div>
              </div>
              <CollapsibleTrigger className="ml-2">
                <ChevronDown
                  className={`w-6 h-6 text-[#2c3968] transition-transform ${
                    isCarrierCompatOpen ? "rotate-180" : ""
                  }`}
                />
              </CollapsibleTrigger>
            </div>
          </div>
          <CollapsibleContent>
            <div className="space-y-6">
              <p className="text-[#666]">
                Network support for {phoneData.name}
              </p>
              
              <div className="space-y-3">
                {phoneData.carrierCompatibility.map((carrier, idx) => (
                  <div
                    key={idx}
                    className="group flex items-center justify-between p-4 rounded-xl border border-[#e0e0e0] hover:border-[#2c3968]/20 bg-white hover:bg-gradient-to-r hover:from-[#f7f9fc] hover:to-white transition-all duration-200"
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        carrier.compatible 
                          ? "bg-green-50 text-green-600" 
                          : "bg-red-50 text-red-600"
                      }`}>
                        {carrier.compatible ? (
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2.5}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        ) : (
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2.5}
                              d="M6 18L18 6M6 6l12 12"
                            />
                          </svg>
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="text-[#1e1e1e]">{carrier.name}</p>
                        {carrier.notes && (
                          <p className="text-sm text-[#999] mt-0.5">{carrier.notes}</p>
                        )}
                      </div>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-xs ${
                      carrier.compatible
                        ? "bg-green-50 text-green-700"
                        : "bg-red-50 text-red-700"
                    }`}>
                      {carrier.compatible ? "Supported" : "Not Supported"}
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex items-start gap-3 p-4 bg-[#f7f9fc] rounded-xl border border-[#2c3968]/10">
                <div className="w-5 h-5 rounded-full bg-[#2c3968]/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <HelpCircle className="w-3 h-3 text-[#2c3968]" />
                </div>
                <p className="text-sm text-[#666]">
                  Compatibility may vary by model variant and region. Verify with your carrier before purchase.
                </p>
              </div>
            </div>
          </CollapsibleContent>
        </div>
      </Collapsible>

      {/* 6. Reviews Section */}
      <Collapsible open={isReviewsOpen} onOpenChange={setIsReviewsOpen}>
        <div id="reviews" ref={reviewsSectionRef} className="bg-white rounded-2xl shadow-sm p-8 mb-8 mt-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div>
                <h2 className="text-[#2c3968] mb-2">User Reviews</h2>
                <div className="h-1 w-20 bg-[#2c3968] rounded-full"></div>
              </div>
              <CollapsibleTrigger className="ml-2">
                <ChevronDown
                  className={`w-6 h-6 text-[#2c3968] transition-transform ${
                    isReviewsOpen ? "rotate-180" : ""
                  }`}
                />
              </CollapsibleTrigger>
            </div>
            {!showReviewForm && (
              <Button 
                className="bg-gradient-to-r from-[#2c3968] to-[#3d4b7f] hover:from-[#2c3968]/90 hover:to-[#3d4b7f]/90 shadow-md hover:shadow-lg transition-all duration-300 hover:scale-[1.02]"
                onClick={() => setShowReviewForm(true)}
              >
                <PenSquare className="w-4 h-4 mr-2" />
                Write a Review
              </Button>
            )}
          </div>
          <CollapsibleContent>
            {/* Rating Statistics */}
            <div className="mb-8 bg-gradient-to-br from-[#f7f9fc] to-white border-2 border-[#2c3968]/10 rounded-2xl p-8">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Overall Rating - Left Column */}
                <div className="lg:col-span-1 flex flex-col items-center justify-center bg-white rounded-xl p-6 shadow-sm border border-[#2c3968]/10">
                  <p className="text-sm text-[#666] mb-2">Overall Rating</p>
                  <div className="flex items-baseline gap-2 mb-3">
                    <span className="text-5xl text-[#2c3968]">{overallRating}</span>
                    <span className="text-xl text-[#666]">/5</span>
                  </div>
                  <div className="flex gap-1 mb-3">
                    {[...Array(5)].map((_, i) => {
                      const fillPercentage = Math.max(0, Math.min(1, overallRating - i));
                      return (
                        <PartialStar
                          key={i}
                          fillPercentage={fillPercentage}
                          fillColor="#2c3968"
                          strokeColor="#2c3968"
                          size={24}
                        />
                      );
                    })}
                  </div>
                  <p className="text-sm text-[#666]">Based on {ratingsCount} {ratingsCount === 1 ? 'review' : 'reviews'}</p>
                </div>

                {/* Category Ratings - Right Columns */}
                <div className="lg:col-span-2">
                  <p className="text-sm text-[#666] mb-4">Average Ratings by Category</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {(() => {
                      // Calculate average for each category
                      const categoryAverages = {
                        camera: phoneData.reviews.reduce((sum, r) => sum + (r.categoryRatings?.camera || 0), 0) / phoneData.reviews.length,
                        battery: phoneData.reviews.reduce((sum, r) => sum + (r.categoryRatings?.battery || 0), 0) / phoneData.reviews.length,
                        design: phoneData.reviews.reduce((sum, r) => sum + (r.categoryRatings?.design || 0), 0) / phoneData.reviews.length,
                        performance: phoneData.reviews.reduce((sum, r) => sum + (r.categoryRatings?.performance || 0), 0) / phoneData.reviews.length,
                        value: phoneData.reviews.reduce((sum, r) => sum + (r.categoryRatings?.value || 0), 0) / phoneData.reviews.length,
                      };

                      const categories = [
                        { name: 'Camera', key: 'camera', icon: Camera },
                        { name: 'Battery', key: 'battery', icon: Battery },
                        { name: 'Design', key: 'design', icon: Palette },
                        { name: 'Performance', key: 'performance', icon: Cpu },
                        { name: 'Value', key: 'value', icon: DollarSign },
                      ];

                      return categories.map((category) => {
                        const avg = categoryAverages[category.key as keyof typeof categoryAverages];
                        const percentage = (avg / 5) * 100;
                        
                        return (
                          <div key={category.key} className="bg-white rounded-lg p-4 border border-[#e0e0e0] hover:border-[#2c3968]/30 transition-colors">
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-2">
                                <category.icon className="w-4 h-4 text-[#2c3968]" />
                                <span className="text-sm text-[#1e1e1e]">{category.name}</span>
                              </div>
                              <span className="text-sm text-[#2c3968]">{avg.toFixed(1)}</span>
                            </div>
                            {/* Progress Bar */}
                            <div className="w-full bg-[#e0e0e0] rounded-full h-2 overflow-hidden">
                              <div 
                                className="h-full bg-gradient-to-r from-[#2c3968] to-[#2c3968]/80 rounded-full transition-all duration-500"
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                          </div>
                        );
                      });
                    })()}
                  </div>
                </div>
              </div>
            </div>

            {/* Review Form */}
            {showReviewForm && (
              <div className="bg-[#f7f7f7] border-2 border-[#2c3968] rounded-lg p-6 mb-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-[#2c3968]">Write Your Review</h3>
                    <p className="text-[#666]">Share your experience with the {phoneData.name}</p>
                  </div>
                  <button
                    onClick={handleCancelReview}
                    className="text-[#666] hover:text-[#2c3968] transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
                
                <div className="space-y-4">
                  {/* Name Input */}
                  <div className="space-y-2">
                    <Label htmlFor="name">Your Name</Label>
                    <Input
                      id="name"
                      placeholder="Enter your name"
                      value={newReview.userName}
                      onChange={(e) => setNewReview({ ...newReview, userName: e.target.value })}
                      className="bg-white"
                    />
                  </div>

                  {/* Category Ratings */}
                  <div className="space-y-4">
                    <div>
                      <Label>Rate by Category</Label>
                      <p className="text-sm text-[#666] mt-1">Your overall rating will be calculated from these categories</p>
                    </div>
                    
                    {/* Camera Rating */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label className="text-sm">Camera</Label>
                        <span className="text-sm text-[#2c3968]">
                          {newReview.categoryRatings.camera > 0 ? newReview.categoryRatings.camera : '-'}/5
                        </span>
                      </div>
                      <div className="flex gap-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onMouseEnter={() => setHoverCategoryRating({ ...hoverCategoryRating, camera: star })}
                            onMouseLeave={() => setHoverCategoryRating({ ...hoverCategoryRating, camera: 0 })}
                            onClick={() => setNewReview({ 
                              ...newReview, 
                              categoryRatings: { ...newReview.categoryRatings, camera: star }
                            })}
                            className="focus:outline-none"
                          >
                            <Star
                              className={`w-6 h-6 transition-colors ${
                                star <= (hoverCategoryRating.camera || newReview.categoryRatings.camera)
                                  ? 'fill-[#2c3968] text-[#2c3968]'
                                  : 'text-[#e0e0e0]'
                              }`}
                            />
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Battery Rating */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label className="text-sm">Battery Life</Label>
                        <span className="text-sm text-[#2c3968]">
                          {newReview.categoryRatings.battery > 0 ? newReview.categoryRatings.battery : '-'}/5
                        </span>
                      </div>
                      <div className="flex gap-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onMouseEnter={() => setHoverCategoryRating({ ...hoverCategoryRating, battery: star })}
                            onMouseLeave={() => setHoverCategoryRating({ ...hoverCategoryRating, battery: 0 })}
                            onClick={() => setNewReview({ 
                              ...newReview, 
                              categoryRatings: { ...newReview.categoryRatings, battery: star }
                            })}
                            className="focus:outline-none"
                          >
                            <Star
                              className={`w-6 h-6 transition-colors ${
                                star <= (hoverCategoryRating.battery || newReview.categoryRatings.battery)
                                  ? 'fill-[#2c3968] text-[#2c3968]'
                                  : 'text-[#e0e0e0]'
                              }`}
                            />
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Design Rating */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label className="text-sm">Design</Label>
                        <span className="text-sm text-[#2c3968]">
                          {newReview.categoryRatings.design > 0 ? newReview.categoryRatings.design : '-'}/5
                        </span>
                      </div>
                      <div className="flex gap-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onMouseEnter={() => setHoverCategoryRating({ ...hoverCategoryRating, design: star })}
                            onMouseLeave={() => setHoverCategoryRating({ ...hoverCategoryRating, design: 0 })}
                            onClick={() => setNewReview({ 
                              ...newReview, 
                              categoryRatings: { ...newReview.categoryRatings, design: star }
                            })}
                            className="focus:outline-none"
                          >
                            <Star
                              className={`w-6 h-6 transition-colors ${
                                star <= (hoverCategoryRating.design || newReview.categoryRatings.design)
                                  ? 'fill-[#2c3968] text-[#2c3968]'
                                  : 'text-[#e0e0e0]'
                              }`}
                            />
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Performance Rating */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label className="text-sm">Performance</Label>
                        <span className="text-sm text-[#2c3968]">
                          {newReview.categoryRatings.performance > 0 ? newReview.categoryRatings.performance : '-'}/5
                        </span>
                      </div>
                      <div className="flex gap-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onMouseEnter={() => setHoverCategoryRating({ ...hoverCategoryRating, performance: star })}
                            onMouseLeave={() => setHoverCategoryRating({ ...hoverCategoryRating, performance: 0 })}
                            onClick={() => setNewReview({ 
                              ...newReview, 
                              categoryRatings: { ...newReview.categoryRatings, performance: star }
                            })}
                            className="focus:outline-none"
                          >
                            <Star
                              className={`w-6 h-6 transition-colors ${
                                star <= (hoverCategoryRating.performance || newReview.categoryRatings.performance)
                                  ? 'fill-[#2c3968] text-[#2c3968]'
                                  : 'text-[#e0e0e0]'
                              }`}
                            />
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Value Rating */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label className="text-sm">Value</Label>
                        <span className="text-sm text-[#2c3968]">
                          {newReview.categoryRatings.value > 0 ? newReview.categoryRatings.value : '-'}/5
                        </span>
                      </div>
                      <div className="flex gap-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onMouseEnter={() => setHoverCategoryRating({ ...hoverCategoryRating, value: star })}
                            onMouseLeave={() => setHoverCategoryRating({ ...hoverCategoryRating, value: 0 })}
                            onClick={() => setNewReview({ 
                              ...newReview, 
                              categoryRatings: { ...newReview.categoryRatings, value: star }
                            })}
                            className="focus:outline-none"
                          >
                            <Star
                              className={`w-6 h-6 transition-colors ${
                                star <= (hoverCategoryRating.value || newReview.categoryRatings.value)
                                  ? 'fill-[#2c3968] text-[#2c3968]'
                                  : 'text-[#e0e0e0]'
                              }`}
                            />
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Overall Rating Display */}
                    {Object.values(newReview.categoryRatings).some(rating => rating > 0) && (
                      <div className="bg-white rounded-lg p-4 border-2 border-[#2c3968]/20">
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Overall Rating:</span>
                          <div className="flex items-center gap-2">
                            <div className="flex gap-0.5">
                              {(() => {
                                const avg = Object.values(newReview.categoryRatings).reduce((sum, r) => sum + r, 0) / 5;
                                return [...Array(5)].map((_, i) => {
                                  const fillPercentage = Math.max(0, Math.min(1, avg - i));
                                  return (
                                    <PartialStar
                                      key={i}
                                      fillPercentage={fillPercentage}
                                      fillColor="#2c3968"
                                      strokeColor="#2c3968"
                                      size={20}
                                    />
                                  );
                                });
                              })()}
                            </div>
                            <span className="text-[#2c3968]">
                              {(Object.values(newReview.categoryRatings).reduce((sum, r) => sum + r, 0) / 5).toFixed(1)}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Review Title */}
                  <div className="space-y-2">
                    <Label htmlFor="title">Review Title</Label>
                    <Input
                      id="title"
                      placeholder="Summarize your experience"
                      value={newReview.title}
                      onChange={(e) => setNewReview({ ...newReview, title: e.target.value })}
                      className="bg-white"
                    />
                  </div>

                  {/* Review Content */}
                  <div className="space-y-2">
                    <Label htmlFor="review">Your Review</Label>
                    <Textarea
                      id="review"
                      placeholder="Tell us about your experience with this phone..."
                      value={newReview.review}
                      onChange={(e) => setNewReview({ ...newReview, review: e.target.value })}
                      rows={6}
                      className="bg-white resize-y min-h-[150px]"
                    />
                  </div>

                  {/* Submit Button */}
                  <div className="flex justify-end gap-3 pt-4">
                    <Button
                      variant="outline"
                      onClick={handleCancelReview}
                    >
                      Cancel
                    </Button>
                    <Button
                      className="bg-[#2c3968] hover:bg-[#2c3968]/90"
                      onClick={handleSubmitReview}
                      disabled={
                        !newReview.userName || 
                        !newReview.title || 
                        !newReview.review || 
                        Object.values(newReview.categoryRatings).some(rating => rating === 0)
                      }
                    >
                      Submit Review
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Existing Reviews */}
            <div className="space-y-6">
              {currentReviews.map((review) => {
                const userClick = helpfulClicks[review.id];
                const helpfulCount = review.helpful + (userClick === 'helpful' ? 1 : 0) - (helpfulClicks[review.id] === null && userClick !== 'helpful' ? 0 : 0);
                const notHelpfulCount = review.notHelpful + (userClick === 'notHelpful' ? 1 : 0);
                
                // Get user initials for avatar
                const getInitials = (name: string) => {
                  return name
                    .split(' ')
                    .map(n => n[0])
                    .join('')
                    .toUpperCase()
                    .slice(0, 2);
                };
                
                return (
                  <div 
                    key={review.id} 
                    className="border border-[#e0e0e0] rounded-xl p-6 hover:border-[#2c3968]/20 hover:shadow-md transition-all duration-200 bg-white"
                  >
                    {/* Review Header */}
                    <div className="flex items-start gap-4 mb-4">
                      {/* Avatar */}
                      <Avatar className="w-12 h-12 border-2 border-[#2c3968]/10">
                        <AvatarFallback className="bg-gradient-to-br from-[#2c3968] to-[#2c3968]/80 text-white">
                          {getInitials(review.userName)}
                        </AvatarFallback>
                      </Avatar>
                      
                      {/* User Info and Rating */}
                      <div className="flex-1">
                        <div className="flex items-start justify-between gap-4 mb-2">
                          <div>
                            <p className="text-[#2c3968] mb-1">{review.userName}</p>
                            <p className="text-sm text-[#666]">{review.date}</p>
                          </div>
                          
                          {/* Rating Stars */}
                          <div className="flex items-center gap-2 bg-[#f7f9fc] px-3 py-2 rounded-lg">
                            <div className="flex gap-0.5">
                              {(() => {
                                // Calculate average rating from category ratings
                                const avgRating = review.categoryRatings 
                                  ? (review.categoryRatings.camera + review.categoryRatings.battery + 
                                     review.categoryRatings.design + review.categoryRatings.performance + 
                                     review.categoryRatings.value) / 5
                                  : review.rating;
                                
                                return [...Array(5)].map((_, i) => {
                                  const fillPercentage = Math.max(0, Math.min(1, avgRating - i));
                                  return (
                                    <PartialStar
                                      key={i}
                                      fillPercentage={fillPercentage}
                                      fillColor="#2c3968"
                                      strokeColor="#2c3968"
                                      size={16}
                                    />
                                  );
                                });
                              })()}
                            </div>
                            <span className="text-sm text-[#2c3968]">
                              {review.categoryRatings 
                                ? ((review.categoryRatings.camera + review.categoryRatings.battery + 
                                    review.categoryRatings.design + review.categoryRatings.performance + 
                                    review.categoryRatings.value) / 5).toFixed(1)
                                : review.rating}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Review Title */}
                    <h3 className="text-[#1e1e1e] mb-3 text-lg">{review.title}</h3>

                    {/* Review Content */}
                    <p className="text-[#666] mb-5 leading-relaxed">{review.review}</p>

                    {/* Category Ratings Dropdown */}
                    {review.categoryRatings && (
                      <div className="mb-4">
                        <button
                          onClick={() => setExpandedCategoryRatings(prev => ({
                            ...prev,
                            [review.id]: !prev[review.id]
                          }))}
                          className="flex items-center gap-2 text-sm text-[#2c3968] hover:text-[#2c3968]/80 transition-colors"
                        >
                          <ChevronDown 
                            className={`w-4 h-4 transition-transform ${
                              expandedCategoryRatings[review.id] ? 'rotate-180' : ''
                            }`}
                          />
                          <span>View detailed ratings</span>
                        </button>
                        
                        {expandedCategoryRatings[review.id] && (
                          <div className="mt-3 bg-white border-2 border-[#2c3968]/10 rounded-xl p-5 shadow-sm">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {/* Camera */}
                              <div className="flex items-center justify-between p-3 bg-[#f7f9fc] rounded-lg hover:bg-[#eef2f9] transition-colors">
                                <div className="flex items-center gap-2">
                                  <Camera className="w-4 h-4 text-[#2c3968]" />
                                  <span className="text-sm text-[#1e1e1e]">Camera</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <div className="flex gap-0.5">
                                    {[...Array(5)].map((_, i) => {
                                      const fillPercentage = Math.max(0, Math.min(1, review.categoryRatings.camera - i));
                                      return (
                                        <PartialStar
                                          key={i}
                                          fillPercentage={fillPercentage}
                                          fillColor="#2c3968"
                                          strokeColor="#2c3968"
                                          size={14}
                                        />
                                      );
                                    })}
                                  </div>
                                  <span className="text-sm text-[#2c3968] min-w-[20px] text-right">{review.categoryRatings.camera}</span>
                                </div>
                              </div>

                              {/* Battery */}
                              <div className="flex items-center justify-between p-3 bg-[#f7f9fc] rounded-lg hover:bg-[#eef2f9] transition-colors">
                                <div className="flex items-center gap-2">
                                  <Battery className="w-4 h-4 text-[#2c3968]" />
                                  <span className="text-sm text-[#1e1e1e]">Battery</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <div className="flex gap-0.5">
                                    {[...Array(5)].map((_, i) => {
                                      const fillPercentage = Math.max(0, Math.min(1, review.categoryRatings.battery - i));
                                      return (
                                        <PartialStar
                                          key={i}
                                          fillPercentage={fillPercentage}
                                          fillColor="#2c3968"
                                          strokeColor="#2c3968"
                                          size={14}
                                        />
                                      );
                                    })}
                                  </div>
                                  <span className="text-sm text-[#2c3968] min-w-[20px] text-right">{review.categoryRatings.battery}</span>
                                </div>
                              </div>

                              {/* Design */}
                              <div className="flex items-center justify-between p-3 bg-[#f7f9fc] rounded-lg hover:bg-[#eef2f9] transition-colors">
                                <div className="flex items-center gap-2">
                                  <Palette className="w-4 h-4 text-[#2c3968]" />
                                  <span className="text-sm text-[#1e1e1e]">Design</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <div className="flex gap-0.5">
                                    {[...Array(5)].map((_, i) => {
                                      const fillPercentage = Math.max(0, Math.min(1, review.categoryRatings.design - i));
                                      return (
                                        <PartialStar
                                          key={i}
                                          fillPercentage={fillPercentage}
                                          fillColor="#2c3968"
                                          strokeColor="#2c3968"
                                          size={14}
                                        />
                                      );
                                    })}
                                  </div>
                                  <span className="text-sm text-[#2c3968] min-w-[20px] text-right">{review.categoryRatings.design}</span>
                                </div>
                              </div>

                              {/* Performance */}
                              <div className="flex items-center justify-between p-3 bg-[#f7f9fc] rounded-lg hover:bg-[#eef2f9] transition-colors">
                                <div className="flex items-center gap-2">
                                  <Cpu className="w-4 h-4 text-[#2c3968]" />
                                  <span className="text-sm text-[#1e1e1e]">Performance</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <div className="flex gap-0.5">
                                    {[...Array(5)].map((_, i) => {
                                      const fillPercentage = Math.max(0, Math.min(1, review.categoryRatings.performance - i));
                                      return (
                                        <PartialStar
                                          key={i}
                                          fillPercentage={fillPercentage}
                                          fillColor="#2c3968"
                                          strokeColor="#2c3968"
                                          size={14}
                                        />
                                      );
                                    })}
                                  </div>
                                  <span className="text-sm text-[#2c3968] min-w-[20px] text-right">{review.categoryRatings.performance}</span>
                                </div>
                              </div>

                              {/* Value */}
                              <div className="flex items-center justify-between p-3 bg-[#f7f9fc] rounded-lg hover:bg-[#eef2f9] transition-colors md:col-span-2">
                                <div className="flex items-center gap-2">
                                  <DollarSign className="w-4 h-4 text-[#2c3968]" />
                                  <span className="text-sm text-[#1e1e1e]">Value</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <div className="flex gap-0.5">
                                    {[...Array(5)].map((_, i) => {
                                      const fillPercentage = Math.max(0, Math.min(1, review.categoryRatings.value - i));
                                      return (
                                        <PartialStar
                                          key={i}
                                          fillPercentage={fillPercentage}
                                          fillColor="#2c3968"
                                          strokeColor="#2c3968"
                                          size={14}
                                        />
                                      );
                                    })}
                                  </div>
                                  <span className="text-sm text-[#2c3968] min-w-[20px] text-right">{review.categoryRatings.value}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Separator */}
                    <Separator className="bg-[#e0e0e0] my-4" />

                    {/* Helpful Buttons */}
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-[#666]">Was this review helpful?</span>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleHelpfulClick(review.id, 'helpful')}
                          className={`flex items-center gap-2 rounded-lg transition-all duration-200 ${
                            userClick === 'helpful' 
                              ? 'bg-[#2c3968] text-white border-[#2c3968] hover:bg-[#2c3968]/90 hover:text-white' 
                              : 'hover:bg-[#f7f9fc] border-[#e0e0e0]'
                          }`}
                        >
                          <ThumbsUp className="w-4 h-4" />
                          <span>{helpfulCount}</span>
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleHelpfulClick(review.id, 'notHelpful')}
                          className={`flex items-center gap-2 rounded-lg transition-all duration-200 ${
                            userClick === 'notHelpful' 
                              ? 'bg-[#2c3968] text-white border-[#2c3968] hover:bg-[#2c3968]/90 hover:text-white' 
                              : 'hover:bg-[#f7f9fc] border-[#e0e0e0]'
                          }`}
                        >
                          <ThumbsDown className="w-4 h-4" />
                          <span>{notHelpfulCount}</span>
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-8 flex justify-center">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious 
                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                        className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                      />
                    </PaginationItem>
                    
                    {[...Array(totalPages)].map((_, index) => {
                      const pageNumber = index + 1;
                      
                      // Show first page, last page, current page, and pages around current page
                      if (
                        pageNumber === 1 ||
                        pageNumber === totalPages ||
                        (pageNumber >= currentPage - 1 && pageNumber <= currentPage + 1)
                      ) {
                        return (
                          <PaginationItem key={pageNumber}>
                            <PaginationLink
                              onClick={() => setCurrentPage(pageNumber)}
                              isActive={currentPage === pageNumber}
                              className="cursor-pointer"
                            >
                              {pageNumber}
                            </PaginationLink>
                          </PaginationItem>
                        );
                      } else if (
                        pageNumber === currentPage - 2 ||
                        pageNumber === currentPage + 2
                      ) {
                        return (
                          <PaginationItem key={pageNumber}>
                            <PaginationEllipsis />
                          </PaginationItem>
                        );
                      }
                      return null;
                    })}
                    
                    <PaginationItem>
                      <PaginationNext 
                        onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                        className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </CollapsibleContent>
        </div>
      </Collapsible>
    </div>

    {/* Recently Viewed Phones */}
    <div id="recently-viewed" className="max-w-[1200px] xl:max-w-[1400px] 2xl:max-w-[1600px] mx-auto">
      <RecentlyViewedPhones 
        currentPhone={phoneData.id}
        onNavigate={(phoneId) => navigate(`/phones/${phoneId}`)}
        recentlyViewedPhones={recentlyViewedPhones}
      />
    </div>

    {/* Comparison Cart */}
    <ComparisonCart
      phones={comparisonPhones}
      onRemovePhone={handleRemoveFromComparison}
      onCompare={handleCompare}
      onClose={handleCloseComparisonCart}
      isMinimized={isCartMinimized}
      onMinimizedChange={setIsCartMinimized}
    />
    
    {/* Toaster with dynamic positioning */}
    <Toaster 
      position="bottom-right" 
      expand={false} 
      richColors
      toastOptions={{
        style: {
          marginBottom: comparisonPhones.length > 0 
            ? (isCartMinimized 
                ? '72px' 
                : (comparisonPhones.length === 3 ? '420px' : '442px'))
            : '24px',
          padding: '16px',
          borderRadius: '12px',
          fontSize: '14px',
          border: '1px solid #e0e0e0',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
        },
        classNames: {
          title: 'font-medium',
          description: 'text-sm opacity-80',
        },
      }}
    />
    </>
  );
}
