"use client";

import { useEffect } from "react";
import { Form, Input, Modal, Select, Switch } from "antd";

import type { AdminUser } from "@/features/users/types";

import type { CatalogDomain } from "../types";

interface DomainModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: {
    name: string;
    display_name: string;
    description: string;
    domain_type: string;
    owner_ids: string[];
    expert_ids: string[];
    is_active?: boolean;
  }) => Promise<void> | void;
  initialValues?: CatalogDomain | null;
  users: AdminUser[];
  isLoading?: boolean;
}

export function DomainModal({
  open,
  onClose,
  onSubmit,
  initialValues,
  users,
  isLoading,
}: DomainModalProps) {
  const [form] = Form.useForm();
  const isEdit = !!initialValues;

  useEffect(() => {
    if (!open) {
      return;
    }

    if (initialValues) {
      form.setFieldsValue({
        ...initialValues,
        owner_ids: initialValues.owners?.map((owner) => owner.id) ?? [],
        expert_ids: initialValues.experts?.map((expert) => expert.id) ?? [],
      });
      return;
    }

    form.resetFields();
    form.setFieldsValue({
      owner_ids: [],
      expert_ids: [],
      is_active: true,
    });
  }, [form, initialValues, open]);

  const userOptions = users.map((user) => ({
    label: user.display_name || user.email,
    value: user.id,
  }));

  const handleOk = async () => {
    const values = await form.validateFields();
    await onSubmit(values);
  };

  return (
    <Modal
      open={open}
      onCancel={onClose}
      onOk={() => void handleOk()}
      confirmLoading={isLoading}
      destroyOnHidden
      width={720}
      title={
        <div className="flex flex-col">
          <span className="text-lg font-semibold text-slate-900">
            {isEdit ? "Edit Domain" : "Create Domain"}
          </span>
          <span className="text-xs font-medium text-slate-500">
            {isEdit
              ? "Update ownership, metadata, and visibility for this domain."
              : "Create a new domain to organize catalog assets and ownership."}
          </span>
        </div>
      }
    >
      <Form form={form} layout="vertical" className="mt-4">
        <div className="grid grid-cols-2 gap-x-4">
          <Form.Item
            name="name"
            label="Name"
            rules={[{ required: true, message: "Please enter the domain name" }]}
          >
            <Input placeholder="e.g. finance" />
          </Form.Item>

          <Form.Item
            name="display_name"
            label="Display Name"
            rules={[
              { required: true, message: "Please enter the display name" },
            ]}
          >
            <Input placeholder="e.g. Finance" />
          </Form.Item>

          <Form.Item
            name="domain_type"
            label="Domain Type"
            rules={[
              { required: true, message: "Please enter the domain type" },
            ]}
          >
            <Input placeholder="e.g. business" />
          </Form.Item>

          {isEdit ? (
            <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 pt-3">
              <Form.Item
                name="is_active"
                label="Active Status"
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>
            </div>
          ) : (
            <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 px-4 py-3 text-xs font-medium text-slate-500">
              Newly created domains start active by default.
            </div>
          )}

          <Form.Item
            name="description"
            label="Description"
            className="col-span-2"
          >
            <Input.TextArea
              rows={4}
              placeholder="Describe what belongs in this domain."
            />
          </Form.Item>

          <Form.Item name="owner_ids" label="Owners" className="col-span-2">
            <Select
              mode="multiple"
              placeholder="Select owners"
              options={userOptions}
              optionFilterProp="label"
              showSearch
            />
          </Form.Item>

          <Form.Item name="expert_ids" label="Experts" className="col-span-2">
            <Select
              mode="multiple"
              placeholder="Select experts"
              options={userOptions}
              optionFilterProp="label"
              showSearch
            />
          </Form.Item>
        </div>
      </Form>
    </Modal>
  );
}
