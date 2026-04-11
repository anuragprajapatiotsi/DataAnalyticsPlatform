"use client";

import React from "react";
import { Form, Input, Modal, Select } from "antd";

type FileAssetCatalogViewModalValues = {
  data_asset_id: string;
  name: string;
  display_name: string;
  description?: string;
  tags?: string[];
  glossary_term_ids?: string[];
  synonyms?: string[];
  sync_mode?: "auto" | "scheduled" | "on_demand" | string;
  cron_expr?: string;
  sync_config?: string;
};

type FileAssetCatalogViewModalProps = {
  open: boolean;
  onClose: () => void;
  dataAssetId: string;
  defaultName: string;
  defaultDisplayName: string;
  onSubmit: (values: FileAssetCatalogViewModalValues) => Promise<void>;
  isSubmitting?: boolean;
};

export function FileAssetCatalogViewModal({
  open,
  onClose,
  dataAssetId,
  defaultName,
  defaultDisplayName,
  onSubmit,
  isSubmitting = false,
}: FileAssetCatalogViewModalProps) {
  const [form] = Form.useForm<FileAssetCatalogViewModalValues>();
  const syncMode = Form.useWatch("sync_mode", form);

  React.useEffect(() => {
    if (!open) {
      return;
    }

    form.setFieldsValue({
      data_asset_id: dataAssetId,
      name: defaultName,
      display_name: defaultDisplayName,
      description: "",
      tags: [],
      glossary_term_ids: [],
      synonyms: [],
      sync_mode: "on_demand",
      cron_expr: "",
      sync_config: "{}",
    });
  }, [dataAssetId, defaultDisplayName, defaultName, form, open]);

  return (
    <Modal
      title="Create Catalog View"
      open={open}
      onCancel={onClose}
      onOk={() => form.submit()}
      okText="Create Catalog View"
      confirmLoading={isSubmitting}
      width={820}
      destroyOnHidden
      forceRender
      centered
    >
      <Form<FileAssetCatalogViewModalValues>
        form={form}
        layout="vertical"
        onFinish={onSubmit}
        className="mt-4"
      >
        <Form.Item name="data_asset_id" label="Data Asset ID">
          <Input disabled />
        </Form.Item>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Form.Item
            name="name"
            label="Name"
            rules={[{ required: true, message: "Please enter a name." }]}
          >
            <Input placeholder="customer_file_catalog_view" />
          </Form.Item>

          <Form.Item
            name="display_name"
            label="Display Name"
            rules={[{ required: true, message: "Please enter a display name." }]}
          >
            <Input placeholder="Customer File Catalog View" />
          </Form.Item>
        </div>

        <Form.Item name="description" label="Description">
          <Input.TextArea rows={3} placeholder="Describe this catalog view" />
        </Form.Item>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Form.Item name="tags" label="Tags">
            <Select mode="tags" tokenSeparators={[","]} placeholder="Add tags" />
          </Form.Item>

          <Form.Item name="glossary_term_ids" label="Glossary Terms">
            <Select
              mode="tags"
              tokenSeparators={[","]}
              placeholder="Add glossary term IDs"
            />
          </Form.Item>

          <Form.Item name="synonyms" label="Synonyms" className="md:col-span-2">
            <Select mode="tags" tokenSeparators={[","]} placeholder="Add synonyms" />
          </Form.Item>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Form.Item name="sync_mode" label="Sync Mode">
            <Select
              options={[
                { label: "On Demand", value: "on_demand" },
                { label: "Scheduled", value: "scheduled" },
                { label: "Auto", value: "auto" },
              ]}
            />
          </Form.Item>

          {syncMode === "scheduled" && (
            <Form.Item
              name="cron_expr"
              label="Cron Expression"
              rules={[{ required: true, message: "Please enter a cron expression." }]}
            >
              <Input placeholder="0 * * * *" />
            </Form.Item>
          )}
        </div>

        <Form.Item
          name="sync_config"
          label="Sync Config (JSON)"
          rules={[
            {
              validator: async (_, value) => {
                if (!value) {
                  return;
                }

                try {
                  JSON.parse(value);
                } catch {
                  throw new Error("Sync Config must be valid JSON.");
                }
              },
            },
          ]}
        >
          <Input.TextArea rows={6} placeholder='{"batch_size": 1000}' />
        </Form.Item>
      </Form>
    </Modal>
  );
}
