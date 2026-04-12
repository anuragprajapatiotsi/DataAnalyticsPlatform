"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Button,
  Dropdown,
  Form,
  Input,
  MenuProps,
  message,
  Modal,
  Radio,
  Space,
  Switch,
} from "antd";
import {
  Edit2,
  Loader2,
  MoreVertical,
  Share2,
  Trash2,
} from "lucide-react";

import { serviceService } from "@/features/services/services/service.service";
import type { ServiceEndpoint } from "@/features/services/types";
import { cn } from "@/shared/utils/cn";

type DeleteAction = "archive" | "delete";

interface ServiceEndpointActionsProps {
  endpointId: string;
  endpointName: string;
  serviceSlug?: string;
  onChanged?: () => void | Promise<void>;
}

function buildBaseUrl(service: string, host: string, port: string | number) {
  const protocolMap: Record<string, string> = {
    postgres: "postgresql",
    mysql: "mysql",
    mongodb: "mongodb",
    redis: "redis",
  };
  const protocol = protocolMap[service] || service;
  return `${protocol}://${host}:${port}`;
}

export function ServiceEndpointActions({
  endpointId,
  endpointName,
  serviceSlug,
  onChanged,
}: ServiceEndpointActionsProps) {
  const [form] = Form.useForm();
  const watchedExtra = Form.useWatch("extra", form);

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deleteAction, setDeleteAction] = useState<DeleteAction>("delete");
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [endpoint, setEndpoint] = useState<ServiceEndpoint | null>(null);

  const generatedUrl = useMemo(() => {
    if (!endpoint?.service_name || !watchedExtra?.host || !watchedExtra?.port) {
      return null;
    }

    return buildBaseUrl(endpoint.service_name, watchedExtra.host, watchedExtra.port);
  }, [endpoint?.service_name, watchedExtra?.host, watchedExtra?.port]);

  useEffect(() => {
    if (!isEditOpen) {
      return;
    }

    let cancelled = false;

    async function loadEndpoint() {
      try {
        setLoadingDetails(true);
        const data = await serviceService.getServiceEndpoint(endpointId);
        if (cancelled) return;
        setEndpoint(data);
        form.setFieldsValue({
          service_name: data.service_name,
          description: data.description,
          is_active: data.is_active,
          internal_connection: data.internal_connection,
          auto_trigger_bots: data.extra?.auto_trigger_bots,
          extra: data.extra,
        });
      } catch {
        if (!cancelled) {
          message.error("Failed to load endpoint details");
          setIsEditOpen(false);
        }
      } finally {
        if (!cancelled) {
          setLoadingDetails(false);
        }
      }
    }

    loadEndpoint();

    return () => {
      cancelled = true;
    };
  }, [endpointId, form, isEditOpen]);

  const menuItems: MenuProps["items"] = [
    {
      key: "edit",
      icon: <Edit2 size={14} />,
      label: "Edit",
    },
    {
      key: "delete",
      icon: <Trash2 size={14} />,
      danger: true,
      label: "Delete",
    },
  ];

  const handleMenuClick: MenuProps["onClick"] = ({ key, domEvent }) => {
    domEvent.stopPropagation();
    if (key === "edit") {
      setIsEditOpen(true);
      return;
    }

    if (key === "delete") {
      setDeleteAction("delete");
      setIsDeleteOpen(true);
    }
  };

  const handleUpdate = async (values: {
    service_name: string;
    description?: string;
    is_active?: boolean;
    internal_connection?: boolean;
    auto_trigger_bots?: boolean;
    extra?: Record<string, unknown>;
  }) => {
    if (!endpoint) {
      return;
    }

    const host = String(values.extra?.host ?? "");
    const port = String(values.extra?.port ?? "");

    if (!host || !port) {
      message.error("Host and port are required");
      return;
    }

    try {
      setSaving(true);
      await serviceService.updateServiceEndpoint(endpointId, {
        service_name: values.service_name,
        description: values.description,
        is_active: values.is_active,
        internal_connection: values.internal_connection,
        base_url: buildBaseUrl(endpoint.service_name, host, port),
        extra: {
          ...endpoint.extra,
          ...values.extra,
          auto_trigger_bots: values.auto_trigger_bots,
        },
      });
      message.success("Service endpoint updated successfully");
      setIsEditOpen(false);
      await onChanged?.();
    } catch (error: unknown) {
      const errorMessage =
        typeof error === "object" &&
        error !== null &&
        "response" in error &&
        typeof (error as { response?: { data?: { message?: string } } }).response?.data?.message === "string"
          ? (error as { response?: { data?: { message?: string } } }).response?.data?.message
          : "Failed to update endpoint";
      message.error(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      setDeleting(true);
      await serviceService.deleteServiceEndpoint(endpointId, deleteAction);
      message.success(
        deleteAction === "archive"
          ? "Service endpoint archived successfully"
          : "Service endpoint deleted successfully",
      );
      setIsDeleteOpen(false);
      await onChanged?.();
    } catch (error: unknown) {
      const errorMessage =
        typeof error === "object" &&
        error !== null &&
        "response" in error &&
        typeof (error as { response?: { data?: { message?: string } } }).response?.data?.message === "string"
          ? (error as { response?: { data?: { message?: string } } }).response?.data?.message
          : "Failed to remove endpoint";
      message.error(errorMessage);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <Dropdown
        menu={{ items: menuItems, onClick: handleMenuClick }}
        trigger={["click"]}
      >
        <Button
          type="text"
          aria-label={`Actions for ${endpointName}`}
          className="flex h-8 w-8 items-center justify-center rounded-md text-slate-400 hover:bg-slate-100 hover:text-slate-700"
          icon={<MoreVertical size={16} />}
          onClick={(event) => event.stopPropagation()}
        />
      </Dropdown>

      <Modal
        title="Edit Service Endpoint"
        open={isEditOpen}
        onCancel={() => setIsEditOpen(false)}
        onOk={() => form.submit()}
        okText="Save Changes"
        cancelText="Cancel"
        confirmLoading={saving}
        width={620}
        destroyOnHidden
      >
        {loadingDetails ? (
          <div className="flex items-center justify-center py-14">
            <Loader2 size={20} className="animate-spin text-blue-600" />
          </div>
        ) : (
          <Form
            form={form}
            layout="vertical"
            requiredMark={false}
            onFinish={handleUpdate}
          >
            <div className="grid grid-cols-2 gap-x-4">
              <Form.Item
                name="service_name"
                label="Service Name"
                className="col-span-2"
                rules={[{ required: true, message: "Service name is required" }]}
              >
                <Input placeholder="Service endpoint name" />
              </Form.Item>

              <Form.Item name="description" label="Description" className="col-span-2">
                <Input.TextArea rows={2} placeholder="Describe this endpoint" />
              </Form.Item>

              {generatedUrl ? (
                <div className="col-span-2 mb-4 rounded-lg border border-blue-100 bg-blue-50/60 px-3 py-2">
                  <div className="mb-1 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wide text-blue-700">
                    <Share2 size={12} />
                    Generated URL
                  </div>
                  <div className="break-all font-mono text-xs text-slate-700">{generatedUrl}</div>
                </div>
              ) : null}

              <Form.Item
                name={["extra", "host"]}
                label="Host"
                rules={[{ required: true, message: "Host is required" }]}
              >
                <Input placeholder="127.0.0.1" />
              </Form.Item>

              <Form.Item
                name={["extra", "port"]}
                label="Port"
                rules={[{ required: true, message: "Port is required" }]}
              >
                <Input placeholder="5432" />
              </Form.Item>

              <Form.Item
                name={["extra", "username"]}
                label="Username"
                rules={[{ required: true, message: "Username is required" }]}
              >
                <Input placeholder="admin" />
              </Form.Item>

              <Form.Item
                name={["extra", "password"]}
                label="Password"
                rules={[{ required: true, message: "Password is required" }]}
              >
                <Input.Password placeholder="Enter password" />
              </Form.Item>

              <Form.Item
                name={["extra", "database"]}
                label={serviceSlug === "databases" || serviceSlug === "database" ? "Default Database" : "Default Target"}
                className="col-span-2"
                rules={[{ required: true, message: "Default database is required" }]}
              >
                <Input placeholder="public" />
              </Form.Item>

              <div className="col-span-2 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
                <Space size="large" wrap>
                  <Form.Item name="is_active" label="Active" valuePropName="checked" className="mb-0">
                    <Switch size="small" />
                  </Form.Item>
                  <Form.Item
                    name="internal_connection"
                    label="Internal"
                    valuePropName="checked"
                    className="mb-0"
                  >
                    <Switch size="small" />
                  </Form.Item>
                  <Form.Item
                    name="auto_trigger_bots"
                    label="Auto Bots"
                    valuePropName="checked"
                    className="mb-0"
                  >
                    <Switch size="small" />
                  </Form.Item>
                </Space>
              </div>
            </div>
          </Form>
        )}
      </Modal>

      <Modal
        title="Remove Service Endpoint"
        open={isDeleteOpen}
        onCancel={() => setIsDeleteOpen(false)}
        onOk={handleDelete}
        okText={deleteAction === "archive" ? "Archive Endpoint" : "Delete Endpoint"}
        okButtonProps={{
          danger: deleteAction === "delete",
          className: cn(deleteAction === "archive" ? "bg-amber-500 hover:!bg-amber-600 border-amber-500" : ""),
        }}
        cancelText="Cancel"
        confirmLoading={deleting}
        destroyOnHidden
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-600">
            Choose how you want to remove <span className="font-semibold text-slate-900">{endpointName}</span>.
          </p>

          <Radio.Group
            value={deleteAction}
            onChange={(event) => setDeleteAction(event.target.value as DeleteAction)}
            className="flex w-full flex-col gap-3"
          >
            <label className="rounded-lg border border-slate-200 p-3 transition-colors hover:border-amber-300 hover:bg-amber-50/40">
              <Radio value="archive">
                <div className="ml-2">
                  <div className="font-medium text-slate-900">Archive data</div>
                  <div className="text-xs text-slate-500">
                    Keep related datasets and assets, but mark the endpoint inactive.
                  </div>
                </div>
              </Radio>
            </label>

            <label className="rounded-lg border border-red-200 p-3 transition-colors hover:bg-red-50/50">
              <Radio value="delete">
                <div className="ml-2">
                  <div className="font-medium text-slate-900">Permanently delete</div>
                  <div className="text-xs text-slate-500">
                    Remove the endpoint and cascade-delete all related data.
                  </div>
                </div>
              </Radio>
            </label>
          </Radio.Group>
        </div>
      </Modal>
    </>
  );
}
