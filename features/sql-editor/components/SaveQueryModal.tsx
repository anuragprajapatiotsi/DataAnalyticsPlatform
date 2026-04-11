"use client";

import React from "react";
import { Form, Input, Modal, Select, Spin } from "antd";

import type { DatasetGroup } from "@/features/explore/services/dataset.service";

export type SaveQueryFormValues = {
  dataset_id: string;
  name: string;
  description?: string;
  sql: string;
};

type SaveQueryModalProps = {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: SaveQueryFormValues) => Promise<void>;
  isSubmitting?: boolean;
  datasets: DatasetGroup[];
  isDatasetsLoading?: boolean;
  initialValues: Partial<SaveQueryFormValues>;
  title?: string;
  submitLabel?: string;
  showSqlField?: boolean;
};

export function SaveQueryModal({
  open,
  onClose,
  onSubmit,
  isSubmitting = false,
  datasets,
  isDatasetsLoading = false,
  initialValues,
  title = "Save Query",
  submitLabel = "Save Query",
  showSqlField = false,
}: SaveQueryModalProps) {
  const [form] = Form.useForm<SaveQueryFormValues>();

  React.useEffect(() => {
    if (!open) {
      return;
    }

    form.setFieldsValue({
      dataset_id: initialValues.dataset_id,
      name: initialValues.name || "",
      description: initialValues.description || "",
      sql: initialValues.sql || "",
    });
  }, [form, initialValues, open]);

  const watchedDatasetId = Form.useWatch("dataset_id", form);
  const watchedName = Form.useWatch("name", form);
  const watchedSql = Form.useWatch("sql", form);
  const isSubmitDisabled =
    !watchedDatasetId || !watchedName?.trim() || !watchedSql?.trim();

  return (
    <Modal
      title={title}
      open={open}
      onCancel={onClose}
      onOk={() => form.submit()}
      okText={submitLabel}
      confirmLoading={isSubmitting}
      okButtonProps={{ disabled: isSubmitDisabled }}
      width={960}
      destroyOnHidden
      forceRender
      centered
    >
      <Form<SaveQueryFormValues>
        form={form}
        layout="vertical"
        onFinish={onSubmit}
        className="mt-4"
      >
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Form.Item
            name="name"
            label="Name"
            rules={[{ required: true, message: "Please enter a query name." }]}
          >
            <Input placeholder="Revenue trend by month" />
          </Form.Item>

          <Form.Item
            name="dataset_id"
            label="Dataset"
            rules={[{ required: true, message: "Please select a dataset." }]}
          >
            <Select
              showSearch
              placeholder="Select dataset"
              optionFilterProp="label"
              loading={isDatasetsLoading}
              options={datasets.map((dataset) => ({
                label: dataset.display_name || dataset.name,
                value: dataset.id,
              }))}
              notFoundContent={isDatasetsLoading ? <Spin size="small" /> : undefined}
            />
          </Form.Item>
        </div>

        <Form.Item name="description" label="Description">
          <Input.TextArea rows={2} placeholder="What is this query for?" />
        </Form.Item>

        {showSqlField ? (
          <Form.Item
            name="sql"
            label="Query"
            rules={[{ required: true, message: "SQL is required." }]}
          >
            <Input.TextArea rows={8} placeholder="SELECT * FROM ..." />
          </Form.Item>
        ) : (
          <Form.Item
            name="sql"
            rules={[{ required: true, message: "SQL is required." }]}
            hidden
          >
            <Input.TextArea />
          </Form.Item>
        )}
      </Form>
    </Modal>
  );
}
