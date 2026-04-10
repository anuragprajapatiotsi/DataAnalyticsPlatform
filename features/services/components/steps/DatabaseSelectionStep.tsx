"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Alert, Empty, Form, Input, Select, Skeleton, Tag } from "antd";
import {
  Check,
  HardDrive,
  Search,
  Server,
  Cylinder,
} from "lucide-react";
import type { FormInstance } from "antd";
import { settingsApi } from "@/features/settings/services/settings.service";
import { SettingsItem } from "@/shared/types";
import { cn } from "@/shared/utils/cn";

interface DatabaseSelectionStepProps {
  form: FormInstance;
  onSelect: (db: SettingsItem) => void;
}

type DatabaseVisual = {
  icon: React.ComponentType<{ className?: string }>;
  accent: string;
  surface: string;
  ring: string;
  label: string;
};

function PostgresMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" fill="none" aria-hidden="true" className={className}>
      <path
        d="M10 12.5C10 8.9 12.9 6 16.5 6C20.1 6 23 8.9 23 12.5V18.2C23 22.5 19.5 26 15.2 26H14.8C12.1 26 10 23.9 10 21.2V12.5Z"
        fill="currentColor"
        opacity="0.16"
      />
      <path
        d="M12.2 14.1C12.2 10.8 14.5 8.6 17.2 8.6C20 8.6 22 10.8 22 14.1V18.4C22 21.9 19.5 24.3 16.4 24.3C14 24.3 12.2 22.6 12.2 20.2V14.1Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M17.2 19.2C18.4 19.2 19.4 18.2 19.4 17C19.4 15.8 18.4 14.8 17.2 14.8C16 14.8 15 15.8 15 17C15 18.2 16 19.2 17.2 19.2Z"
        fill="currentColor"
      />
      <path
        d="M13.8 22.6L10.4 25.8"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function MysqlMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" fill="none" aria-hidden="true" className={className}>
      <path
        d="M8 20.2C10.7 18.1 12.9 16.9 15.7 16.6C18.2 16.3 20.4 17.1 22.5 18.7C23.8 19.8 24.9 21.2 26 23"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M12.1 14.1C13.8 11.5 16.4 10 19.2 10C21.2 10 23 10.8 24.4 12.2"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M9.2 20.4C8.5 18.9 8.2 17.5 8.2 16.1C8.2 13.1 9.9 10.4 12.5 8.9"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M20.3 8.8L22 6.9"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <circle cx="21.7" cy="14.7" r="1.4" fill="currentColor" />
    </svg>
  );
}

function getDatabaseVisual(slug: string): DatabaseVisual {
  const normalized = slug.toLowerCase();

  if (normalized.includes("postgres")) {
    return {
      icon: PostgresMark,
      accent: "text-sky-700",
      surface: "bg-sky-50",
      ring: "border-sky-200",
      label: "PostgreSQL",
    };
  }

  if (normalized.includes("mysql") || normalized.includes("mariadb")) {
    return {
      icon: MysqlMark,
      accent: "text-orange-700",
      surface: "bg-orange-50",
      ring: "border-orange-200",
      label: normalized.includes("mariadb") ? "MariaDB" : "MySQL",
    };
  }

  if (
    normalized.includes("mongo") ||
    normalized.includes("redis") ||
    normalized.includes("cassandra") ||
    normalized.includes("nosql")
  ) {
    return {
      icon: HardDrive,
      accent: "text-emerald-700",
      surface: "bg-emerald-50",
      ring: "border-emerald-200",
      label: "NoSQL",
    };
  }

  if (normalized.includes("oracle") || normalized.includes("sqlserver")) {
    return {
      icon: Server,
      accent: "text-violet-700",
      surface: "bg-violet-50",
      ring: "border-violet-200",
      label: "Enterprise SQL",
    };
  }

  return {
    icon: Cylinder,
    accent: "text-slate-700",
    surface: "bg-slate-100",
    ring: "border-slate-200",
    label: "Database",
  };
}

function getDatabaseMeta(db: SettingsItem) {
  const source = `${db.display_label} ${db.slug} ${db.description}`.toLowerCase();

  if (source.includes("postgres")) {
    return "SQL, OLTP, relational";
  }
  if (source.includes("mysql") || source.includes("mariadb")) {
    return "SQL, transactional, relational";
  }
  if (source.includes("mongo")) {
    return "Document store";
  }
  if (source.includes("redis")) {
    return "In-memory, key-value";
  }
  if (source.includes("oracle")) {
    return "Enterprise relational";
  }
  if (source.includes("sqlserver")) {
    return "Microsoft SQL platform";
  }
  if (source.includes("cassandra")) {
    return "Wide-column store";
  }
  return "Connector available";
}

function matchesCategory(slug: string, category: string) {
  if (category === "all") {
    return true;
  }

  if (category === "sql") {
    const sqlKeywords = [
      "sql",
      "postgres",
      "mysql",
      "oracle",
      "mariadb",
      "sqlite",
      "server",
    ];
    return sqlKeywords.some((keyword) => slug.includes(keyword)) && !slug.includes("nosql");
  }

  if (category === "nosql") {
    return (
      slug.includes("nosql") ||
      slug.includes("mongo") ||
      slug.includes("cassandra") ||
      slug.includes("redis")
    );
  }

  return slug.includes(category.toLowerCase());
}

function LoadingCards() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 6 }).map((_, index) => (
        <div
          key={`database-skeleton-${index}`}
          className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
        >
          <div className="flex items-start gap-4">
            <Skeleton.Avatar active size={52} shape="square" />
            <div className="flex-1">
              <Skeleton active title={{ width: "48%" }} paragraph={{ rows: 2 }} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function DatabaseSelectionStep({
  form,
  onSelect,
}: DatabaseSelectionStepProps) {
  const selectedId = Form.useWatch("db_id", form);
  const [allDatabases, setAllDatabases] = useState<SettingsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [category, setCategory] = useState<string>("all");

  useEffect(() => {
    async function fetchDatabases() {
      try {
        setLoading(true);
        const data = await settingsApi.getSettings("databases");
        setAllDatabases(data.filter((db) => db.is_active && db.is_enabled));
        setError(null);
      } catch (err) {
        console.error("Failed to fetch databases:", err);
        setError("Failed to load database options. Please try again later.");
      } finally {
        setLoading(false);
      }
    }

    void fetchDatabases();
  }, []);

  const filteredDatabases = useMemo(() => {
    const normalizedSearch = searchTerm.toLowerCase().trim();

    return allDatabases.filter((db) => {
      const slug = db.slug.toLowerCase();
      const haystack = [
        db.display_label,
        db.slug,
        db.description,
        getDatabaseMeta(db),
      ]
        .join(" ")
        .toLowerCase();

      const matchesSearch = haystack.includes(normalizedSearch);
      const categoryMatch = matchesCategory(slug, category);

      return matchesSearch && categoryMatch;
    });
  }, [allDatabases, category, searchTerm]);

  if (loading) {
    return (
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-lg font-bold tracking-tight text-slate-900">
            Choose A Database Connector
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Pick the platform you want to connect and we will tailor the next step
            for it.
          </p>
        </div>
        <LoadingCards />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-[300px] items-center justify-center">
        <Alert
          message="Error"
          description={error}
          type="error"
          showIcon
          className="w-full max-w-md"
        />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="mx-auto flex max-w-4xl flex-col gap-4">
        <div className="flex flex-col gap-1">
          <h2 className="text-lg font-bold tracking-tight text-slate-900">
            Choose A Database Connector
          </h2>
          <p className="text-sm text-slate-500">
            Select the database type first. The connection form will adapt to the
            connector you pick.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-[220px_minmax(0,1fr)]">
          <Select
            size="large"
            value={category}
            onChange={setCategory}
            className="w-full"
            options={[
              { label: "All Databases", value: "all" },
              { label: "SQL Databases", value: "sql" },
              { label: "NoSQL Databases", value: "nosql" },
            ]}
          />

          <Input
            size="large"
            prefix={<Search size={16} className="text-slate-400" />}
            placeholder="Search connectors by name, type, or description"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            className="rounded-lg border-slate-200"
            allowClear
          />
        </div>
      </div>

      {filteredDatabases.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-white py-14">
          <Empty description="No databases available" />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filteredDatabases.map((db) => {
            const isSelected = selectedId === db.id;
            const visual = getDatabaseVisual(db.slug);
            const IconComponent = visual.icon;

            return (
              <button
                key={db.id}
                type="button"
                role="radio"
                aria-checked={isSelected}
                aria-label={`Select ${db.display_label}`}
                onClick={() => onSelect(db)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    onSelect(db);
                  }
                }}
                className={cn(
                  "group relative flex w-full flex-col rounded-xl border bg-white p-4 text-left shadow-sm transition-all duration-200",
                  "hover:-translate-y-0.5 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
                  isSelected
                    ? "border-blue-500 bg-blue-50/40 shadow-md ring-1 ring-blue-500/15"
                    : "border-slate-200 hover:border-blue-300 hover:bg-slate-50/80",
                )}
              >
                <div className="flex items-start gap-4">
                  <div
                    className={cn(
                      "flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border transition-colors duration-200",
                      visual.surface,
                      visual.ring,
                      visual.accent,
                      isSelected && "border-blue-200 bg-blue-100 text-blue-700",
                    )}
                  >
                    <IconComponent className="h-8 w-8" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h3
                          className={cn(
                            "truncate text-sm font-semibold text-slate-900",
                            isSelected && "text-blue-700",
                          )}
                        >
                          {db.display_label}
                        </h3>
                        <p className="mt-1 text-xs font-medium text-slate-500">
                          {visual.label}
                        </p>
                      </div>

                      {isSelected && (
                        <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-white shadow-sm">
                          <Check size={14} strokeWidth={3} />
                        </span>
                      )}
                    </div>

                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-medium text-slate-600">
                        {getDatabaseMeta(db)}
                      </span>
                      <span className="inline-flex items-center rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-mono text-slate-500">
                        {db.slug}
                      </span>
                      {db.slug.includes("beta") && (
                        <Tag className="m-0 border-none bg-blue-100 px-2 py-0.5 text-[10px] font-bold uppercase text-blue-700">
                          Beta
                        </Tag>
                      )}
                    </div>

                    <p className="mt-3 line-clamp-2 text-xs leading-5 text-slate-500">
                      {db.description || "Ready-to-use connector configuration for this platform."}
                    </p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
