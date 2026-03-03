import { Database } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { CustomSelect } from "@/shared/components/ui/custom-select";

const timeRangeOptions = [
  { label: "Last 7 days", value: "7d" },
  { label: "Last 30 days", value: "30d" },
  { label: "Last 90 days", value: "90d" },
];

export function TotalDataAssetsCard() {
  return (
    <Card className="h-full rounded-2xl border-slate-200 bg-slate-50/95 shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between border-b border-slate-200 pb-4">
        <CardTitle className="flex items-center gap-2 text-base text-slate-900">
          <Database className="h-4 w-4 text-slate-500" />
          Total Data Assets
        </CardTitle>
        <CustomSelect
          options={timeRangeOptions}
          value="7d"
          className="h-9 min-w-36 rounded-lg"
        />
      </CardHeader>
      <CardContent className="flex h-[300px] flex-col items-center justify-center gap-5">
        <div className="relative flex h-44 w-44 items-center justify-center rounded-full bg-[conic-gradient(#1d4ed8_0_300deg,#60a5fa_300deg_322deg,#93c5fd_322deg_342deg,#bfdbfe_342deg_360deg)]">
          <div className="flex h-32 w-32 items-center justify-center rounded-full bg-white text-4xl font-semibold text-slate-700">
            484
          </div>
        </div>
        <div className="rounded-xl border border-blue-200 bg-blue-100 px-5 py-2 text-center">
          <p className="text-2xl font-semibold leading-6 text-slate-700">24</p>
          <p className="text-xs text-slate-500">Feb</p>
        </div>
      </CardContent>
    </Card>
  );
}

