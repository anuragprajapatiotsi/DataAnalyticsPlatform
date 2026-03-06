"use client";

import React from "react";
import { PASSWORD_POLICY } from "@/shared/utils/validation";

export function PasswordGuidance() {
  return (
    <div className="mt-2 space-y-1.5 p-3 rounded-lg bg-slate-50 border border-slate-100 animate-in slide-in-from-top-1 duration-300">
      <p className="text-[12px] font-bold text-slate-700 mb-1">
        Password must contain:
      </p>
      <ul className="space-y-1 list-none p-0 m-0">
        {PASSWORD_POLICY.rules.map((rule, index) => (
          <li
            key={index}
            className="flex items-center gap-2 text-[12px] text-slate-500"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
            {rule.label}
          </li>
        ))}
      </ul>
    </div>
  );
}
