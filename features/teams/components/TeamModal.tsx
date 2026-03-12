"use client";

import React, { useEffect } from "react";
import { Modal, Form, Input as AntInput, Switch, Select } from "antd";
import type { Team } from "../types";

interface TeamModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: any) => void;
  initialValues?: Team | null;
  isLoading?: boolean;
  teams: Team[];
}

export function TeamModal({
  open,
  onClose,
  onSubmit,
  initialValues,
  isLoading,
  teams,
}: TeamModalProps) {
  const [form] = Form.useForm();
  const isEdit = !!initialValues;

  useEffect(() => {
    if (open) {
      if (initialValues) {
        form.setFieldsValue(initialValues);
      } else {
        form.resetFields();
        form.setFieldsValue({
          team_type: "group",
          is_active: true,
          public_team_view: false,
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
        <div className="flex flex-col gap-0.5">
          <span className="text-[18px] font-semibold text-slate-900 leading-tight">
            {isEdit ? "Update Team" : "Add Team"}
          </span>
          <span className="text-[12px] text-slate-500 font-medium">
            {isEdit
              ? "Update team information and settings"
              : "Create a new team in your organization"}
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
        className="grid grid-cols-2"
        initialValues={{
          team_type: "group",
          is_active: true,
          public_team_view: false,
        }}
      >
        <Form.Item
          name="display_name"
          label="Display Name"
          rules={[{ required: true, message: "Please enter display name" }]}
          className="col-span-1"
        >
          <AntInput placeholder="e.g. Engineering" />
        </Form.Item>

        <Form.Item
          name="name"
          label="Name"
          rules={[{ required: true, message: "Please enter unique name" }]}
          className="col-span-1"
        >
          <AntInput placeholder="e.g. engineering" disabled={isEdit} />
        </Form.Item>

        <Form.Item
          name="email"
          label="Email"
          rules={[
            { required: true, message: "Please enter team email" },
            { type: "email", message: "Please enter a valid email" },
          ]}
          className="col-span-1"
        >
          <AntInput placeholder="team@example.com" />
        </Form.Item>

        <Form.Item
          name="team_type"
          label="Team Type"
          rules={[{ required: true, message: "Please select team type" }]}
          className="col-span-1"
        >
          <Select>
            <Select.Option value="group">Group</Select.Option>
            <Select.Option value="organization">Organization</Select.Option>
            <Select.Option value="department">Department</Select.Option>
            <Select.Option value="division">Division</Select.Option>
          </Select>
        </Form.Item>

        <Form.Item
          name="description"
          label="Description"
          className="col-span-2"
        >
          <AntInput.TextArea placeholder="Enter description" rows={3} />
        </Form.Item>

        <Form.Item
          name="parent_team_id"
          label={
            <span className="text-[13px] font-semibold text-slate-700">
              Parent Team
            </span>
          }
          className="col-span-2"
        >
          <Select
            placeholder="Select parent team (optional)"
            allowClear
            className="h-9"
          >
            {teams
              .filter((t) => t.id !== initialValues?.id)
              .map((t) => (
                <Select.Option key={t.id} value={t.id}>
                  {t.display_name} ({t.name})
                </Select.Option>
              ))}
          </Select>
        </Form.Item>

        <div className="col-span-2 flex gap-8 bg-slate-50 p-4 rounded-lg border border-slate-100">
          <Form.Item
            name="public_team_view"
            label="Public View"
            valuePropName="checked"
            className="mb-0"
          >
            <Switch />
          </Form.Item>

          <Form.Item
            name="is_active"
            label="Active Status"
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
