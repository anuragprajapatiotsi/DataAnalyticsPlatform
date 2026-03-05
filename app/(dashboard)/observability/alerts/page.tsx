import { PageHeader } from "@/shared/components/layout/PageHeader";

export default function AlertsPage() {
  const breadcrumbItems = [
    { label: "Observability", href: "/observability" },
    { label: "Alerts" },
  ];

  return (
    <div className="flex flex-col px-6 py-6 space-y-6 animate-in fade-in duration-500">
      <PageHeader
        title="Alerts"
        description="Configure and manage alerts for data quality and system health."
        breadcrumbItems={breadcrumbItems}
      />

      <div className="rounded-lg border-2 border-dashed border-slate-200 bg-white p-20 text-center">
        <p className="text-slate-500">Alerts configuration coming soon...</p>
      </div>
    </div>
  );
}
