import { useState, useRef, useEffect } from "react";
import { ChevronLeft, ChevronRight, Smartphone } from "lucide-react";
import { phonesData } from "../data/phoneData";

interface RecentPhone {
  id: string;
  name: string;
  image: string;
}

interface RecentlyViewedPhonesProps {
  currentPhone: string;
  onNavigate: (phoneId: string) => void;
  recentlyViewedPhones?: string[];
}

const API_URL = "http://localhost:5001/api/phones";

export default function RecentlyViewedPhones({ currentPhone, onNavigate, recentlyViewedPhones }: RecentlyViewedPhonesProps) {
  const [scrollPosition, setScrollPosition] = useState(0);
  const [canScroll, setCanScroll] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [recentPhones, setRecentPhones] = useState<RecentPhone[]>([]);
  const [loading, setLoading] = useState(false);

  // Retrieve phone data from local or API
  useEffect(() => {
    const phoneIds = recentlyViewedPhones && recentlyViewedPhones.length > 0
      ? recentlyViewedPhones.slice(0, 8)
      : [];

    if (phoneIds.length === 0) {
      setRecentPhones([]);
      return;
    }

    const resolve = async () => {
      setLoading(true);
      const results: RecentPhone[] = [];

      for (const id of phoneIds) {
        // Check hardcoded data first
        if (phonesData[id]) {
          results.push({
            id,
            name: phonesData[id].name,
            image: phonesData[id].images?.main || "",
          });
        } else {
          // Try fetching from API
          try {
            const res = await fetch(`${API_URL}/${id}`);
            if (res.ok) {
              const data = await res.json();
              results.push({
                id: data.id,
                name: data.name || id,
                image: data.images?.main || "",
              });
            } else {
              // Phone not found in API either — still show it with fallback
              results.push({ id, name: id, image: "" });
            }
          } catch {
            results.push({ id, name: id, image: "" });
          }
        }
      }

      setRecentPhones(results);
      setLoading(false);
    };

    resolve();
  }, [recentlyViewedPhones]);
  
  // Check if content is scrollable
  useEffect(() => {
    const checkScrollable = () => {
      if (scrollContainerRef.current) {
        const isScrollable = scrollContainerRef.current.scrollWidth > scrollContainerRef.current.clientWidth;
        setCanScroll(isScrollable);
      }
    };
    
    checkScrollable();
    window.addEventListener('resize', checkScrollable);
    
    return () => window.removeEventListener('resize', checkScrollable);
  }, [recentPhones]);
  
  const handleScroll = (direction: 'left' | 'right') => {
    if (!scrollContainerRef.current) return;
    
    const scrollAmount = 200; // Adjust scroll amount as needed
    const newPosition = direction === 'left' 
      ? Math.max(0, scrollPosition - scrollAmount)
      : scrollPosition + scrollAmount;
    
    scrollContainerRef.current.scrollTo({
      left: newPosition,
      behavior: 'smooth'
    });
    
    setScrollPosition(newPosition);
  };
  
  const showLeftArrow = canScroll && scrollPosition > 0;
  const showRightArrow = canScroll && scrollContainerRef.current 
    ? scrollPosition < (scrollContainerRef.current.scrollWidth - scrollContainerRef.current.clientWidth - 1)
    : false;

// Don't show if no recently viewed phones
if (recentPhones.length === 0 && !loading) {
    return (
      <div className="px-6 py-12">
        <div className="bg-white dark:bg-[#161b26] rounded-2xl shadow-sm p-6 md:p-10 transition-colors duration-300">
          <div className="mb-8">
            <h2 className="text-[#2c3968] dark:text-[#4a7cf6] mb-2">Recently Viewed</h2>
            <div className="h-1 w-20 bg-[#2c3968] dark:bg-[#4a7cf6] rounded-full"></div>
          </div>
          <p className="text-center text-[#999] dark:text-[#666] py-8">
            No recently viewed phones yet
          </p>
        </div>
      </div>
    );
  }


  return (
    <div className="px-6 py-12">
      <div className="bg-white dark:bg-[#161b26] rounded-2xl shadow-sm p-6 md:p-10 transition-colors duration-300">
        {/* Title */}
        <div className="mb-8">
          <h2 className="text-[#2c3968] dark:text-[#4a7cf6] mb-2">Recently Viewed</h2>
          <div className="h-1 w-20 bg-[#2c3968] dark:bg-[#4a7cf6] rounded-full"></div>
        </div>
        
        {/* Container with refined border and enhanced background */}
        <div className="relative border-2 border-[#e0e0e0] dark:border-[#2d3548] rounded-[40px] px-4 md:px-8 lg:px-16 py-8 md:py-12 bg-gradient-to-br from-[#f5f7fa] via-[#fafbfc] to-[#f0f2f5] dark:from-[#1a1f2e] dark:via-[#1e2530] dark:to-[#1a1f2e] shadow-inner overflow-hidden transition-colors duration-300">
          {/* Decorative subtle pattern overlay */}
          <div className="absolute inset-0 opacity-30 pointer-events-none rounded-[40px]" style={{
            backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(44, 57, 104, 0.05) 1px, transparent 0)',
            backgroundSize: '40px 40px'
          }}></div>
          
          {/* Left Arrow */}
          {showLeftArrow && (
            <button
              onClick={() => handleScroll('left')}
              className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 z-20 flex items-center justify-center w-10 h-10 md:w-12 md:h-12 bg-white dark:bg-[#252b3d] rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 border-2 border-[#2c3968]/10 dark:border-[#4a7cf6]/10 hover:border-[#2c3968]/30 dark:hover:border-[#4a7cf6]/30"
              aria-label="Scroll left"
            >
              <ChevronLeft className="w-6 h-6 text-[#2c3968] dark:text-[#4a7cf6]" />
            </button>
          )}
          
          {/* Scrollable Container */}
          <div 
            ref={scrollContainerRef}
            className="relative flex items-start gap-4 md:gap-6 lg:gap-8 overflow-x-auto scrollbar-hide scroll-smooth px-2 md:px-4 py-8 md:py-10"
            onScroll={(e) => setScrollPosition(e.currentTarget.scrollLeft)}
            style={{
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
            }}
          >
            {recentPhones.map((phone, index) => (
              <div 
                key={phone.id} 
                className="group flex flex-col items-center min-w-[120px] sm:min-w-[140px] md:min-w-[150px] w-[120px] sm:w-[140px] md:w-[150px] cursor-pointer transition-all duration-300 ease-out hover:scale-105 hover:z-10"
                style={{
                  position: 'relative',
                  zIndex: phone.id === currentPhone ? 999 : recentPhones.length - index,
                  opacity: phone.id === currentPhone ? 1 : Math.max(0.55, 1 - (index * 0.1))
                }}
                onClick={() => {
                  if (phone.id === currentPhone) {
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  } else {
                    onNavigate(phone.id);
                  }
                }}
              >
                {/* Phone Card */}
                <div className="bg-white dark:bg-[#252b3d] rounded-2xl p-3 md:p-5 shadow-md group-hover:shadow-xl transition-all duration-300 w-full border border-transparent group-hover:border-[#2c3968]/10 dark:group-hover:border-[#4a7cf6]/10 h-full flex flex-col">
                  {/* Badge for current or most recent phone */}
                  {phone.id === currentPhone ? (
                    <div className="absolute -top-2 md:-top-3 -right-2 md:-right-3 bg-[#2c3968] dark:bg-[#4a7cf6] text-white px-2 md:px-3 py-0.5 md:py-1 rounded-full text-[10px] md:text-xs z-10 shadow-md">
                      Current
                    </div>
                  ) : index === 0 && phone.id !== currentPhone && (
                    <div className="absolute -top-2 md:-top-3 -right-2 md:-right-3 bg-[#2c3968] dark:bg-[#4a7cf6] text-white px-2 md:px-3 py-0.5 md:py-1 rounded-full text-[10px] md:text-xs z-10 shadow-md">
                      Latest
                    </div>
                  )}
                  
                  {/* Phone Image */}
                  <div className="w-full h-[100px] sm:h-[120px] md:h-[140px] mb-3 md:mb-4 overflow-hidden rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 dark:from-[#1a1f2e] dark:to-[#1e2530] flex items-center justify-center">
                    {phone.image ? (
                      <img 
                        src={phone.image} 
                        alt={phone.name}
                        className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-110"
                      />
                    ) : (
                      <Smartphone className="w-12 h-12 text-[#ccc] dark:text-[#444]" />
                    )}
                  </div>
                  {/* Phone Name */}
                  <p className="text-center text-[#2c3968] dark:text-[#4a7cf6] text-xs md:text-sm transition-colors duration-300 group-hover:text-[#1e2547] dark:group-hover:text-[#5b8df7] mt-auto h-[35px] md:h-[40px] flex items-center justify-center leading-tight">{phone.name}</p>
                </div>
              </div>
            ))}
          </div>
          
          {/* Right Arrow */}
          {showRightArrow && (
            <button
              onClick={() => handleScroll('right')}
              className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 z-20 flex items-center justify-center w-10 h-10 md:w-12 md:h-12 bg-white dark:bg-[#252b3d] rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 border-2 border-[#2c3968]/10 dark:border-[#4a7cf6]/10 hover:border-[#2c3968]/30 dark:hover:border-[#4a7cf6]/30"
              aria-label="Scroll right"
            >
              <ChevronRight className="w-6 h-6 text-[#2c3968] dark:text-[#4a7cf6]" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}