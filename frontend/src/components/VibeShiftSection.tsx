import { useEffect, useState } from "react";
import { Info, BarChart2, Activity, Plus, ArrowUpRight, Check } from "lucide-react";

// Custom Components & API
import { getPhoneVibeShift } from "../api/trendsApi";
import { VibeShiftResponse } from "../types/trendTypes";
import { MomentumChart } from "./MomentumChart";

interface VibeShiftProps {
  phoneId: string;
  comparisonPhoneIds: string[];
  onCompare: (id: string) => void;
  onRemove: (id: string) => void;
  onViewDetails: (id: string) => void;
}

export function VibeShiftSection({ phoneId, comparisonPhoneIds, onCompare, onRemove, onViewDetails }: VibeShiftProps) {
  // ------------------------------------------------------------
  // | HOOKS
  // ------------------------------------------------------------
  const [data, setData] = useState<VibeShiftResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [timeRange, setTimeRange] = useState(12); // Default to 12 months

  // ------------------------------------------------------------
  // | DATA SYNCHRONIZATION
  // ------------------------------------------------------------
  useEffect(() => {
    if (!phoneId) return;
    setLoading(true);

    // Pass the timeRange to the API call
    const days = timeRange === 12 ? 365 : timeRange === 24 ? 730 : timeRange * 30; // Converting months to days
    getPhoneVibeShift(phoneId, days)
      .then(setData)
      .finally(() => setLoading(false));
  }, [phoneId, timeRange]);

  // ------------------------------------------------------------
  // | RENDER GUARD PAGES
  // ------------------------------------------------------------
  if (!phoneId)
    return (
      <div className="h-[400px] border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-3xl flex flex-col items-center justify-center text-gray-400">
        <BarChart2 size={48} className="mb-4 opacity-20" />
        <p className="font-medium">Select a device to analyze its vibe shift</p>
      </div>
    );

  // Checks if phone has any mixed sentiment based how many pros/cons and reviews were analyzed
  const hasPros = data?.currentVibe.pros && data.currentVibe.pros.length > 0;
  const hasCons = data?.currentVibe.cons && data.currentVibe.cons.length > 0;
  const isMixed = !hasPros && !hasCons && (data?.currentVibe.totalAnalyzed || 0) > 5;

  // Checks if phone is already in comparison cart
  const isAlreadyInCart = comparisonPhoneIds.includes(phoneId);

  // ------------------------------------------------------------
  // | UI
  // ------------------------------------------------------------
  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-1000">
      {/* QUICK ACTION BAR */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pb-6 border-b border-gray-100 dark:border-gray-800/50">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-[#4a7cf6]/10 rounded-2xl text-[#4a7cf6]">
            <BarChart2 size={20} />
          </div>
          <div>
            <h4 className="text-sm font-black uppercase tracking-widest text-gray-900 dark:text-white">
              {phoneId.replace(/-/g, " ")}
            </h4>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">Deep Dive Active</p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          {/* FULL DETAILS BUTTON */}
          <button
            onClick={() => onViewDetails(phoneId)}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 text-[11px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-400 hover:text-[#4a7cf6] dark:hover:text-[#4a7cf6] hover:border-[#4a7cf6] dark:hover:border-[#4a7cf6] hover:bg-blue-50/30 dark:hover:bg-blue-900/10 hover:shadow-md transition-all duration-300 group active:scale-95 cursor-pointer"
          >
            Full Details
            <ArrowUpRight
              size={14}
              className="transform transition-transform duration-300 opacity-60 group-hover:opacity-100 group-hover:-translate-y-1 group-hover:translate-x-1 cursor-pointer"
            />
          </button>

          {/* COMPARISON TOGGLE BUTTON */}
          {isAlreadyInCart ? (
            /* SUCCESS STATE: ALREADY IN COMPARE (GREEN) */
            <button
              onClick={() => onRemove(phoneId)}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl border border-emerald-500/50 bg-emerald-500/5 dark:bg-emerald-500/10 text-gray-500 dark:text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:border-emerald-500 hover:shadow-lg hover:shadow-emerald-500/10 transition-all duration-300 active:scale-95 cursor-pointer group"
            >
              <Check
                size={14}
                strokeWidth={3}
                className="text-emerald-500 transform transition-transform duration-300 group-hover:scale-110"
              />
              <span>ALREADY IN COMPARE</span>
            </button>
          ) : (
            /* ACTION STATE: ADD TO COMPARE (BLUE) */
            <button
              onClick={() => onCompare(phoneId)}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl border border-[#4a7cf6]/50 bg-[#4a7cf6]/5 dark:bg-[#4a7cf6]/10 text-gray-500 dark:text-gray-400 hover:text-[#4a7cf6] dark:hover:text-[#4a7cf6] hover:border-[#4a7cf6] hover:shadow-lg hover:shadow-blue-500/10 transition-all duration-300 active:scale-95 cursor-pointer group"
            >
              <Plus
                size={14}
                strokeWidth={3}
                className="text-[#4a7cf6] transform transition-transform duration-300 group-hover:rotate-90"
              />
              <span>ADD TO COMPARE</span>
            </button>
          )}
        </div>
      </div>

      {/* TIME RANGE PICKER */}
      <div className="flex justify-center">
        <div className="inline-flex bg-gray-100/50 dark:bg-[#161b22] p-1.5 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-inner gap-1 mt-4">
          {[3, 6, 12, 24].map((m) => (
            <button
              key={m}
              onClick={() => setTimeRange(m)}
              disabled={loading}
              className={`px-6 py-2 rounded-xl text-[11px] font-black transition-all duration-300 uppercase cursor-pointer tracking-tighter ${
                timeRange === m
                  ? "bg-white dark:bg-[#2c3968] text-[#4a7cf6] dark:text-white shadow-sm scale-105"
                  : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              }`}
            >
              {m === 24 ? "2Y View" : `${m}M View`}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 min-h-[450px]">
        {/* --- LEFT COLUMN: CHART --- */}
        <div className="lg:col-span-2 relative">
          {loading && data && (
            <div className="absolute inset-0 z-10 bg-white/40 dark:bg-[#0d1117]/40 backdrop-blur-[2px] rounded-[2.5rem] flex items-center justify-center animate-in fade-in duration-300">
              <div className="flex flex-col items-center gap-2">
                <Activity className="text-[#4a7cf6] animate-spin" size={32} />
                <p className="text-[10px] font-black uppercase tracking-widest text-[#4a7cf6]">
                  Updating Trajectory...
                </p>
              </div>
            </div>
          )}

          {!data && loading ? (
            /* Initial Load Skeleton */
            <div className="w-full h-[400px] bg-gray-100/50 dark:bg-white/5 animate-pulse rounded-[2.5rem] border border-dashed border-gray-200 dark:border-gray-800 flex items-center justify-center">
              <Activity className="text-gray-200 dark:text-gray-800 animate-bounce" size={32} />
            </div>
          ) : (
            <div className={`transition-opacity duration-500 ${loading ? "opacity-30" : "opacity-100"}`}>
              <MomentumChart
                data={data?.timeline.map((t) => ({ ...t, month: t.date })) || []}
                title="Community Vibe Over Time"
                subtitle="How user opinions have shifted"
                badgeText={`${timeRange}M Timeline`}
              />
            </div>
          )}
        </div>

        {/* --- RIGHT COLUMN: PROS/CONS --- */}
        <div className="relative">
          {/* PROS/CONS OVERLAY */}
          {loading && data && (
            <div className="absolute inset-0 z-10 bg-white/40 dark:bg-[#111622]/40 backdrop-blur-[2px] rounded-[2.5rem] animate-in fade-in duration-300" />
          )}

          <div
            className={`bg-white dark:bg-[#111622] p-8 h-full rounded-[2.5rem] border border-white dark:border-gray-800 shadow-[0_20px_50px_rgba(0,0,0,0.02)] flex flex-col justify-between transition-opacity duration-500 ${loading && data ? "opacity-30" : "opacity-100"}`}
          >
            {!data && loading ? (
              <div className="space-y-10 animate-pulse">
                <div className="h-4 w-24 bg-gray-100 dark:bg-gray-800 rounded-full" />
                <div className="space-y-4">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="h-8 w-full bg-gray-50 dark:bg-gray-800/40 rounded-xl" />
                  ))}
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col justify-between">
                <div>
                  <div className="mb-10">
                    <h3 className="text-xs font-black uppercase tracking-[0.2em] text-[#2c3968] dark:text-[#4a7cf6] mb-1 flex items-center gap-2">
                      <Info size={14} className="opacity-50" /> Current Vibe
                    </h3>
                    <p className="text-[10px] text-gray-400 font-medium italic">What people are saying right now</p>
                  </div>

                  {isMixed ? (
                    <div className="py-12 px-6 text-center bg-amber-50/30 dark:bg-amber-900/10 rounded-[2rem] border border-dashed border-amber-200 dark:border-amber-800/50">
                      <p className="text-[10px] font-black text-amber-600 dark:text-amber-500 uppercase tracking-[0.2em] mb-2">
                        Mixed Reviews
                      </p>
                      <p className="text-xs text-amber-700/60 dark:text-amber-400/50 italic leading-relaxed">
                        Opinions are currently split.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-12">
                      <div className="space-y-4 mt-8">
                        <p className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.2em]">
                          Top Strengths
                        </p>
                        <div className="space-y-3">
                          {hasPros &&
                            data?.currentVibe.pros.slice(0, 5).map((p) => (
                              <div key={p.topic} className="flex items-center justify-between group/item">
                                <span className="text-[13px] font-black text-gray-800 dark:text-white uppercase tracking-tighter group-hover/item:text-emerald-500 transition-colors">
                                  {p.topic}
                                </span>
                                <div className="h-px flex-1 mx-4 bg-gray-50 dark:bg-gray-800/50" />
                                <span className="text-[10px] font-bold text-gray-400">
                                  {p.count} <span className="text-[8px] opacity-50 uppercase">mentions</span>
                                </span>
                              </div>
                            ))}
                        </div>
                      </div>

                      <div className="space-y-4 mt-8">
                        <p className="text-[10px] font-black text-red-500 uppercase tracking-[0.2em]">
                          Common Complaints
                        </p>
                        <div className="space-y-3">
                          {hasCons &&
                            data?.currentVibe.cons.slice(0, 5).map((c) => (
                              <div key={c.topic} className="flex items-center justify-between group/item">
                                <span className="text-[13px] font-black text-gray-800 dark:text-white uppercase tracking-tighter group-hover/item:text-red-500 transition-colors">
                                  {c.topic}
                                </span>
                                <div className="h-px flex-1 mx-4 bg-gray-50 dark:bg-gray-800/50" />
                                <span className="text-[10px] font-bold text-gray-400">
                                  {c.count} <span className="text-[8px] opacity-50 uppercase">mentions</span>
                                </span>
                              </div>
                            ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="mt-12 pt-6 border-t border-gray-50 dark:border-gray-800/50 flex flex-col gap-1">
                  <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">
                    Based on {data?.currentVibe.totalAnalyzed || 0} community reviews
                  </p>
                  <p className="text-[8px] text-gray-300 dark:text-gray-600 font-medium italic">
                    Data updated in real-time
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
