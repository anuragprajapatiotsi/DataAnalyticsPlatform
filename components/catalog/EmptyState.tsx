"use client";

import { Database } from "lucide-react";

export function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center animate-in fade-in duration-700">
      <div className="relative mb-6">
        <div className="absolute -inset-4 rounded-full bg-blue-50/50 blur-xl" />
        <Database className="relative h-24 w-24 text-slate-300 opacity-60" />
      </div>

      <h3 className="text-xl font-bold text-slate-800 mb-2">
        No data is available in the All Domains.
      </h3>
      <p className="max-w-md text-sm text-slate-500 mb-8 leading-relaxed">
        Start by adding a service or data asset to the All Domains.
      </p>

      <div className="flex flex-col items-center gap-2 pt-6 border-t border-slate-100 w-full max-w-xs">
        <p className="text-xs text-slate-400">
          Still need help?{" "}
          <a
            href="#"
            className="text-blue-600 font-semibold hover:underline decoration-2 underline-offset-4"
          >
            Refer to our docs
          </a>{" "}
          for more information.
        </p>
      </div>
    </div>
  );
}
