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
      title={
        <div className="flex flex-col gap-0.5">
          <span className="text-[18px] font-semibold text-slate-900 leading-tight">
            {isEdit ? "Update Organization" : "Add Organization"}
          </span>
          <span className="text-[12px] text-slate-500 font-medium">
            {isEdit
              ? "Update organizational entity details"
              : "Create a new organizational entity"}
          </span>
        </div>
      }
      open={open}
      onOk={handleSubmit}
      onCancel={onClose}
      confirmLoading={isLoading}
      destroyOnHidden
      mask={{ closable: false }}
      width={520}
      className="custom-modal"
    >
      <Form
        form={form}
        layout="vertical"
        className="mt-4"
        initialValues={{ is_active: true, is_default: false }}
      >
        <Form.Item
          name="name"
          label={
            <span className="text-[13px] font-semibold text-slate-700">
              Name
            </span>
          }
          rules={[
            { required: true, message: "Please enter organization name" },
          ]}
        >
          <AntInput
            placeholder="Enter organization name"
            className="h-9 text-[13px]"
          />
        </Form.Item>

        <Form.Item
          name="slug"
          label={
            <span className="text-[13px] font-semibold text-slate-700">
              Slug
            </span>
          }
          rules={[{ required: true, message: "Please enter slug" }]}
        >
          <AntInput
            placeholder="e.g. engineering-unit"
            disabled={isEdit}
            className="h-9 text-[13px]"
          />
        </Form.Item>

        <Form.Item
          name="description"
          label={
            <span className="text-[13px] font-semibold text-slate-700">
              Description
            </span>
          }
        >
          <AntInput.TextArea
            placeholder="Enter description"
            rows={3}
            className="text-[13px]"
          />
        </Form.Item>

        <Form.Item
          name="contact_email"
          label={
            <span className="text-[13px] font-semibold text-slate-700">
              Contact Email
            </span>
          }
          rules={[
            { required: true, message: "Please enter contact email" },
            { type: "email", message: "Please enter a valid email" },
          ]}
        >
          <AntInput
            placeholder="email@example.com"
            className="h-9 text-[13px]"
          />
        </Form.Item>

        <div className="flex gap-8 bg-slate-50 p-4 rounded-lg border border-slate-100">
          <Form.Item
            name="is_active"
            label={
              <span className="text-[13px] font-semibold text-slate-700">
                Active
              </span>
            }
            valuePropName="checked"
            className="mb-0"
          >
            <Switch />
          </Form.Item>

          <Form.Item
            name="is_default"
            label={
              <span className="text-[13px] font-semibold text-slate-700">
                Default
              </span>
            }
            valuePropName="checked"
            className="mb-0"
          >
            <Switch />
          </Form.Item>
        </div>
      </Form>
    </Modal>
  );
}
