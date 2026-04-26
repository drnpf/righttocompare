import { useCallback, useEffect, useMemo, useState } from "react";
import { Activity } from "lucide-react";

// Custom Components & API
import { DebouncedPhoneSearch } from "./DebouncedPhoneSearch";
import { MomentumChart } from "./MomentumChart";
import { BrandRadar } from "./BrandRadar";
import { SentimentTicker } from "./SentimentTicker";
import { VibeShiftSection } from "./VibeShiftSection";
import ComparisonCart from "./ComparisonCart";
import { getGlobalTrends, getTickerData } from "../api/trendsApi";
import { GlobalTrendsResponse, TickerData } from "../types/trendTypes";
import { PhoneSummary } from "../types/phoneTypes";
import { getPhoneSummaries } from "../api/phoneApi";
import { useNavigate } from "react-router-dom";

interface TrendsPageProps {
  comparisonPhoneIds: string[];
  onCompare: (id: string) => void;
  onRemove: (id: string) => void;
  onViewDetails: (id: string) => void;
}

export default function TrendsPage({ comparisonPhoneIds, onCompare, onRemove, onViewDetails }: TrendsPageProps) {
  // ------------------------------------------------------------
  // | HOOKS
  // ------------------------------------------------------------
  const navigate = useNavigate();
  const [data, setData] = useState<GlobalTrendsResponse | null>(null);
  const [ticker, setTicker] = useState<TickerData[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState(12); // Default to 12 months
  const [selectedPhoneId, setSelectedPhoneId] = useState<string>("");

  // --- COMPARISON CART STATES ---
  const [comparisonData, setComparisonData] = useState<PhoneSummary[]>([]);
  const [isCartMinimized, setIsCartMinimized] = useState(true);

  // ------------------------------------------------------------
  // | DATA SYNCHRONIZATION
  // ------------------------------------------------------------

  // Memoize the phone selection handler
  const handlePhoneSelect = useCallback((id: string) => {
    setSelectedPhoneId(id);
  }, []); // Empty dependency array means this reference is static

  // Memoized search component for phone sentiment history section
  const MemoizedSearch = useMemo(
    () => <DebouncedPhoneSearch onSelect={(id) => setSelectedPhoneId(id)} />,
    [handlePhoneSelect],
  );
  // Derive the full phone objects for the cart
  const comparisonPhones = useMemo<PhoneSummary[]>(() => {
    return (comparisonPhoneIds || []).map((id) => {
      const cached = comparisonData.find((p) => p.id === id);
      if (cached) return cached;
      return { id, name: "Loading...", manufacturer: "", images: { main: "" }, price: "---" };
    });
  }, [comparisonPhoneIds, comparisonData]);
  /**
   * SYNC: Global Market Intelligence
   * Signal: timeRange change
   * Action: Fetches both the global momentum trajectory and the 30-day
   * sentiment ticker in parallel to initialize the dashboard.
   */
  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setLoading(true);
        const [trendsResult, tickerResult] = await Promise.all([getGlobalTrends(timeRange), getTickerData(30)]);

        setData(trendsResult);
        setTicker(tickerResult);
      } catch (err) {
        console.error("Dashboard Fetch Error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAllData();
  }, [timeRange]);

  /**
   * SYNC: Comparison Cart Metadata Cache
   * Signal: comparisonPhoneIds list changes
   * Action: Identifies phone IDs in the comparison cart that are missing
   * from the local metadata cache and fetches their summaries (names, images)
   * to ensure the UI remains populated.
   */
  useEffect(() => {
    const syncCart = async () => {
      // Find IDs that aren't in our local metadata cache yet
      const missingIds = (comparisonPhoneIds || []).filter((id) => !comparisonData.find((p) => p.id === id));

      if (missingIds.length === 0) return;

      try {
        const newItems = await getPhoneSummaries(missingIds);
        setComparisonData((prev) => {
          const combined = [...prev, ...newItems];
          // Ensure uniqueness by ID
          return Array.from(new Map(combined.map((item) => [item.id, item])).values());
        });
      } catch (error) {
        console.error("Failed to sync comparison cart:", error);
      }
    };
    syncCart();
  }, [comparisonPhoneIds]);

  // ------------------------------------------------------------
  // | RENDER GUARD PAGES
  // ------------------------------------------------------------
  if (loading && !data)
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#4a7cf6]"></div>
      </div>
    );

  if (!data) return <div className="p-20 text-center font-bold">Failed to load market data.</div>;

  // ------------------------------------------------------------
  // | COMPONENT LOGIC
  // ------------------------------------------------------------
  // Adds phone to comparison list
  const handleAddAndPop = (id: string) => {
    onCompare(id);
    setIsCartMinimized(false); // Maximize the cart immediately
  };

  // ------------------------------------------------------------
  // | UI
  // ------------------------------------------------------------
  return (
    <div className="flex flex-col min-h-screen bg-[#f8fafc] dark:bg-[#0d1117] transition-colors duration-500">
      <SentimentTicker items={ticker} />

      {/* GLOBAL MARKET TRENDS */}
      <div className="relative">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-64 bg-[#4a7cf6]/5 blur-[120px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-8 pt-16 pb-24 w-full">
          <header className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-8 mt-4">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#4a7cf6]/10 text-[#4a7cf6] text-[10px] font-black uppercase tracking-widest mb-2">
                <Activity size={12} /> Live Market Feed
              </div>
              <h1 className="text-5xl font-black tracking-tighter dark:text-white uppercase italic">
                Market <span className="text-[#4a7cf6]">Intelligence</span>
              </h1>
              <p className="text-gray-400 font-medium max-w-md leading-tight">
                Real-time community sentiment and brand trajectory analysis.
              </p>
            </div>

            {/* TIME RANGE SELECTOR */}
            <div className="flex bg-white/80 dark:bg-[#161b22]/80 backdrop-blur-md p-1 rounded-2xl border border-white dark:border-gray-800 shadow-xl shadow-blue-500/5 gap-1 mb-4 mt-4">
              {[3, 6, 12, 24].map((m) => (
                <button
                  key={m}
                  onClick={() => setTimeRange(m)}
                  className={`px-6 py-2.5 rounded-xl text-[12px] font-black transition-all duration-300 cursor-pointer ${
                    timeRange === m
                      ? "bg-[#2c3968] text-white shadow-lg shadow-indigo-500/20 scale-105"
                      : "text-gray-400 hover:text-[#4a7cf6] hover:bg-gray-50 dark:hover:bg-gray-800"
                  }`}
                >
                  {m === 24 ? "2Y" : `${m}M`}
                </button>
              ))}
            </div>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            {/* GLOBAL MOMENTUM CHART*/}
            <div className="lg:col-span-2 bg-white dark:bg-[#111622] rounded-[2.5rem] p-2 shadow-[0_20px_50px_rgba(0,0,0,0.02)] dark:shadow-none border border-white dark:border-gray-800">
              <MomentumChart data={data.momentum} />
            </div>
            {/* BRAND PERFORMANCE TABLE*/}
            <div className="lg:col-span-1">
              <BrandRadar brands={data.brandRadar} />
            </div>
          </div>
        </div>
      </div>

      {/* DEVICE DEEP DIVE SECTION */}
      <section className="flex-1 bg-white dark:bg-[#090c12] border-t border-gray-100 dark:border-gray-800/50 shadow-[0_-20px_40px_rgba(0,0,0,0.02)]">
        <div className="max-w-7xl mx-auto px-8 py-24 mt-4 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-10 mb-16">
            <div className="max-w-xl">
              <h2 className="text-3xl font-black tracking-tighter dark:text-white uppercase italic mb-4">
                Device <span className="text-gray-400">Deep Dive</span>
              </h2>
              <p className="text-gray-400 text-sm font-medium leading-relaxed">
                Enter a specific model to extract granular sentiment shifts and feature mentions.
              </p>
            </div>
            <div className="w-full max-w-md">{MemoizedSearch}</div>
          </div>

          {/* PHONE VIBE SECTION (CHART + PRO/CON LIST) */}
          <div className="min-h-[600px] w-full relative">
            {selectedPhoneId ? (
              <VibeShiftSection
                phoneId={selectedPhoneId}
                comparisonPhoneIds={comparisonPhoneIds}
                onCompare={handleAddAndPop}
                onRemove={onRemove}
                onViewDetails={onViewDetails}
              />
            ) : (
              <div className="h-[500px] bg-[#f8fafc] dark:bg-[#111622]/50 border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-[3rem] flex flex-col items-center justify-center text-gray-400 group hover:border-[#4a7cf6]/30 transition-all duration-500">
                <div className="p-6 bg-white dark:bg-gray-900 rounded-[2rem] shadow-xl shadow-blue-500/5 mb-6 group-hover:scale-110 transition-transform duration-500">
                  <div className="text-[#4a7cf6] opacity-40">
                    <Activity size={40} />
                  </div>
                </div>
                <p className="text-xl font-black tracking-tight text-gray-900 dark:text-white uppercase italic">
                  Start Your Deep Dive
                </p>
                <p className="text-sm mt-2 font-medium opacity-60 max-w-xs text-center leading-relaxed italic">
                  Select a device above to view community feedback and trend data.
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      <ComparisonCart
        phones={comparisonPhones}
        onRemovePhone={onRemove}
        onCompare={() => navigate("/compare")}
        onClose={() => setIsCartMinimized(true)}
        isMinimized={isCartMinimized}
        onMinimizedChange={setIsCartMinimized}
      />
    </div>
  );
}
