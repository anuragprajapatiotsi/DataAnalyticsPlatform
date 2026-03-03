import { TestTube2 } from "lucide-react";

const columns = [
  "Status",
  "Failed/Aborted Reason",
  "Last Run",
  "Name",
  "Table",
  "Column",
  "Incident",
];

export function QualityTable() {
  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-1">
        <h3 className="text-lg font-bold text-slate-900">Test Case Insights</h3>
        <p className="text-xs text-slate-500">
          Access a centralized view of your dataset's health based on configured
          test validations.
        </p>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50">
                {columns.map((column) => (
                  <th
                    key={column}
                    className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider"
                  >
                    {column}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colSpan={columns.length} className="px-6 py-24 text-center">
                  <div className="flex flex-col items-center justify-center space-y-4">
                    <div className="relative">
                      <div className="absolute -inset-4 rounded-full bg-blue-50/50 blur-xl" />
                      <div className="relative rounded-full bg-blue-50 p-4">
                        <TestTube2 className="h-10 w-10 text-blue-400" />
                      </div>
                    </div>
                    <div className="space-y-2 max-w-sm">
                      <p className="text-sm font-medium text-slate-900">
                        No test cases found
                      </p>
                      <p className="text-xs leading-relaxed text-slate-500">
                        Enhance your data reliability by adding quality tests to
                        this table. Our step-by-step guide will show you how to
                        get started.
                      </p>
                    </div>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
