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
        <h2 className="text-lg font-bold text-slate-900 tracking-tight">
          Review & Finalize
        </h2>
        <p className="text-slate-500 text-sm">
          Verify configuration before connecting.
        </p>
      </div>

      <div className="space-y-4">
        <section className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="bg-slate-50/50 px-4 py-2.5 border-b border-slate-100 flex items-center gap-2">
            <Info size={16} className="text-blue-600" />
            <h3 className="font-bold text-slate-800 uppercase tracking-wider text-[10px]">
              General Information
            </h3>
          </div>
          <div className="p-4">
            <Descriptions column={2} size="small" layout="vertical" colon={false}>
              <Descriptions.Item label={<span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Source Category</span>}>
                <Tag color="blue" className="px-2 py-0 rounded-md font-bold border-none bg-blue-50 text-blue-700 uppercase text-[9px]">
                  {data.service_type || "Unknown"}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label={<span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Service Name</span>} span={1}>
                <span className="text-slate-700 text-[11px] font-bold">{data.service_name || "Untitled Service"}</span>
              </Descriptions.Item>
              <Descriptions.Item label={<span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Integration</span>} span={1}>
                <span className="text-slate-700 text-[11px] font-medium">{data.integration_label || data.service_name || "No Integration Selected"}</span>
              </Descriptions.Item>
              {data.description && (
                <Descriptions.Item label={<span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Description</span>} span={2}>
                  <p className="text-slate-500 text-[11px] leading-relaxed">{data.description}</p>
                </Descriptions.Item>
              )}
            </Descriptions>
          </div>
        </section>

        <section className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="bg-slate-50/50 px-4 py-2.5 border-b border-slate-100 flex items-center gap-2">
            <Layers size={16} className="text-indigo-600" />
            <h3 className="font-bold text-slate-800 uppercase tracking-wider text-[10px]">
              Technical Configuration
            </h3>
          </div>
          <div className="p-4">
            <Descriptions column={{ xs: 1, sm: 2, md: 2 }} size="small" layout="vertical" colon={false} className="technical-descriptions">
              {data.json_config ? (
                (() => {
                  try {
                    const parsed = JSON.parse(data.json_config);
                    const fields = { ...parsed, ...parsed.extra };
                    delete fields.extra;
                    
                    return Object.entries(fields).map(([key, value]) => {
                      if (typeof value === 'object') return null;
                      const isPassword = key.toLowerCase().includes('password') || key.toLowerCase().includes('secret');
                      return (
                        <Descriptions.Item 
                          key={key} 
                          label={<span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest truncate block">{key.replace(/_/g, " ")}</span>}
                        >
                          <span className="text-slate-900 font-mono text-[11px] break-all">
                            {isPassword ? "••••••••" : String(value)}
                          </span>
                        </Descriptions.Item>
                      );
                    });
                  } catch (e) {
                    return <Descriptions.Item label="Error">Invalid JSON Config</Descriptions.Item>;
                  }
                })()
              ) : (
                Object.entries(data).map(([key, value]) => {
                  const reserved = ["name", "description", "type", "db_id", "integration_slug", "integration_label", "service_name", "json_config"];
                  if (reserved.includes(key) || typeof value === "object" || value === undefined || value === "") return null;
                  
                  const isPassword = key.toLowerCase().includes('password') || key.toLowerCase().includes('secret');
                  return (
                    <Descriptions.Item 
                      key={key} 
                      label={<span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest truncate block">{key.replace(/_/g, " ")}</span>}
                    >
                      <span className="text-slate-900 font-mono text-[11px] break-all">
                        {isPassword ? "••••••••" : String(value)}
                      </span>
                    </Descriptions.Item>
                  );
                })
              )}
            </Descriptions>
          </div>
        </section>
      </div>
    </div>
  );
}
