"use client";

import { useEffect } from "react";
import { Form, Input, Modal } from "antd";

import type { CatalogDomain } from "@/features/domains/types";
import type { AdminUser } from "@/features/users/types";

type FileGroupModalValues = {
  name: string;
  display_name: string;
  description?: string;
  domain_id?: string;
  tags: string[];
  owner_ids: string[];
  expert_ids: string[];
};

type FileGroupModalProps = {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: FileGroupModalValues) => Promise<void>;
  domains: CatalogDomain[];
  users: AdminUser[];
  isSubmitting?: boolean;
};

export function FileGroupModal({
  open,
  onClose,
  onSubmit,
  isSubmitting = false,
}: FileGroupModalProps) {
  const [form] = Form.useForm<FileGroupModalValues>();

  useEffect(() => {
    if (open) {
      form.setFieldsValue({
        name: "",
        display_name: "",
        description: "",
        domain_id: undefined,
        tags: [],
        owner_ids: [],
        expert_ids: [],
      });
    }
  }, [form, open]);

  return (
    <Modal
      title="Create File Group"
      open={open}
      onCancel={onClose}
      onOk={() => form.submit()}
      confirmLoading={isSubmitting}
      okText="Create"
      destroyOnHidden
      forceRender
      centered
    >
      <Form<FileGroupModalValues>
        form={form}
        layout="vertical"
        onFinish={onSubmit}
        initialValues={{
          name: "",
          display_name: "",
          description: "",
          tags: [],
          owner_ids: [],
          expert_ids: [],
        }}
        className="mt-4"
      >
        <Form.Item
          name="name"
          label="Name"
          rules={[{ required: true, message: "Please enter the file group name." }]}
        >
          <Input placeholder="file_group_name" />
        </Form.Item>

        <Form.Item
          name="display_name"
          label="Display Name"
          rules={[{ required: true, message: "Please enter the display name." }]}
        >
          <Input placeholder="File Group Display Name" />
        </Form.Item>

        <Form.Item name="description" label="Description">
          <Input.TextArea rows={3} placeholder="Short description for this file group" />
        </Form.Item>

        {/* <Form.Item name="domain_id" label="Domain">
          <Select
            allowClear
            placeholder="Select a domain"
            options={domains.map((domain) => ({
              label: domain.display_name || domain.name,
              value: domain.id,
            }))}
          />
        </Form.Item>

        <Form.Item name="tags" label="Tags">
          <Select mode="tags" tokenSeparators={[","]} placeholder="Add tags" />
        </Form.Item>

        <Form.Item name="owner_ids" label="Owners">
          <Select
            mode="multiple"
            allowClear
            placeholder="Select owners"
            options={users.map((user) => ({
              label: user.display_name || user.username || user.email,
              value: user.id,
            }))}
          />
        </Form.Item>

        <Form.Item name="expert_ids" label="Experts">
          <Select
            mode="multiple"
            allowClear
            placeholder="Select experts"
            options={users.map((user) => ({
              label: user.display_name || user.username || user.email,
              value: user.id,
            }))}
          />
        </Form.Item> */}
      </Form>
    </Modal>
  );
}
