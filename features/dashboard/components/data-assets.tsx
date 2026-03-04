import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";

const assetSummary = [
  { label: "Tables", value: 1284 },
  { label: "Dashboards", value: 186 },
  { label: "Pipelines", value: 72 },
  { label: "ML Models", value: 24 },
];

export function DataAssetsCard() {
  return (
    <Card className="h-full rounded-lg border-slate-200 bg-slate-50/95 shadow-sm">
      <CardHeader>
        <CardTitle className="text-base text-slate-900">Data Assets</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-3">
        {assetSummary.map((asset) => (
          <div
            key={asset.label}
            className="rounded-lg border border-slate-200 bg-white p-4"
          >
            <p className="text-xs uppercase tracking-wide text-slate-500">
              {asset.label}
            </p>
            <p className="mt-1 text-2xl font-semibold text-slate-900">
              {asset.value}
            </p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
