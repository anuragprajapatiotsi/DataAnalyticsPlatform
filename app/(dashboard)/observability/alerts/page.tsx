import { ObservabilityHeader } from "@/components/observability/header";

export default function AlertsPage() {
  return (
    <div className="space-y-6">
      <ObservabilityHeader
        title="Alerts"
        subtitle="Configure and manage alerts for data quality and system health."
      />

      <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-white p-20 text-center">
        <p className="text-slate-500">Alerts configuration coming soon...</p>
      </div>
    </div>
  );
}
