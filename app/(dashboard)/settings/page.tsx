"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronRight, Home } from "lucide-react";
import { SettingsCard } from "@/components/dashboard/settings-card";
import { useSettings } from "@/hooks/use-settings";
import { getIcon } from "@/utils/icon-mapper";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/utils/cn";

export default function SettingsPage() {
  const router = useRouter();
  const [history, setHistory] = useState([
    { slug: "settings", label: "Settings" },
  ]);

  const currentLevel = history[history.length - 1];
  const { data: settings, isLoading, isError } = useSettings(currentLevel.slug);

  const handleCardClick = (item: any) => {
    if (item.node_type === "category" || item.has_children) {
      setHistory((prev) => [
        ...prev,
        { slug: item.slug, label: item.display_label },
      ]);
    } else if (item.node_type === "leaf" && item.nav_url) {
      router.push(item.nav_url);
    }
  };

  const navigateToLevel = (index: number) => {
    setHistory((prev) => prev.slice(0, index + 1));
  };

  if (isLoading) {
    return (
      <div className="h-full overflow-y-auto p-6 pb-20 custom-scrollbar">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8 pl-1">
            <Skeleton className="h-10 w-48 mb-2" />
            <Skeleton className="h-6 w-96" />
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-32 w-full rounded-2xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex h-full items-center justify-center p-6">
        <p className="text-red-500 font-medium text-lg">
          Failed to load settings.
        </p>
      </div>
    );
  }

  const sortedSettings = [...(settings || [])].sort(
    (a, b) => (a.sort_order || 0) - (b.sort_order || 0),
  );

  return (
    <div className="h-full overflow-y-auto p-6 pb-20 custom-scrollbar animate-in fade-in slide-in-from-bottom-3 duration-500">
      <div className="mx-auto max-w-7xl">
        {/* Breadcrumbs */}
        <nav className="mb-6 flex items-center space-x-2 text-sm font-medium text-slate-500">
          {history.map((item, index) => (
            <div key={item.slug} className="flex items-center">
              {index > 0 && (
                <ChevronRight className="mx-2 h-4 w-4 text-slate-400" />
              )}
              <button
                onClick={() => navigateToLevel(index)}
                className={cn(
                  "flex items-center hover:text-blue-600 transition-colors",
                  index === history.length - 1
                    ? "text-slate-900 cursor-default"
                    : "",
                )}
                disabled={index === history.length - 1}
              >
                {index === 0 && <Home className="mr-1.5 h-4 w-4" />}
                {item.label}
              </button>
            </div>
          ))}
        </nav>

        <div className="mb-8 pl-1">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            {currentLevel.label}
          </h1>
          <p className="mt-2 text-slate-600 font-medium max-w-2xl">
            {history.length === 1
              ? "Ability to configure the OpenMetadata application to suit your needs."
              : `Configure settings for ${currentLevel.label}.`}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {sortedSettings.map((item) => {
            const IconComponent = getIcon(item.icon);
            return (
              <div key={item.id} onClick={() => handleCardClick(item)}>
                <SettingsCard
                  title={item.display_label}
                  description={item.description}
                  icon={IconComponent}
                  iconBgClass="bg-blue-50"
                  iconColorClass="text-blue-600"
                />
              </div>
            );
          })}
          {sortedSettings.length === 0 && (
            <div className="col-span-full flex flex-col items-center justify-center py-12 text-center">
              <p className="text-slate-500 font-medium">
                No settings found in this category.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
