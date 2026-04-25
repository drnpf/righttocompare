interface BrandRadarProps {
  brands: { brand: string; avgRating: number; reviewCount: number }[];
}

export function BrandRadar({ brands }: BrandRadarProps) {
  return (
    <div className="bg-white dark:bg-[#111622] p-8 rounded-[2.5rem] border border-white dark:border-gray-800 shadow-[0_20px_50px_rgba(0,0,0,0.02)] h-full flex flex-col">
      <div className="mb-10">
        <h3 className="text-xs font-black uppercase tracking-[0.2em] text-[#2c3968] dark:text-[#4a7cf6] mb-1">
          Brand Radar
        </h3>
        <p className="text-[10px] text-gray-400 font-medium">Market sentiment ranking</p>
      </div>

      <div className="space-y-8 flex-1">
        {brands.map((item, idx) => (
          <div key={item.brand} className="group cursor-default">
            <div className="flex justify-between items-end mb-3">
              <div className="flex items-center gap-3">
                {/* Ranking Index */}
                <span className="text-[10px] font-black text-gray-300 dark:text-gray-700 group-hover:text-[#4a7cf6] transition-colors">
                  {(idx + 1).toString().padStart(2, "0")}
                </span>
                <span className="font-black text-gray-900 dark:text-white uppercase italic tracking-tighter group-hover:translate-x-1 transition-transform duration-300">
                  {item.brand}
                </span>
              </div>

              {/* Rating Badge */}
              <div className="flex flex-col items-end">
                <span className="text-lg font-black text-[#2c3968] dark:text-white leading-none">
                  {item.avgRating.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Performance Bar */}
            <div className="relative w-full h-1.5 bg-gray-100 dark:bg-gray-800/50 rounded-full overflow-hidden">
              <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle,rgba(74,124,246,0.2)_1px,transparent_1px)] bg-[size:4px_4px]" />

              <div
                className="relative h-full bg-gradient-to-r from-[#4a7cf6] to-[#6366f1] rounded-full transition-all duration-1000 ease-out"
                style={{ width: `${(item.avgRating / 5) * 100}%` }}
              >
                <div className="absolute right-0 top-0 h-full w-2 bg-white/40 blur-[2px]" />
              </div>
            </div>

            {/* Sub-data */}
            <div className="flex justify-between items-center mt-2">
              <p className="text-[9px] text-gray-400 uppercase font-black tracking-widest opacity-60 group-hover:opacity-100 transition-opacity">
                {item.reviewCount} <span className="font-medium text-[8px]">Community Insights</span>
              </p>
              <div className="h-1 w-1 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
            </div>
          </div>
        ))}
      </div>

      {/* Analytics Footer */}
      <div className="mt-8 pt-6 border-t border-gray-50 dark:border-gray-800/50">
        <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest text-center">
          Confidence Score: <span className="text-[#4a7cf6]">98.4%</span>
        </p>
      </div>
    </div>
  );
}
