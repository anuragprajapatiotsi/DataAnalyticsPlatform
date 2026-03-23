"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Card, Spin, Empty, Alert } from "antd";
import { Plus } from "lucide-react";
import { PageHeader } from "@/shared/components/layout/PageHeader";
import { settingsApi } from "@/features/settings/services/settings.service";
import { getIcon } from "@/shared/utils/icon-mapper";
import { SettingsItem } from "@/shared/types";

export default function AddServiceCategoryPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<SettingsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchServices() {
      try {
        setLoading(true);
        const data = await settingsApi.getSettings("services");
        // Filter by is_active and is_enabled
        const activeCategories = data.filter((item) => item.is_active && item.is_enabled);
        setCategories(activeCategories);
        setError(null);
      } catch (err) {
        console.error("Failed to fetch services:", err);
        setError("Failed to load service categories. Please try again later.");
      } finally {
        setLoading(false);
      }
    }

    fetchServices();
  }, []);

  const handleCardClick = (item: SettingsItem) => {
    if (item.node_type === "category" || item.has_children) {
      // Navigate to show children (will be caught by the catch-all route /settings/[[...slug]])
      router.push(`/settings/services/${item.slug}`);
    } else {
      // For leaf nodes or direct creation (e.g., if it's already a specific type)
      router.push(`/settings/services/${item.slug}/create`);
    }
  };

  const breadcrumbItems = [
    { label: "Settings", href: "/settings" },
    { label: "Services", href: "/settings/services" },
    { label: "Add Service" },
  ];

  if (loading) {
    return (
      <div className="flex flex-col space-y-6 animate-in fade-in duration-500 max-w-[1400px] mx-auto px-6 pt-2 pb-20">
        <PageHeader title="Add Service" description="Select a service category to get started." breadcrumbItems={breadcrumbItems} />
        <div className="flex-1 flex items-center justify-center py-20 bg-white rounded-xl border border-slate-200">
          <Spin size="large" description="Loading service categories..." />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col space-y-6 animate-in fade-in duration-500 max-w-[1400px] mx-auto px-6 pt-2 pb-20">
        <PageHeader title="Add Service" description="Select a service category to get started." breadcrumbItems={breadcrumbItems} />
        <div className="flex-1 flex items-center justify-center p-8 bg-white rounded-xl border border-slate-200">
          <Alert message="Error" description={error} type="error" showIcon className="max-w-md w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col space-y-6 animate-in fade-in duration-500 max-w-[1400px] mx-auto px-6 pt-2 pb-20">
      <PageHeader
        title="Add Service"
        description="Select a service category to get started."
        breadcrumbItems={breadcrumbItems}
      />

      <div className="flex-1">
        {categories.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-12 text-center shadow-sm">
            <Empty description="No service categories available." />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {categories.map((category) => {
              const IconComponent = getIcon(category.icon);
              return (
                <Card
                  key={category.id}
                  hoverable
                  className="border-slate-200 shadow-sm hover:shadow-md transition-all duration-300 rounded-xl"
                  onClick={() => handleCardClick(category)}
                >
                  <div className="flex flex-col gap-4">
                    <div className="w-12 h-12 bg-slate-50 rounded-lg flex items-center justify-center border border-slate-100">
                      <IconComponent className="text-blue-600" size={24} />
                    </div>
                    <div className="min-h-[60px]">
                      <h3 className="font-bold text-slate-900 line-clamp-1">{category.display_label}</h3>
                      <p className="text-xs text-slate-500 mt-1 leading-relaxed line-clamp-2">
                        {category.description || "Configure and manage this service type."}
                      </p>
                    </div>
                    <Button 
                      type="primary" 
                      icon={<Plus size={14} />}
                      className="w-full mt-2 bg-blue-600 hover:bg-blue-700 font-semibold h-9 rounded-lg"
                    >
                      Add {category.display_label}
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
