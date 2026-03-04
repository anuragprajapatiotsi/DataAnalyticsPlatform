import { Clock3 } from "lucide-react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";

const activityItems = [
  {
    id: "evt-1",
    title: "Schema updated",
    description: "orders.transaction_status added in finance.orders",
    timestamp: "2 min ago",
  },
  {
    id: "evt-2",
    title: "New table indexed",
    description: "analytics.customer_lifecycle indexed for search",
    timestamp: "18 min ago",
  },
  {
    id: "evt-3",
    title: "Data quality warning",
    description: "null ratio exceeded threshold for marketing.campaigns",
    timestamp: "1 hr ago",
  },
];

export function ActivityFeedCard() {
  return (
    <Card className="h-full rounded-lg border-slate-200 bg-slate-50/95 shadow-sm">
      <CardHeader>
        <CardTitle className="text-base text-slate-900">
          Activity Feed
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {activityItems.map((item) => (
          <div
            key={item.id}
            className="rounded-lg border border-slate-200 bg-white p-3"
          >
            <p className="text-sm font-semibold text-slate-900">{item.title}</p>
            <p className="mt-1 text-xs text-slate-600">{item.description}</p>
            <p className="mt-2 inline-flex items-center gap-1 text-xs text-slate-500">
              <Clock3 className="h-3.5 w-3.5" />
              {item.timestamp}
            </p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
