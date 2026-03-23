"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { PageHeader } from "@/shared/components/layout/PageHeader";
import { ServiceHeader, ServiceTable } from "@/features/services/components";
import { useServices } from "@/features/services/hooks/useServices";
import { GetServicesParams, Service } from "@/features/services/types";
import { message, Modal, Spin, Empty } from "antd";
import { serviceService } from "@/features/services/services/service.service";
import { settingsApi } from "@/features/settings/services/settings.service";
import { SettingsItem } from "@/shared/types";

export default function CategoryServicesPage() {
  const params = useParams();
  const router = useRouter();
  const categorySlug = params.category as string;
  const [categoryInfo, setCategoryInfo] = useState<SettingsItem | null>(null);
  const [allowedSlugs, setAllowedSlugs] = useState<string[]>([]);
  
  const [queryParams, setQueryParams] = useState<GetServicesParams>({
    skip: 0,
    limit: 50,
    type: categorySlug.replace(/s$/, ""), // Keep for backend if supported
  });

  const { data, isLoading, refetch } = useServices(queryParams);

  useEffect(() => {
    async function fetchCategoryDetails() {
      try {
        // Fetch top-level categories to find the current one
        const categories = await settingsApi.getSettings("services");
        const current = categories.find(c => c.slug === categorySlug);
        if (current) {
          setCategoryInfo(current);
        }

        // Fetch child integrations (e.g., postgres, mysql for databases)
        const integrations = await settingsApi.getSettings(categorySlug);
        setAllowedSlugs(integrations.map(item => item.slug));
      } catch (err) {
        console.error("Failed to fetch category details:", err);
      }
    }
    fetchCategoryDetails();
  }, [categorySlug]);

  const handleSearchChange = (search: string) => {
    setQueryParams((prev) => ({ ...prev, search, skip: 0 }));
  };

  const handleAddClick = () => {
    router.push(`/settings/services/${categorySlug}/add`);
  };

  // Filter the data locally to ensure only relevant connections are shown
  const filteredServices = (data?.data || []).filter((service: any) => {
    const serviceName = service.service_name || service.integration_slug;
    return allowedSlugs.length === 0 || (serviceName && allowedSlugs.includes(serviceName));
  });

  const handleEdit = (service: Service) => {
    message.info(`Editing ${service.display_label} coming soon`);
  };

  const handleDelete = (id: string) => {
    Modal.confirm({
      title: "Are you sure you want to delete this service?",
      content: "This action cannot be undone.",
      okText: "Delete",
      okType: "danger",
      onOk: async () => {
        try {
          await serviceService.deleteService(id);
          message.success("Service deleted successfully");
          refetch();
        } catch (error) {
          message.error("Failed to delete service");
        }
      },
    });
  };

  const handleTest = async (id: string) => {
    const hide = message.loading("Testing connection...", 0);
    try {
      const result = await serviceService.testConnection(id);
      hide();
      if (result.success) {
        message.success(result.message || "Connection successful!");
      } else {
        message.error(result.message || "Connection failed");
      }
    } catch (error) {
      hide();
      message.error("Failed to test connection");
    }
  };

  const categoryLabel = categoryInfo?.display_label || categorySlug.charAt(0).toUpperCase() + categorySlug.slice(1);

  const breadcrumbItems = [
    { label: "Settings", href: "/settings" },
    { label: "Services", href: "/settings/services" },
    { label: categoryLabel },
  ];

  return (
    <div className="flex flex-col space-y-6 animate-in fade-in duration-500 max-w-[1400px] mx-auto px-6 pt-2 pb-20">
      <PageHeader
        title={categoryLabel}
        description={`Manage your ${categoryLabel.toLowerCase()} connections and integrations.`}
        breadcrumbItems={breadcrumbItems}
      />

      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <ServiceHeader 
          onSearchChange={handleSearchChange} 
          onAddClick={handleAddClick} 
        />
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <ServiceTable
          services={filteredServices}
          isLoading={isLoading}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onTest={handleTest}
        />
      </div>
    </div>
  );
}
