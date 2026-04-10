"use client";

import { useMemo, useState } from "react";
import { Alert, Button, Empty, Input, Spin, Table, Tabs, Tag, Tooltip } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useQuery } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowRight,
  FileText,
  FolderOpen,
  RefreshCw,
  Search,
  Server,
} from "lucide-react";

import { datasetService, type DatasetGroup } from "@/features/explore/services/dataset.service";
import { serviceService } from "@/features/services/services/service.service";
import { type ExplorerServiceEndpoint } from "@/features/services/types";
import { PageHeader } from "@/shared/components/layout/PageHeader";
import { useAuth } from "@/shared/hooks/use-auth";

export default function ExploreDataAssetsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { currentOrgId } = useAuth();
  const section = searchParams.get("section");
  const activeTab = section === "files" ? "files" : "service-endpoints";
  const [serviceSearch, setServiceSearch] = useState("");
  const [fileSearch, setFileSearch] = useState("");

  const getConnectionId = (connection: ExplorerServiceEndpoint) =>
    connection.service_endpoint_id || connection.id;

  const breadcrumbItems = [
    { label: "Catalog", href: "/explore" },
    { label: "Data Assets" },
  ];

  const {
    data: services = [],
    isLoading: isServicesLoading,
    isError: isServicesError,
    refetch: refetchServices,
    isRefetching: isServicesRefetching,
  } = useQuery({
    queryKey: ["connections"],
    queryFn: serviceService.getExplorerConnections,
    staleTime: 30 * 1000,
  });

  const {
    data: datasets = [],
    isLoading: isDatasetsLoading,
    isError: isDatasetsError,
    refetch: refetchDatasets,
    isRefetching: isDatasetsRefetching,
  } = useQuery({
    queryKey: ["datasets", "file"],
    queryFn: () =>
      datasetService.getDatasets({
        source_type: "file",
        skip: 0,
        limit: 100,
      }),
    staleTime: 5 * 60 * 1000,
  });

  const filteredServices = useMemo(() => {
    const normalizedSearch = serviceSearch.toLowerCase().trim();
    return services.filter((service) => {
      const id = getConnectionId(service).toLowerCase();
      const name = String(service.service_name || "").toLowerCase();
      const description = String(service.description || "").toLowerCase();
      return (
        name.includes(normalizedSearch) ||
        description.includes(normalizedSearch) ||
        id.includes(normalizedSearch)
      );
    });
  }, [serviceSearch, services]);

  const filteredDatasets = useMemo(() => {
    const normalizedSearch = fileSearch.toLowerCase().trim();
    return datasets
      .filter((dataset) => String(dataset.source_type || "").toLowerCase() === "file")
      .filter((dataset) => (currentOrgId && dataset.org_id ? dataset.org_id === currentOrgId : true))
      .filter((dataset) => dataset.is_active !== false)
      .filter((dataset) => {
        const name = String(dataset.name || "").toLowerCase();
        const displayName = String(dataset.display_name || "").toLowerCase();
        const description = String(dataset.description || "").toLowerCase();
        const id = String(dataset.id || "").toLowerCase();
        return (
          name.includes(normalizedSearch) ||
          displayName.includes(normalizedSearch) ||
          description.includes(normalizedSearch) ||
          id.includes(normalizedSearch)
        );
      });
  }, [currentOrgId, datasets, fileSearch]);

  const serviceColumns: ColumnsType<ExplorerServiceEndpoint> = [
    {
      title: "Service Name",
      dataIndex: "service_name",
      key: "service_name",
      width: "30%",
      render: (name, record) => (
        <div className="flex items-center gap-3 group/name">
          <div className="flex h-8 w-8 items-center justify-center rounded-md border border-blue-100 bg-blue-50 text-blue-600">
            <Server size={14} />
          </div>
          <div className="flex flex-col">
            <span className="font-semibold text-slate-900 group-hover/name:text-blue-600 transition-colors">
              {name}
            </span>
            <span className="max-w-[220px] truncate font-mono text-[10px] text-slate-400">
              {getConnectionId(record)}
            </span>
          </div>
        </div>
      ),
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
      width: "30%",
      render: (value) => (
        <span className="line-clamp-2 text-[13px] text-slate-500">
          {value || <span className="italic opacity-70">No description provided</span>}
        </span>
      ),
    },
    {
      title: "Asset Count",
      dataIndex: "asset_count",
      key: "asset_count",
      width: "13%",
      render: (value) => <span className="text-[13px] font-medium text-slate-700">{value ?? 0}</span>,
    },
    {
      title: "Database Count",
      dataIndex: "database_count",
      key: "database_count",
      width: "13%",
      render: (value) => <span className="text-[13px] font-medium text-slate-700">{value ?? 0}</span>,
    },
    {
      title: "Schema Count",
      dataIndex: "schema_count",
      key: "schema_count",
      width: "14%",
      render: (value) => <span className="text-[13px] font-medium text-slate-700">{value ?? 0}</span>,
    },
    {
      title: "",
      key: "action",
      width: "10%",
      align: "right",
      render: () => (
        <ArrowRight size={16} className="mr-2 text-slate-400 opacity-0 transition-opacity group-hover:opacity-100" />
      ),
    },
  ];

  const datasetCards = filteredDatasets.map((dataset: DatasetGroup) => {
    const datasetLabel = dataset.display_name || dataset.name || "File Group";
    const href = `/explore/data-assets/files/${dataset.id}?dn=${encodeURIComponent(datasetLabel)}`;

    return (
      <button
        key={dataset.id}
        type="button"
        onClick={() => router.push(href)}
        className="group flex h-full flex-col rounded-xl border border-slate-200 bg-white p-5 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:border-blue-200 hover:bg-blue-50/30 hover:shadow-md"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-emerald-100 bg-emerald-50 text-emerald-600">
            <FolderOpen size={18} />
          </div>
          <ArrowRight size={16} className="mt-1 text-slate-300 transition-colors group-hover:text-blue-600" />
        </div>
        <div className="mt-4 min-w-0">
          <div className="truncate text-base font-semibold text-slate-900">{datasetLabel}</div>
          <div className="mt-1 truncate font-mono text-[11px] text-slate-400">{dataset.name || dataset.id}</div>
        </div>
        <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-500">
          {dataset.description || "No description provided for this file group yet."}
        </p>
        <div className="mt-4 flex items-center gap-2">
          <Tag className="m-0 rounded-full border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700">
            File Group
          </Tag>
          <span className="truncate text-[11px] text-slate-400">ID: {dataset.id}</span>
        </div>
      </button>
    );
  });

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-[#FAFAFA] animate-in fade-in duration-500">
      <div className="shrink-0 border-b border-slate-200 bg-white px-6 pt-5 shadow-sm">
        <div className="mx-auto max-w-[1400px] pb-4">
          <div className="flex items-center justify-between gap-4">
            <PageHeader
              title="Data Assets"
              description="Explore service endpoints and file-based assets as separate inventory paths."
              breadcrumbItems={breadcrumbItems}
            />

            <div className="flex items-center gap-5">
              <div className="flex flex-col items-end border-r border-slate-200 pr-5">
                <span className="mb-0.5 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                  Active View
                </span>
                <span className="text-sm font-semibold text-slate-900">
                  {activeTab === "service-endpoints" ? "Service Endpoints" : "Files"}
                </span>
              </div>
              <Tooltip title={activeTab === "service-endpoints" ? "Refresh Service Endpoints" : "Refresh File Groups"}>
                <Button
                  onClick={() =>
                    activeTab === "service-endpoints" ? refetchServices() : refetchDatasets()
                  }
                  icon={
                    <RefreshCw
                      size={14}
                      className={
                        activeTab === "service-endpoints"
                          ? (isServicesLoading || isServicesRefetching ? "animate-spin" : "")
                          : (isDatasetsLoading || isDatasetsRefetching ? "animate-spin" : "")
                      }
                    />
                  }
                  className="flex h-9 w-9 items-center justify-center rounded-md border-slate-200 p-0 text-slate-500 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600"
                />
              </Tooltip>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        <div className="mx-auto flex max-w-[1400px] flex-col gap-4">
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <Tabs
              activeKey={activeTab}
              onChange={(key) => {
                router.replace(
                  key === "files" ? "/explore/data-assets?section=files" : "/explore/data-assets",
                );
              }}
              className="data-assets-tabs"
              items={[
                {
                  key: "service-endpoints",
                  label: (
                    <div className="flex items-center gap-2">
                      <Server size={14} />
                      <span>Service Endpoints</span>
                      <Tag className="m-0 rounded-full border-blue-200 bg-blue-50 px-2 text-[11px] font-semibold text-blue-700">
                        {filteredServices.length}
                      </Tag>
                    </div>
                  ),
                  children: (
                    <div className="flex flex-col">
                      <div className="border-b border-slate-100 px-6 py-4">
                        <div className="flex items-center justify-between gap-4">
                          <div>
                            <div className="text-sm font-medium text-slate-900">Service endpoint inventory</div>
                            <div className="mt-1 text-sm text-slate-500">
                              Continue using the existing connection → database → schema → object drill-down.
                            </div>
                          </div>
                          <div className="flex max-w-md flex-1 items-center gap-2 rounded-lg border border-slate-200 px-3">
                            <Search size={16} className="text-slate-400" />
                            <Input
                              value={serviceSearch}
                              onChange={(event) => setServiceSearch(event.target.value)}
                              placeholder="Search connections by name, ID, or description"
                              variant="borderless"
                              className="h-10 px-0 shadow-none"
                            />
                          </div>
                        </div>
                      </div>

                      {isServicesError ? (
                        <div className="p-6">
                          <Alert
                            title="Failed to load service endpoints"
                            description="We couldn't load the explorer connections right now."
                            type="error"
                            showIcon
                            action={<Button size="small" onClick={() => refetchServices()}>Retry</Button>}
                          />
                        </div>
                      ) : (
                        <Table
                          dataSource={filteredServices}
                          columns={serviceColumns}
                          rowKey={(record) => getConnectionId(record)}
                          loading={{
                            spinning: isServicesLoading,
                            indicator: <Spin indicator={<RefreshCw className="animate-spin text-blue-600" size={24} />} />,
                          }}
                          pagination={{
                            pageSize: 50,
                            hideOnSinglePage: true,
                            className: "px-6 py-4 border-t border-slate-100 !mb-0 bg-white",
                          }}
                          className="custom-explore-table"
                          onRow={(record) => ({
                            onClick: () => router.push(`/explore/data-assets/${getConnectionId(record)}`),
                            className: "cursor-pointer group",
                          })}
                          locale={{
                            emptyText: (
                              <Empty
                                image={<div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full border border-slate-100 bg-slate-50"><Server className="text-slate-300" size={28} /></div>}
                                description={
                                  <div className="flex flex-col gap-1">
                                    <span className="text-sm font-medium text-slate-700">No Service Endpoints Found</span>
                                    <span className="text-[13px] text-slate-400">Try adjusting your search criteria.</span>
                                  </div>
                                }
                              />
                            ),
                          }}
                        />
                      )}
                    </div>
                  ),
                },
                {
                  key: "files",
                  label: (
                    <div className="flex items-center gap-2">
                      <FileText size={14} />
                      <span>Files</span>
                      <Tag className="m-0 rounded-full border-emerald-200 bg-emerald-50 px-2 text-[11px] font-semibold text-emerald-700">
                        {filteredDatasets.length}
                      </Tag>
                    </div>
                  ),
                  children: (
                    <div className="flex flex-col">
                      <div className="border-b border-slate-100 px-6 py-4">
                        <div className="flex items-center justify-between gap-4">
                          <div>
                            <div className="text-sm font-medium text-slate-900">File groups</div>
                            <div className="mt-1 text-sm text-slate-500">
                              Browse file-based datasets first, then drill into file assets without mixing in service endpoints.
                            </div>
                          </div>
                          <div className="flex max-w-md flex-1 items-center gap-2 rounded-lg border border-slate-200 px-3">
                            <Search size={16} className="text-slate-400" />
                            <Input
                              value={fileSearch}
                              onChange={(event) => setFileSearch(event.target.value)}
                              placeholder="Search file groups by name, description, or ID"
                              variant="borderless"
                              className="h-10 px-0 shadow-none"
                            />
                          </div>
                        </div>
                      </div>

                      {isDatasetsError ? (
                        <div className="p-6">
                          <Alert
                            title="Failed to load file groups"
                            description="We couldn't load the file datasets right now."
                            type="error"
                            showIcon
                            action={<Button size="small" onClick={() => refetchDatasets()}>Retry</Button>}
                          />
                        </div>
                      ) : isDatasetsLoading ? (
                        <div className="flex items-center justify-center p-16">
                          <Spin indicator={<RefreshCw className="animate-spin text-emerald-600" size={24} />} />
                        </div>
                      ) : filteredDatasets.length === 0 ? (
                        <div className="py-16">
                          <Empty
                            image={<div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full border border-slate-100 bg-slate-50"><FileText className="text-slate-300" size={28} /></div>}
                            description={
                              <div className="flex flex-col gap-1">
                                <span className="text-sm font-medium text-slate-700">No File Groups Found</span>
                                <span className="text-[13px] text-slate-400">File-based datasets will appear here once they are created.</span>
                              </div>
                            }
                          />
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 gap-4 p-6 md:grid-cols-2 xl:grid-cols-3">
                          {datasetCards}
                        </div>
                      )}
                    </div>
                  ),
                },
              ]}
            />
          </div>
        </div>
      </div>

      <style jsx global>{`
        .data-assets-tabs .ant-tabs-nav {
          margin: 0 !important;
          padding: 0 24px !important;
          background: #fff !important;
        }
        .data-assets-tabs .ant-tabs-tab {
          padding-top: 16px !important;
          padding-bottom: 16px !important;
          font-weight: 600 !important;
        }
        .custom-explore-table .ant-table {
          background: transparent !important;
        }
        .custom-explore-table .ant-table-thead > tr > th {
          background: #fafafa !important;
          color: #64748b !important;
          font-size: 11px !important;
          font-weight: 600 !important;
          text-transform: uppercase !important;
          letter-spacing: 0.05em !important;
          border-bottom: 1px solid #e2e8f0 !important;
          padding: 12px 24px !important;
          position: sticky;
          top: 0;
          z-index: 10;
        }
        .custom-explore-table .ant-table-thead > tr > th::before {
          display: none !important;
        }
        .custom-explore-table .ant-table-tbody > tr > td {
          padding: 16px 24px !important;
          border-bottom: 1px solid #f1f5f9 !important;
          transition: background-color 0.2s ease;
        }
        .custom-explore-table .ant-table-tbody > tr:hover > td {
          background: #f8fafc !important;
        }
      `}</style>
    </div>
  );
}
