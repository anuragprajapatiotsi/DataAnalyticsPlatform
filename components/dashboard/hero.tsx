import { Database, Search } from "lucide-react";

import { Card } from "@/components/ui/card";
import { CustomSelect } from "@/components/ui/custom-select";
import { Input } from "@/components/ui/input";

const domains = [
  "Payments DB",
  "Finance Warehouse",
  "Customer 360",
  "Analytics Core",
  "Observability",
];

const domainOptions = [
  { label: "All Domains", value: "all" },
  { label: "Finance", value: "finance" },
  { label: "Marketing", value: "marketing" },
  { label: "Operations", value: "operations" },
  { label: "Data Platform", value: "data-platform" },
];

export function DashboardHero() {
  return (
    <section className="space-y-5">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
          Welcome, admin!
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          Search and manage metadata for tables, databases, schemas, and
          pipelines.
        </p>
      </div>

      <div className="flex flex-col gap-3 lg:flex-row">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            className="h-11 rounded-xl border-slate-200 bg-white pl-10 shadow-sm"
            placeholder="Search metadata (tables, databases, schemas...)"
          />
        </div>
        <CustomSelect
          options={domainOptions}
          value="all"
          className="h-11 min-w-52"
        />
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5">
        {domains.map((domain) => (
          <Card
            key={domain}
            className="flex items-center gap-3 rounded-xl border-slate-200 bg-white/95 p-3 shadow-sm"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
              <Database className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900">{domain}</p>
              <p className="text-xs text-slate-500">Postgres</p>
            </div>
          </Card>
        ))}
      </div>
    </section>
  );
}
