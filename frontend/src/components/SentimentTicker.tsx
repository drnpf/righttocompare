import { TickerData } from "../types/trendTypes";
import { TrendingUp, TrendingDown, Flame, AlertCircle } from "lucide-react";

export function SentimentTicker({ items }: { items: TickerData[] }) {
  if (items.length === 0) return null;

  return (
    <div className="w-full bg-white dark:bg-[#0d1117] border-b border-gray-200 dark:border-gray-800 py-3 overflow-hidden whitespace-nowrap relative z-10">
      <div className="flex items-center gap-12 animate-marquee-infinite hover:pause w-max">
        {[...items, ...items, ...items, ...items].map((item, idx) => {
          const isPos = item.tag.startsWith("+");
          const label = item.tag.slice(1);

          return (
            <div
              key={idx}
              className="flex items-center gap-4 px-4 py-1 rounded-full bg-gray-50 dark:bg-[#161b26] border border-gray-100 dark:border-gray-800 transition-transform hover:scale-105"
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
                <span className="text-xs font-black text-gray-700 dark:text-gray-300 tabular-nums">
                  {item.velocity}
                </span>
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
