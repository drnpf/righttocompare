import { useEffect, useState } from "react";
import { Activity, Clock } from "lucide-react";

// Custom Components & API
import { MomentumChart } from "../components/MomentumChart";
import { BrandRadar } from "../components/BrandRadar";
import { SentimentTicker } from "../components/SentimentTicker";
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
      {/* Global Sentiment Ticker */}
      <SentimentTicker items={ticker} />

      <div className="max-w-7xl mx-auto p-8 w-full">
        <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Activity className="text-[#4a7cf6]" size={28} />
              <h1 className="text-4xl font-black tracking-tight dark:text-white">Market Intelligence</h1>
            </div>
            <p className="text-gray-500 font-medium">Tracking community sentiment and brand performance over time.</p>
          </div>

          {/* Time Range Selector */}
          <div className="flex bg-white dark:bg-[#1a1f2e] p-1.5 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm">
            {[3, 6, 12, 24].map((m) => (
              <button
                key={m}
                onClick={() => setTimeRange(m)}
                className={`px-5 py-2 rounded-xl text-xs font-black transition-all ${
                  timeRange === m
                    ? "bg-[#2c3968] text-white shadow-md"
                    : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                }`}
              >
                {m === 24 ? "2Y" : `${m}M`}
              </button>
            ))}
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Chart Area */}
          <div className="lg:col-span-2">
            <MomentumChart data={data.momentum} />
          </div>

          {/* Sidebar Radar */}
          <div className="lg:col-span-1">
            <BrandRadar brands={data.brandRadar} />
          </div>
        </div>
      </div>
    </div>
  );
}
