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
import { Button, Select } from "antd";
import { Building2 } from "lucide-react";

export default function ExploreServiceTypePage() {
  const params = useParams();
  const router = useRouter();
  const serviceType = params.service_type as string;

  const [groupedData, setGroupedData] = useState<GroupedServiceCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [organizations, setOrganizations] = useState<{ id: string; name: string }[]>([]);
  const [selectedOrgId, setSelectedOrgId] = useState<string | undefined>(undefined);

  // Fetch Organizations
  useEffect(() => {
    async function fetchOrgs() {
      try {
        const orgs = await serviceService.getOrganizations();
        setOrganizations(orgs || []);
      } catch (err) {
        console.error("Failed to fetch organizations:", err);
      }
    }
    fetchOrgs();
  }, []);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const data = await serviceService.getServiceEndpointsByType(serviceType, selectedOrgId);
      setGroupedData(data || []);
    } catch (err) {
      console.error(`Failed to fetch ${serviceType} connections:`, err);
      message.error("Failed to load connections.");
    } finally {
      setLoading(false);
    }
  }, [serviceType, selectedOrgId]);

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

          <div className="flex items-center gap-3">
            <div className="flex flex-col gap-1 items-end">
              <span className="text-[14px] font-bold text-slate-600  tracking-widest leading-none mr-1">
                Organization
              </span>
              <Select
                placeholder="All Organizations"
                allowClear
                className="w-64"
                suffixIcon={<Building2 size={14} className="text-slate-00" />}
                onChange={(value) => setSelectedOrgId(value)}
                value={selectedOrgId}
                loading={organizations.length === 0 && loading}
                options={organizations.map(org => ({
                  label: org.name,
                  value: org.id
                }))}
                variant="filled"
                style={{ borderRadius: '8px'}}
              />
            </div>
          </div>
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
              emptyText={
                selectedOrgId 
                  ? "No connections available for the selected organization"
                  : `No ${serviceType} connections found. Add one in Settings > Services.`
              }
            />
          )}
        </div>
      </div>
    </div>
  );
}
