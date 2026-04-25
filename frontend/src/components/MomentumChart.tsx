import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface MomentumChartProps {
  data: { month: string; avgRating: number; count?: number }[];
  title?: string;
  subtitle?: string;
  badgeText?: string;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const insightCount = payload[0].payload.count;
    return (
      <div className="bg-white/80 dark:bg-[#161b22]/90 backdrop-blur-md border border-gray-100 dark:border-gray-800 p-4 rounded-xl shadow-2xl transition-all duration-300">
        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">{label}</p>
        <div className="flex items-baseline gap-2">
          <p className="text-xl font-black text-[#2c3968] dark:text-white">{payload[0].value.toFixed(2)}</p>
          <p className="text-[10px] font-bold text-emerald-500 uppercase">Avg Vibe</p>
        </div>
        {insightCount !== undefined && insightCount > 0 && (
          <p className="text-[10px] text-gray-400 mt-1 italic font-medium">
            Based on {payload[0].payload.count} insights
          </p>
        )}
      </div>
    );
  }
  return null;
};

export function MomentumChart({
  data,
  title = "Market Momentum",
  subtitle = "Community sentiment trajectory",
  badgeText = "Platform-Wide",
}: MomentumChartProps) {
  return (
    <div className="h-[400px] w-full bg-white dark:bg-[#111622] p-8 rounded-[2.5rem] border border-white dark:border-gray-800 shadow-[0_20px_50px_rgba(0,0,0,0.02)] transition-all">
      <div className="flex items-center justify-between mb-10">
        <div>
          <h3 className="text-xs font-black uppercase tracking-[0.2em] text-[#2c3968] dark:text-[#4a7cf6] mb-1">
            {title}
          </h3>
          <p className="text-[10px] text-gray-400 font-medium">{subtitle}</p>
        </div>
        <span className="text-[9px] font-black px-3 py-1 bg-blue-50 dark:bg-blue-900/20 text-[#4a7cf6] rounded-full border border-blue-100 dark:border-blue-800 uppercase tracking-tighter">
          {badgeText}
        </span>
      </div>

      <ResponsiveContainer width="99%" aspect={3}>
        <AreaChart data={data} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
          <defs>
            {/* Main Fill Gradient */}
            <linearGradient id="colorRating" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#4a7cf6" stopOpacity={0.15} />
              <stop offset="95%" stopColor="#4a7cf6" stopOpacity={0} />
            </linearGradient>

            {/* Drop Shadow Filter for line */}
            <filter id="shadow" height="200%">
              <feGaussianBlur in="SourceAlpha" stdDeviation="3" result="blur" />
              <feOffset in="blur" dx="0" dy="4" result="offsetBlur" />
              <feFlood floodColor="#4a7cf6" floodOpacity="0.3" result="offsetColor" />
              <feComposite in="offsetColor" in2="offsetBlur" operator="in" result="offsetBlur" />
              <feMerge>
                <feMergeNode />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          <CartesianGrid vertical={false} stroke="#94a3b8" strokeOpacity={0.08} strokeWidth={1} />

          <XAxis
            dataKey="month"
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 9, fontWeight: 800, fill: "#94a3b8" }}
            dy={15}
            interval="preserveStartEnd"
          />

          <YAxis
            domain={[0, 5]}
            ticks={[0, 2.5, 5]}
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 9, fontWeight: 800, fill: "#94a3b8" }}
          />

          <Tooltip content={<CustomTooltip />} cursor={{ stroke: "#4a7cf6", strokeWidth: 1, strokeDasharray: "4 4" }} />

          <Area
            type="monotone"
            dataKey="avgRating"
            stroke="#4a7cf6"
            strokeWidth={4}
            strokeLinecap="round"
            fillOpacity={1}
            fill="url(#colorRating)"
            filter="url(#shadow)"
            animationDuration={1500}
            activeDot={{
              r: 6,
              fill: "#4a7cf6",
              stroke: "#fff",
              strokeWidth: 3,
              className: "shadow-xl",
            }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
