"use client";

import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { Spin, message, Table, Input, Select, Empty, Tooltip, Button } from "antd";
import { 
  Database, 
  Search, 
  Building2, 
  Server,
  Network,
  RefreshCw,
  ArrowRight,
  Filter
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
      
      const connectorsResp = await serviceService.getConnectors();
      const connectorsList = Array.isArray(connectorsResp) ? connectorsResp : [];
      const connectorsData = connectorsList.map((c: any) => ({
        id: c.id,
        slug: c.slug,
        display_label: c.display_label
      }));
      setConnectors(connectorsData);

      const type = (serviceType === "database" || serviceType === "databases") ? "databases" : serviceType;
      const resp = await serviceService.getServiceEndpointsByType(type, selectedOrgId, "primary");
      
      setCategories(Array.isArray(resp) ? resp : []);

      if (!selectedConnectorSlug && connectorsData.length > 0) {
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
  }, [serviceType, selectedOrgId, selectedConnectorSlug]);

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
      width: "25%",
      render: (text, record) => (
        <div 
          className="flex items-center gap-3 group cursor-pointer"
          onClick={() => router.push(`/explore/${serviceType}/${record.id}`)}
        >
          <div className="flex items-center justify-center w-8 h-8 rounded-md bg-blue-50/50 border border-blue-100 text-blue-600 group-hover:bg-blue-600 group-hover:border-blue-600 group-hover:text-white transition-all duration-200">
            <Server size={14} />
          </div>
          <div className="flex flex-col">
            <span className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
              {text}
            </span>
          </div>
        </div>
      ),
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
      width: "35%",
      render: (text) => (
        <span className="text-slate-500 text-[13px] line-clamp-2">
          {text || "No description provided."}
        </span>
      ),
    },
    {
      title: "Status",
      dataIndex: "is_active",
      key: "status",
      width: "15%",
      render: (active) => (
        <div className={cn(
          "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium border",
          active 
            ? "bg-emerald-50 text-emerald-700 border-emerald-200" 
            : "bg-slate-50 text-slate-600 border-slate-200"
        )}>
          <span className={cn(
            "w-1.5 h-1.5 rounded-full",
            active ? "bg-emerald-500 shadow-[0_0_4px_rgba(16,185,129,0.4)]" : "bg-slate-400"
          )} />
          {active ? "Connected" : "Disconnected"}
        </div>
      ),
    },
    {
      title: "Infrastructure",
      key: "infrastructure",
      width: "15%",
      render: (_, record) => {
        const host = record.extra?.host || "N/A";
        const port = record.extra?.port || "";
        return (
          <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-slate-50 border border-slate-200 text-slate-600 text-[11px] font-mono w-fit">
            <Network size={12} className="text-slate-400" />
            <span className="truncate max-w-[120px]">{host}</span>
            {port && <span className="text-slate-400">:{port}</span>}
          </div>
        );
      },
    },
    {
      title: "",
      key: "actions",
      width: "10%",
      align: "right",
      render: (_, record) => (
        <Tooltip title="View Details">
          <Button
            type="text"
            className="flex items-center justify-center text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
            icon={<ArrowRight size={16} />}
            onClick={(e) => {
              e.stopPropagation();
              router.push(`/explore/${serviceType}/${record.id}`);
            }}
          />
        </Tooltip>
      ),
    },
  ];

  return (
    <div className="flex flex-col h-full bg-[#FAFAFA] animate-in fade-in duration-500 overflow-hidden">
      {/* Header Area */}
      <div className="px-6 pt-5 pb-4 bg-white border-b border-slate-200">
        <div className="flex items-center justify-between">
          <PageHeader
            title={serviceLabel}
            description={isDatabaseService 
              ? "Discover and manage your connected database instances."
              : `Explore and manage your connected ${serviceType} instances.`}
            breadcrumbItems={breadcrumbItems}
          />

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5">
              <Building2 size={14} className="text-slate-400" />
              <div className="h-4 w-px bg-slate-200 mx-1" />
              <Select
                placeholder="All Organizations"
                allowClear
                variant="borderless"
                className="w-40 custom-org-select"
                options={organizations.map(org => ({ label: org.name, value: org.id }))}
                onChange={(val) => setSelectedOrgId(val)}
                value={selectedOrgId}
                popupMatchSelectWidth={false}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-4">
        {/* Toolbar */}
        <div className="flex items-center justify-between gap-4 bg-white p-2 rounded-xl border border-slate-200 shadow-sm">
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
            {isDatabaseService && (
              <div className="flex items-center gap-2">
                <Filter size={14} className="text-slate-400" />
                <Select
                  placeholder="Filter Connector"
                  variant="borderless"
                  className="w-40 bg-slate-50 rounded-md custom-filter-select"
                  options={connectors.map(c => ({ label: c.display_label, value: c.slug }))}
                  onChange={(val) => setSelectedConnectorSlug(val)}
                  value={selectedConnectorSlug}
                />
              </div>
            )}
            
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

        {/* Table Container */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex-1 flex flex-col min-h-0">
          <Table
            dataSource={filteredConnections}
            columns={columns}
            rowKey="id"
            loading={{
              spinning: loading,
              indicator: <Spin indicator={<RefreshCw className="animate-spin text-blue-600" size={24} />} />
            }}
            scroll={{ y: "calc(100vh - 310px)" }}
            onRow={(record) => ({
              onClick: () => router.push(`/explore/${serviceType}/${record.id}`),
              className: "cursor-pointer"
            })}
            pagination={{ 
              pageSize: 50, 
              hideOnSinglePage: true,
              className: "px-6 py-4 border-t border-slate-100 mt-auto !mb-0 flex-shrink-0 bg-white" 
            }}
            className="custom-explore-table flex-1 flex flex-col h-full"
            locale={{
              emptyText: (
                <Empty
                  image={
                    <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center mx-auto mb-4 border border-slate-100">
                      <Server className="text-slate-300" size={28} />
                    </div>
                  }
                  description={
                    <div className="flex flex-col gap-1">
                      <span className="text-slate-700 font-medium text-sm">
                        {selectedConnectorSlug ? "No instances found" : "Select a connector"}
                      </span>
                      <span className="text-slate-400 text-[13px]">
                        {selectedConnectorSlug 
                          ? "Try adjusting your search or filters." 
                          : "Please select a connector to view available databases."}
                      </span>
                    </div>
                  }
                />
              ),
            }}
          />
        </div>
      </div>

      <style jsx global>{`
        /* Overrides for cleaner select inputs */
        .custom-org-select .ant-select-selector,
        .custom-filter-select .ant-select-selector {
          padding: 0 !important;
          color: #475569 !important;
          font-weight: 500;
        }
        .custom-org-select .ant-select-selection-item,
        .custom-filter-select .ant-select-selection-item {
          font-size: 13px;
        }
        
        /* Modern Table Styles */
        .custom-explore-table .ant-table {
          background: transparent !important;
        }
        .custom-explore-table .ant-table-thead > tr > th {
          background: #FAFAFA !important;
          color: #64748b !important;
          font-size: 11px !important;
          font-weight: 600 !important;
          text-transform: uppercase !important;
          letter-spacing: 0.05em !important;
          border-bottom: 1px solid #E2E8F0 !important;
          padding: 12px 24px !important;
        }
        .custom-explore-table .ant-table-thead > tr > th::before {
          display: none !important; /* Remove Antd default column separators */
        }
        .custom-explore-table .ant-table-tbody > tr > td {
          padding: 16px 24px !important;
          border-bottom: 1px solid #F1F5F9 !important;
          transition: background-color 0.2s ease;
        }
        .custom-explore-table .ant-table-tbody > tr:hover > td {
          background: #F8FAFC !important;
        }
        /* Custom scrollbar for the table */
        .custom-explore-table .ant-table-body::-webkit-scrollbar {
          width: 6px;
          height: 6px;
        }
        .custom-explore-table .ant-table-body::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-explore-table .ant-table-body::-webkit-scrollbar-thumb {
          background: #CBD5E1;
          border-radius: 4px;
        }
        .custom-explore-table .ant-table-body::-webkit-scrollbar-thumb:hover {
          background: #94A3B8;
        }
      `}</style>
    </div>
  );
}