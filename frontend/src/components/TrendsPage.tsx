import { useEffect, useState } from "react";
import { Activity } from "lucide-react";

// Custom Components & API
import { MomentumChart } from "../components/MomentumChart";
import { BrandRadar } from "../components/BrandRadar";
import { SentimentTicker } from "../components/SentimentTicker";
import { VibeShiftSection } from "../components/VibeShiftSection";
import { getGlobalTrends, getTickerData } from "../api/trendsApi";
import { GlobalTrendsResponse, TickerData } from "../types/trendTypes";

export default function TrendsPage() {
  // ------------------------------------------------------------
  // | HOOKS
  // ------------------------------------------------------------
  const [data, setData] = useState<GlobalTrendsResponse | null>(null);
  const [ticker, setTicker] = useState<TickerData[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState(12); // Default to 12 months
  const [selectedPhoneId, setSelectedPhoneId] = useState<string>("");

  // ------------------------------------------------------------
  // | DATA SYNCHRONIZATION
  // ------------------------------------------------------------
  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setLoading(true);
        // Fetching both datasets in parallel
        const [trendsResult, tickerResult] = await Promise.all([
          getGlobalTrends(timeRange),
          getTickerData(30), // Ticker tracks the last 30 days of buzz
        ]);

        setData(trendsResult);
        setTicker(tickerResult);
      } catch (err) {
        console.error("Dashboard Fetch Error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAllData();
  }, [timeRange]); // Refetch whenever the user changes the time filter

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
  // | UI
  // ------------------------------------------------------------
  return (
    <div className="flex flex-col min-h-screen bg-[#f7f7f7] dark:bg-[#0d1117]">
      <SentimentTicker items={ticker} />
      <div className="max-w-7xl mx-auto p-8 w-full space-y-20">
        {/* GLOBAL TRENDS HEADER */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Activity className="text-[#4a7cf6]" size={28} />
              <h1 className="text-4xl font-black tracking-tight dark:text-white uppercase">Market Intelligence</h1>
            </div>
            <p className="text-gray-500 font-medium">Tracking community sentiment and brand performance over time.</p>
          </div>

          {/* Time Range Selector */}
          <div className="flex bg-white dark:bg-[#161b22] p-1 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm gap-1">
            {[3, 6, 12, 24].map((m) => (
              <button
                key={m}
                onClick={() => setTimeRange(m)}
                className={`px-4 py-2 min-w-[50px] rounded-lg text-[13px] font-bold transition-all ${
                  timeRange === m
                    ? "bg-[#2c3968] text-white shadow-md scale-105"
                    : "text-gray-400 hover:text-gray-600 dark:hover:text-[#4a7cf6]"
                }`}
              >
                {m === 24 ? "2Y" : `${m}M`}
              </button>
            ))}
          </div>
        </header>

        {/* GLOBAL TRENDS GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-10">
          <div className="lg:col-span-2 min-w-0">
            <MomentumChart data={data.momentum} />
          </div>
          <div className="lg:col-span-1">
            <BrandRadar brands={data.brandRadar} />
          </div>
        </div>

        <section className="space-y-10 pt-10 border-t border-gray-200 dark:border-gray-800">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-3xl font-black tracking-tight dark:text-white uppercase">Device Deep Dive</h2>
              <p className="text-sm text-gray-500 font-medium">
                Analyze specific sentiment shifts for a single device.
              </p>
            </div>

            {/* Select Phone */}
            <div className="relative w-full max-w-xs">
              <select
                value={selectedPhoneId}
                onChange={(e) => setSelectedPhoneId(e.target.value)}
                className="w-full bg-white dark:bg-[#161b22] border border-gray-200 dark:border-gray-800 rounded-xl px-4 py-3 text-sm font-bold shadow-sm focus:ring-2 focus:ring-[#4a7cf6] outline-none appearance-none cursor-pointer"
              >
                <option value="">Select a Phone...</option>
                <option value="iphone-15-pro">iPhone 15 Pro</option>
                <option value="samsung-s24-ultra">Galaxy S24 Ultra</option>
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none opacity-50">
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path
                    d="M2.5 4.5L6 8L9.5 4.5"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            </div>
          </div>

          <VibeShiftSection phoneId={selectedPhoneId} />
        </section>
      </div>
    </div>
  );
}
