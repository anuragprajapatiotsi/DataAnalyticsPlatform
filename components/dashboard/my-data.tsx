import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const myDataItems = [
  { id: "my-1", name: "finance.monthly_revenue", owner: "admin", status: "Healthy" },
  { id: "my-2", name: "customer.orders_cleaned", owner: "admin", status: "Warning" },
  { id: "my-3", name: "ops.pipeline_run_log", owner: "admin", status: "Healthy" },
];

export function MyDataCard() {
  return (
    <Card className="h-full rounded-2xl border-slate-200 bg-slate-50/95 shadow-sm">
      <CardHeader>
        <CardTitle className="text-base text-slate-900">My Data</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {myDataItems.map((item) => (
          <div
            key={item.id}
            className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-3"
          >
            <div>
              <p className="text-sm font-medium text-slate-900">{item.name}</p>
              <p className="text-xs text-slate-500">Owner: {item.owner}</p>
            </div>
            <span
              className={
                item.status === "Healthy"
                  ? "rounded-full bg-emerald-100 px-2 py-1 text-xs font-semibold text-emerald-700"
                  : "rounded-full bg-amber-100 px-2 py-1 text-xs font-semibold text-amber-700"
              }
            >
              {item.status}
            </span>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
