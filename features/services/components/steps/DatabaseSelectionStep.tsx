"use client";

import React, { useEffect, useState } from "react";
import { Form, Spin, Card, Empty, Alert, Tag, Select, Input } from "antd";
import { Check } from "lucide-react";
import { SettingsItem } from "@/shared/types";
import { settingsApi } from "@/features/settings/services/settings.service";
import { cn } from "@/shared/utils/cn";
import { getIcon } from "@/shared/utils/icon-mapper";

interface DatabaseSelectionStepProps {
  form: any;
  onSelect: (db: SettingsItem) => void;
}

export function DatabaseSelectionStep({ form, onSelect }: DatabaseSelectionStepProps) {
  const selectedId = Form.useWatch("db_id", form);
  const [allDatabases, setAllDatabases] = useState<SettingsItem[]>([]);
  const [filteredDatabases, setFilteredDatabases] = useState<SettingsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [category, setCategory] = useState<string>("all");

  useEffect(() => {
    async function fetchDatabases() {
      try {
        setLoading(true);
        // Using "databases" as the default parent for the selection step
        const data = await settingsApi.getSettings("databases");
        const activeDatabases = data.filter((db) => db.is_active && db.is_enabled);
        setAllDatabases(activeDatabases);
        setFilteredDatabases(activeDatabases);
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

  useEffect(() => {
    const filtered = allDatabases.filter(db => {
      const matchesSearch = db.display_label.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = category === "all" || db.slug.toLowerCase().includes(category.toLowerCase());
      return matchesSearch && matchesCategory;
    });
    setFilteredDatabases(filtered);
  }, [searchTerm, category, allDatabases]);

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

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="flex flex-col gap-4 max-w-2xl mx-auto">
        <Select
          size="large"
          value={category}
          onChange={setCategory}
          className="w-full"
          options={[
            { label: "All Database Services", value: "all" },
            { label: "SQL Databases", value: "sql" },
            { label: "NoSQL Databases", value: "nosql" },
          ]}
        />
        <Input
          size="large"
          prefix={<span className="text-slate-400 mr-1"><Check size={16} /></span>}
          placeholder="Search for Connector"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="rounded-lg border-slate-200"
          allowClear
        />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 justify-center">
        {filteredDatabases.length === 0 ? (
          <div className="col-span-full py-12">
            <Empty description="No service connectors found matching your query." />
          </div>
        ) : (
          filteredDatabases.map((db) => {
            const isSelected = selectedId === db.id;
            const iconName = db.icon || "database";
            const IconComponent = getIcon(iconName);
            
            return (
              <Card
                key={db.id}
                hoverable
                onClick={() => onSelect(db)}
                className={cn(
                  "relative transition-all duration-300 rounded-xl border-2 hover:border-blue-400 aspect-square flex flex-col items-center justify-center text-center p-2 group overflow-hidden",
                  isSelected
                    ? "border-blue-600 bg-blue-50/10 shadow-md ring-1 ring-blue-600/10"
                    : "border-slate-100 bg-white"
                )}
                styles={{ body: { padding: '0', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', width: '100%' } }}
              >
                <div className="flex flex-col items-center gap-3">
                  <div className={cn(
                    "p-3 rounded-xl bg-slate-50 border border-slate-100 transition-all duration-300 group-hover:bg-blue-600 group-hover:border-blue-700 group-hover:text-white",
                    isSelected ? "bg-blue-600 border-blue-700 text-white" : "text-slate-500"
                  )}>
                    <IconComponent size={28} />
                  </div>
                  <div>
                    <h3 className={cn(
                      "font-bold text-[12px] leading-tight transition-colors duration-300",
                      isSelected ? "text-blue-700" : "text-slate-800"
                    )}>
                      {db.display_label}
                    </h3>
                    {db.slug.includes("beta") && (
                      <Tag className="text-[9px] px-1 py-0 m-0 border-none bg-blue-100 text-blue-600 font-bold uppercase">Beta</Tag>
                    )}
                  </div>
                </div>
                {isSelected && (
                  <div className="absolute top-2 right-2 bg-blue-600 text-white p-1 rounded-full shadow-sm animate-in zoom-in duration-300">
                    <Check size={10} strokeWidth={3} />
                  </div>
                )}
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
