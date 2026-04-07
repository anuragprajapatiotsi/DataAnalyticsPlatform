"use client";

import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Input, Select, Button, Tooltip, message } from "antd";
import { Search, Building2, RefreshCw, Filter } from "lucide-react";
import { serviceService } from "@/features/services/services/service.service";
import { CatalogPageLayout } from "@/shared/components/catalog/CatalogPageLayout";
import { ServiceListTable } from "@/shared/components/catalog/ServiceListTable";
import {
  ServiceEndpoint,
  ConnectorMetadata,
  GroupedServiceCategory,
} from "@/features/services/types";
import { cn } from "@/shared/utils/cn";

export default function SqlEditorDatabaseSourcesPage() {
  const router = useRouter();
  const serviceType = "databases";

  const [categories, setCategories] = useState<GroupedServiceCategory[]>([]);
  const [connectors, setConnectors] = useState<ConnectorMetadata[]>([]);
  const [loading, setLoading] = useState(true);
  const [organizations, setOrganizations] = useState<{ id: string; name: string }[]>([]);
  const [selectedOrgId, setSelectedOrgId] = useState<string | undefined>(undefined);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedConnectorSlug, setSelectedConnectorSlug] = useState<string | undefined>(undefined);

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
      
      const connectorsResp = await serviceService.getConnectors();
      const connectorsList = Array.isArray(connectorsResp) ? connectorsResp : [];
      const connectorsData = connectorsList.map((c: any) => ({
        id: c.id,
        slug: c.slug,
        display_label: c.display_label
      }));
      setConnectors(connectorsData);

      const resp = await serviceService.getServiceEndpointsByType(serviceType, selectedOrgId, "primary");
      setCategories(Array.isArray(resp) ? resp : []);

      if (!selectedConnectorSlug && connectorsData.length > 0) {
        const firstAvailable = connectorsData.find(c => 
          (Array.isArray(resp) ? resp : []).some((cat: any) => cat.category_slug === c.slug)
        );
        if (firstAvailable) setSelectedConnectorSlug(firstAvailable.slug);
      }
    } catch (err) {
      console.error(`Failed to fetch database connections:`, err);
      message.error("Failed to load connections.");
    } finally {
      setLoading(false);
    }
  }, [selectedOrgId, selectedConnectorSlug]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filteredConnections = useMemo(() => {
    if (!selectedConnectorSlug) return [];
    const category = categories.find(cat => cat.category_slug === selectedConnectorSlug);
    if (!category) return [];
    const connections = category.connections || [];
    return connections.filter(conn => 
      conn.service_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      conn.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [categories, selectedConnectorSlug, searchTerm]);

  const breadcrumbItems = [
    { label: "SQL Editor", href: "/sql-editor" },
    { label: "Sources" },
    { label: "Databases" },
  ];

  const toolbar = (
    <div className="flex items-center justify-between gap-4">
      <div className="flex-1 flex items-center gap-2 px-2">
        <Search size={16} className="text-slate-400" />
        <Input
          placeholder="Search by name or description..."
          variant="borderless"
          className="h-9 shadow-none px-2 text-[14px] w-full max-w-md focus:ring-0"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      
      <div className="flex items-center gap-3 pr-2 border-l border-slate-100 pl-4">
        <div className="flex items-center gap-2">
          <Filter size={14} className="text-slate-400" />
          <Select
            placeholder="Filter Connector"
            variant="borderless"
            className="w-40 bg-slate-50 rounded-md"
            options={connectors.map(c => ({ label: c.display_label, value: c.slug }))}
            onChange={(val) => setSelectedConnectorSlug(val)}
            value={selectedConnectorSlug}
          />
        </div>
        
        <Tooltip title="Refresh Data">
          <Button 
            type="text"
            icon={<RefreshCw size={16} className={cn("text-slate-500", loading && "animate-spin")} />} 
            className="flex items-center justify-center h-8 w-8 rounded-md hover:bg-slate-100 transition-colors"
            onClick={fetchData}
            disabled={loading}
          />
        </Tooltip>
      </div>
    </div>
  );

  const headerActions = (
    <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5">
      <Building2 size={14} className="text-slate-400" />
      <div className="h-4 w-px bg-slate-200 mx-1" />
      <Select
        placeholder="All Organizations"
        allowClear
        variant="borderless"
        className="w-40"
        options={organizations.map(org => ({ label: org.name, value: org.id }))}
        onChange={(val) => setSelectedOrgId(val)}
        value={selectedOrgId}
        popupMatchSelectWidth={false}
      />
    </div>
  );

  return (
    <CatalogPageLayout
      title="Database Sources"
      description="Discover and manage your connected database instances within the SQL Editor."
      breadcrumbItems={breadcrumbItems}
      toolbar={toolbar}
      headerActions={headerActions}
    >
      <ServiceListTable
        services={filteredConnections}
        loading={loading}
        serviceType="databases"
        onServiceClick={(record) => router.push(`/sql-editor/sources/databases/${record.id}`)}
      />
      
    </CatalogPageLayout>
  );
}
