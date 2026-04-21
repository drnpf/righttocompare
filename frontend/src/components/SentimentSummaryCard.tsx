import { TrendingUp, TrendingDown, Info, Sparkles, RotateCcw } from "lucide-react";
import { Button } from "./ui/button";
import { SentimentSummary } from "../types/sentimentTypes";
import { SentimentPill } from "./SentimentPill";
import { useDarkMode } from "./DarkModeContext";

interface SentimentSummaryCardProp {
  data: SentimentSummary | null;
  isLoading?: boolean;
  sourceType?: string; // "reviews", "discussions", "posts"
  activeFilters?: string[];
  onPillClick?: (tag: string) => void;
}

const generateVerdict = (pros: string[], cons: string[]): string => {
  // Getting number of pros and cons
  const proCount = pros.length;
  const conCount = cons.length;
  if (proCount === 0 && conCount === 0) return "";

  const topPro = pros[0] || ""; // Pro with the highest count
  const topCon = cons[0] || ""; // Con with the highest count
  const proList = pros.slice(0, 3).join(", "); // Top 3 pros
  const conList = cons.slice(0, 3).join(", "); // Top 3 cons

  // Heavy pros, almost no cons
  if (proCount >= 3 && conCount <= 1) {
    return `The consensus is overwhelmingly positive. While there's a minor gripe regarding ${topCon || "the overall package"}, the ${proList} make this device an absolute standout in its class.`;
  }

  // Balanced pros and cons
  if (proCount >= 2 && conCount >= 2) {
    return `It's a classic case of trade-offs. You're getting top-tier ${proList}, but you'll have to stomach some notable shortcomings with the ${conList}. It's a powerhouse, but not without its frustrations.`;
  }

  // One very strong pro, many cons
  if (proCount === 1 && conCount >= 2) {
    return `This is a niche pick. The ${topPro} is clearly the main draw, but the community warns that the ${conList} prevent it from being a safe recommendation for everyone.`;
  }

  // Heavy cons
  if (conCount > proCount) {
    return `Proceed with caution. Despite some appreciation for the ${topPro || "features"}, the feedback is dominated by concerns over ${conList}. The community seems to feel the value proposition just isn't there yet.`;
  }

  // Very little data
  return `The early word is in: users are currently navigating the balance between the ${proList} and the ${conList}. It's a developing story, but the ${topPro} is currently the feature to watch.`;
};

export function SentimentSummaryCard({
  data,
  isLoading,
  sourceType = "reviews",
  activeFilters = [],
  onPillClick,
}: SentimentSummaryCardProp) {
  const { isDarkMode } = useDarkMode();

  const renderBoldVerdict = (text: string) => {
    if (!text) return null;

    // Combines all topics into one list
    const allTopics = [...proNames, ...conNames];
    if (allTopics.length === 0) return text;

    // Creates a regex pattern for bolding the phone feature names
    const pattern = new RegExp(`(${allTopics.join("|")})`, "gi");
    const parts = text.split(pattern);

    // Creating features bolded in HTML w/ CSS or just the text itself
    return parts.map((part, i) => {
      const isTopic = allTopics.includes(part.toLowerCase());
      return isTopic ? (
        <strong key={i} className={`font-extrabold ${isDarkMode ? "text-white" : "text-black"}`}>
          {part}
        </strong>
      ) : (
        part
      );
    });
  };

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

  // Handles filtering out chosen tags from choosable list
  const visiblePros = data.pros.filter((p) => !activeFilters.includes(`+${p.topic}`));
  const visibleCons = data.cons.filter((c) => !activeFilters.includes(`-${c.topic}`));

  // Handles case if there is data to analyze for sentiment
  const proNames = data?.pros.map((p) => p.topic.toLowerCase());
  const conNames = data?.cons.map((c) => c.topic.toLowerCase());
  const rawVerdict = generateVerdict(proNames, conNames);

  // Rendering UI
  return (
    <div
      className={`mb-8 p-6 rounded-2xl border transition-all ${
        isDarkMode ? "bg-[#161b22] border-[#2d3748]" : "bg-white border-[#2c3968]/5 shadow-sm"
      }`}
    >
      <div className="flex flex-col gap-4 mb-6">
        <div className="flex items-center justify-between">
          <h3
            className={`text-sm font-bold uppercase tracking-widest ${isDarkMode ? "text-[#4a7cf6]" : "text-[#2c3968]"}`}
          >
            Community Consensus
          </h3>
          <div className="flex items-center gap-1.5 text-[10px] text-gray-400 font-medium italic">
            <Info size={12} />
            Analyzed from {data.totalAnalyzed} {sourceType}
          </div>
        </div>

        {/* Active Filters Bar */}
        {activeFilters.length > 0 && (
          <div
            className={`flex flex-wrap items-center gap-3 p-3 rounded-xl border-dashed border-2 ${
              isDarkMode ? "bg-gray-900/40 border-gray-700" : "bg-gray-50 border-gray-200"
            }`}
          >
            <span className="text-[10px] font-bold uppercase opacity-50 ml-1">Active Filters:</span>
            <div className="flex flex-wrap gap-2">
              {activeFilters.map((tag) => (
                <SentimentPill key={tag} tag={tag as any} isActive={true} onClick={onPillClick} />
              ))}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => activeFilters.forEach((f) => onPillClick?.(f))}
              className="h-7 px-2 text-[10px] uppercase font-bold text-red-500 hover:bg-red-50 cursor-pointer"
            >
              <RotateCcw size={12} className="mr-1" />
              Clear All
            </Button>
          </div>
        )}
      </div>

      {/* Verdict */}
      {rawVerdict && (
        <div
          className={`mb-8 p-5 rounded-xl border-l-4 ${
            isDarkMode ? "bg-[#1e2533] border-[#4a7cf6] text-gray-300" : "bg-[#f0f4ff] border-[#2c3968] text-[#2c3968]"
          }`}
        >
          <div className="flex items-center gap-2 mb-2">
            <Sparkles size={14} className={isDarkMode ? "text-[#4a7cf6]" : "text-[#2c3968]"} />
            <span className="text-[10px] font-bold uppercase tracking-widest opacity-70">The Verdict</span>
          </div>
          <p className="text-sm leading-relaxed italic">"{renderBoldVerdict(rawVerdict)}"</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Pros Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
            <TrendingUp size={16} />
            <span className="text-xs font-bold uppercase">Community Loves</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {visiblePros.length > 0 ? (
              visiblePros.map((p, idx) => (
                <SentimentPill key={`pro-${idx}`} tag={`+${p.topic}`} count={p.count} onClick={onPillClick} />
              ))
            ) : (
              <p className="text-[10px] text-gray-400 italic">No more pros to select.</p>
            )}
          </div>
        </div>

        {/* Cons Section */}
        <div
          className={`space-y-4 pt-6 md:pt-0 md:pl-8 md:border-l ${isDarkMode ? "border-gray-800" : "border-gray-100"}`}
        >
          <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
            <TrendingDown size={16} />
            <span className="text-xs font-bold uppercase">Pain Points</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {visibleCons.length > 0 ? (
              visibleCons.map((c, idx) => (
                <SentimentPill key={`con-${idx}`} tag={`-${c.topic}`} count={c.count} onClick={onPillClick} />
              ))
            ) : (
              <p className="text-[10px] text-gray-400 italic">No more pain points to select.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
