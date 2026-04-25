import { useEffect, useState } from "react";
import { Info, BarChart2 } from "lucide-react";

// Custom Components & API
import { getPhoneVibeShift } from "../api/trendsApi";
import { VibeShiftResponse } from "../types/trendTypes";
import { MomentumChart } from "./MomentumChart";

export function VibeShiftSection({ phoneId }: { phoneId: string }) {
  const [data, setData] = useState<VibeShiftResponse | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!phoneId) return;
    setLoading(true);
    getPhoneVibeShift(phoneId, 30)
      .then(setData)
      .finally(() => setLoading(false));
  }, [phoneId]);

  if (!phoneId)
    return (
      <div className="h-[400px] border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-3xl flex flex-col items-center justify-center text-gray-400">
        <BarChart2 size={48} className="mb-4 opacity-20" />
        <p className="font-medium">Select a device to analyze its vibe shift</p>
      </div>
    );

  if (loading) return <div className="h-[400px] animate-pulse bg-gray-100 dark:bg-gray-800 rounded-3xl" />;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Historical Timeline */}
        <div className="lg:col-span-2">
          <MomentumChart data={data?.timeline.map((t) => ({ ...t, month: t.date, count: 0 })) || []} />
        </div>

        {/* Current Vibe (Pros & Cons) */}
        <div className="bg-white dark:bg-[#161b22] p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
          <h3 className="text-sm font-bold uppercase tracking-widest text-[#2c3968] dark:text-[#4a7cf6] mb-6 flex items-center gap-2">
            <Info size={16} /> Current Vibe
          </h3>

          <div className="space-y-6">
            <div>
              <p className="text-[10px] font-black text-emerald-500 uppercase mb-3">Top Pros</p>
              <div className="flex flex-wrap gap-2">
                {data?.currentVibe.pros.slice(0, 5).map((p) => (
                  <span
                    key={p.topic}
                    className="px-3 py-1 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold rounded-lg border border-emerald-100 dark:border-emerald-800"
                  >
                    +{p.topic}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <p className="text-[10px] font-black text-red-500 uppercase mb-3">Top Cons</p>
              <div className="flex flex-wrap gap-2">
                {data?.currentVibe.cons.slice(0, 5).map((c) => (
                  <span
                    key={c.topic}
                    className="px-3 py-1 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-xs font-bold rounded-lg border border-red-100 dark:border-red-800"
                  >
                    -{c.topic}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
