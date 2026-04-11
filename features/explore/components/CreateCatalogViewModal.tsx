"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Modal,
  Form,
  Input,
  Select,
  Button,
  message,
  Tabs,
  Typography,
} from "antd";
import { useQueryClient } from "@tanstack/react-query";
import { Database, Link, CalendarClock, Settings2 } from "lucide-react";
import { serviceService } from "@/features/services/services/service.service";
import { CATALOG_VIEWS_UPDATED_EVENT } from "@/features/sql-editor/constants";

function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

const { Text } = Typography;

function toInternalName(value?: string) {
  return (value || "")
    .trim()
    .replace(/[^a-zA-Z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .toLowerCase();
}

interface CreateCatalogViewModalProps {
  open: boolean;
  onCancel: () => void;
  onSuccess?: (newViewId?: string) => void;
  initialAssetId?: string;
  initialEndpointContext?: {
    source_connection_id: string;
    source_schema: string;
    source_table: string;
  };
}

export function CreateCatalogViewModal({
  open,
  onCancel,
  onSuccess,
  initialAssetId,
  initialEndpointContext,
}: CreateCatalogViewModalProps) {
  const [form] = Form.useForm();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<"asset" | "endpoint">("asset");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Asset Mode States
  const [assetOptions, setAssetOptions] = useState<
    { label: string; value: string }[]
  >([]);
  const [fetchingAssets, setFetchingAssets] = useState(false);

  // Endpoint Mode States
  const [connections, setConnections] = useState<any[]>([]);
  const [databases, setDatabases] = useState<any[]>([]);
  const [schemas, setSchemas] = useState<any[]>([]);
  const [tables, setTables] = useState<any[]>([]);

  const [fetchingConns, setFetchingConns] = useState(false);
  const [fetchingDbs, setFetchingDbs] = useState(false);
  const [fetchingSchemas, setFetchingSchemas] = useState(false);
  const [fetchingTables, setFetchingTables] = useState(false);

  const selectedConnectionId = Form.useWatch("source_connection_id", form);
  const selectedDatabase = Form.useWatch("-database-", form);
  const selectedSchema = Form.useWatch("source_schema", form);
  const selectedSourceTable = Form.useWatch("source_table", form);
  const syncMode = Form.useWatch("sync_mode", form);

  // --- Reset forms when opening/closing ---
  useEffect(() => {
    if (open) {
      form.resetFields();
      if (initialEndpointContext) {
        setActiveTab("endpoint");
        form.setFieldsValue({
          ...initialEndpointContext,
          name: toInternalName(initialEndpointContext.source_table),
          display_name: initialEndpointContext.source_table,
          data_asset_id: initialAssetId,
        });
      } else if (initialAssetId) {
        setActiveTab("asset");
        form.setFieldsValue({ data_asset_id: initialAssetId });
        // Fetch specific asset to display name if necessary (optional improvement)
      } else {
        // Fetch initial list of assets, and connections
        fetchAssets("");
        fetchConnections();
      }
    }
  }, [open, initialAssetId, initialEndpointContext, form]);

  // --- Async Fetchers ---
  const fetchAssets = useMemo(
    () =>
      debounce(async (search: string) => {
        setFetchingAssets(true);
        try {
          const res = await serviceService.getDataAssets({
            name: search,
            limit: 50,
          });
          setAssetOptions(
            (res as any[]).map((a: any) => ({
              label: a.display_name || a.name,
              value: a.id,
            }))
          );
        } catch (error) {
          console.error("Failed to fetch assets:", error);
        } finally {
          setFetchingAssets(false);
        }
      }, 500),
    []
  );

  const fetchConnections = async () => {
    setFetchingConns(true);
    try {
      const res = await serviceService.getServices({ limit: 100 });
      setConnections(res.data || []);
    } catch (error) {
      message.error("Failed to fetch connections");
    } finally {
      setFetchingConns(false);
    }
  };

  // --- Cascade Fetch Effects ---
  useEffect(() => {
    if (activeTab !== "endpoint") return;
    if (!selectedConnectionId) {
      setDatabases([]);
      form.setFieldsValue({ "-database-": undefined, source_schema: undefined, source_table: undefined });
      return;
    }
    const loadDBs = async () => {
      setFetchingDbs(true);
      try {
        const dbs = await serviceService.getDatabases(selectedConnectionId);
        setDatabases(dbs || []);
        form.setFieldsValue({ "-database-": undefined, source_schema: undefined, source_table: undefined });
      } catch (err) {
        console.error(err);
      } finally {
        setFetchingDbs(false);
      }
    };
    loadDBs();
  }, [selectedConnectionId, activeTab]);

  useEffect(() => {
    if (activeTab !== "endpoint") return;
    if (!selectedConnectionId || !selectedDatabase) {
      setSchemas([]);
      form.setFieldsValue({ source_schema: undefined, source_table: undefined });
      return;
    }
    const loadSchemas = async () => {
      setFetchingSchemas(true);
      try {
        const schs = await serviceService.getSchemas(selectedConnectionId, selectedDatabase);
        setSchemas(schs || []);
        form.setFieldsValue({ source_schema: undefined, source_table: undefined });
      } catch (err) {
        console.error(err);
      } finally {
        setFetchingSchemas(false);
      }
    };
    loadSchemas();
  }, [selectedDatabase, selectedConnectionId, activeTab]);

  useEffect(() => {
    if (activeTab !== "endpoint") return;
    if (!selectedConnectionId || !selectedDatabase || !selectedSchema) {
      setTables([]);
      form.setFieldsValue({ source_table: undefined });
      return;
    }
    const loadTables = async () => {
      setFetchingTables(true);
      try {
        const tbls = await serviceService.getDBObjects(selectedConnectionId, selectedDatabase, selectedSchema);
        setTables(tbls || []);
        form.setFieldsValue({ source_table: undefined });
      } catch (err) {
        console.error(err);
      } finally {
        setFetchingTables(false);
      }
    };
    loadTables();
  }, [selectedSchema, selectedDatabase, selectedConnectionId, activeTab]);

  useEffect(() => {
    if (activeTab !== "endpoint" || !selectedSourceTable) {
      return;
    }

    const currentName = form.getFieldValue("name");
    const currentDisplayName = form.getFieldValue("display_name");
    const normalizedTableName = toInternalName(selectedSourceTable);

    form.setFieldsValue({
      name: currentName || normalizedTableName,
      display_name: currentDisplayName || selectedSourceTable,
    });
  }, [activeTab, form, selectedSourceTable]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setIsSubmitting(true);

      // Clean payload based on active mode
      const payload: any = {
        name: values.name,
      };

      if (values.display_name) payload.display_name = values.display_name;
      if (values.description) payload.description = values.description;
      
      const sMode = values.sync_mode || "on_demand";
      payload.sync_mode = sMode;
      if (sMode === "scheduled" && values.cron_expr) {
        payload.cron_expr = values.cron_expr;
      }

      if (activeTab === "asset") {
        payload.data_asset_id = values.data_asset_id;
      } else {
        if (initialAssetId) {
          payload.data_asset_id = initialAssetId;
        }
        payload.source_connection_id = initialEndpointContext?.source_connection_id || values.source_connection_id;
        payload.source_schema = initialEndpointContext?.source_schema || values.source_schema;
        payload.source_table = initialEndpointContext?.source_table || values.source_table;
        // The API defaults source_object_type to table usually, but we can explicitly set it
        payload.source_object_type = "table"; 
      }

      const newView = await serviceService.createCatalogView(payload);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["catalog-views"] }),
        queryClient.invalidateQueries({ queryKey: ["catalog-view"] }),
        queryClient.invalidateQueries({ queryKey: ["sync-config"] }),
        queryClient.invalidateQueries({ queryKey: ["trino-schemas"] }),
        queryClient.invalidateQueries({ queryKey: ["trino-tables"] }),
        queryClient.invalidateQueries({ queryKey: ["trino-table-detail"] }),
      ]);
      if (typeof window !== "undefined") {
        window.dispatchEvent(
          new CustomEvent(CATALOG_VIEWS_UPDATED_EVENT, {
            detail: { id: newView?.id },
          }),
        );
      }
      message.success("Catalog view created successfully");
      if (onSuccess) onSuccess(newView?.id);
      onCancel();
    } catch (err: any) {
      if (err.errorFields) return; // Validation error
      console.error(err);
      message.error(err?.response?.data?.message || "Failed to create catalog view");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      title={
        <div className="flex items-center gap-2">
          <Settings2 size={18} className="text-slate-500" />
          <span>Create Custom Catalog View</span>
        </div>
      }
      open={open}
      onCancel={onCancel}
      onOk={handleSubmit}
      okText="Create Resource"
      okButtonProps={{ loading: isSubmitting }}
      width={600}
      destroyOnHidden
    >
      {!initialAssetId && !initialEndpointContext && (
        <Tabs
          activeKey={activeTab}
          onChange={(k: any) => {
            setActiveTab(k);
            form.resetFields([
              "data_asset_id",
              "source_connection_id",
              "-database-",
              "source_schema",
              "source_table",
            ]);
          }}
          className="mb-4"
          items={[
            {
              key: "asset",
              label: (
                <span className="flex items-center gap-2">
                  <Database size={16} /> From Data Asset (Recommended)
                </span>
              ),
            },
            {
              key: "endpoint",
              label: (
                <span className="flex items-center gap-2">
                  <Link size={16} /> From Service Endpoint
                </span>
              ),
            },
          ]}
        />
      )}

      {initialAssetId && (
        <div className="bg-blue-50 text-blue-700 p-3 rounded-lg mb-6 flex items-start gap-3 border border-blue-100">
          <Database size={18} className="mt-0.5" />
          <div className="text-sm">
            You are creating a catalog view explicitly linked to this asset. 
            The system will automatically extract connection and schema linkages.
          </div>
        </div>
      )}

      {initialEndpointContext && (
        <div className="bg-blue-50 text-blue-700 p-3 rounded-lg mb-6 flex items-start gap-3 border border-blue-100">
          <Link size={18} className="mt-0.5 shrink-0" />
          <div className="text-sm">
            You are creating a catalog view explicitly linked to the source table <span className="font-bold font-mono">{initialEndpointContext.source_table}</span>.
          </div>
        </div>
      )}

      <Form form={form} layout="vertical" initialValues={{ sync_mode: "on_demand" }}>
        
        {/* Core Info - Common to Both */}
        <div className="grid grid-cols-2 gap-4">
          <Form.Item
            name="name"
            label="Internal Name"
            rules={[
              { required: true, message: "Please enter an internal name" },
              { pattern: /^[a-z0-9_]+$/, message: "Lowercase alphanumeric and underscores only" }
            ]}
          >
            <Input placeholder="e.g. core_users_view" />
          </Form.Item>
          <Form.Item
            name="display_name"
            label="Display Name"
          >
            <Input placeholder="e.g. Core Users" />
          </Form.Item>
        </div>

        <Form.Item name="description" label="Description">
          <Input.TextArea rows={2} placeholder="Optional detailed description..." />
        </Form.Item>

        {activeTab === "asset" && (
          <Form.Item
            name="data_asset_id"
            label="Source Data Asset"
            rules={[{ required: true, message: "Asset selection is required" }]}
          >
            <Select
              showSearch
              filterOption={false}
              onSearch={fetchAssets}
              options={assetOptions}
              disabled={!!initialAssetId}
              loading={fetchingAssets}
              placeholder="Search and select a data asset..."
            />
          </Form.Item>
        )}

        {activeTab === "endpoint" && !initialEndpointContext && (
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 mb-6 flex flex-col gap-4">
            <Text className="text-xs font-bold uppercase tracking-widest text-slate-400">
              Source Coordinates
            </Text>
            <Form.Item
              name="source_connection_id"
              label="Connection"
              className="mb-0"
              rules={[{ required: true, message: "Required" }]}
            >
              <Select
                options={connections.map((c) => ({ label: c.name, value: c.id }))}
                loading={fetchingConns}
                showSearch
                optionFilterProp="label"
                placeholder="Select Endpoint..."
              />
            </Form.Item>

            <div className="grid grid-cols-3 gap-3">
              <Form.Item
                name="-database-" // Used only for fetching, not submitted in payload
                label="Database"
                className="mb-0"
                rules={[{ required: true, message: "Required" }]}
              >
                <Select
                  options={databases.map((d) => ({ label: d.name, value: d.name }))}
                  loading={fetchingDbs}
                  disabled={!selectedConnectionId}
                  placeholder="Database"
                />
              </Form.Item>
              <Form.Item
                name="source_schema"
                label="Schema"
                className="mb-0"
                rules={[{ required: true, message: "Required" }]}
              >
                <Select
                  options={schemas.map((s) => ({ label: s.name, value: s.name }))}
                  loading={fetchingSchemas}
                  disabled={!selectedDatabase}
                  placeholder="Schema"
                />
              </Form.Item>
              <Form.Item
                name="source_table"
                label="Table"
                className="mb-0"
                rules={[{ required: true, message: "Required" }]}
              >
                <Select
                  options={tables.map((t) => ({ label: t.name, value: t.name }))}
                  loading={fetchingTables}
                  disabled={!selectedSchema}
                  placeholder="Table"
                />
              </Form.Item>
            </div>
          </div>
        )}

        {/* Sync Settings */}
        <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 mt-2">
           <Text className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4 block">
              Synchronization Control
            </Text>
          <div className="grid grid-cols-2 gap-4">
            <Form.Item
              name="sync_mode"
              label="Sync Mode"
              className="mb-0"
            >
              <Select
                options={[
                  { label: "On Demand (Manual)", value: "on_demand" },
                  { label: "Auto (Webhook/Event)", value: "auto" },
                  { label: "Scheduled (Cron)", value: "scheduled" },
                ]}
              />
            </Form.Item>

            {syncMode === "scheduled" && (
              <Form.Item
                name="cron_expr"
                label="Cron Expression"
                className="mb-0"
                rules={[{ required: true, message: "Cron required for scheduled mode" }]}
              >
                <Input placeholder="e.g. 0 * * * *" prefix={<CalendarClock size={16} className="text-slate-400" />} />
              </Form.Item>
            )}
          </div>
        </div>

      </Form>
    </Modal>
  );
}
