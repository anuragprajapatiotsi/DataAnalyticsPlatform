"use client";

import React from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "antd";
import { SettingsCard } from "@/features/dashboard/components/settings-card";
import { useSettings } from "@/features/settings/hooks/use-settings";
import { getIcon } from "@/shared/utils/icon-mapper";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { PageHeader } from "@/shared/components/layout/PageHeader";

export default function SettingsCatchAllPage() {
  const router = useRouter();
  const params = useParams();

  // params.slug is an array of path segments
  const slugs = (params.slug as string[]) || [];
  const currentSlug = slugs.length > 0 ? slugs[slugs.length - 1] : "settings";

  const { data: settings, isLoading, isError } = useSettings(currentSlug);

  const handleCardClick = (item: any) => {
    if (item.node_type === "category" || item.has_children) {
      // Append the new slug to the current URL path
      const newPath = `/settings/${slugs.join("/")}/${item.slug}`.replace(
        /\/+/g,
        "/",
      );
      router.push(newPath);
    } else if (item.node_type === "leaf") {
      // Special handling for services to use the Service Wizard
      if (slugs.includes("services")) {
        router.push(`/settings/services/${item.slug}/create`);
        return;
      }
      
      if (item.nav_url) {
        // For leaf nodes, navigate to their literal nav_url
        // Special case for members to follow hierarchical structure
        const targetUrl =
          item.nav_url === "/settings/members"
            ? "/settings/organization-team-user-management/organizations"
            : item.nav_url;
        router.push(targetUrl);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="h-full overflow-y-auto p-8 custom-scrollbar">
        <div className="w-full">
          <div className="mb-8 pl-1">
            <Skeleton className="h-10 w-48 mb-2" />
            <Skeleton className="h-6 w-96" />
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} className="h-32 w-full rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex h-full items-center justify-center p-6">
        <div className="text-center">
          <p className="text-red-500 font-semibold text-lg">
            Failed to load settings.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 text-blue-600 hover:underline text-sm font-medium"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const sortedSettings = [...(settings || [])].sort(
    (a, b) => (a.sort_order || 0) - (b.sort_order || 0),
  );

  // Reconstruct breadcrumb items
  const breadcrumbItems = [
    {
      label: "Settings",
      href: "/settings",
      active: currentSlug === "settings",
    },
  ];

  slugs.forEach((slug, index) => {
    breadcrumbItems.push({
      label: slug.charAt(0).toUpperCase() + slug.slice(1),
      href: `/settings/${slugs.slice(0, index + 1).join("/")}`,
      active: index === slugs.length - 1,
    });

    // If we just added 'services' and there's another slug (like 'databases'), 
    // inject 'Add Service' in between to maintain the flow
    if (slug === "services" && index < slugs.length - 1) {
      breadcrumbItems.push({
        label: "Add Service",
        href: "/settings/services/add",
        active: false,
      });
    }
  });

  return (
    <div className="h-full overflow-y-auto px-6 pt-2 pb-20 custom-scrollbar animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="w-full">
        <PageHeader
          title={
            currentSlug === "settings"
              ? "Settings"
              : currentSlug.charAt(0).toUpperCase() + currentSlug.slice(1)
          }
          description={
            settings?.find((item: any) => item.slug === currentSlug)
              ?.description ||
            (currentSlug === "settings"
              ? "Manage your account, workspace preferences, and application settings."
              : `Manage and configure settings for the ${currentSlug} category.`)
          }
          breadcrumbItems={breadcrumbItems}
        />

        <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {sortedSettings.map((item) => {
            const IconComponent = getIcon(item.icon);
            return (
              <div
                key={item.id}
                onClick={() => handleCardClick(item)}
                className="group cursor-pointer transform transition-all duration-300 hover:-translate-y-1"
              >
                <SettingsCard
                  title={item.display_label}
                  description={item.description}
                  icon={IconComponent}
                  iconBgClass="bg-blue-50 group-hover:bg-blue-100 transition-colors"
                  iconColorClass="text-blue-600"
                />
              </div>
            );
          })}
          {sortedSettings.length === 0 && (
            <div className="col-span-full flex flex-col items-center justify-center py-20 text-center rounded-lg border-2 border-dashed border-slate-200 bg-slate-50/10">
              <div className="h-16 w-16 bg-slate-100/50 rounded-full flex items-center justify-center mb-4">
                <div className="h-8 w-8 text-slate-400" />
              </div>
              <p className="text-slate-500 font-semibold text-xl">
                No items found here
              </p>
              <p className="text-slate-400 mt-2">
                This category doesn't have any sub-items or children yet.
              </p>
              {slugs.includes("services") && (
                <Button 
                  type="primary" 
                  className="mt-6 bg-blue-600 hover:bg-blue-700 font-semibold h-10 px-8 rounded-lg"
                  onClick={() => router.push(`/settings/services/${currentSlug}/create`)}
                >
                  Create {currentSlug.charAt(0).toUpperCase() + currentSlug.slice(1)} Service
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
