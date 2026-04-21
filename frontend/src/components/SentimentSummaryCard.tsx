import { TrendingUp, TrendingDown, Info } from "lucide-react";
import { SentimentSummary } from "../types/sentimentTypes";
import { SentimentPill } from "./SentimentPill";
import { useDarkMode } from "./DarkModeContext";

interface SentimentSummaryCardProp {
  data: SentimentSummary | null;
  isLoading?: boolean;
  sourceType?: string; // "reviews", "discussions", "posts"
}

export function SentimentSummaryCard({ data, isLoading, sourceType = "reviews" }: SentimentSummaryCardProp) {
  const { isDarkMode } = useDarkMode();

  // Render guard if loading
  if (isLoading) {
    return (
      <div
        className={`mb-8 p-6 rounded-2xl border animate-pulse ${
          isDarkMode ? "bg-[#161b22] border-[#2d3748]" : "bg-white border-gray-100 shadow-sm"
        }`}
      >
        <div className="h-4 w-32 bg-gray-300 dark:bg-gray-700 rounded mb-6"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-3">
            <div className="h-8 w-full bg-gray-200 dark:bg-gray-800 rounded-lg"></div>
          </div>
          <div className="space-y-3">
            <div className="h-8 w-full bg-gray-200 dark:bg-gray-800 rounded-lg"></div>
          </div>
        </div>
      </div>
    );
  }

  // Handles case if there is no analysis data
  if (!data || data.totalAnalyzed === 0) return null;

  // Rendering UI
  return (
    <div
      className={`mb-8 p-6 rounded-2xl border transition-all ${
        isDarkMode ? "bg-[#161b22] border-[#2d3748]" : "bg-white border-[#2c3968]/5 shadow-sm"
      }`}
    >
      {/* Header Info */}
      <div className="flex items-center justify-between mb-6">
        <h3
          className={`text-sm font-bold uppercase tracking-widest ${isDarkMode ? "text-[#4a7cf6]" : "text-[#2c3968]"}`}
        >
          Community Consensus
        </h3>
        <div className="flex items-center gap-1.5 text-[10px] text-gray-400 font-medium italic">
          <Info size={12} />
          AI-analyzed from {data.totalAnalyzed} {sourceType}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Pros Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
            <TrendingUp size={16} />
            <span className="text-xs font-bold uppercase">Community Loves</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {data.pros.length > 0 ? (
              data.pros.map((p, idx) => <SentimentPill key={`pro-${idx}`} tag={`+${p.topic}`} count={p.count} />)
            ) : (
              <p className="text-xs text-gray-500 italic px-1">Gathering positive trends...</p>
            )}
          </div>
        </div>

        {/* Cons Section */}
        <div
          className={`space-y-4 pt-6 md:pt-0 md:pl-8 border-t md:border-t-0 md:border-l ${
            isDarkMode ? "border-gray-800" : "border-gray-100"
          }`}
        >
          <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
            <TrendingDown size={16} />
            <span className="text-xs font-bold uppercase">Pain Points</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {data.cons.length > 0 ? (
              data.cons.map((c, idx) => <SentimentPill key={`con-${idx}`} tag={`-${c.topic}`} count={c.count} />)
            ) : (
              <p className="text-xs text-gray-500 italic px-1">No major complaints yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
