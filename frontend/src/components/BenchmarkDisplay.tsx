import { BarChart3, Cpu, Monitor } from "lucide-react";

interface BenchmarkDisplayProps {
  benchmarks: Record<string, string>;
  phoneName: string;
}

// Max reference scores for progress bar scaling
const maxScores: Record<string, number> = {
  "GeekBench 6 Single-Core": 3000,
  "GeekBench 6 Multi-Core": 8000,
  "AnTuTu v10": 2000000,
  "3DMark Wild Life Extreme": 5500,
  "3DMark Solar Bay": 10000,
  "GFXBench Manhattan 3.1": 160,
  "GFXBench Car Chase": 120,
  "PCMark Work 3.0": 20000,
};

// Score rating labels
const getScoreRating = (percentage: number): { label: string; color: string } => {
  if (percentage >= 85) return { label: "Excellent", color: "#10b981" };
  if (percentage >= 70) return { label: "Great", color: "#3b82f6" };
  if (percentage >= 50) return { label: "Good", color: "#f59e0b" };
  return { label: "Average", color: "#9ca3af" };
};

// Parse score string to number
const parseScore = (scoreStr: string): number => {
  return parseInt(scoreStr.replace(/[^0-9]/g, "")) || 0;
};

// Group benchmarks into CPU and GPU categories
const cpuBenchmarks = ["GeekBench 6 Single-Core", "GeekBench 6 Multi-Core", "AnTuTu v10", "PCMark Work 3.0"];
const gpuBenchmarks = ["3DMark Wild Life Extreme", "3DMark Solar Bay", "GFXBench Manhattan 3.1", "GFXBench Car Chase"];

export default function BenchmarkDisplay({ benchmarks, phoneName }: BenchmarkDisplayProps) {
  if (!benchmarks || Object.keys(benchmarks).length === 0) return null;

  const cpuScores = Object.entries(benchmarks).filter(([key]) => cpuBenchmarks.includes(key));
  const gpuScores = Object.entries(benchmarks).filter(([key]) => gpuBenchmarks.includes(key));

  const renderScoreBar = (name: string, value: string) => {
    const score = parseScore(value);
    const max = maxScores[name] || 10000;
    const percentage = Math.min((score / max) * 100, 100);
    const rating = getScoreRating(percentage);

    return (
      <div key={name} className="mb-4">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-sm text-[#1e1e1e] dark:text-white">{name}</span>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-[#2c3968] dark:text-[#4a7cf6]">{value}</span>
            <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: `${rating.color}15`, color: rating.color }}>
              {rating.label}
            </span>
          </div>
        </div>
        <div className="w-full h-2.5 bg-[#f0f0f0] dark:bg-[#252b3d] rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-700 ease-out"
            style={{ width: `${percentage}%`, backgroundColor: rating.color }}
          />
        </div>
      </div>
    );
  };

  return (
    <div className="px-6 py-8" id="benchmarks">
      <div className="bg-white dark:bg-[#161b26] rounded-2xl shadow-sm p-6 md:p-8 transition-colors duration-300">
        {/* Title */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-[#f5f7fa] dark:bg-[#252b3d] flex items-center justify-center">
            <BarChart3 className="w-5 h-5 text-[#2c3968] dark:text-[#4a7cf6]" />
          </div>
          <div>
            <h2 className="text-[#2c3968] dark:text-[#4a7cf6]">Performance Benchmarks</h2>
            <p className="text-sm text-[#999] dark:text-[#707070]">{phoneName} benchmark scores</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* CPU Benchmarks */}
          {cpuScores.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Cpu className="w-4 h-4 text-[#2c3968] dark:text-[#4a7cf6]" />
                <h3 className="text-[#2c3968] dark:text-[#4a7cf6] text-sm font-medium">CPU Performance</h3>
              </div>
              {cpuScores.map(([name, value]) => renderScoreBar(name, value))}
            </div>
          )}

          {/* GPU Benchmarks */}
          {gpuScores.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Monitor className="w-4 h-4 text-[#2c3968] dark:text-[#4a7cf6]" />
                <h3 className="text-[#2c3968] dark:text-[#4a7cf6] text-sm font-medium">GPU Performance</h3>
              </div>
              {gpuScores.map(([name, value]) => renderScoreBar(name, value))}
            </div>
          )}
        </div>

        {/* Legend */}
        <div className="mt-6 pt-4 border-t border-[#e5e5e5] dark:border-[#2d3548]">
          <p className="text-xs text-[#999] dark:text-[#707070]">
            Scores benchmarked by GeekBench, AnTuTu, 3DMark, and GFXBench. 
          </p>
        </div>
      </div>
    </div>
  );
}