"use client";

import React, { useEffect } from "react";
import { Modal, Form, Input as AntInput, Switch } from "antd";
import type { Organization } from "@/services/api/types";

interface OrgModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: any) => void;
  initialValues?: Organization | null;
  isLoading?: boolean;
}

export function OrgModal({
  open,
  onClose,
  onSubmit,
  initialValues,
  isLoading,
}: OrgModalProps) {
  const [form] = Form.useForm();
  const isEdit = !!initialValues;

  useEffect(() => {
    if (open) {
      if (initialValues) {
        form.setFieldsValue(initialValues);
      } else {
        form.resetFields();
        form.setFieldsValue({ is_active: true, is_default: false });
      }
    }
  }, [open, initialValues, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      onSubmit(values);
    } catch (error) {
      console.error("Validation failed:", error);
    }
  };

  return (
    <Modal
      title={isEdit ? "Update Organization" : "Add Organization"}
      open={open}
      onOk={handleSubmit}
      onCancel={onClose}
      confirmLoading={isLoading}
      destroyOnHidden
      mask={{ closable: false }}
    >
      <Form
        form={form}
        layout="vertical"
        className="mt-4"
        initialValues={{ is_active: true, is_default: false }}
      >
        <Form.Item
          name="name"
          label="Name"
          rules={[
            { required: true, message: "Please enter organization name" },
          ]}
        >
          <AntInput placeholder="Enter name" />
        </Form.Item>

        <Form.Item
          name="slug"
          label="Slug"
          rules={[{ required: true, message: "Please enter slug" }]}
        >
          <AntInput placeholder="enter-slug" disabled={isEdit} />
        </Form.Item>

        <Form.Item name="description" label="Description">
          <AntInput.TextArea placeholder="Enter description" rows={3} />
        </Form.Item>

        <Form.Item
          name="contact_email"
          label="Contact Email"
          rules={[
            { required: true, message: "Please enter contact email" },
            { type: "email", message: "Please enter a valid email" },
          ]}
        >
          <AntInput placeholder="email@example.com" />
        </Form.Item>

        <div className="flex gap-8">
          <Form.Item name="is_active" label="Active" valuePropName="checked">
            <Switch />
          </Form.Item>

          <Form.Item name="is_default" label="Default" valuePropName="checked">
            <Switch />
          </Form.Item>
        </div>
      </Form>
    </Modal>
  );
}
