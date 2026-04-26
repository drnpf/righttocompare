import { useDarkMode } from "./DarkModeContext";
import { darkModeColors } from "./darkModeConfig";
import { TickerData } from "../types/trendTypes";
import { TrendingUp, TrendingDown, Flame, AlertCircle } from "lucide-react";

export function SentimentTicker({ items }: { items: TickerData[] }) {
  const { isDarkMode } = useDarkMode();
  const colors = darkModeColors;

  if (items.length === 0) return null;

  // ------------------------------------------------------------
  // | THEME DEFINITION
  // ------------------------------------------------------------
  const containerBg = isDarkMode ? colors.background.primary.dark : colors.background.primary.light;
  const containerBorder = isDarkMode ? colors.border.default.dark : colors.border.default.light;
  const pillBg = isDarkMode ? colors.background.card.dark : colors.background.card.light;
  const velocityText = isDarkMode ? colors.text.primary.dark : colors.text.primary.light;

  return (
    <div
      className="w-full border-b py-3 overflow-hidden whitespace-nowrap relative z-10 transition-colors duration-500"
      style={{
        backgroundColor: containerBg,
        borderColor: containerBorder,
      }}
    >
      <div className="flex items-center gap-12 animate-marquee-infinite hover:pause w-max">
        {/* Quadruple the items to ensure a looping of tags*/}
        {[...items, ...items, ...items, ...items].map((item, idx) => {
          const isPos = item.tag.startsWith("+");
          const label = item.tag.slice(1);

          return (
            <div
              key={idx}
              className="flex items-center gap-4 px-4 py-1 rounded-full border transition-all duration-300 hover:scale-105 shadow-sm"
              style={{
                backgroundColor: pillBg,
                borderColor: containerBorder,
              }}
            >
              <span
                className={`flex items-center gap-1.5 text-[11px] font-black uppercase tracking-widest ${
                  isPos ? "text-emerald-500" : "text-red-500"
                }`}
              >
                {isPos ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                {label}
              </span>

              <div className="flex items-center gap-2">
                <span
                  className="text-xs font-black tabular-nums transition-colors duration-500"
                  style={{ color: velocityText }}
                >
                  {item.velocity}
                </span>

                {/* Semantic Icons */}
                {item.velocity > 20 ? (
                  <Flame size={12} className="text-orange-500 fill-orange-500 animate-pulse" />
                ) : !isPos && item.velocity > 10 ? (
                  <AlertCircle size={12} className="text-red-400" />
                ) : null}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
