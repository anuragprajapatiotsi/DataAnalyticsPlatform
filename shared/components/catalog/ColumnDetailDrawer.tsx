"use client";

import React from "react";
import { Drawer, Tag, Empty, Tooltip, Divider } from "antd";
import { 
  Columns, 
  Info, 
  Key, 
  Hash, 
  Tag as TagIcon, 
  Clock, 
  Lock,
  Database
} from "lucide-react";
import { ColumnInfo } from "@/features/services/types";
import { cn } from "@/shared/utils/cn";

interface ColumnDetailDrawerProps {
  column: ColumnInfo | null;
  open: boolean;
  onClose: () => void;
}

export function ColumnDetailDrawer({ column, open, onClose }: ColumnDetailDrawerProps) {
  if (!column && open) return null;

  return (
    <Drawer
      title={
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-50 border border-blue-100 text-blue-600">
            <Columns size={16} />
          </div>
          <div className="flex flex-col">
            <span className="text-[15px] font-bold text-slate-900 leading-tight">
              {column?.name}
            </span>
            <span className="text-[11px] font-mono text-slate-500 uppercase tracking-wider">
              {column?.data_type}
            </span>
          </div>
        </div>
      }
      placement="right"
      onClose={onClose}
      open={open}
      size="default"
      className="column-detail-drawer"
      styles={{ 
        body: { padding: 0 },
        wrapper: { width: 480 }
      }}
    >
      {!column ? (
        <div className="flex items-center justify-center h-full">
          <Empty description="No column selected" />
        </div>
      ) : (
        <div className="flex flex-col h-full bg-[#FAFAFA]">
          {/* Main Info Section */}
          <div className="p-6 bg-white border-b border-slate-200">
            <div className="flex flex-col gap-5">
              <div>
                <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                  <Info size={12} />
                  Description
                </h4>
                <p className="text-[14px] text-slate-600 leading-relaxed bg-slate-50/50 p-4 rounded-xl border border-dashed border-slate-200">
                  {column.description || "No description provided for this column."}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-sm">
                  <div className="flex items-center gap-2 text-slate-400 mb-2">
                    <Database size={14} />
                    <span className="text-[11px] font-semibold uppercase tracking-wider">Type</span>
                  </div>
                  <span className="text-[14px] font-mono font-bold text-slate-700">{column.data_type}</span>
                </div>
                <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-sm">
                  <div className="flex items-center gap-2 text-slate-400 mb-2">
                    <Lock size={14} />
                    <span className="text-[11px] font-semibold uppercase tracking-wider">Nullable</span>
                  </div>
                  <Tag color={column.is_nullable ? "blue" : "orange"} className="rounded-md font-bold text-[11px] uppercase">
                    {column.is_nullable ? "YES" : "NO"}
                  </Tag>
                </div>
              </div>
            </div>
          </div>

          {/* Properties Section */}
          <div className="p-6 flex flex-col gap-6 overflow-y-auto">
            {/* Metadata Tags */}
            <div>
              <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                <TagIcon size={12} />
                Tags & Classifications
              </h4>
              <div className="flex flex-wrap gap-2">
                {column.ordinal_position === 1 && (
                  <Tag className="flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-700 border-amber-200 font-bold text-[11px] uppercase rounded-lg">
                    <Key size={12} />
                    Primary Key
                  </Tag>
                )}
                {column.tags?.map(tag => (
                  <Tag key={tag} className="px-3 py-1 bg-blue-50 text-blue-700 border-blue-200 font-bold text-[11px] uppercase rounded-lg">
                    {tag}
                  </Tag>
                )) || (
                  <span className="text-slate-400 italic text-[13px]">No tags assigned</span>
                )}
              </div>
            </div>

            <Divider className="my-0 border-slate-200" />

            {/* Glossary Terms */}
            <div>
              <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                <Hash size={12} />
                Glossary Terms
              </h4>
              <div className="flex flex-wrap gap-2">
                {column.glossary_terms?.map(term => (
                  <Tag key={term} className="px-3 py-1 bg-emerald-50 text-emerald-700 border-emerald-200 font-bold text-[11px] uppercase rounded-lg">
                    {term}
                  </Tag>
                )) || (
                  <span className="text-slate-400 italic text-[13px]">No glossary terms found</span>
                )}
              </div>
            </div>

            <Divider className="my-0 border-slate-200" />

            {/* Usage Info */}
            <div className="bg-blue-50/30 border border-blue-100 rounded-xl p-4">
              <div className="flex items-start gap-4">
                <div className="p-2 bg-blue-100 rounded-lg text-blue-600 mt-1">
                  <Clock size={16} />
                </div>
                <div>
                  <h5 className="text-[13px] font-bold text-blue-900 mb-1">Profiling Status</h5>
                  <p className="text-[12px] text-blue-700/70 leading-relaxed">
                    Last profiled 2 days ago. No significant PII or data quality issues detected in this column.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      <style jsx global>{`
        .column-detail-drawer .ant-drawer-header {
          padding: 20px 24px !important;
          border-bottom: 1px solid #f1f5f9 !important;
        }
        .column-detail-drawer .ant-drawer-close {
          color: #94a3b8 !important;
          transition: color 0.2s ease;
        }
        .column-detail-drawer .ant-drawer-close:hover {
          color: #475569 !important;
          background: #f1f5f9 !important;
        }
      `}</style>
    </Drawer>
  );
}
