"use client";

import React, { useEffect, useState } from "react";
import { Card, Spin, Empty, Alert, Form, Input } from "antd";
import { Check } from "lucide-react";
import { settingsApi } from "@/features/settings/services/settings.service";
import { cn } from "@/shared/utils/cn";
import { SettingsItem } from "@/shared/types";

interface DatabaseSelectionStepProps {
  form: any;
  onSelect: (db: SettingsItem) => void;
}

export function DatabaseSelectionStep({ form, onSelect }: DatabaseSelectionStepProps) {
  const selectedId = Form.useWatch("db_id", form);
  const [databases, setDatabases] = useState<SettingsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchDatabases() {
      try {
        setLoading(true);
        const data = await settingsApi.getSettings("databases");
        // Only show items where is_active = true and is_enabled = true
        const activeDatabases = data.filter((db) => db.is_active && db.is_enabled);
        setDatabases(activeDatabases);
        setError(null);
      } catch (err) {
        console.error("Failed to fetch databases:", err);
        setError("Failed to load database options. Please try again later.");
      } finally {
        setLoading(false);
      }
    }

    fetchDatabases();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[300px] gap-4">
        <Spin size="large" />
        <p className="text-slate-500 font-medium">Fetching available databases...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[300px] flex items-center justify-center">
        <Alert
          message="Error"
          description={error}
          type="error"
          showIcon
          className="max-w-md w-full"
        />
      </div>
    );
  }

  if (databases.length === 0) {
    return (
      <div className="min-h-[300px] flex items-center justify-center">
        <Empty description="No active database integrations found." />
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div>
        <h2 className="text-lg font-bold text-slate-900 tracking-tight">Select Database Type</h2>
        <p className="text-slate-500 text-sm">
          Choose the engine that powers your data.
        </p>
      </div>


      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {databases.map((db) => {
          const isSelected = selectedId === db.id;
          return (
            <Card
              key={db.id}
              hoverable
              onClick={() => onSelect(db)}
              className={cn(
                "relative transition-all duration-300 rounded-lg border-2 group",
                isSelected
                  ? "border-blue-500 bg-blue-50/20 shadow-sm ring-2 ring-blue-500/10"
                  : "border-slate-100 bg-white hover:border-blue-200"
              )}
              styles={{ body: { padding: '0.75rem' } }}
            >
              <div className="flex flex-col gap-3">
                <div className="flex items-start justify-between">
                  <div className={cn(
                    "w-10 h-10 rounded-lg flex items-center justify-center border transition-colors duration-300",
                    isSelected 
                      ? "bg-blue-600 border-blue-500 text-white" 
                      : "bg-slate-50 border-slate-100 text-slate-400 group-hover:bg-blue-50 group-hover:border-blue-100 group-hover:text-blue-500"
                  )}>
                    <span className="text-lg font-bold">
                      {db.display_label.charAt(0)}
                    </span>
                  </div>
                  {isSelected && (
                    <div className="bg-blue-600 text-white p-1 rounded-full shadow-sm animate-in zoom-in duration-300">
                      <Check size={12} strokeWidth={3} />
                    </div>
                  )}
                </div>
                <div>
                  <h3 className={cn(
                    "font-bold text-sm transition-colors duration-300",
                    isSelected ? "text-blue-700" : "text-slate-900"
                  )}>
                    {db.display_label}
                  </h3>
                  <p className="text-[11px] text-slate-500 mt-0.5 leading-tight line-clamp-1">
                    {db.description || "Database integration."}
                  </p>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
