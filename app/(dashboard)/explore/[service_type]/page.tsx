"use client";

import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { Spin, message, Table, Badge, Input, Select, Empty, Tooltip, Button } from "antd";
import { 
  Database, 
  Search, 
  Building2, 
  Layers, 
  LayoutDashboard,
  ExternalLink,
  Settings2,
  Activity,
  Server,
  Network
} from "lucide-react";
import { serviceService } from "@/features/services/services/service.service";
import { PageHeader } from "@/shared/components/layout/PageHeader";
import {
  ServiceEndpoint,
  ConnectorMetadata,
  GroupedServiceCategory
} from "@/features/services/types";
import { cn } from "@/shared/utils/cn";
import type { ColumnsType } from "antd/es/table";

export default function ExploreServiceTypePage() {
  const params = useParams();
  const router = useRouter();
  const serviceType = params.service_type as string;

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
      
      // 1. Fetch connectors (always parents of 'databases')
      const connectorsResp = await serviceService.getConnectors();
      const connectorsList = Array.isArray(connectorsResp) ? connectorsResp : [];
      const connectorsData = connectorsList.map((c: any) => ({
        id: c.id,
        slug: c.slug,
        display_label: c.display_label
      }));
      setConnectors(connectorsData);

      // 2. Fetch connections (name=primary for grouped results)
      const type = (serviceType === "database" || serviceType === "databases") ? "databases" : serviceType;
      const resp = await serviceService.getServiceEndpointsByType(type, selectedOrgId, "primary");
      
      // The service already handles extracting .categories if present
      setCategories(Array.isArray(resp) ? resp : []);

      // Default to first connector if none selected
      if (!selectedConnectorSlug && connectorsData.length > 0) {
        // Find if we have any category that matches a connector
        const firstAvailable = connectorsData.find(c => 
          (Array.isArray(resp) ? resp : []).some((cat: any) => cat.category_slug === c.slug)
        );
        if (firstAvailable) setSelectedConnectorSlug(firstAvailable.slug);
      }
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

  // Unified Filtering Logic
  const filteredConnections = useMemo(() => {
    if (!selectedConnectorSlug) return [];

    const category = categories.find(cat => cat.category_slug === selectedConnectorSlug);
    if (!category) return [];

    console.log("Selected connector:", selectedConnectorSlug);
    console.log("Matched category:", category);
    console.log("Connections before search filter:", category.connections);

    const connections = category.connections || [];
    
    return connections.filter(conn => 
      conn.service_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      conn.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [categories, selectedConnectorSlug, searchTerm]);

  const isDatabaseService = serviceType === "database" || serviceType === "databases";
  const serviceLabel = isDatabaseService ? "Database Services" : 
    (serviceType.charAt(0).toUpperCase() + serviceType.slice(1));

  const breadcrumbItems = [
    { label: "Explore", href: "/explore" },
    { label: "Sources", href: "/explore" },
    { label: serviceLabel },
  ];

  const columns: ColumnsType<ServiceEndpoint> = [
    {
      title: "Service Name",
      dataIndex: "service_name",
      key: "service_name",
      render: (text, record) => (
        <div 
          className="flex items-center gap-3 group cursor-pointer"
          onClick={() => router.push(`/explore/${serviceType}/${record.id}`)}
        >
          <div className="p-2 rounded-lg bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all">
            <Server size={16} />
          </div>
          <span className="font-bold text-slate-800 group-hover:text-blue-600 transition-colors uppercase tracking-tight">
            {text}
          </span>
        </div>
      ),
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
      render: (text) => (
        <span className="text-slate-500 text-sm italic">
          {text || "No description provided."}
        </span>
      ),
    },
    {
      title: "Status",
      dataIndex: "is_active",
      key: "status",
      render: (active) => (
        <Badge
          status={active ? "success" : "default"}
          text={
            <span className={cn(
              "text-[10px] font-black uppercase tracking-widest",
              active ? "text-green-600" : "text-slate-400"
            )}>
              {active ? "Active" : "Inactive"}
            </span>
          }
        />
      ),
    },
    {
      title: "Infrastructure",
      key: "infrastructure",
      render: (_, record) => {
        const host = record.extra?.host || "N/A";
        const port = record.extra?.port || "";
        return (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100 border border-slate-200 text-slate-600 text-[10px] font-black uppercase tracking-widest w-fit">
            <Network size={10} />
            {host}{port ? `:${port}` : ""}
          </div>
        );
      },
    },
    {
      title: "Actions",
      key: "actions",
      width: "120px",
      render: (_, record) => (
        <Tooltip title="View Databases">
          <Button
            type="text"
            icon={<Database size={16} className="text-slate-400 hover:text-blue-600 transition-colors" />}
            onClick={() => router.push(`/explore/${serviceType}/${record.id}`)}
          >
            <span className="ml-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 group-hover:text-blue-600">
              Explore
            </span>
          </Button>
        </Tooltip>
      ),
    },
  ];

  return (
    <div className="flex flex-col h-full bg-[#f8fafc] animate-in fade-in duration-500 overflow-hidden">
      {/* Header Area */}
      <div className="px-4 pt-2 pb-2 bg-white border-b border-slate-200 shadow-sm">
        <div className="flex items-center justify-between">
          <PageHeader
            title={`${serviceLabel}`}
            description={isDatabaseService 
              ? "Discover and manage your connected database instances grouped by connector type."
              : `Explore and manage your connected ${serviceType} instances.`}
            breadcrumbItems={breadcrumbItems}
          />

          <div className="flex items-center gap-4">
            <div className="flex flex-col gap-1 items-end">
              <span className="text-[14px] font-bold text-slate-400 uppercase tracking-widest leading-none mr-1">
                Organization
              </span>
              <Select
                placeholder="All Organizations"
                allowClear
                className="w-48 custom-select"
                options={organizations.map(org => ({ label: org.name, value: org.id }))}
                onChange={(val) => setSelectedOrgId(val)}
                value={selectedOrgId}
                variant="filled"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
        {/* Filter Bar */}
        <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between gap-4">
          <div className="flex-1 flex items-center gap-4">
            <Input
              placeholder="Search Connections..."
              prefix={<Search size={16} className="text-slate-400" />}
              className="h-10 rounded-lg border-slate-200 max-w-md bg-slate-50/30"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            { isDatabaseService && (
              <Select
                placeholder="Filter by Connector"
                className="w-48 custom-select"
                options={connectors.map(c => ({ label: c.display_label, value: c.slug }))}
                onChange={(val) => setSelectedConnectorSlug(val)}
                value={selectedConnectorSlug}
                variant="filled"
              />
            )}
          </div>
          
          <Button 
            icon={<Activity size={16} />} 
            className="rounded-lg h-10 border-slate-200 text-slate-600 font-bold"
            onClick={fetchData}
            loading={loading}
          >
            Refresh Data
          </Button>
        </div>

        {/* Connection List Table */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex-1 flex flex-col min-h-0 h-full">
          <Table
            dataSource={filteredConnections}
            columns={columns}
            rowKey="id"
            loading={loading}
            scroll={{ y: "calc(100vh - 290px)" }}
            pagination={{ 
              pageSize: 50, 
              hideOnSinglePage: true,
              className: "px-6 py-4 border-t border-slate-50 mt-auto !mb-0 flex-shrink-0 bg-white" 
            }}
            className="custom-explore-table flex-1 flex flex-col h-full"
            locale={{
              emptyText: (
                <Empty
                  image={<Server className="mx-auto text-slate-200" size={48} />}
                  description={
                    <div className="flex flex-col gap-1">
                      <span className="text-slate-500 font-bold">
                        {selectedConnectorSlug ? "No connections found for this connector" : "Please select a connector to view connections"}
                      </span>
                      <span className="text-slate-400 text-xs">Try adjusting your filters or organization.</span>
                    </div>
                  }
                />
              ),
            }}
          />
        </div>
      </div>

      <style jsx global>{`
        .custom-select .ant-select-selector {
          border-radius: 8px !important;
          border-color: #e2e8f0 !important;
          height: 40px !important;
          display: flex !important;
          align-items: center !important;
        }
        .custom-explore-table .ant-table-thead > tr > th {
          background: #f8fafc !important;
          color: #64748b !important;
          font-size: 10px !important;
          font-weight: 800 !important;
          text-transform: uppercase !important;
          letter-spacing: 0.1em !important;
          border-bottom: 2px solid #f1f5f9 !important;
          padding: 16px 24px !important;
        }
        .custom-explore-table .ant-table-tbody > tr > td {
          padding: 12px 24px !important;
          border-bottom: 1px solid #f1f5f9 !important;
        }
        .custom-explore-table .ant-table-row:hover > td {
          background: #f1f5f9/30 !important;
        }
      `}</style>
    </div>
  );
}
