import { PageHeader } from "@/shared/components/layout/PageHeader";

export default function IncidentsPage() {
  const breadcrumbItems = [
    { label: "Observability", href: "/observability" },
    { label: "Incident Manager" },
  ];

  return (
    <div className="flex flex-col px-6 pt-2 pb-6 space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-500 max-w-[1400px] mx-auto">
      <PageHeader
        title="Incident Manager"
        description="Manage and track data incidents to ensure timely resolution."
        breadcrumbItems={breadcrumbItems}
      />

      <div className="rounded-lg border-2 border-dashed border-slate-200 bg-white p-20 text-center">
        <p className="text-slate-500">
          Incident Manager content coming soon...
        </p>
      </div>
    </div>
  );
}
