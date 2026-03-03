import { ObservabilityHeader } from "@/features/observability/components/header";

export default function IncidentsPage() {
  return (
    <div className="space-y-6">
      <ObservabilityHeader
        title="Incident Manager"
        subtitle="Manage and track data incidents to ensure timely resolution."
      />

      <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-white p-20 text-center">
        <p className="text-slate-500">
          Incident Manager content coming soon...
        </p>
      </div>
    </div>
  );
}

