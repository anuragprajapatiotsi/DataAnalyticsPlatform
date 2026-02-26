import { cn } from "@/utils/cn";

interface MetricCardProps {
  title: string;
  value: string | number;
  progress: number;
  legend?: { label: string; value: number; color: string }[];
}

function ProgressCircle({
  percent,
  color,
}: {
  percent: number;
  color: string;
}) {
  const radius = 35;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percent / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center">
      <svg className="h-20 w-20 transform -rotate-90">
        <circle
          className="text-slate-100"
          strokeWidth="6"
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx="40"
          cy="40"
        />
        <circle
          className={cn("transition-all duration-1000", color)}
          strokeWidth="6"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx="40"
          cy="40"
        />
      </svg>
      <span className="absolute text-sm font-bold text-slate-900">
        {percent}%
      </span>
    </div>
  );
}

export function QualityMetrics() {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
      {/* Total Tests */}
      <div className="flex items-center justify-between rounded-xl border border-slate-100 bg-white p-5 shadow-sm">
        <div className="space-y-3">
          <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">
            Total Tests
          </p>
          <p className="text-3xl font-bold text-slate-900">0</p>
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2 text-xs">
              <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              <span className="text-slate-500">Success</span>
              <span className="font-semibold text-slate-700">0</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <div className="h-1.5 w-1.5 rounded-full bg-orange-500" />
              <span className="text-slate-500">Aborted</span>
              <span className="font-semibold text-slate-700">0</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <div className="h-1.5 w-1.5 rounded-full bg-red-500" />
              <span className="text-slate-500">Failed</span>
              <span className="font-semibold text-slate-700">0</span>
            </div>
          </div>
        </div>
        <ProgressCircle percent={0} color="text-emerald-500" />
      </div>

      {/* Healthy Data Assets */}
      <div className="flex items-center justify-between rounded-xl border border-slate-100 bg-white p-5 shadow-sm">
        <div className="space-y-1">
          <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">
            Healthy Data Assets
          </p>
          <p className="text-3xl font-bold text-slate-900">0</p>
        </div>
        <ProgressCircle percent={0} color="text-blue-500" />
      </div>

      {/* Data Assets Coverage */}
      <div className="flex items-center justify-between rounded-xl border border-slate-100 bg-white p-5 shadow-sm">
        <div className="space-y-1">
          <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">
            Data Assets Coverage
          </p>
          <p className="text-3xl font-bold text-slate-900">0</p>
        </div>
        <ProgressCircle percent={0} color="text-purple-500" />
      </div>
    </div>
  );
}
