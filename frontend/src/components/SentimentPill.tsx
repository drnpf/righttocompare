import { useDarkMode } from "./DarkModeContext";
import { SentimentTag } from "../types/sentimentTypes";
import { ChevronUp, ChevronDown } from "lucide-react";

interface SentimentPillProps {
  tag: SentimentTag;
  count?: number;
  onClick?: (topic: string) => void;
}

export function SentimentPill({ tag, count, onClick }: SentimentPillProps) {
  const { isDarkMode } = useDarkMode();

  // Parse the tag: prefix determines the "vibe", slice removes the prefix for the label
  const isPositive = tag.startsWith("+");
  const label = tag.slice(1);

  // Dynamic Styles based on sentiment and theme
  const colorClasses = isPositive
    ? isDarkMode
      ? "bg-green-900/20 text-green-400 border-green-900/30 hover:bg-green-900/30"
      : "bg-green-50 text-green-700 border-green-200 hover:bg-green-100"
    : isDarkMode
      ? "bg-red-900/20 text-red-400 border-red-900/30 hover:bg-red-900/30"
      : "bg-red-50 text-red-700 border-red-200 hover:bg-red-100";

  return (
    <div
      onClick={() => onClick?.(label)}
      className={`
        inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border 
        text-[10px] font-bold uppercase tracking-wider transition-all duration-200
        ${colorClasses}
        ${onClick ? "cursor-pointer" : "cursor-default"}
      `}
    >
      {/* Icon Indicator */}
      {isPositive ? (
        <ChevronUp size={12} className="stroke-[3px]" />
      ) : (
        <ChevronDown size={12} className="stroke-[3px]" />
      )}

      {/* The Topic Label */}
      <span>{label}</span>

      {/* The Agreement Count (Conditional) */}
      {count !== undefined && (
        <div
          className={`
          ml-1 pl-1.5 border-l flex items-center
          ${isDarkMode ? "border-white/10" : "border-black/10"}
        `}
        >
          <span className="opacity-70">{count}</span>
        </div>
      )}
    </div>
  );
}
