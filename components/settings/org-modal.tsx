"use client";

import React, { useEffect } from "react";
import { Modal, Form, Input, Switch, message } from "antd";
import type {
  Organization,
  CreateOrgRequest,
  UpdateOrgRequest,
} from "@/services/api/types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { orgsApi } from "@/services/api/orgs";

interface OrgModalProps {
  open: boolean;
  onClose: () => void;
  org?: Organization; // If provided, we are in Edit mode
}

export function OrgModal({ open, onClose, org }: OrgModalProps) {
  const [form] = Form.useForm();
  const queryClient = useQueryClient();
  const isEdit = !!org;

  useEffect(() => {
    if (open) {
      if (org) {
        form.setFieldsValue(org);
      } else {
        form.resetFields();
      }
    }
  }, [open, org, form]);

  const createMutation = useMutation({
    mutationFn: (data: CreateOrgRequest) => orgsApi.createOrg(data),
    onSuccess: () => {
      message.success("Organization created successfully");
      queryClient.invalidateQueries({ queryKey: ["orgs"] });
      onClose();
    },
    onError: (error: any) => {
      message.error(
        error.response?.data?.message || "Failed to create organization",
      );
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: UpdateOrgRequest) => orgsApi.updateOrg(org!.id, data),
    onSuccess: () => {
      message.success("Organization updated successfully");
      queryClient.invalidateQueries({ queryKey: ["orgs"] });
      onClose();
    },
    onError: (error: any) => {
      message.error(
        error.response?.data?.message || "Failed to update organization",
      );
    },
  });

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      if (isEdit) {
        updateMutation.mutate({
          ...values,
          owner_id: org.owner_id, // Preserve owner_id if not editable in this simple form
        });
      } else {
        createMutation.mutate(values);
      }
    } catch (info) {
      console.log("Validate Failed:", info);
    }
  };

  return (
    <Modal
      title={isEdit ? "Update Organization" : "Create Organization"}
      open={open}
      onOk={handleSubmit}
      onCancel={onClose}
      confirmLoading={createMutation.isPending || updateMutation.isPending}
      okText={isEdit ? "Update" : "Create"}
      destroyOnHidden
      mask={{ closable: false }}
      centered
      className="custom-antd-modal"
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={{ is_active: true }}
        className="mt-4"
      >
        <Form.Item
          name="name"
          label="Name"
          rules={[
            { required: true, message: "Please enter organization name" },
          ]}
        >
          <Input placeholder="e.g. Acme Corp" className="h-10 rounded-lg" />
        </Form.Item>

        <Form.Item
          name="contact_email"
          label="Contact Email"
          rules={[
            { required: true, message: "Please enter contact email" },
            { type: "email", message: "Please enter a valid email address" },
          ]}
        >
          <Input placeholder="admin@acme.com" className="h-10 rounded-lg" />
        </Form.Item>

        <Form.Item name="description" label="Description">
          <Input.TextArea
            placeholder="Brief description about the organization"
            rows={4}
            className="rounded-lg"
          />
        </Form.Item>

        {isEdit && (
          <Form.Item
            name="is_active"
            label="Active Status"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>
        )}
      </Form>
    </Modal>
  );
}
