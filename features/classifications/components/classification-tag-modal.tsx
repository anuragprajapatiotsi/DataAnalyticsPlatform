"use client";

import { useEffect } from "react";
import { Form, Input, Modal, Select, Switch } from "antd";

import type { CatalogDomain } from "@/features/domains/types";
import type { AdminUser } from "@/features/users/types";
import type { ClassificationTag } from "../types";

interface ClassificationTagModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: {
    name: string;
    display_name: string;
    description: string;
    icon_url: string;
    color: string;
    detection_patterns: string[];
    auto_classify: boolean;
    owner_ids: string[];
    domain_ids: string[];
    is_active?: boolean;
  }) => Promise<void> | void;
  users: AdminUser[];
  domains: CatalogDomain[];
  isLoading?: boolean;
  initialValues?: ClassificationTag | null;
}

export function ClassificationTagModal({
  open,
  onClose,
  onSubmit,
  users,
  domains,
  isLoading,
  initialValues,
}: ClassificationTagModalProps) {
  const [form] = Form.useForm();
  const isEdit = !!initialValues;

  useEffect(() => {
    if (!open) {
      return;
    }

    if (initialValues) {
      form.setFieldsValue({
        ...initialValues,
        detection_patterns:
          initialValues.detection_patterns?.map((item) => item.pattern) ?? [],
        owner_ids: initialValues.owners?.map((owner) => owner.id) ?? [],
        domain_ids: initialValues.domains?.map((domain) => domain.id) ?? [],
      });
      return;
    }

    form.resetFields();
    form.setFieldsValue({
      color: "#2563eb",
      icon_url: "",
      detection_patterns: [],
      auto_classify: false,
      owner_ids: [],
      domain_ids: [],
      is_active: true,
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
      title={isEdit ? "Edit Classification Tag" : "Add Classification Tag"}
    >
      <Form form={form} layout="vertical" className="mt-4">
        <div className="grid grid-cols-2 gap-x-4">
          <Form.Item
            name="name"
            label="Name"
            rules={[{ required: true, message: "Please enter the tag name" }]}
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
            name="icon_url"
            label="Icon URL"
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="color"
            label="Color"
            rules={[{ required: true, message: "Please enter a color" }]}
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
            name="detection_patterns"
            label="Detection Patterns"
            className="col-span-2"
          >
            <Select
              mode="tags"
              tokenSeparators={[","]}
              placeholder="Add one or more detection patterns"
            />
          </Form.Item>

          <Form.Item
            name="owner_ids"
            label="Owners"
            className="col-span-2"
          >
            <Select mode="multiple" options={userOptions} showSearch optionFilterProp="label" />
          </Form.Item>

          <Form.Item
            name="domain_ids"
            label="Domains"
            className="col-span-2"
          >
            <Select mode="multiple" options={domainOptions} showSearch optionFilterProp="label" />
          </Form.Item>

          <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 pt-3">
            <Form.Item
              name="auto_classify"
              label="Auto Classify"
              valuePropName="checked"
            >
              <Switch />
            </Form.Item>
          </div>

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
        </div>
      </Form>
    </Modal>
  );
}
