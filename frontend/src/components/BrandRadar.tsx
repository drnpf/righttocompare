interface BrandRadarProps {
  brands: { brand: string; avgRating: number; reviewCount: number }[];
}

export function BrandRadar({ brands }: BrandRadarProps) {
  return (
    <div className="bg-white dark:bg-[#161b22] p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm h-full">
      <h3 className="text-sm font-bold uppercase tracking-widest text-[#2c3968] dark:text-[#4a7cf6] mb-8">
        Brand Radar
      </h3>
      <div className="space-y-6">
        {brands.map((item, idx) => (
          <div key={item.brand} className="group">
            <div className="flex justify-between items-end mb-2">
              <div>
                <span className="text-[10px] font-bold text-gray-400 mr-2">0{idx + 1}</span>
                <span className="font-bold text-gray-900 dark:text-white">{item.brand}</span>
              </div>
              <span className="text-sm font-black text-[#4a7cf6]">{item.avgRating}</span>
            </div>
            {/* Minimal Progress Bar */}
            <div className="w-full h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#4a7cf6] rounded-full transition-all duration-1000"
                style={{ width: `${(item.avgRating / 5) * 100}%` }}
              />
            </div>
            <p className="text-[9px] text-gray-400 mt-1 uppercase font-bold tracking-tighter">
              Based on {item.reviewCount} community insights
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
