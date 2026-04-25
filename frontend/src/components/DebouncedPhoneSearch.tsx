import { useState, useEffect, useRef } from "react";
import { Search, Loader2 } from "lucide-react";
import { getPhonePage } from "../api/phoneApi";
import { PhoneCard } from "../types/phoneTypes";

// --- CONFIGURATION ---
const SEARCH_DEBOUNCE_TIMER_MS = 400;
const SEARCH_RESULT_LIMIT = 5;

interface Props {
  onSelect: (id: string) => void;
}

export function DebouncedPhoneSearch({ onSelect }: Props) {
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState<PhoneCard[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const shouldSearch = useRef(true);

  /**
   * Fetches for PhoneCard objects for search dropdown on phones that match search query
   */
  useEffect(() => {
    // Skips use effect if search was just executed
    if (!shouldSearch.current) {
      shouldSearch.current = true; // Reset for the next time the user types
      return;
    }

    // Only search if there text
    if (!searchTerm.trim()) {
      setResults([]);
      setIsOpen(false);
      onSelect("");
      setIsSearching(false);
      return;
    }

    // Starts loading indicator
    setIsSearching(true);

    // Set the debounce timer before phone search API is actualyl called
    const delayDebounceFn = setTimeout(async () => {
      try {
        // Gets phone page
        const response = await getPhonePage(1, SEARCH_RESULT_LIMIT, { search: searchTerm });

        setResults(response.phones);
        setIsOpen(true);
      } catch (err) {
        console.error("Search failed:", err);
      } finally {
        setIsSearching(false);
      }
    }, SEARCH_DEBOUNCE_TIMER_MS);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, onSelect]);

  // Close dropdown on click outside of dropdown
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div className="relative w-full max-w-md" ref={dropdownRef}>
      <div className="relative group">
        <div className="absolute left-4 top-1/2 -translate-y-1/2">
          {isSearching ? (
            <Loader2 className="animate-spin text-[#4a7cf6]" size={18} />
          ) : (
            <Search className="text-gray-400 group-focus-within:text-[#4a7cf6] transition-colors" size={18} />
          )}
        </div>
        <input
          type="text"
          placeholder="Search for a phone to analyze..."
          className="w-full bg-white dark:bg-[#161b22] border border-gray-200 dark:border-gray-800 rounded-2xl pl-12 pr-4 py-4 text-sm font-bold shadow-sm focus:ring-2 focus:ring-[#4a7cf6] outline-none transition-all"
          value={searchTerm}
          onChange={(e) => {
            shouldSearch.current = true;
            setSearchTerm(e.target.value);
          }}
          onFocus={() => searchTerm && results.length > 0 && setIsOpen(true)}
        />
      </div>

      {/* Results Dropdown */}
      {isOpen && results.length > 0 && (
        <div className="absolute top-full mt-2 w-full bg-white dark:bg-[#1c212e] border border-gray-100 dark:border-gray-800 rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
          <div className="p-2 border-b border-gray-50 dark:border-gray-800">
            <span className="text-[10px] font-black text-gray-400 uppercase px-2">Top Matches</span>
          </div>
          {results.map((phone) => (
            <button
              key={phone.id}
              onClick={() => {
                shouldSearch.current = false;
                setResults([]);
                onSelect(phone.id);
                setSearchTerm(phone.name);
                setIsOpen(false);
              }}
              className="w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-[#252b3d] transition-colors flex items-center gap-4 group"
            >
              {/* PHONE THUMBNAIL */}
              <div className="w-12 h-12 flex-shrink-0 rounded-xl bg-white dark:bg-gray-800 overflow-hidden flex items-center justify-center border border-gray-100 dark:border-gray-700 p-1 shadow-inner">
                {phone.images?.main ? (
                  <img
                    src={phone.images.main}
                    alt={phone.name}
                    className="w-full h-full object-contain transition-transform group-hover:scale-110 duration-300"
                  />
                ) : (
                  <div className="text-[8px] font-black text-gray-400 uppercase text-center leading-tight">
                    No
                    <br />
                    Img
                  </div>
                )}
              </div>

              {/* PHONE LABELS */}
              <div className="flex flex-col flex-1 min-w-0">
                <span className="text-sm font-bold text-gray-900 dark:text-white truncate group-hover:text-[#4a7cf6] transition-colors">
                  {phone.name}
                </span>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tight truncate">
                  {phone.manufacturer}
                </span>
              </div>

              <div className="flex-shrink-0 text-[10px] font-black px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-gray-500 opacity-0 group-hover:opacity-100 transition-all">
                SELECT
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
