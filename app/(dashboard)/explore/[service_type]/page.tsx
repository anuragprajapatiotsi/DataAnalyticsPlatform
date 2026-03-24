"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { Spin, message } from "antd";
import { Settings2 } from "lucide-react";
import { serviceService } from "@/features/services/services/service.service";
import { PageHeader } from "@/shared/components/layout/PageHeader";
import {
  GroupedServiceCategory,
  ServiceEndpoint,
} from "@/features/services/types";
import { GroupedConnectionList } from "@/features/services/components";
import { Button } from "antd";

export default function ExploreServiceTypePage() {
  const params = useParams();
  const router = useRouter();
  const serviceType = params.service_type as string;

  const [groupedData, setGroupedData] = useState<GroupedServiceCategory[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const data = await serviceService.getServiceEndpointsByType(serviceType);
      setGroupedData(data || []);
    } catch (err) {
      console.error(`Failed to fetch ${serviceType} connections:`, err);
      message.error("Failed to load connections.");
    } finally {
      setLoading(false);
    }
  }, [serviceType]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const serviceLabel =
    serviceType.charAt(0).toUpperCase() + serviceType.slice(1);

  const breadcrumbItems = [
    { label: "Explore", href: "/explore" },
    { label: "Sources", href: "/explore" },
    { label: serviceLabel },
  ];

  const handleRowClick = (endpoint: ServiceEndpoint) => {
    router.push(`/explore/${serviceType}/${endpoint.id}`);
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

  return (
    <div className="flex flex-col h-full bg-[#f8fafc] animate-in fade-in duration-500 overflow-hidden">
      {/* Header Area */}
      <div className="px-4 pt-2 pb-2 bg-white border-b border-slate-200">
        <div className="flex items-center justify-between">
          <PageHeader
            title={`${serviceLabel} Sources`}
            description={`Explore and manage your connected ${serviceType} instances grouped by integration.`}
            breadcrumbItems={breadcrumbItems}
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-4">
        <div className="max-w-[1400px] mx-auto">
          {loading && groupedData.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-32 space-y-4">
              <Spin size="large" />
              <p className="text-slate-400 font-medium">
                Loading your connections...
              </p>
            </div>
          ) : (
            <GroupedConnectionList
              groups={groupedData}
              loading={loading}
              onRowClick={handleRowClick}
              onDelete={handleDelete}
              emptyText={`No ${serviceType} connections found. Add one in Settings > Services.`}
            />
          )}
        </div>
      </div>
    </div>
  );
}
