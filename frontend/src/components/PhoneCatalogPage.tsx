import { Search, Grid3x3, List, ChevronDown, Plus, Check, Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";
import { PhoneCard } from "../types/phoneTypes";
import { getPhoneCardById, getPhonePage, getManufacturers } from "../api/phoneApi";
import ComparisonCart from "./ComparisonCart";
import RecentlyViewedPhones from "./RecentlyViewedPhones";
import { toast } from "sonner@2.0.3";
import { Badge } from "./ui/badge";

interface PhoneCatalogPageProps {
  onNavigate: (phoneId: string) => void;
  comparisonPhoneIds?: string[];
  onComparisonChange?: (phoneIds: string[]) => void;
  onNavigateToComparison?: (phoneIds: string[]) => void;
  recentlyViewedPhones?: string[];
}

// ------------------------------------------------------------
// | CONFIGURATION CONSTANTS
// ------------------------------------------------------------
const SEARCH_DELAY_LOADING_MS = 150; // The time until loading UI displays on search
const SEARCH_DEBOUNCE_MS = 300; // Time to wait after typing stops before sending search query to server

// ------------------------------------------------------------
// | PHONE CATALOG PAGE DEFINITION
// ------------------------------------------------------------
export default function PhoneCatalogPage({
  onNavigate,
  comparisonPhoneIds = [],
  onComparisonChange,
  onNavigateToComparison,
  recentlyViewedPhones = [],
}: PhoneCatalogPageProps) {
  // ------------------------------------------------------------
  // | HOOKS
  // ------------------------------------------------------------
  // --- Phone Data States ---
  const [allPhones, setAllPhones] = useState<PhoneCard[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // --- Pagination States ---
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [hasPrevPage, setHasPrevPage] = useState(false);
  const itemsPerPage = 24;

  // --- UI States ---
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sortBy, setSortBy] = useState<"name" | "price" | "release">("name");
  const [manufacturerFilter, setManufacturerFilter] = useState<string>("all");
  const [activeTab, setActiveTab] = useState<"catalog" | "hot" | "popular">("catalog");
  const [availableManufacturers, setAvailableManufacturers] = useState<string[]>([]);
  const [isCartMinimized, setIsCartMinimized] = useState(false);
  const [comparisonData, setComparisonData] = useState<PhoneCard[]>([]);

  // ------------------------------------------------------------
  // | DATA SYNCHRONIZATION
  // ------------------------------------------------------------

  /**
   * INITIAL COMPONENT MOUNT/REFRESH:
   * Signal: On catalog page component mount or refresh
   * Action: Fetches for all unique manufacturers in the database
   */
  useEffect(() => {
    const loadManufacturers = async () => {
      try {
        setAvailableManufacturers(await getManufacturers());
      } catch (error) {
        console.error("Failed to load manufacturers");
      }
    };
    loadManufacturers();
  }, []);

  /**
   * ON FILTER CHANGE CATALOG PAGE SYNC:
   * Signal: On search query, filter, sort, or active tab changes
   * Action: Resets current page to 1
   */
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, manufacturerFilter, sortBy, activeTab]);

  /**
   * PHONE CATALOG PAGE SYNC:
   * Signal: Catalog page mount or when currentPage value changes
   * Action: Fetches the phone catalog of the current page and
   * pagination metadata for pagination system on home page
   */
  useEffect(() => {
    let loadingTimer: ReturnType<typeof setTimeout>;
    let debounceTimer: ReturnType<typeof setTimeout>;

    const fetchPhones = async () => {
      // --- HOT PAGE AND POPULAR PAGE SHORT CIRCUIT ---
      if (activeTab !== "catalog") {
        // Showing no phones on those pages for now until we figure out how we display things there
        setAllPhones([]);
        setTotalItems(0);
        setLoading(false);
        return;
      }

      try {
        // Setting loading state only after certain duration has passed on backend fetching
        loadingTimer = setTimeout(() => setLoading(true), SEARCH_DELAY_LOADING_MS); // reduces UI flicker

        // Building options object to query DB for phones
        const options = {
          search: searchQuery,
          manufacturer: manufacturerFilter === "all" ? [] : [manufacturerFilter],
          sortBy: sortBy === "release" ? "newest" : sortBy === "price" ? "price_desc" : "name_asc",
        };
        const { phones, pagination } = await getPhonePage(currentPage, itemsPerPage, options);

        // Mounting phone card catalog page for use
        setAllPhones(phones);

        // Setting all pagination metadata values
        setTotalItems(pagination.totalItems);
        setTotalPages(pagination.totalPages);
        setHasNextPage(pagination.hasNextPage);
        setHasPrevPage(pagination.hasPrevPage);
        setError(null);

        // Scrolls to top when fresh mount of catalog page/refresh
        window.scrollTo({ top: 0, behavior: "smooth" });
      } catch (error) {
        setError("Failed to fetch phones");
      } finally {
        clearTimeout(loadingTimer);
        setLoading(false);
      }
    };

    // Add debounce time to delay the search until user finish typing
    debounceTimer = setTimeout(fetchPhones, SEARCH_DEBOUNCE_MS);

    // Clearing timers for next
    return () => {
      clearTimeout(debounceTimer);
      clearTimeout(loadingTimer);
    };
  }, [currentPage, searchQuery, manufacturerFilter, sortBy, activeTab]);

  /**
   * SYNC: Comparison Cart Refreshes
   * Signal: Component mount or change in number of phones in comparisonPhoneIds list
   * Action: Fetches phone details if IDs exist but local cache is empty
   */
  useEffect(() => {
    const syncComparisonCart = async () => {
      // Checks syncing is needed by comparing phone IDs passed by controller with cached comparison phone data
      const missingIds = comparisonPhoneIds.filter((id) => !comparisonData.find((phone) => phone.id === id));

      // Handles case if no missing IDs in comparisonData cache
      if (missingIds.length === 0) return;

      // Handles case if syncing needed of missing phones from comparisonData cache
      try {
        // Handles re-fetching phone cards that should be in comparison cart into the comparison data
        const promises = missingIds.map((id) => getPhoneCardById(id));
        const results = await Promise.all(promises);
        const newCards = results.filter((p): p is PhoneCard => p !== null);
        setComparisonData((prev) => {
          // Adding already existing cards in comparison data and the newly fetched cards into map
          const cardsForCompare = new Map();
          prev.forEach((phone) => cardsForCompare.set(phone.id, phone));
          newCards.forEach((phone) => cardsForCompare.set(phone.id, phone));
          return Array.from(cardsForCompare.values());
        });
      } catch (error) {
        console.error("Failed to sync comparison cart:", error);
      }
    };
    syncComparisonCart();
  }, [comparisonPhoneIds.length]);

  // ------------------------------------------------------------
  // | HOME PAGE LOGIC
  // ------------------------------------------------------------

  // Helper function to check if a phone was released within the past year
  const parsePhoneDate = (dateStr: string) => new Date(dateStr);
  const isWithinPastYear = (releaseDate: string) => {
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
    return parsePhoneDate(releaseDate) >= oneYearAgo;
  };

  // Get phones based on active tab
  const getPhonesForTab = () => {
    switch (activeTab) {
      case "hot":
        // Filter phones released within past year, sorted by release date
        return allPhones
          .filter((phone) => isWithinPastYear(phone.releaseDate))
          .sort((a, b) => {
            // // Sort by release date (newest first)
            // Better long-term solution would be to store dates in ISO format in database
            const dateA = new Date(a.releaseDate).getTime();
            const dateB = new Date(b.releaseDate).getTime();

            return dateB - dateA;
          });
      case "popular":
        // Empty for now
        return [];
      default:
        // Catalog - all phones
        return allPhones;
    }
  };

  const handleAddToComparison = (phoneId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const phone = allPhones.find((p) => p.id === phoneId);
    if (!phone) return;

    // Handles case if phone is already in comparison cart
    if (comparisonPhoneIds.includes(phoneId)) return;

    // Check if comparison cart is full (max 3 phones)
    if (comparisonPhoneIds.length >= 3) {
      toast.error("Comparison cart full", {
        description: "You can compare up to 3 phones at once. Remove a phone to add another.",
        duration: 3000,
      });
      return;
    }

    // Locally caching the phone data in the comparison cart into React state
    setComparisonData((prev) => [...prev, phone]);
    const newComparisonIds = [...comparisonPhoneIds, phoneId];
    onComparisonChange?.(newComparisonIds);

    toast.success("Added to comparison", {
      description: `${phone.name} is ready to compare`,
      duration: 3000,
    });
  };

  const isPhoneInComparison = (phoneId: string) => {
    return comparisonPhoneIds.includes(phoneId);
  };

  /**
   * Generates an array of page numbers for pagination UI
   *  The pattern is: [1, ..., current-1, current, current+1, ..., totalPages]
   * @returns An array containing numbers (or string - the "...") for page buttons
   */
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const pageRange = 2;

    // Iterates through all possible page values
    for (let i = 1; i <= totalPages; i++) {
      // Getting pages to show in pagination
      const isFirstPage = i === 1;
      const isLastPage = i === totalPages;

      // Getting the pages within window length of current page
      const isWithinWindow = i >= currentPage - pageRange && i <= currentPage + pageRange;

      // Determining which page number to push into list
      if (isFirstPage || isLastPage || isWithinWindow) {
        pages.push(i);
      } else if (pages[pages.length - 1] !== "...") {
        pages.push("..."); // Only pushes "..." if previous item is not "..." or the (first, last, current, or neighbors)
      }
    }
    return pages;
  };

  // ------------------------------------------------------------
  // | RENDER GUARDS
  // ------------------------------------------------------------
  // Handle loading and error views
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="animate-spin text-[#2c3968] dark:text-[#4a7cf6]" size={48} />
        <p className="text-[#666] dark:text-[#a0a8b8]">Fetching live catalog...</p>
      </div>
    );
  }

  // ------------------------------------------------------------
  // | UI SECTION
  // ------------------------------------------------------------
  return (
    <>
      <div className="max-w-[1400px] 2xl:max-w-[1600px] mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-[#2c3968] dark:text-[#4a7cf6] mb-2">Phone Catalog</h1>
          <p className="text-[#666] dark:text-[#a0a8b8] mb-6">Browse our collection of {totalItems} smartphones</p>

          {/* Tab Buttons */}
          <div className="flex gap-3 flex-wrap">
            <button
              onClick={() => setActiveTab("catalog")}
              className={`px-6 py-3 rounded-lg transition-all duration-200 ${
                activeTab === "catalog"
                  ? "bg-gradient-to-r from-[#2c3968] to-[#3d4b7d] dark:from-[#4a7cf6] dark:to-[#5b8df7] text-white shadow-lg"
                  : "bg-white dark:bg-[#161b26] text-[#1e1e1e] dark:text-white border border-[#e5e5e5] dark:border-[#2d3548] hover:border-[#2c3968] dark:hover:border-[#4a7cf6]"
              }`}
            >
              Catalog
            </button>
            <button
              onClick={() => setActiveTab("hot")}
              className={`px-6 py-3 rounded-lg transition-all duration-200 ${
                activeTab === "hot"
                  ? "bg-gradient-to-r from-[#2c3968] to-[#3d4b7d] dark:from-[#4a7cf6] dark:to-[#5b8df7] text-white shadow-lg"
                  : "bg-white dark:bg-[#161b26] text-[#1e1e1e] dark:text-white border border-[#e5e5e5] dark:border-[#2d3548] hover:border-[#2c3968] dark:hover:border-[#4a7cf6]"
              }`}
            >
              Hot
            </button>
            <button
              onClick={() => setActiveTab("popular")}
              className={`px-6 py-3 rounded-lg transition-all duration-200 ${
                activeTab === "popular"
                  ? "bg-gradient-to-r from-[#2c3968] to-[#3d4b7d] dark:from-[#4a7cf6] dark:to-[#5b8df7] text-white shadow-lg"
                  : "bg-white dark:bg-[#161b26] text-[#1e1e1e] dark:text-white border border-[#e5e5e5] dark:border-[#2d3548] hover:border-[#2c3968] dark:hover:border-[#4a7cf6]"
              }`}
            >
              Popular Compare
            </button>
          </div>
        </div>

        {/* Controls */}
        <div className="bg-white dark:bg-[#161b26] rounded-2xl shadow-sm border border-[#e5e5e5] dark:border-[#2d3548] p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
            {/* Search Bar */}
            <div className="relative flex-1 w-full lg:max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#999] dark:text-[#707070]" size={20} />
              <input
                type="text"
                placeholder="Search phones..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-lg border border-[#d9d9d9] dark:border-[#2d3548] bg-white dark:bg-[#1a1f2e] text-[#1e1e1e] dark:text-white placeholder:text-[#b3b3b3] dark:placeholder:text-[#707070] focus:border-[#2c3968] dark:focus:border-[#4a7cf6] focus:outline-none focus:ring-2 focus:ring-[#2c3968]/20 dark:focus:ring-[#4a7cf6]/20 transition-all"
              />
            </div>

            <div className="flex flex-wrap gap-3 items-center">
              {/* Manufacturer Filter */}
              <div className="relative">
                <select
                  value={manufacturerFilter}
                  onChange={(e) => setManufacturerFilter(e.target.value)}
                  className="appearance-none pl-4 pr-10 py-3 rounded-lg border border-[#d9d9d9] dark:border-[#2d3548] bg-white dark:bg-[#1a1f2e] text-[#1e1e1e] dark:text-white focus:border-[#2c3968] dark:focus:border-[#4a7cf6] focus:outline-none focus:ring-2 focus:ring-[#2c3968]/20 dark:focus:ring-[#4a7cf6]/20 transition-all cursor-pointer"
                >
                  <option value="all">All Brands</option>
                  {availableManufacturers.map((manufacturer) => (
                    <option key={manufacturer} value={manufacturer}>
                      {manufacturer}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#666] dark:text-[#a0a8b8] pointer-events-none"
                  size={20}
                />
              </div>

              {/* Sort By */}
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as "name" | "price" | "release")}
                  className="appearance-none pl-4 pr-10 py-3 rounded-lg border border-[#d9d9d9] dark:border-[#2d3548] bg-white dark:bg-[#1a1f2e] text-[#1e1e1e] dark:text-white focus:border-[#2c3968] dark:focus:border-[#4a7cf6] focus:outline-none focus:ring-2 focus:ring-[#2c3968]/20 dark:focus:ring-[#4a7cf6]/20 transition-all cursor-pointer"
                >
                  <option value="name">Sort: Name</option>
                  <option value="price">Sort: Price</option>
                  <option value="release">Sort: Newest</option>
                </select>
                <ChevronDown
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#666] dark:text-[#a0a8b8] pointer-events-none"
                  size={20}
                />
              </div>

              {/* View Mode Toggle */}
              <div className="flex gap-2 bg-[#f7f7f7] dark:bg-[#1a1f2e] rounded-lg p-1">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2 rounded-md transition-all ${
                    viewMode === "grid"
                      ? "bg-white dark:bg-[#252b3d] text-[#2c3968] dark:text-[#4a7cf6] shadow-sm"
                      : "text-[#666] dark:text-[#a0a8b8] hover:text-[#2c3968] dark:hover:text-[#4a7cf6]"
                  }`}
                >
                  <Grid3x3 size={20} />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-2 rounded-md transition-all ${
                    viewMode === "list"
                      ? "bg-white dark:bg-[#252b3d] text-[#2c3968] dark:text-[#4a7cf6] shadow-sm"
                      : "text-[#666] dark:text-[#a0a8b8] hover:text-[#2c3968] dark:hover:text-[#4a7cf6]"
                  }`}
                >
                  <List size={20} />
                </button>
              </div>
            </div>
          </div>

          {/* Active Filters */}
          {(searchQuery || manufacturerFilter !== "all") && (
            <div className="mt-4 pt-4 border-t border-[#e5e5e5] dark:border-[#2d3548]">
              <div className="flex flex-wrap gap-2 items-center">
                <span className="text-[#666] dark:text-[#a0a8b8]">Active filters:</span>
                {searchQuery && (
                  <span className="px-3 py-1 bg-[#2c3968]/10 dark:bg-[#4a7cf6]/10 text-[#2c3968] dark:text-[#4a7cf6] rounded-full">
                    Search: "{searchQuery}"
                  </span>
                )}
                {manufacturerFilter !== "all" && (
                  <span className="px-3 py-1 bg-[#2c3968]/10 dark:bg-[#4a7cf6]/10 text-[#2c3968] dark:text-[#4a7cf6] rounded-full">
                    Brand: {manufacturerFilter}
                  </span>
                )}
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setManufacturerFilter("all");
                  }}
                  className="text-[#666] dark:text-[#a0a8b8] hover:text-[#2c3968] dark:hover:text-[#4a7cf6] underline"
                >
                  Clear all
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Results Count */}
        <div className="mb-4">
          <p className="text-[#666] dark:text-[#a0a8b8]">
            Showing {allPhones.length} {allPhones.length === 1 ? "phone" : "phones"}
          </p>
        </div>

        {/* Phone Grid/List */}
        {allPhones.length > 0 ? (
          viewMode === "grid" ? (
            // GRID VIEW
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {allPhones.map((phone, index) => (
                <button
                  key={phone.id}
                  onClick={() => onNavigate(phone.id)}
                  className="bg-white dark:bg-[#161b26] rounded-2xl shadow-sm border border-[#e5e5e5] dark:border-[#2d3548] overflow-hidden hover:shadow-lg hover:scale-[1.02] transition-all duration-200 text-left group"
                >
                  {/* Phone Image */}
                  <div className="aspect-square bg-gradient-to-br from-[#f7f7f7] to-[#e5e5e5] dark:from-[#1a1f2e] dark:to-[#252b3d] flex items-center justify-center p-8">
                    <img
                      src={phone.images.main}
                      alt={phone.name}
                      loading={index < 4 ? "eager" : "lazy"} // Lazy loads the images for phones after first row, or not in view
                      fetchpriority={index < 4 ? "high" : "low"} // Images on first row have high priority to be downloaded first
                      className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-300"
                    />
                  </div>

                  {/* Phone Info */}
                  <div className="p-5">
                    <div className="mb-3">
                      <p className="text-[#999] dark:text-[#707070] mb-1">{phone.manufacturer}</p>
                      <h3 className="text-[#1e1e1e] dark:text-white mb-2">{phone.name}</h3>
                      <div className="flex items-center gap-2 mb-2">
                        <Badge
                          variant="secondary"
                          className="bg-[#2c3968] dark:bg-[#4a7cf6] text-white hover:bg-[#2c3968]/90 dark:hover:bg-[#4a7cf6]/90"
                        >
                          {phone.releaseDate}
                        </Badge>
                      </div>
                      <p className="text-[#2c3968] dark:text-[#4a7cf6]">{phone.price}</p>
                    </div>

                    <div className="space-y-1.5">
                      {phone.quickSpecs.slice(0, 3).map((spec, index) => (
                        <div key={index} className="flex items-center gap-2 text-[#666] dark:text-[#a0a8b8]">
                          <spec.icon size={16} className="shrink-0" />
                          <span className="text-[14px] truncate">{spec.value}</span>
                        </div>
                      ))}
                    </div>

                    <div className="mt-4 pt-4 border-t border-[#e5e5e5] dark:border-[#2d3548]">
                      {isPhoneInComparison(phone.id) ? (
                        <div className="flex items-center justify-center gap-2 text-[#10b981] dark:text-[#34d399]">
                          <Check size={16} />
                          <span className="text-[14px]">Already in Compare</span>
                        </div>
                      ) : (
                        <button
                          onClick={(e) => handleAddToComparison(phone.id, e)}
                          className="w-full py-2 px-3 bg-gradient-to-r from-[#2c3968] to-[#3d4b7d] dark:from-[#4a7cf6] dark:to-[#5b8df7] text-white rounded-lg hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2 group/btn hover:scale-105"
                        >
                          <Plus size={16} className="transition-transform group-hover/btn:rotate-90" />
                          <span className="text-[14px]">Add to Compare</span>
                        </button>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            // LIST VIEW
            <div className="space-y-4">
              {allPhones.map((phone, index) => (
                <button
                  key={phone.id}
                  onClick={() => onNavigate(phone.id)}
                  className="w-full bg-white dark:bg-[#161b26] rounded-2xl shadow-sm border border-[#e5e5e5] dark:border-[#2d3548] p-6 hover:shadow-lg hover:scale-[1.01] transition-all duration-200 text-left group"
                >
                  <div className="flex gap-6 items-center">
                    {/* Phone Image */}
                    <div className="w-32 h-32 bg-gradient-to-br from-[#f7f7f7] to-[#e5e5e5] dark:from-[#1a1f2e] dark:to-[#252b3d] rounded-xl flex items-center justify-center p-4 shrink-0">
                      <img
                        src={phone.images.main}
                        alt={phone.name}
                        loading={index < 4 ? "eager" : "lazy"} // Lazy loads the images for phones after first row, or not in view
                        fetchpriority={index < 4 ? "high" : "low"} // Images on first row have high priority to be downloaded first
                        className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-300"
                      />
                    </div>

                    {/* Phone Info */}
                    <div className="flex-1 min-w-0">
                      <div className="mb-3">
                        <p className="text-[#999] dark:text-[#707070] mb-1">{phone.manufacturer}</p>
                        <h3 className="text-[#1e1e1e] dark:text-white mb-2">{phone.name}</h3>
                        <div className="flex items-center gap-2 mb-2">
                          <Badge
                            variant="secondary"
                            className="bg-[#2c3968] dark:bg-[#4a7cf6] text-white hover:bg-[#2c3968]/90 dark:hover:bg-[#4a7cf6]/90"
                          >
                            {phone.releaseDate}
                          </Badge>
                        </div>
                        <p className="text-[#2c3968] dark:text-[#4a7cf6]">{phone.price}</p>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                        {phone.quickSpecs.map((spec, index) => (
                          <div key={index} className="flex items-start gap-2">
                            <spec.icon size={16} className="shrink-0 mt-0.5 text-[#666] dark:text-[#a0a8b8]" />
                            <div className="min-w-0">
                              <p className="text-[#999] dark:text-[#707070] text-[12px]">{spec.label}</p>
                              <p className="text-[#1e1e1e] dark:text-white text-[14px] truncate">{spec.value}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* View Button */}
                    <div className="hidden lg:block shrink-0">
                      {isPhoneInComparison(phone.id) ? (
                        <div className="flex items-center gap-2 px-6 py-3 bg-[#10b981]/10 dark:bg-[#34d399]/10 text-[#10b981] dark:text-[#34d399] rounded-lg border border-[#10b981]/20 dark:border-[#34d399]/20">
                          <Check size={18} />
                          <span className="text-[14px] whitespace-nowrap">Already in Compare</span>
                        </div>
                      ) : (
                        <button
                          onClick={(e) => handleAddToComparison(phone.id, e)}
                          className="px-6 py-3 bg-gradient-to-r from-[#2c3968] to-[#3d4b7d] dark:from-[#4a7cf6] dark:to-[#5b8df7] text-white rounded-lg hover:shadow-lg transition-all duration-200 flex items-center gap-2 group/btn hover:scale-105"
                        >
                          <Plus size={18} className="transition-transform group-hover/btn:rotate-90" />
                          <span className="whitespace-nowrap">Add to Compare</span>
                        </button>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )
        ) : (
          <div className="bg-white dark:bg-[#161b26] rounded-2xl shadow-sm border border-[#e5e5e5] dark:border-[#2d3548] p-12 text-center">
            <div className="max-w-md mx-auto">
              <div className="w-20 h-20 bg-[#f7f7f7] dark:bg-[#1a1f2e] rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="text-[#999] dark:text-[#707070]" size={32} />
              </div>
              <h3 className="text-[#1e1e1e] dark:text-white mb-2">No phones found</h3>
              <p className="text-[#666] dark:text-[#a0a8b8] mb-6">
                We couldn't find any phones matching your search criteria. Try adjusting your filters.
              </p>
              <button
                onClick={() => {
                  setSearchQuery("");
                  setManufacturerFilter("all");
                }}
                className="px-6 py-3 bg-gradient-to-r from-[#2c3968] to-[#3d4a7a] text-white rounded-lg hover:shadow-lg hover:scale-[1.02] transition-all duration-200"
              >
                Clear Filters
              </button>
            </div>
          </div>
        )}

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="mt-12 flex flex-wrap items-center justify-center gap-2 pb-8">
            {/* Previous Arrow */}
            <button
              disabled={!hasPrevPage}
              onClick={() => setCurrentPage((prev) => prev - 1)}
              className="p-2 rounded-lg border border-[#e5e5e5] dark:border-[#2d3548] text-[#2c3968] dark:text-[#4a7cf6] disabled:opacity-30 hover:bg-[#f7f9fc] transition-all"
            >
              <ChevronLeft size={20} />
            </button>

            {/* Numeric Pages */}
            <div className="flex items-center gap-2">
              {getPageNumbers().map((pageNum, idx) => (
                <button
                  key={idx}
                  disabled={pageNum === "..."}
                  onClick={() => typeof pageNum === "number" && setCurrentPage(pageNum)}
                  className={`min-w-[40px] h-[40px] rounded-lg border transition-all text-sm font-medium ${
                    pageNum === currentPage
                      ? "bg-[#2c3968] text-white border-[#2c3968] shadow-md"
                      : pageNum === "..."
                        ? "border-transparent cursor-default text-[#999]"
                        : "border-[#e5e5e5] dark:border-[#2d3548] text-[#666] dark:text-[#a0a8b8] hover:border-[#2c3968] dark:hover:border-[#4a7cf6] hover:text-[#2c3968]"
                  }`}
                >
                  {pageNum}
                </button>
              ))}
            </div>

            {/* Next Arrow */}
            <button
              disabled={!hasNextPage}
              onClick={() => setCurrentPage((prev) => prev + 1)}
              className="p-2 rounded-lg border border-[#e5e5e5] dark:border-[#2d3548] text-[#2c3968] dark:text-[#4a7cf6] disabled:opacity-30 hover:bg-[#f7f9fc] transition-all"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        )}

        {/* Comparison Cart - Only show if there are phones in cart */}
        {comparisonPhoneIds.length > 0 && (
          <ComparisonCart
            phones={comparisonPhoneIds.map((id) => {
              const cachedPhone = comparisonData.find((p) => p.id === id);
              return {
                id: id,
                name: cachedPhone?.name || "Unknown",
                manufacturer: cachedPhone?.manufacturer || "Unknown",
                image: cachedPhone?.images?.main || "",
                price: cachedPhone?.price || "N/A",
              };
            })}
            onRemovePhone={(phoneId) => {
              setComparisonData((prev) => prev.filter((p) => p.id !== phoneId));
              onComparisonChange?.(comparisonPhoneIds.filter((id) => id !== phoneId));
            }}
            onCompare={() => onNavigateToComparison?.(comparisonPhoneIds)}
            isMinimized={isCartMinimized}
            onMinimizedChange={setIsCartMinimized}
            onClose={() => setIsCartMinimized(true)}
          />
        )}
      </div>

      {/* Recently Viewed Phones */}
      <div className="max-w-[1400px] 2xl:max-w-[1600px] mx-auto">
        <RecentlyViewedPhones currentPhone="" onNavigate={onNavigate} recentlyViewedPhones={recentlyViewedPhones} />
      </div>
    </>
  );
}
