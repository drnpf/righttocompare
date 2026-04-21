import { useDarkMode } from "./DarkModeContext";
import { SentimentTag } from "../types/sentimentTypes";
import { ChevronUp, ChevronDown, X } from "lucide-react";

interface SentimentPillProps {
  tag: SentimentTag;
  count?: number;
  isActive?: boolean;
  onClick?: (topic: string) => void;
}

export function SentimentPill({ tag, count, isActive, onClick }: SentimentPillProps) {
  const { isDarkMode } = useDarkMode();

  // Parse the tag to determine if positive/negative and removes the sign to prep for labeling
  const isPositive = tag.startsWith("+");
  const label = tag.slice(1);

  // Glow effect for case where sentiment pills are active buttons
  const activeClass = isActive
    ? isDarkMode
      ? "ring-2 ring-white scale-105"
      : "ring-2 ring-[#2c3968] scale-105"
    : "opacity-80 hover:opacity-100";

  // Dynamic Styles based on sentiment and theme
  const colorClasses = isPositive
    ? isDarkMode
      ? "bg-green-900/20 text-green-400 border-green-900/30 hover:bg-green-900/30"
      : "bg-green-50 text-green-700 border-green-200 hover:bg-green-100"
    : isDarkMode
      ? "bg-red-900/20 text-red-400 border-red-900/30 hover:bg-red-900/30"
      : "bg-red-50 text-red-700 border-red-200 hover:bg-red-100";

  return (
    <button
      onClick={() => onClick?.(tag)}
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-[10px] font-bold uppercase transition-all cursor-pointer select-none ${activeClass} ${colorClasses}`}
    >
      {/* If active show X. If not, show arrow */}
      {isActive ? <X size={12} strokeWidth={3} /> : isPositive ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
      <span>{label}</span>
      {/* Hide count in the top active bar */}
      {!isActive && count !== undefined && <span className="ml-1 pl-1.5 border-l opacity-70">{count}</span>}
    </button>
  );
}
