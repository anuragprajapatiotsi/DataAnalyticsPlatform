import { SearchX } from "lucide-react";

import { Button } from "@/shared/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";

export function KpiCard() {
  return (
    <Card className="h-full rounded-lg border-slate-200 bg-slate-50/95 shadow-sm">
      <CardHeader className="border-b border-slate-200 pb-4">
        <CardTitle className="text-base text-slate-900">KPI</CardTitle>
      </CardHeader>
      <CardContent className="flex h-[300px] flex-col items-center justify-center gap-3 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-slate-400">
          <SearchX className="h-7 w-7" />
        </div>
        <h3 className="text-xl font-semibold text-slate-800">
          Start Tracking What Matters
        </h3>
        <p className="max-w-xs text-sm text-slate-500">
          Define key performance indicators to monitor impact and drive smarter
          decisions.
        </p>
        <Button
          size="sm"
          className="mt-1 rounded-md bg-blue-600 hover:bg-blue-700"
        >
          Set Up KPI
        </Button>
      </CardContent>
    </Card>
  );
}
