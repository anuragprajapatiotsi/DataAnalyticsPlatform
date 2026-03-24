"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Button, Card, Spin, Empty, Alert } from "antd";
import { Plus } from "lucide-react";
import { PageHeader } from "@/shared/components/layout/PageHeader";
import { settingsApi } from "@/features/settings/services/settings.service";
import { getIcon } from "@/shared/utils/icon-mapper";
import { SettingsItem } from "@/shared/types";

export default function ServicesPage() {
  const router = useRouter();
  const [categories, setCategories] = React.useState<SettingsItem[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
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
    // Navigate to the category detail page
    router.push(`/settings/services/${item.slug}`);
  };

  const breadcrumbItems = [
    { label: "Settings", href: "/settings" },
    { label: "Services" },
  ];

  if (loading) {
    return (
      <div className="flex flex-col space-y-6 animate-in fade-in duration-500 max-w-[1400px] mx-auto px-6 pt-2 pb-20">
        <PageHeader title="Services" description="Select a service category to get started." breadcrumbItems={breadcrumbItems} />
        <div className="flex-1 flex items-center justify-center py-20 bg-white rounded-xl border border-slate-200">
          <Spin size="large" description="Loading categories..." />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col space-y-6 animate-in fade-in duration-500 max-w-[1400px] mx-auto px-6 pt-2 pb-20">
        <PageHeader title="Services" description="Select a service category to get started." breadcrumbItems={breadcrumbItems} />
        <div className="flex-1 flex items-center justify-center p-8 bg-white rounded-xl border border-slate-200">
          <Alert title="Error" description={error} type="error" showIcon className="max-w-md w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col space-y-6 animate-in fade-in duration-500 max-w-[1400px] mx-auto px-6 pt-2 pb-20">
      <PageHeader
        title="Services"
        description="Connect and manage your data sources and integrations."
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
                  className="border-slate-200 shadow-sm hover:shadow-md transition-all duration-300 rounded-xl overflow-hidden group"
                  onClick={() => handleCardClick(category)}
                  styles={{ body: { padding: '24px' } }}
                >
                  <div className="flex flex-col gap-5">
                    <div className="p-3 bg-blue-50/50 rounded-xl border border-blue-100/50 w-fit group-hover:bg-blue-600 group-hover:border-blue-700 transition-all duration-300">
                      <IconComponent className="text-blue-600 group-hover:text-white transition-colors" size={24} />
                    </div>
                    <div className="min-h-[auto]">
                      <h3 className="font-bold text-slate-900 text-lg">{category.display_label}</h3>
                      <p className="text-sm text-slate-500 mt-2 leading-relaxed line-clamp-2">
                        {category.description || `Browse and manage your ${category.display_label.toLowerCase()} connections.`}
                      </p>
                    </div>
                    <div className="pt-2">
                      <Button 
                        type="primary" 
                        icon={<Plus size={16} />}
                        className="w-full bg-slate-900 hover:bg-black border-none font-bold h-10 rounded-lg flex items-center justify-center gap-2 shadow-sm shadow-slate-900/10 group-hover:bg-blue-600 transition-all"
                      >
                        Explore {category.display_label}
                      </Button>
                    </div>
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
