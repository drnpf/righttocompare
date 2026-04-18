import React from "react";
import { Search, ChevronDown, RotateCcw, Cpu, HardDrive, DollarSign } from "lucide-react";

interface CatalogFilterProps {
  // Search
  searchQuery: string;
  setSearchQuery: (val: string) => void;

  // Manufacturer filter
  manufacturerFilter: string;
  setManufacturerFilter: (val: string) => void;
  availableManufacturers: string[];

  // Numeric Filters
  maxPrice: number;
  setMaxPrice: (val: number) => void;
  selectedRAM: number[];
  setSelectedRAM: (ram: number[]) => void;
  selectedStorage: number[];
  setSelectedStorage: (storage: number[]) => void;

  onClearAll: () => void;
}

/**
 * Catalog Filter
 *
 * This component is used on the catalog page for users to narrow down
 * their phone results based on hardware specs, price, and brand.
 *
 * NOTE: RAM and storage use numeric arrays!!
 */
export const CatalogFilters = ({
  searchQuery,
  setSearchQuery,
  manufacturerFilter,
  setManufacturerFilter,
  availableManufacturers,
  maxPrice,
  setMaxPrice,
  selectedRAM,
  setSelectedRAM,
  selectedStorage,
  setSelectedStorage,
  onClearAll,
}: CatalogFilterProps) => {
  /**
   * Toggles numeric value within a filter array. If value exists exists it is removed; otherwise added
   * @param value The numeric hardware spec to filter
   * @param currentArray The current array of selected filters
   * @param setter Using react state setter to set new filter array
   */
  const toggleNumericFilter = (value: number, currentArray: number[], setter: (arr: number[]) => void) => {
    const next = currentArray.includes(value) ? currentArray.filter((v) => v !== value) : [...currentArray, value];
    setter(next);
  };

  return (
    <div className="bg-white dark:bg-[#161b26] rounded-2xl shadow-sm border border-[#e5e5e5] dark:border-[#2d3548] p-6 mb-8 transition-all">
      <div className="flex flex-col gap-6">
        {/* --- SECTION: Primary Identification (Search & Brand) --- */}
        <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
          <div className="relative flex-1 w-full lg:max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#999] dark:text-[#707070]" size={20} />
            <input
              type="text"
              placeholder="Search by model or processor..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-lg border border-[#d9d9d9] dark:border-[#2d3548] bg-white dark:bg-[#1a1f2e] text-[#1e1e1e] dark:text-white focus:border-[#2c3968] dark:focus:border-[#4a7cf6] focus:outline-none focus:ring-2 focus:ring-[#2c3968]/20 transition-all"
            />
          </div>

          <div className="flex flex-wrap gap-3 w-full lg:w-auto">
            {/* Brand Dropdown */}
            <div className="relative flex-1 lg:flex-none">
              <select
                value={manufacturerFilter}
                onChange={(e) => setManufacturerFilter(e.target.value)}
                className="w-full appearance-none pl-4 pr-10 py-3 rounded-lg border border-[#d9d9d9] dark:border-[#2d3548] bg-white dark:bg-[#1a1f2e] text-[#1e1e1e] dark:text-white cursor-pointer"
              >
                <option value="all">All Brands</option>
                {availableManufacturers.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
              <ChevronDown
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#666] pointer-events-none"
                size={18}
              />
            </div>

            {/* Filter Reset Button */}
            <button
              onClick={onClearAll}
              className="flex items-center gap-2 px-4 py-3 text-sm font-medium text-[#2c3968] dark:text-[#4a7cf6] hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors"
            >
              <RotateCcw size={16} />
              Reset
            </button>
          </div>
        </div>

        {/* --- SECTION: Hardware Specification Filters --- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-6 border-t border-[#e5e5e5] dark:border-[#2d3548]">
          {/* PRICE RANGE FILTERS: Filters out devices strictly above maxPrice */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2 text-[#2c3968] dark:text-[#4a7cf6]">
                <DollarSign size={16} />
                <span className="text-sm font-bold uppercase tracking-wider">Max Price</span>
              </div>
              <span className="text-lg font-bold text-[#2c3968] dark:text-white">${maxPrice}</span>
            </div>
            <input
              type="range"
              min="0"
              max="2500"
              step="50"
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-[#2c3968] dark:accent-[#4a7cf6]"
            />
          </div>

          {/* RAM MULTI-SELECT: Targets specs.performance.ram.options array */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-[#2c3968] dark:text-[#4a7cf6]">
              <Cpu size={16} />
              <span className="text-sm font-bold uppercase tracking-wider">RAM Memory</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {[4, 8, 12, 16, 24].map((size) => (
                <button
                  key={size}
                  onClick={() => toggleNumericFilter(size, selectedRAM, setSelectedRAM)}
                  className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
                    selectedRAM.includes(size)
                      ? "bg-[#2c3968] dark:bg-[#4a7cf6] text-white shadow-md"
                      : "bg-gray-100 dark:bg-[#1a1f2e] text-gray-600 dark:text-[#a0a8b8] hover:bg-gray-200"
                  }`}
                >
                  {size}GB
                </button>
              ))}
            </div>
          </div>

          {/* STORAGE MULTI-SELECT: Targets specs.performance.storageOptions array */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-[#2c3968] dark:text-[#4a7cf6]">
              <HardDrive size={16} />
              <span className="text-sm font-bold uppercase tracking-wider">Storage</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {[128, 256, 512, 1024].map((size) => (
                <button
                  key={size}
                  onClick={() => toggleNumericFilter(size, selectedStorage, setSelectedStorage)}
                  className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
                    selectedStorage.includes(size)
                      ? "bg-[#2c3968] dark:bg-[#4a7cf6] text-white shadow-md"
                      : "bg-gray-100 dark:bg-[#1a1f2e] text-gray-600 dark:text-[#a0a8b8] hover:bg-gray-200"
                  }`}
                >
                  {size >= 1024 ? "1TB" : `${size}GB`}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
