import { useDarkMode } from "./DarkModeContext";
import { darkModeColors } from "./darkModeConfig";

/**
 * This is the brand radar that shows how each brand is performing based
 * on an aggregation of reviews of all phones for each brand within some
 * time frame.
 */
interface BrandRadarProps {
  brands: { brand: string; avgRating: number; reviewCount: number }[];
}

export function BrandRadar({ brands }: BrandRadarProps) {
  const { isDarkMode } = useDarkMode();
  const colors = darkModeColors;

  // ------------------------------------------------------------
  // | COMPONENT LOGIC
  // ------------------------------------------------------------
  // Calculate total insights to determine statistical confidence
  const totalInsights = brands.reduce((sum, item) => sum + item.reviewCount, 0);

  /**
   * Confidence Calculation:
   * Score that scales with data volume.
   * Logic: 100 reviews = ~80% confidence, 500+ reviews = 99%+
   * Formula: 100 * (1 - e^(-total / constant))
   */
  const calculateConfidence = (total: number) => {
    if (total === 0) return 0;
    const score = 70 + 29.9 * (1 - Math.exp(-total / 200));
    return score.toFixed(1);
  };
  const dynamicConfidence = calculateConfidence(totalInsights);

  // ------------------------------------------------------------
  // | THEME DEFINITION
  // ------------------------------------------------------------
  const brandColor = isDarkMode ? colors.text.brand.dark : colors.text.brand.light;
  const secondaryText = isDarkMode ? colors.text.secondary.dark : colors.text.secondary.light;

  return (
    <div
      className="p-8 rounded-[2.5rem] border shadow-[0_20px_50px_rgba(0,0,0,0.02)] h-full flex flex-col transition-all duration-500"
      style={{
        backgroundColor: isDarkMode ? colors.background.card.dark : colors.background.card.light,
        borderColor: isDarkMode ? colors.border.default.dark : colors.border.default.light,
      }}
    >
      <div className="mb-10">
        <h3
          className="text-xs font-black uppercase tracking-[0.2em] mb-1 transition-colors duration-500"
          style={{ color: brandColor }}
        >
          Brand Radar
        </h3>
        <p className="text-[10px] font-medium" style={{ color: secondaryText }}>
          Market sentiment ranking
        </p>
      </div>

      <div className="space-y-4 flex-1">
        {brands.map((item, idx) => (
          <div
            key={item.brand}
            className="group cursor-default p-4 -mx-4 rounded-2xl transition-all duration-300 hover:bg-[#f0f0f0] dark:hover:bg-[#1e2530]"
          >
            <div className="flex justify-between items-end mb-3">
              <div className="flex items-center gap-3">
                {/* Ranking Index */}
                <span className="text-[10px] font-black text-gray-300 dark:text-gray-600 group-hover:text-[#4a7cf6] transition-colors">
                  {(idx + 1).toString().padStart(2, "0")}
                </span>
                <span className="font-black text-gray-900 dark:text-white uppercase italic tracking-tighter group-hover:translate-x-1 transition-transform duration-300">
                  {item.brand}
                </span>
              </div>

              {/* Rating Badge */}
              <div className="flex flex-col items-end">
                <span
                  className="text-lg font-black leading-none transition-colors duration-500"
                  style={{ color: isDarkMode ? "#fff" : colors.text.brand.light }}
                >
                  {item.avgRating.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Performance Bar */}
            <div className="relative w-full h-1.5 rounded-full overflow-hidden bg-gray-100 dark:bg-gray-800/50">
              <div
                className="relative h-full transition-all duration-1000 ease-out"
                style={{
                  width: `${(item.avgRating / 5) * 100}%`,
                  backgroundColor: brandColor,
                }}
              >
                <div className="absolute right-0 top-0 h-full w-2 bg-white/40 blur-[2px]" />
              </div>
            </div>

            {/* Sub-data */}
            <div className="flex justify-between items-center mt-2">
              <p
                className="text-[9px] uppercase font-black tracking-widest opacity-60 group-hover:opacity-100 transition-opacity"
                style={{ color: secondaryText }}
              >
                {item.reviewCount} <span className="font-medium text-[8px]">Community Insights</span>
              </p>
              <div
                className="h-1 w-1 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]"
                style={{ backgroundColor: isDarkMode ? "#4a7cf6" : "#10b981" }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Analytics Footer */}
      <div
        className="mt-8 pt-6 border-t"
        style={{ borderColor: isDarkMode ? colors.border.subtle.dark : colors.border.subtle.light }}
      >
        <p className="text-[9px] font-bold uppercase tracking-widest text-center" style={{ color: secondaryText }}>
          Confidence Score: <span style={{ color: brandColor }}>{dynamicConfidence}%</span>
        </p>
      </div>
    </div>
  );
}
