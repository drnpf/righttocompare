import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface MomentumChartProps {
  data: { month: string; avgRating: number; count: number }[];
}

export function MomentumChart({ data }: MomentumChartProps) {
  return (
    <div className="h-[400px] w-full bg-white dark:bg-[#161b22] p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
      <div className="flex items-center justify-between mb-8">
        <h3 className="text-sm font-bold uppercase tracking-widest text-[#2c3968] dark:text-[#4a7cf6]">
          Market Momentum
        </h3>
        <span className="text-[10px] font-bold px-2 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-600 rounded-full">
          Platform-Wide
        </span>
      </div>

      <ResponsiveContainer width="99%" aspect={3}>
        <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="colorRating" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#4a7cf6" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#4a7cf6" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#888888" opacity={0.1} />
          <XAxis
            dataKey="month"
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 10, fontWeight: 600, fill: "#94a3b8" }}
            dy={10}
          />
          <YAxis
            domain={[0, 5]}
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 10, fontWeight: 600, fill: "#94a3b8" }}
          />
          <Tooltip
            contentStyle={{
              borderRadius: "12px",
              border: "none",
              backgroundColor: "#1f2937",
              color: "#fff",
              fontSize: "12px",
            }}
            itemStyle={{ color: "#4a7cf6" }}
          />
          <Area
            type="monotone"
            dataKey="avgRating"
            stroke="#4a7cf6"
            strokeWidth={3}
            fillOpacity={1}
            fill="url(#colorRating)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
