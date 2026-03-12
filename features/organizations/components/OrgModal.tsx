"use client";

import React, { useEffect } from "react";
import { Modal, Form, Input as AntInput, Switch } from "antd";
import type { Organization } from "@/shared/types";

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
        form.setFieldsValue({
          is_active: true,
        });
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
      title={
        <div className="flex flex-col ">
          <span className="text-[18px] font-semibold text-slate-900 leading-tight">
            {isEdit ? "Update Organization" : "Add Organization"}
          </span>
          <span className="text-[12px] text-slate-500 font-medium">
            {isEdit
              ? "Update organization information and settings"
              : "Create a new organization entity"}
          </span>
        </div>
      }
      open={open}
      onOk={handleSubmit}
      onCancel={onClose}
      confirmLoading={isLoading}
      destroyOnHidden
      mask={{ closable: false }}
      width={560}
      className="custom-modal"
    >
      <Form
        form={form}
        layout="vertical"
        className="mt-1"
        initialValues={{
          is_active: true,
        }}
      >
        <div className="grid grid-cols-2 ">
          <Form.Item
            name="name"
            label="Name"
            rules={[
              { required: true, message: "Please enter organization name" },
            ]}
            className="col-span-2"
          >
            <AntInput placeholder="e.g. Acme Corp" />
          </Form.Item>

          <Form.Item
            name="contact_email"
            label="Contact Email"
            rules={[
              { required: true, message: "Please enter contact email" },
              { type: "email", message: "Please enter a valid email" },
            ]}
            className="col-span-2"
          >
            <AntInput placeholder="admin@acme.com" />
          </Form.Item>

          <Form.Item
            name="description"
            label="Description"
            className="col-span-2"
          >
            <AntInput.TextArea placeholder="Enter description" rows={3} />
          </Form.Item>

          <div className="col-span-2 flex  bg-slate-50 rounded-lg border border-slate-100">
            <Form.Item
              name="is_active"
              label="Active Status"
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
