"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { PageHeader } from "@/shared/components/layout/PageHeader";
import { ServiceHeader, GroupedConnectionList } from "@/features/services/components";
import { GroupedServiceCategory, ServiceEndpoint } from "@/features/services/types";
import { message, Spin } from "antd";
import { serviceService } from "@/features/services/services/service.service";
import { settingsApi } from "@/features/settings/services/settings.service";
import { SettingsItem } from "@/shared/types";

export default function CategoryServicesPage() {
  const params = useParams();
  const router = useRouter();
  const categorySlug = params.category as string;
  const [categoryInfo, setCategoryInfo] = useState<SettingsItem | null>(null);
  
  const [groupedData, setGroupedData] = useState<GroupedServiceCategory[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      // Fetch category details for breadcrumbs
      const categories = await settingsApi.getSettings("services");
      const current = categories.find((c) => c.slug === categorySlug);
      if (current) {
        setCategoryInfo(current);
      }

      // Fetch grouped connections
      const data = await serviceService.getServiceEndpointsByType(categorySlug);
      setGroupedData(data || []);
    } catch (err) {
      console.error("Failed to fetch category details:", err);
      message.error("Failed to load connections.");
    } finally {
      setLoading(false);
    }
  }, [categorySlug]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleAddClick = () => {
    router.push(`/settings/services/${categorySlug}/add`);
  };

  const handleSearchChange = (search: string) => {
    // Basic local filtering for now if needed, but the user wants to group by category from API
    // If we want real search, we might need a different API or filter groupedData locally
  };

  const handleRowClick = (endpoint: ServiceEndpoint) => {
    // Navigate to explore view for this endpoint
    router.push(`/explore/${categorySlug}/${endpoint.id}`);
  };

  const handleDelete = async (endpoint: ServiceEndpoint) => {
    try {
      await serviceService.deleteServiceEndpoint(endpoint.id);
      message.success("Connection deleted successfully");
      await fetchData();
    } catch (err) {
      console.error("Failed to delete connection:", err);
      message.error("Failed to delete connection.");
      throw err;
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
        description={`Manage and monitor all your ${categoryLabel.toLowerCase()} connections grouped by integration type.`}
        breadcrumbItems={breadcrumbItems}
      />

      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-4 flex-1">
          <ServiceHeader 
            onSearchChange={handleSearchChange} 
            onAddClick={handleAddClick} 
          />
        </div>
      </div>

      <div className="min-h-[400px]">
        {loading && groupedData.length === 0 ? (
          <div className="flex items-center justify-center p-20">
            <Spin size="large" />
          </div>
        ) : (
          <GroupedConnectionList
            groups={groupedData}
            loading={loading}
            onRowClick={handleRowClick}
            onDelete={handleDelete}
            emptyText={`No ${categoryLabel.toLowerCase()} connections found. Click 'Add Service' to get started.`}
          />
        )}
      </div>
    </div>
  );
}
