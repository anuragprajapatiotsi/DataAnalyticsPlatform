"use client";

import React from "react";
import { Collapse, Form, Input, Modal, Select, Spin } from "antd";

import type { DatasetGroup } from "@/features/explore/services/dataset.service";
import type { CatalogDomain } from "@/features/domains/types";
import type { AdminUser } from "@/features/users/types";

export type SaveQueryFormValues = {
  dataset_id: string;
  name: string;
  description?: string;
  sql: string;
  catalog?: string;
  schema?: string;
  domain_id?: string;
  trino_endpoint_id?: string;
  tags?: string[];
  owner_ids?: string[];
  classification_tag_ids?: string[];
  glossary_term_ids?: string[];
};

type SaveQueryModalProps = {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: SaveQueryFormValues) => Promise<void>;
  isSubmitting?: boolean;
  datasets: DatasetGroup[];
  domains: CatalogDomain[];
  users: AdminUser[];
  isDatasetsLoading?: boolean;
  isOptionsLoading?: boolean;
  initialValues: Partial<SaveQueryFormValues>;
};

export function SaveQueryModal({
  open,
  onClose,
  onSubmit,
  isSubmitting = false,
  datasets,
  domains,
  users,
  isDatasetsLoading = false,
  isOptionsLoading = false,
  initialValues,
}: SaveQueryModalProps) {
  const [form] = Form.useForm<SaveQueryFormValues>();

  React.useEffect(() => {
    if (!open) {
      return;
    }

    form.setFieldsValue({
      dataset_id: undefined,
      name: initialValues.name || "",
      description: initialValues.description || "",
      sql: initialValues.sql || "",
      catalog: initialValues.catalog || "",
      schema: initialValues.schema || "",
      domain_id: initialValues.domain_id,
      trino_endpoint_id: initialValues.trino_endpoint_id || "",
      tags: initialValues.tags || [],
      owner_ids: initialValues.owner_ids || [],
      classification_tag_ids: initialValues.classification_tag_ids || [],
      glossary_term_ids: initialValues.glossary_term_ids || [],
    });
  }, [form, initialValues, open]);

  const watchedDatasetId = Form.useWatch("dataset_id", form);
  const watchedName = Form.useWatch("name", form);
  const watchedSql = Form.useWatch("sql", form);
  const isSubmitDisabled =
    !watchedDatasetId || !watchedName?.trim() || !watchedSql?.trim();

  return (
    <Modal
      title="Save Query"
      open={open}
      onCancel={onClose}
      onOk={() => form.submit()}
      okText="Save Query"
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

        <Form.Item
          name="sql"
          label="SQL"
          rules={[{ required: true, message: "SQL is required." }]}
        >
          <Input.TextArea rows={8} placeholder="SELECT * FROM ..." />
        </Form.Item>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Form.Item name="catalog" label="Catalog">
            <Input placeholder="Catalog" />
          </Form.Item>

          <Form.Item name="schema" label="Schema">
            <Input placeholder="Schema" />
          </Form.Item>

          <Form.Item name="domain_id" label="Domain ID">
            <Select
              allowClear
              placeholder="Select domain"
              loading={isOptionsLoading}
              options={domains.map((domain) => ({
                label: domain.display_name || domain.name,
                value: domain.id,
              }))}
            />
          </Form.Item>

          <Form.Item name="trino_endpoint_id" label="Trino Endpoint ID">
            <Input placeholder="Trino endpoint ID" />
          </Form.Item>
        </div>

        <Collapse
          className="mt-4"
          items={[
            {
              key: "advanced",
              label: "Advanced Fields",
              children: (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <Form.Item name="tags" label="Tags">
                    <Select mode="tags" tokenSeparators={[","]} placeholder="Add tags" />
                  </Form.Item>

                  <Form.Item name="classification_tag_ids" label="Classification Tags">
                    <Select
                      mode="tags"
                      tokenSeparators={[","]}
                      placeholder="Add classification tag IDs"
                    />
                  </Form.Item>

                  <Form.Item name="glossary_term_ids" label="Glossary Terms">
                    <Select
                      mode="tags"
                      tokenSeparators={[","]}
                      placeholder="Add glossary term IDs"
                    />
                  </Form.Item>

                  <Form.Item name="owner_ids" label="Owners">
                    <Select
                      mode="multiple"
                      allowClear
                      placeholder="Select owners"
                      loading={isOptionsLoading}
                      options={users.map((user) => ({
                        label: user.display_name || user.username || user.email,
                        value: user.id,
                      }))}
                    />
                  </Form.Item>
                </div>
              ),
            },
          ]}
        />
      </Form>
    </Modal>
  );
}
