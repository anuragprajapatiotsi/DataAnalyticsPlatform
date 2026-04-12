"use client";

import React from "react";
import { Alert, Form, Input, Modal, Select } from "antd";
import { BookOpen } from "lucide-react";

import { NOTEBOOK_TEMPLATES } from "@/features/notebooks/constants/templates";
import type {
  CreateNotebookRequest,
  NotebookExecutionMode,
  NotebookExecutionProfile,
} from "@/features/notebooks/types";

interface CreateNotebookModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: CreateNotebookRequest) => Promise<void>;
  isSubmitting: boolean;
}

export function CreateNotebookModal({
  open,
  onClose,
  onSubmit,
  isSubmitting,
}: CreateNotebookModalProps) {
  const [form] = Form.useForm<{
    name: string;
    description?: string;
    template_key: string;
    execution_mode: NotebookExecutionMode;
    default_execution_profile: NotebookExecutionProfile;
  }>();

  const selectedTemplateKey = Form.useWatch("template_key", form) || "blank";
  const selectedTemplate =
    NOTEBOOK_TEMPLATES.find((template) => template.key === selectedTemplateKey) ||
    NOTEBOOK_TEMPLATES[0];

  React.useEffect(() => {
    if (!open) {
      return;
    }

    form.setFieldsValue({
      template_key: "blank",
      execution_mode: "single_profile",
      default_execution_profile: "python",
    });
  }, [form, open]);

  return (
    <Modal
      title={
        <div className="flex items-center gap-2 text-[16px]">
          <BookOpen size={18} className="text-blue-600" />
          Create Notebook
        </div>
      }
      open={open}
      onCancel={() => {
        form.resetFields();
        onClose();
      }}
      onOk={() => form.submit()}
      okText="Create Notebook"
      cancelText="Cancel"
      confirmLoading={isSubmitting}
      destroyOnHidden
      width={560}
    >
      <Form
        form={form}
        layout="vertical"
        requiredMark={false}
        initialValues={{
          template_key: "blank",
          execution_mode: "single_profile",
          default_execution_profile: "python",
        }}
        onFinish={async (values) => {
          const { template_key, ...restValues } = values;
          const template =
            NOTEBOOK_TEMPLATES.find((item) => item.key === template_key) ||
            NOTEBOOK_TEMPLATES[0];

          await onSubmit({
            ...restValues,
            name: restValues.name.trim(),
            description: restValues.description?.trim() || undefined,
            content: template.content,
          });
          form.resetFields();
        }}
        className="mt-5"
      >
        <Form.Item
          name="template_key"
          label="Template"
          rules={[{ required: true, message: "Template selection is required" }]}
        >
          <Select
            options={NOTEBOOK_TEMPLATES.map((template) => ({
              label: template.label,
              value: template.key,
            }))}
            onChange={(value) => {
              const template =
                NOTEBOOK_TEMPLATES.find((item) => item.key === value) || NOTEBOOK_TEMPLATES[0];
              form.setFieldsValue({
                default_execution_profile: template.recommendedProfile,
              });
            }}
          />
        </Form.Item>

        <Alert
          type="info"
          showIcon
          className="mb-4"
          title={selectedTemplate.label}
          description={selectedTemplate.description}
        />

        <Form.Item
          name="name"
          label="Notebook Name"
          rules={[{ required: true, message: "Notebook name is required" }]}
        >
          <Input placeholder="sales_analysis" />
        </Form.Item>

        <Form.Item name="description" label="Description">
          <Input.TextArea
            rows={3}
            placeholder="Describe the notebook purpose and audience"
          />
        </Form.Item>

        <div className="grid gap-4 md:grid-cols-2">
          <Form.Item
            name="execution_mode"
            label="Execution Mode"
            rules={[{ required: true, message: "Execution mode is required" }]}
          >
            <Select
              options={[
                { label: "Single Profile", value: "single_profile" },
                { label: "Mixed Profile", value: "mixed_profile" },
              ]}
            />
          </Form.Item>

          <Form.Item
            name="default_execution_profile"
            label="Default Execution Profile"
            rules={[{ required: true, message: "Default profile is required" }]}
          >
            <Select
              options={[
                { label: "Python", value: "python" },
                { label: "PySpark", value: "pyspark" },
                { label: "SQL / Trino", value: "sql_trino" },
              ]}
            />
          </Form.Item>
        </div>
      </Form>
    </Modal>
  );
}
