"use client";

import React from "react";
import { Descriptions, Tag, Divider } from "antd";
import { Info, Shield, Layers } from "lucide-react";

interface PreviewStepProps {
  form: any;
}

export function PreviewStep({ form }: PreviewStepProps) {
  const data = form.getFieldsValue();
  return (
    <div className="space-y-2 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div>
        <h2 className="text-lg font-bold text-slate-900 tracking-tight">Review & Finalize</h2>
        <p className="text-slate-500 text-sm">Verify configuration before connecting.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        <section className="bg-white rounded-lg border border-slate-200 overflow-hidden">
          <div className="bg-slate-50/80 px-3 py-1 border-b border-slate-100 flex items-center gap-2">
            <Info size={14} className="text-blue-600" />
            <h3 className="font-bold text-slate-800 uppercase tracking-wider text-[9px]">General</h3>
          </div>
          <div className="p-2 space-y-2">
            <div className="space-y-0.5">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Name</span>
              <p className="text-slate-900 font-bold text-sm truncate">{data.name || "Untitled"}</p>
            </div>
            <div className="flex gap-1.5">
              <Tag color="blue" className="px-2 py-0 rounded-md font-bold border-none bg-blue-50 text-blue-700 uppercase text-[8px]">
                {data.type}
              </Tag>
              {data.integration_label && (
                <Tag color="cyan" className="px-2 py-0 rounded-md font-bold border-none bg-cyan-50 text-cyan-700 uppercase text-[8px]">
                  {data.integration_label}
                </Tag>
              )}
            </div>
          </div>
        </section>

        <section className="bg-white rounded-lg border border-slate-200 overflow-hidden">
          <div className="bg-slate-50/80 px-3 py-1 border-b border-slate-100 flex items-center gap-2">
            <Layers size={14} className="text-indigo-600" />
            <h3 className="font-bold text-slate-800 uppercase tracking-wider text-[9px]">Technical</h3>
          </div>
          <div className="p-2 grid grid-cols-2 gap-x-3 gap-y-1.5">
            {data.json_config ? (
              (() => {
                try {
                  const parsed = JSON.parse(data.json_config);
                  return (
                    <>
                      <div className="space-y-0.5">
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest truncate block">Service Name</span>
                        <p className="text-slate-900 font-mono text-[10px] truncate">{parsed.service_name}</p>
                      </div>
                      <div className="space-y-0.5">
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest truncate block">Base URL</span>
                        <p className="text-slate-900 font-mono text-[10px] truncate">{parsed.base_url}</p>
                      </div>
                      <div className="col-span-2 space-y-0.5">
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest truncate block">Config Mode</span>
                        <Tag color="gold" className="text-[8px] font-bold px-1 py-0 border-none m-0">JSON PAYLOAD</Tag>
                      </div>
                    </>
                  );
                } catch (e) {
                  return <p className="text-[10px] text-red-500 col-span-2">Invalid JSON Config</p>;
                }
              })()
            ) : (
              Object.entries(data).map(([key, value]) => {
                if (["name", "description", "type", "password", "db_id", "integration_slug", "integration_label", "service_name"].includes(key)) return null;
                if (typeof value === "object") return null;
                return (
                  <div key={key} className="space-y-0.5">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest truncate block">{key.replace(/_/g, " ")}</span>
                    <p className="text-slate-900 font-mono text-[10px] truncate" title={String(value)}>{String(value)}</p>
                  </div>
                );
              })
            )}
            {!data.json_config && data.password && (
              <div className="space-y-0.5">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Password</span>
                <p className="text-slate-400 tracking-tighter text-[10px]">••••••••</p>
              </div>
            )}
          </div>
        </section>
      </div>

      <div className="bg-blue-600 rounded-lg p-3 flex gap-3 items-center shadow-sm">
        <Shield className="text-white shrink-0" size={16} />
        <p className="text-blue-50 text-[10px] leading-tight">
          Encryption (AES-256) is applied to all credentials before storage.
        </p>
      </div>
    </div>
  );
}
