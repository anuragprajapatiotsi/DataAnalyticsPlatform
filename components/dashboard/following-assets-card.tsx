import { BellOff } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CustomSelect } from "@/components/ui/custom-select";

const filterOptions = [
  { label: "Latest", value: "latest" },
  { label: "Most Active", value: "most-active" },
  { label: "Recently Updated", value: "recently-updated" },
];

export function FollowingAssetsCard() {
  return (
    <Card className="h-full rounded-2xl border-slate-200 bg-slate-50/95 shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between border-b border-slate-200 pb-4">
        <CardTitle className="text-base text-slate-900">
          Following Assets
        </CardTitle>
        <CustomSelect
          options={filterOptions}
          value="latest"
          className="h-9 min-w-32 rounded-lg"
        />
      </CardHeader>
      <CardContent className="flex h-[300px] flex-col items-center justify-center gap-3 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-slate-400">
          <BellOff className="h-7 w-7" />
        </div>
        <h3 className="text-xl font-semibold text-slate-800">
          Find Assets to Follow
        </h3>
        <p className="max-w-xs text-sm text-slate-500">
          You can follow data assets to monitor their changes and activity in
          one place.
        </p>
        <Button
          size="sm"
          className="mt-1 rounded-md bg-blue-600 hover:bg-blue-700"
        >
          Explore Assets
        </Button>
      </CardContent>
    </Card>
  );
}
