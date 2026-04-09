"use client";

import { useEffect } from "react";
import { Form, Input, Modal, Select, Switch } from "antd";

import type { CatalogDomain } from "@/features/domains/types";
import type { AdminUser } from "@/features/users/types";

import type { Classification } from "../types";

interface ClassificationModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: {
    name: string;
    display_name: string;
    description: string;
    mutually_exclusive: boolean;
    owner_ids: string[];
    domain_ids: string[];
    is_active?: boolean;
  }) => Promise<void> | void;
  initialValues?: Classification | null;
  users: AdminUser[];
  domains: CatalogDomain[];
  isLoading?: boolean;
}

export function ClassificationModal({
  open,
  onClose,
  onSubmit,
  initialValues,
  users,
  domains,
  isLoading,
}: ClassificationModalProps) {
  const [form] = Form.useForm();
  const isEdit = !!initialValues;

  useEffect(() => {
    if (!open) {
      return;
    }

    if (!initialValues) {
      form.resetFields();
      form.setFieldsValue({
        mutually_exclusive: false,
        owner_ids: [],
        domain_ids: [],
        is_active: true,
      });
      return;
    }

    form.setFieldsValue({
      ...initialValues,
      owner_ids: initialValues.owners.map((owner) => owner.id),
      domain_ids: initialValues.domains.map((domain) => domain.id),
    });
  }, [form, initialValues, open]);

  const userOptions = users.map((user) => ({
    label: user.display_name || user.email,
    value: user.id,
  }));

  const domainOptions = domains.map((domain) => ({
    label: domain.display_name || domain.name,
    value: domain.id,
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
      width={720}
      destroyOnHidden
      title={isEdit ? "Edit Classification" : "Add Classification"}
    >
      <Form form={form} layout="vertical" className="mt-4">
        <div className="grid grid-cols-2 gap-x-4">
          <Form.Item
            name="name"
            label="Name"
            rules={[{ required: true, message: "Please enter the name" }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="display_name"
            label="Display Name"
            rules={[{ required: true, message: "Please enter the display name" }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="description"
            label="Description"
            className="col-span-2"
          >
            <Input.TextArea rows={4} />
          </Form.Item>

          <Form.Item
            name="owner_ids"
            label="Owners"
            className="col-span-2"
          >
            <Select
              mode="multiple"
              options={userOptions}
              optionFilterProp="label"
              showSearch
            />
          </Form.Item>

          <Form.Item
            name="domain_ids"
            label="Domains"
            className="col-span-2"
          >
            <Select
              mode="multiple"
              options={domainOptions}
              optionFilterProp="label"
              showSearch
            />
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
          ) : null}

          <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 pt-3">
            <Form.Item
              name="mutually_exclusive"
              label="Mutually Exclusive"
              valuePropName="checked"
            >
              <Switch />
            </Form.Item>
          </div>
        </div>
      </Form>
    </Modal>
  );
}
