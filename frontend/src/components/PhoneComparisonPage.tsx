import React, { useState, useMemo, useEffect } from "react";
import { X, ArrowLeft, Plus, ChevronDown, Monitor, Cpu, BarChart3, Camera, Battery, Palette, Wifi, Mic, Radio, Smartphone, HelpCircle, Signal, Share2, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "./ui/button";
import { phonesData, PhoneData } from "../data/phoneData";
import { PartialStar } from "./PartialStar";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "./ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Checkbox } from "./ui/checkbox";
import { Badge } from "./ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "./ui/collapsible";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip";
import SpecTableOfContents from "./SpecTableOfContents";
import RecentlyViewedPhones from "./RecentlyViewedPhones";
import { toast } from "sonner@2.0.3";
import { useParams, useNavigate } from "react-router-dom";

// Category icons mapping
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
  'carrier-compatibility': { icon: Signal },
};

// Tooltips for important/confusing specifications
const specTooltips: Record<string, string> = {
  "Refresh Rate": "How many times per second the screen updates. Higher rates (120Hz) make scrolling and animations smoother than standard 60Hz displays.",
  "Peak Brightness": "The maximum brightness level the screen can reach, measured in nits. Higher values mean better visibility in direct sunlight.",
  "Chipset": "The main processor that powers the phone. Think of it as the 'brain' that handles all computing tasks and determines overall performance.",
  "CPU": "Central Processing Unit - the main processor core architecture and clock speed. Determines how fast your phone can execute tasks and run applications.",
  "GPU": "Graphics Processing Unit - handles graphics rendering for games and visual effects. Better GPUs mean smoother gaming and better visual performance.",
  "RAM": "Random Access Memory - temporary storage for running apps. More RAM allows you to run more apps simultaneously without slowdown.",
  "AnTuTu Score": "A benchmark score measuring overall phone performance. Higher scores indicate faster, more powerful devices. Scores above 1 million are considered flagship-level.",
  "Geekbench Score": "Measures CPU performance in real-world tasks. Single-core scores show performance for everyday tasks, multi-core shows performance under heavy load.",
  "Aperture": "The opening that lets light into the camera. Lower f-numbers (like f/1.7) mean wider openings, allowing more light for better low-light photos.",
  "Optical Zoom": "True zoom using physical lenses, maintaining image quality. Digital zoom just crops and enlarges, reducing quality.",
  "OIS": "Optical Image Stabilization - physically stabilizes the camera to reduce blur from hand shake, crucial for sharp photos and stable videos.",
  "IP68 Rating": "Water and dust resistance rating. IP68 means dust-tight and can survive submersion in water up to 1.5 meters for 30 minutes.",
  "Wireless Charging": "Charges your phone by placing it on a charging pad without cables. Convenient but typically slower than wired charging.",
  "NFC": "Near Field Communication - enables contactless payments (like Samsung Pay) and quick pairing with compatible devices by tapping.",
  "Wi-Fi 6E": "Latest Wi-Fi standard offering faster speeds and less interference than older Wi-Fi versions. Requires a compatible router to take full advantage.",
  "5G Bands": "The specific 5G frequencies your phone supports. More bands mean better 5G connectivity in more locations worldwide.",
  "SAR Value": "Specific Absorption Rate - measures radio frequency energy absorbed by the body. Lower values mean less radiation exposure.",
};

interface PhoneComparisonPageProps {
  phoneIds: string[];
  onRemovePhone: (phoneId: string) => void;

  //refactor? unneeded even?
  // onBackToSpecs: () => void;
  // onBackToSpecs: (phoneId: string) => void;
  onAddPhone?: (phoneId: string) => void;
  onNavigate?: (phoneId: string) => void;
  recentlyViewedPhones?: string[];
}

export default function PhoneComparisonPage({
  phoneIds,
  onRemovePhone,
  
  //unneeded?
  // onBackToSpecs,
  onAddPhone,
  onNavigate,
  recentlyViewedPhones,
}: PhoneComparisonPageProps) {
  // Routing
  const navigate = useNavigate();

  const [stickyHeader, setStickyHeader] = useState(false);
  const [searchOpenIndex, setSearchOpenIndex] = useState<number | null>(null);
  const [openCategories, setOpenCategories] = useState<Record<string, boolean>>({});
  const [selectedSpecs, setSelectedSpecs] = useState<Record<string, string[]>>({});
  const [filterVisible, setFilterVisible] = useState(false); // Hidden by default for mobile

  // Show filter by default on larger screens
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) { // lg breakpoint
        setFilterVisible(true);
      } else {
        setFilterVisible(false);
      }
    };
    
    handleResize(); // Set initial state
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Handle share comparison
  const handleShareComparison = () => {
    if (phones.length === 0) {
      toast.error("Add phones to share a comparison");
      return;
    }

    const params = new URLSearchParams();
    params.set('compare', phoneIds.join(','));
    const shareUrl = `${window.location.origin}${window.location.pathname}?${params.toString()}`;

    navigator.clipboard.writeText(shareUrl).then(() => {
      toast.success("Comparison link copied to clipboard!");
    }).catch(() => {
      toast.error("Failed to copy link");
    });
  };

  // Get phone data for all selected phones
  const phones = useMemo(() => {
    return phoneIds
      .map((id) => phonesData[id])
      .filter((phone): phone is PhoneData => phone !== undefined);
  }, [phoneIds]);

  // Calculate average ratings for each phone
  const phoneRatings = useMemo(() => {
    return phones.map((phone) => {
      const reviews = phone.reviews;
      if (reviews.length === 0) return { overall: 0, count: 0 };

      const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
      return {
        overall: totalRating / reviews.length,
        count: reviews.length,
      };
    });
  }, [phones]);

  // Get all unique specification categories
  const allCategories = useMemo(() => {
    const categoriesSet = new Set<string>();
    phones.forEach((phone) => {
      Object.keys(phone.categories).forEach((cat) => categoriesSet.add(cat));
    });
    // Add carrier compatibility as a separate category only if there are phones
    if (phones.length > 0) {
      categoriesSet.add('carrier-compatibility');
    }
    return Array.from(categoriesSet);
  }, [phones]);

  // Handle scroll for sticky header
  useEffect(() => {
    const handleScroll = () => {
      setStickyHeader(window.scrollY > 300);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Calculate the minimum number of slots to show
  const minSlots = 3;
  const emptySlots = Math.max(minSlots - phones.length, 0);

  // Initialize and reset filters when phones change
  useEffect(() => {
    if (phones.length > 0) {
      const newSelectedSpecs: Record<string, string[]> = {};
      allCategories.forEach(category => {
        const specs = new Set<string>();
        if (category === 'carrier-compatibility') {
          // Handle carrier compatibility separately
          phones.forEach((phone) => {
            phone.carrierCompatibility?.forEach(carrier => {
              specs.add(carrier.name);
            });
          });
        } else {
          phones.forEach((phone) => {
            if (phone.categories[category]) {
              Object.keys(phone.categories[category]).forEach((key) => specs.add(key));
            }
          });
        }
        newSelectedSpecs[category] = Array.from(specs);
      });
      setSelectedSpecs(newSelectedSpecs);
    }
  }, [phones.length, allCategories.length]);

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
    allCategories.forEach(category => {
      const specs = new Set<string>();
      if (category === 'carrier-compatibility') {
        // Handle carrier compatibility separately
        phones.forEach((phone) => {
          phone.carrierCompatibility?.forEach(carrier => {
            specs.add(carrier.name);
          });
        });
      } else {
        phones.forEach((phone) => {
          if (phone.categories[category]) {
            Object.keys(phone.categories[category]).forEach((key) => specs.add(key));
          }
        });
      }
      allSpecs[category] = Array.from(specs);
    });
    setSelectedSpecs(allSpecs);
  };

  const clearAllSpecs = () => {
    const emptySpecs: Record<string, string[]> = {};
    allCategories.forEach(category => {
      emptySpecs[category] = [];
    });
    setSelectedSpecs(emptySpecs);
  };

  const isCategoryFullySelected = (category: string) => {
    const allSpecsSet = new Set<string>();
    if (category === 'carrier-compatibility') {
      phones.forEach((phone) => {
        phone.carrierCompatibility?.forEach(carrier => {
          allSpecsSet.add(carrier.name);
        });
      });
    } else {
      phones.forEach((phone) => {
        if (phone.categories[category]) {
          Object.keys(phone.categories[category]).forEach((key) => allSpecsSet.add(key));
        }
      });
    }
    const allSpecs = Array.from(allSpecsSet);
    const selected = selectedSpecs[category] || [];
    return allSpecs.length === selected.length && allSpecs.length > 0;
  };

  const isCategoryPartiallySelected = (category: string) => {
    const selected = selectedSpecs[category] || [];
    return selected.length > 0 && !isCategoryFullySelected(category);
  };

  const toggleAllCategorySpecs = (category: string) => {
    const allSpecsSet = new Set<string>();
    if (category === 'carrier-compatibility') {
      phones.forEach((phone) => {
        phone.carrierCompatibility?.forEach(carrier => {
          allSpecsSet.add(carrier.name);
        });
      });
    } else {
      phones.forEach((phone) => {
        if (phone.categories[category]) {
          Object.keys(phone.categories[category]).forEach((key) => allSpecsSet.add(key));
        }
      });
    }
    const allSpecs = Array.from(allSpecsSet);
    const isFullySelected = isCategoryFullySelected(category);
    setSelectedSpecs(prev => ({
      ...prev,
      [category]: isFullySelected ? [] : allSpecs
    }));
  };

  return (
    <div className="max-w-[1600px] 2xl:max-w-[1800px] mx-auto px-3 sm:px-6 py-4 sm:py-8">
      <div className="flex gap-3 lg:gap-6 relative">
        {/* Left Sidebar - Filter */}
        <div 
          className={`shrink-0 transition-all duration-300 ease-in-out ${
            filterVisible ? 'w-[280px] sm:w-[340px] opacity-100' : 'w-0 opacity-0'
          } ${filterVisible ? 'fixed lg:relative top-0 left-0 h-full lg:h-auto z-[60] lg:z-auto' : ''}`}
        >
          {/* Mobile Overlay */}
          {filterVisible && (
            <div 
              className="fixed inset-0 bg-black/50 lg:hidden z-[59]"
              onClick={() => setFilterVisible(false)}
            />
          )}
          <div className={`sticky top-24 ${filterVisible ? '' : 'invisible'} ${filterVisible ? 'z-[60] lg:z-auto' : ''}`}>
            <div className="bg-white rounded-2xl shadow-sm p-4 sm:p-6 h-screen lg:h-auto overflow-y-auto lg:overflow-visible">
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-[#2c3968] text-lg sm:text-xl font-semibold">Specification Filter</h2>
                  <button
                    onClick={() => setFilterVisible(false)}
                    className="text-[#2c3968] hover:bg-[#2c3968]/10 rounded-lg p-2 transition-colors"
                    title="Hide filter"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                </div>
                <div className="h-1 w-20 bg-[#2c3968] rounded-full mb-4"></div>
                <div className="flex gap-2 text-sm">
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

              <div className="space-y-2 lg:max-h-[calc(100vh-250px)] lg:overflow-y-auto">
                {allCategories.map((category) => {
                  const allSpecsSet = new Set<string>();
                  if (category === 'carrier-compatibility') {
                    phones.forEach((phone) => {
                      phone.carrierCompatibility?.forEach(carrier => {
                        allSpecsSet.add(carrier.name);
                      });
                    });
                  } else {
                    phones.forEach((phone) => {
                      if (phone.categories[category]) {
                        Object.keys(phone.categories[category]).forEach((key) => allSpecsSet.add(key));
                      }
                    });
                  }
                  const specs = Array.from(allSpecsSet);
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
                      <div className="border border-[#e0e0e0] rounded-lg hover:border-[#2c3968]/20 transition-all duration-200 bg-white">
                        <div className="flex items-center justify-between p-3 cursor-pointer hover:bg-[#f7f9fc] transition-colors duration-200">
                          <div className="flex items-center gap-2 flex-1">
                            <div className="w-8 h-8 rounded-lg bg-[#f5f7fa] flex items-center justify-center shrink-0">
                              <CategoryIcon className="w-4 h-4 text-[#2c3968]" />
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <CollapsibleTrigger className="flex items-center gap-2 text-left w-full">
                                <span className="capitalize text-[#2c3968] text-sm truncate">{category}</span>
                                {(isFullySelected || isPartiallySelected) && (
                                  <Badge 
                                    variant="secondary" 
                                    className="text-xs px-1.5 py-0 bg-[#2c3968]/10 text-[#2c3968] border border-[#2c3968]/20 shrink-0"
                                  >
                                    {categorySelectedSpecs.length}/{specs.length}
                                  </Badge>
                                )}
                              </CollapsibleTrigger>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2 shrink-0">
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
                                className={`w-4 h-4 transition-all duration-200 ${
                                  openCategories[category] ? "rotate-180 text-[#2c3968]" : "text-[#999]"
                                }`}
                              />
                            </CollapsibleTrigger>
                          </div>
                        </div>
                        
                        <CollapsibleContent>
                          <div className="border-t border-[#e0e0e0] bg-[#fafbfc] p-2 space-y-1 max-h-[200px] overflow-y-auto">
                            {specs.map((specName) => (
                              <div 
                                key={specName} 
                                className="flex items-center gap-2 py-1.5 px-2 rounded-md hover:bg-white transition-colors duration-150"
                              >
                                <Checkbox
                                  checked={categorySelectedSpecs.includes(specName)}
                                  onCheckedChange={() => toggleSpec(category, specName)}
                                  id={`${category}-${specName}`}
                                />
                                <label
                                  htmlFor={`${category}-${specName}`}
                                  className="text-[#1e1e1e] text-sm cursor-pointer flex-1"
                                >
                                  {specName}
                                </label>
                              </div>
                            ))}
                          </div>
                        </CollapsibleContent>
                      </div>
                    </Collapsible>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Right Content - Comparison Table */}
        <div className="flex-1 min-w-0">
      {/* Sticky Header */}
      <div
        className={`fixed top-0 left-0 right-0 bg-gradient-to-r from-white via-[#f7f9fc] to-white backdrop-blur-xl border-b-2 border-[#2c3968]/20 shadow-xl z-50 transition-all duration-300 ${
          stickyHeader ? "translate-y-0 opacity-100" : "-translate-y-full opacity-0"
        }`}
      >
        <div className="max-w-[1600px] 2xl:max-w-[1800px] mx-auto px-6">
          <div className="flex items-center gap-4 py-4">
            <div className="flex items-center gap-2 shrink-0">
              <div className="w-1.5 h-6 bg-gradient-to-b from-[#2c3968] to-[#3d4b7d] rounded-full"></div>
              <span className="text-[#2c3968] font-bold text-base bg-gradient-to-r from-[#2c3968] to-[#3d4b7d] bg-clip-text text-transparent">Currently Comparing</span>
            </div>
            
            {/* Phone cards */}
            <div className="flex items-center gap-3 flex-wrap">
              {phones.map((phone) => (
                <div
                  key={phone.id}
                  className="flex items-center gap-2.5 px-4 py-2 bg-gradient-to-br from-white to-[#f7f9fc] rounded-xl border-2 border-[#2c3968]/20 shadow-md hover:shadow-lg hover:scale-105 transition-all duration-200"
                >
                  <div className="w-10 h-10 bg-white rounded-lg p-1 shadow-sm">
                    <img
                      src={phone.images.main}
                      alt={phone.name}
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <span className="text-sm font-medium text-[#2c3968] truncate max-w-[200px]">
                    {phone.manufacturer} {phone.name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Header */}
      <div id="comparison-header" className="mb-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#2c3968]/5 via-transparent to-[#2c3968]/5 rounded-3xl"></div>
        <div className="absolute top-0 left-0 w-40 h-40 bg-[#2c3968]/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-40 h-40 bg-[#2c3968]/5 rounded-full blur-3xl"></div>
        <div className="relative bg-gradient-to-br from-white/80 to-white/40 backdrop-blur-sm border-2 border-[#2c3968]/10 rounded-3xl p-10 shadow-lg">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-3 mb-6">
              <div className="w-2 h-2 rounded-full bg-[#2c3968] animate-pulse"></div>
              <span className="text-sm uppercase tracking-wider text-[#2c3968]/70 font-medium">Side-by-Side Analysis</span>
              <div className="w-2 h-2 rounded-full bg-[#2c3968] animate-pulse"></div>
            </div>
            <h1 className="text-5xl text-[#2c3968] mb-4 font-bold tracking-tight">
              Phone Comparison
            </h1>
            <div className="h-1.5 w-32 bg-gradient-to-r from-transparent via-[#2c3968] to-transparent rounded-full mx-auto mb-6"></div>
            <p className="text-lg text-[#666] leading-relaxed mb-6">
              {phones.length === 0 
                ? "Add phones to start comparing specifications, features, and ratings side by side"
                : `Comparing ${phones.length} ${phones.length === 1 ? 'phone' : 'phones'} • Detailed specifications, features, and ratings at a glance`
              }
            </p>
            {phones.length > 0 && (
              <Button
                onClick={handleShareComparison}
                className="bg-[#2c3968] hover:bg-[#1f2747] text-white px-6 py-2 rounded-lg transition-colors duration-200 inline-flex items-center gap-2"
              >
                <Share2 className="w-4 h-4" />
                Share Comparison
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Show Filter Button (when hidden) */}
      {!filterVisible && (
        <div className="fixed left-0 top-1/2 -translate-y-1/2 z-50">
          <button
            onClick={() => setFilterVisible(true)}
            className="bg-[#2c3968] hover:bg-[#1f2747] text-white rounded-r-lg p-3 shadow-lg transition-all duration-200 flex items-center gap-2"
            title="Show filter"
          >
            <ChevronRight className="w-5 h-5" />
            <span className="text-sm font-medium whitespace-nowrap">Filters</span>
          </button>
        </div>
      )}

      {/* Comparison Table */}
      <div className="bg-white rounded-lg border border-[#e0e0e0] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-max" style={{ borderCollapse: 'separate', borderSpacing: 0 }}>
            <thead>
              <tr>
                <th className="w-[180px] p-0 bg-white sticky left-0 z-10"></th>
                {phones.map((phone, index) => (
                  <th 
                    key={phone.id} 
                    className="w-[340px] p-0 bg-white border-l border-[#e0e0e0] align-top"
                  >
                    <div className="p-6 relative">
                      <button
                        onClick={() => onRemovePhone(phone.id)}
                        className="absolute top-4 right-4 text-[#999] hover:text-red-500 transition-colors z-10"
                        title="Remove from comparison"
                      >
                        <X className="w-5 h-5" />
                      </button>
                      <div className="flex flex-col items-center pt-2">
                        <button
                          onClick={() => onNavigate?.(phone.id)}
                          className="w-32 h-32 mb-4 hover:opacity-75 transition-opacity cursor-pointer"
                          title={`View ${phone.manufacturer} ${phone.name} specs`}
                        >
                          <img
                            src={phone.images.main}
                            alt={phone.name}
                            className="w-full h-full object-contain"
                          />
                        </button>
                        <button
                          onClick={() => onNavigate?.(phone.id)}
                          className="text-center hover:underline transition-all cursor-pointer group"
                          title={`View ${phone.manufacturer} ${phone.name} specs`}
                        >
                          <h3 className="text-[#2c3968] dark:text-[#4a7cf6] mb-1 group-hover:text-[#1f2747] dark:group-hover:text-[#5b8df7]">
                            {phone.manufacturer}
                          </h3>
                          <p className="text-sm text-[#666] dark:text-[#a0a8b8] mb-2 group-hover:text-[#444] dark:group-hover:text-[#b8c0d0]">
                            {phone.name}
                          </p>
                        </button>
                        <Badge variant="secondary" className="bg-[#2c3968] dark:bg-[#4a7cf6] text-white hover:bg-[#2c3968]/90 dark:hover:bg-[#4a7cf6]/90 mb-2">
                          {phone.releaseDate}
                        </Badge>
                        <p className="text-[#2c3968] dark:text-[#4a7cf6] mb-3">{phone.price}</p>
                        
                        {/* Rating */}
                        <div className="flex items-center gap-2 mb-1">
                          <div className="flex gap-0.5">
                            {Array.from({ length: 5 }).map((_, i) => {
                              const rating = phoneRatings[phones.indexOf(phone)]?.overall || 0;
                              const fillPercentage = Math.max(0, Math.min(1, (rating - i)));
                              return (
                                <PartialStar
                                  key={i}
                                  fillPercentage={fillPercentage}
                                  className="w-4 h-4"
                                />
                              );
                            })}
                          </div>
                          <span className="text-sm text-[#666]">
                            {(phoneRatings[phones.indexOf(phone)]?.overall || 0).toFixed(1)}
                          </span>
                        </div>
                        <p className="text-xs text-[#999]">
                          ({phoneRatings[phones.indexOf(phone)]?.count || 0} reviews)
                        </p>
                      </div>
                    </div>
                  </th>
                ))}
                
                {/* Empty slots with search */}
                {emptySlots > 0 && Array.from({ length: emptySlots }).map((_, idx) => {
                  const availablePhones = Object.values(phonesData).filter(
                    phone => !phoneIds.includes(phone.id)
                  );
                  
                  return (
                    <th 
                      key={`empty-${idx}`} 
                      className="w-[340px] p-0 bg-white border-l border-[#e0e0e0] align-top"
                    >
                      <div className="p-6">
                        <div className="flex flex-col items-center justify-center min-h-[380px]">
                          <Popover open={searchOpenIndex === idx} onOpenChange={(open) => setSearchOpenIndex(open ? idx : null)}>
                            <PopoverTrigger asChild>
                              <button
                                className="w-full flex flex-col items-center justify-center gap-4 p-6 border-2 border-dashed border-[#e0e0e0] rounded-lg hover:border-[#2c3968] hover:bg-[#f7f9fc] transition-all group"
                              >
                                <div className="w-20 h-20 rounded-full bg-[#f0f0f0] flex items-center justify-center group-hover:bg-[#2c3968] transition-colors">
                                  <Plus className="w-10 h-10 text-[#ccc] group-hover:text-white transition-colors" />
                                </div>
                                <div className="text-center">
                                  <p className="text-[#2c3968] mb-1">Add Phone</p>
                                  <p className="text-xs text-[#999]">Search and compare</p>
                                </div>
                              </button>
                            </PopoverTrigger>
                            <PopoverContent 
                              className="w-[300px] p-0" 
                              align="center"
                              onOpenAutoFocus={(e) => e.preventDefault()}
                            >
                              <Command>
                                <CommandInput placeholder="Search phones..." />
                                <CommandList>
                                  <CommandEmpty>No phones found.</CommandEmpty>
                                  <CommandGroup>
                                    {availablePhones.map((phone) => (
                                      <CommandItem
                                        key={phone.id}
                                        onSelect={() => {
                                          if (onAddPhone) {
                                            onAddPhone(phone.id);
                                          }
                                          setSearchOpenIndex(null);
                                        }}
                                        className="cursor-pointer"
                                      >
                                        <div className="flex items-center gap-3 w-full">
                                          <img
                                            src={phone.images.main}
                                            alt={phone.name}
                                            className="w-10 h-10 object-contain shrink-0"
                                          />
                                          <div className="flex-1 min-w-0">
                                            <p className="text-sm text-[#2c3968] truncate">
                                              {phone.manufacturer} {phone.name}
                                            </p>
                                            <p className="text-xs text-[#666]">{phone.price}</p>
                                          </div>
                                          <Plus className="w-4 h-4 text-[#2c3968] shrink-0" />
                                        </div>
                                      </CommandItem>
                                    ))}
                                  </CommandGroup>
                                </CommandList>
                              </Command>
                            </PopoverContent>
                          </Popover>
                        </div>
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>

            {phones.length > 0 && (
              <tbody>
                {/* Quick Specs Section Header */}
                <tr id="quick-overview">
                  <td className="px-6 py-4 bg-gradient-to-r from-[#2c3968]/5 to-transparent border-l-4 border-[#2c3968] border-t-2 border-t-[#e0e0e0] sticky left-0 z-10">
                    <h4 className="text-[#2c3968]">Quick Overview</h4>
                  </td>
                  {phones.map((phone) => (
                    <td key={phone.id} className="px-6 py-4 bg-gradient-to-r from-[#2c3968]/5 to-transparent border-t-2 border-t-[#e0e0e0] border-l border-[#e0e0e0]"></td>
                  ))}
                  {emptySlots > 0 && Array.from({ length: emptySlots }).map((_, idx) => (
                    <td key={`empty-${idx}`} className="px-6 py-4 bg-gradient-to-r from-[#2c3968]/5 to-transparent border-t-2 border-t-[#e0e0e0] border-l border-[#e0e0e0]"></td>
                  ))}
                </tr>

                {/* Quick Specs Rows - Always visible */}
                {phones[0]?.quickSpecs.map((spec, idx) => (
                  <tr key={idx} className="group hover:bg-[#fafbfc] transition-colors">
                    <td className="px-6 py-3 bg-white border-t border-[#e0e0e0] sticky left-0 z-10 group-hover:bg-[#fafbfc]">
                      <div className="flex items-center gap-3">
                        <spec.icon className="w-4 h-4 text-[#2c3968] flex-shrink-0" />
                        <span className="text-sm text-[#666] break-words">{spec.label}</span>
                      </div>
                    </td>
                    {phones.map((phone) => {
                      const phoneSpec = phone.quickSpecs.find((s) => s.label === spec.label);
                      return (
                        <td 
                          key={phone.id} 
                          className="px-6 py-3 bg-white border-t border-[#e0e0e0] border-l border-[#e0e0e0] group-hover:bg-[#fafbfc]"
                        >
                          <span className="text-sm text-[#2c3968] break-words">
                            {phoneSpec?.value || "N/A"}
                          </span>
                        </td>
                      );
                    })}
                    {emptySlots > 0 && Array.from({ length: emptySlots }).map((_, idx) => (
                      <td key={`empty-${idx}`} className="px-6 py-3 bg-white border-t border-[#e0e0e0] border-l border-[#e0e0e0] group-hover:bg-[#fafbfc]">
                        <span className="text-sm text-[#999]">-</span>
                      </td>
                    ))}
                  </tr>
                ))}

                {/* Full Specifications by Category - Filtered */}
                {allCategories.map((category) => {
                  // Get all unique spec keys across all phones for this category
                  const allSpecKeys = new Set<string>();
                  phones.forEach((phone) => {
                    if (phone.categories[category]) {
                      Object.keys(phone.categories[category]).forEach((key) =>
                        allSpecKeys.add(key)
                      );
                    }
                  });
                  
                  // Filter based on selected specs
                  const categorySelectedSpecs = selectedSpecs[category] || [];
                  const filteredSpecKeys = Array.from(allSpecKeys).filter(key => 
                    categorySelectedSpecs.includes(key)
                  );

                  // Skip category if no specs are selected
                  if (filteredSpecKeys.length === 0) return null;

                  return (
                    <React.Fragment key={category}>
                      {/* Category Header */}
                      <tr id={`spec-${category}`}>
                        <td className="px-6 py-4 bg-gradient-to-r from-[#2c3968]/5 to-transparent border-l-4 border-[#2c3968] border-t-2 border-t-[#e0e0e0] sticky left-0 z-10">
                          <h4 className="text-[#2c3968] capitalize">
                            {category.replace(/([A-Z])/g, " $1").trim()}
                          </h4>
                        </td>
                        {phones.map((phone) => (
                          <td key={phone.id} className="px-6 py-4 bg-gradient-to-r from-[#2c3968]/5 to-transparent border-t-2 border-t-[#e0e0e0] border-l border-[#e0e0e0]"></td>
                        ))}
                        {emptySlots > 0 && Array.from({ length: emptySlots }).map((_, idx) => (
                          <td key={`empty-header-${idx}`} className="px-6 py-4 bg-gradient-to-r from-[#2c3968]/5 to-transparent border-t-2 border-t-[#e0e0e0] border-l border-[#e0e0e0]"></td>
                        ))}
                      </tr>

                      {/* Category Specs */}
                      {filteredSpecKeys.map((specKey, specIdx) => (
                        <tr key={`${category}-${specKey}`} className="group hover:bg-[#fafbfc] transition-colors">
                          <td className="px-6 py-3 bg-white border-t border-[#e0e0e0] sticky left-0 z-10 group-hover:bg-[#fafbfc]">
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-[#666] break-words">{specKey}</span>
                              {specTooltips[specKey] && (
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
                                      <p className="text-sm leading-relaxed">{specTooltips[specKey]}</p>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              )}
                            </div>
                          </td>
                          {phones.map((phone) => {
                            const value = phone.categories[category]?.[specKey];
                            return (
                              <td 
                                key={phone.id} 
                                className="px-6 py-3 bg-white border-t border-[#e0e0e0] border-l border-[#e0e0e0] group-hover:bg-[#fafbfc]"
                              >
                                <span className="text-sm text-[#2c3968] break-words">
                                  {value || "N/A"}
                                </span>
                              </td>
                            );
                          })}
                          {emptySlots > 0 && Array.from({ length: emptySlots }).map((_, idx) => (
                            <td key={`empty-spec-${idx}`} className="px-6 py-3 bg-white border-t border-[#e0e0e0] border-l border-[#e0e0e0] group-hover:bg-[#fafbfc]">
                              <span className="text-sm text-[#999]">-</span>
                            </td>
                          ))}
                        </tr>
                      ))}
                    </React.Fragment>
                  );
                })}
                {/* Carrier Compatibility Section */}
                {(() => {
                  // Get all unique carriers from all phones
                  const allCarriers = new Set<string>();
                  phones.forEach(phone => {
                    phone.carrierCompatibility?.forEach(carrier => {
                      allCarriers.add(carrier.name);
                    });
                  });
                  const carriers = Array.from(allCarriers).sort();
                  
                  // Filter carriers based on selectedSpecs
                  const selectedCarriers = selectedSpecs['carrier-compatibility'] || [];
                  const filteredCarriers = carriers.filter(carrier => 
                    selectedCarriers.includes(carrier)
                  );

                  // Skip section if no carriers are selected
                  if (filteredCarriers.length === 0) return null;

                  return (
                    <React.Fragment key="carrier-compatibility">
                      {/* Section Header */}
                      <tr id="spec-carrier-compatibility">
                        <td className="px-6 py-4 bg-gradient-to-r from-[#2c3968]/5 to-transparent border-l-4 border-[#2c3968] border-t-2 border-t-[#e0e0e0] sticky left-0 z-10">
                          <h4 className="text-[#2c3968]">Carrier Compatibility</h4>
                        </td>
                        {phones.map((phone) => (
                          <td key={phone.id} className="px-6 py-4 bg-gradient-to-r from-[#2c3968]/5 to-transparent border-t-2 border-t-[#e0e0e0] border-l border-[#e0e0e0]"></td>
                        ))}
                        {emptySlots > 0 && Array.from({ length: emptySlots }).map((_, idx) => (
                          <td key={`empty-header-carrier-${idx}`} className="px-6 py-4 bg-gradient-to-r from-[#2c3968]/5 to-transparent border-t-2 border-t-[#e0e0e0] border-l border-[#e0e0e0]"></td>
                        ))}
                      </tr>

                      {/* Carrier rows */}
                      {filteredCarriers.map((carrierName) => (
                        <tr key={`carrier-${carrierName}`} className="group hover:bg-[#fafbfc] transition-colors">
                          <td className="px-6 py-3 bg-white border-t border-[#e0e0e0] sticky left-0 z-10 group-hover:bg-[#fafbfc]">
                            <span className="text-sm text-[#666] break-words">{carrierName}</span>
                          </td>
                          {phones.map((phone) => {
                            const carrierInfo = phone.carrierCompatibility?.find(c => c.name === carrierName);
                            return (
                              <td 
                                key={phone.id} 
                                className="px-6 py-3 bg-white border-t border-[#e0e0e0] border-l border-[#e0e0e0] group-hover:bg-[#fafbfc]"
                              >
                                {carrierInfo ? (
                                  <div className="flex flex-col gap-1">
                                    <span className={`text-sm font-medium ${carrierInfo.compatible ? 'text-green-600' : 'text-red-600'}`}>
                                      {carrierInfo.compatible ? '✓ Compatible' : '✗ Not Compatible'}
                                    </span>
                                    {carrierInfo.notes && (
                                      <span className="text-xs text-[#999]">{carrierInfo.notes}</span>
                                    )}
                                  </div>
                                ) : (
                                  <span className="text-sm text-[#999]">N/A</span>
                                )}
                              </td>
                            );
                          })}
                          {emptySlots > 0 && Array.from({ length: emptySlots }).map((_, idx) => (
                            <td key={`empty-carrier-${idx}`} className="px-6 py-3 bg-white border-t border-[#e0e0e0] border-l border-[#e0e0e0] group-hover:bg-[#fafbfc]">
                              <span className="text-sm text-[#999]">-</span>
                            </td>
                          ))}
                        </tr>
                      ))}
                    </React.Fragment>
                  );
                })()}
              </tbody>
            )}
          </table>
        </div>
      </div>

      {/* Bottom margin for comparison cart */}
      <div className="h-24"></div>
        </div>
      </div>

      {/* Recently Viewed Phones */}
      {onNavigate && (
        <div id="recently-viewed">
          <RecentlyViewedPhones 
            currentPhone="" 

            //refactor?
            // onNavigate={onNavigate}
            onNavigate={(phoneId) => navigate(`/phones/${phoneId}`)}
            recentlyViewedPhones={recentlyViewedPhones}
          />
        </div>
      )}
      
      {/* Table of Contents */}
      <SpecTableOfContents specCategories={allCategories} mode="comparison" phoneCount={phones.length} />
    </div>
  );
}