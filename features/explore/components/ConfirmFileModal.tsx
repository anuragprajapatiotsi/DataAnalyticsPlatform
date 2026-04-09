"use client";

import React from "react";
import {
  Modal,
  Form,
  Input,
  Select,
  Checkbox,
  Collapse,
  Table,
  Switch,
  Empty,
  Spin,
} from "antd";
import type { ColumnsType } from "antd/es/table";

import type { DatasetGroup } from "@/features/explore/services/dataset.service";
import type {
  ConfirmIngestColumnOverride,
  IngestFilePreviewColumn,
} from "@/features/explore/services/file.service";
import type { CatalogDomain } from "@/features/domains/types";
import type { AdminUser } from "@/features/users/types";

type ConfirmFileModalValues = {
  dataset_id: string;
  asset_name: string;
  display_name: string;
  description?: string;
  sensitivity?: string;
  is_pii?: boolean;
  tier?: string;
  domain_id?: string;
  subject_area_id?: string;
  tag_ids?: string[];
  glossary_term_ids?: string[];
  owner_ids?: string[];
};

type ConfirmFileModalProps = {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: ConfirmFileModalValues & { column_overrides: ConfirmIngestColumnOverride[] }) => Promise<void>;
  isSubmitting?: boolean;
  datasets: DatasetGroup[];
  isDatasetsLoading?: boolean;
  domains?: CatalogDomain[];
  owners?: AdminUser[];
  isOptionsLoading?: boolean;
  inferredSchema: IngestFilePreviewColumn[];
  defaultAssetName: string;
  defaultDisplayName: string;
};

const SENSITIVITY_OPTIONS = [
  { label: "Internal", value: "internal" },
  { label: "Public", value: "public" },
  { label: "Restricted", value: "restricted" },
  { label: "PII", value: "pii" },
];

const TIER_OPTIONS = [
  { label: "Bronze", value: "bronze" },
  { label: "Silver", value: "silver" },
  { label: "Gold", value: "gold" },
  { label: "Platinum", value: "platinum" },
];

function buildOverrides(schema: IngestFilePreviewColumn[]): ConfirmIngestColumnOverride[] {
  return schema.map((column, index) => ({
    name: column.name,
    data_type: String(column.data_type || "string"),
    nullable: Boolean(column.nullable),
    ordinal_position:
      typeof column.ordinal_position === "number" ? column.ordinal_position : index + 1,
  }));
}

export function ConfirmFileModal({
  open,
  onClose,
  onSubmit,
  isSubmitting = false,
  datasets,
  isDatasetsLoading = false,
  domains = [],
  owners = [],
  isOptionsLoading = false,
  inferredSchema,
  defaultAssetName,
  defaultDisplayName,
}: ConfirmFileModalProps) {
  const [form] = Form.useForm<ConfirmFileModalValues>();
  const [columnOverrides, setColumnOverrides] = React.useState<ConfirmIngestColumnOverride[]>([]);

  React.useEffect(() => {
    if (!open) {
      form.resetFields();
      setColumnOverrides([]);
      return;
    }

    form.setFieldsValue({
      dataset_id: undefined,
      asset_name: defaultAssetName,
      display_name: defaultDisplayName,
      description: "",
      sensitivity: "internal",
      is_pii: false,
      tier: undefined,
      domain_id: undefined,
      subject_area_id: "",
      tag_ids: [],
      glossary_term_ids: [],
      owner_ids: [],
    });
    setColumnOverrides(buildOverrides(inferredSchema));
  }, [defaultAssetName, defaultDisplayName, form, inferredSchema, open]);

  const watchedDatasetId = Form.useWatch("dataset_id", form);
  const watchedAssetName = Form.useWatch("asset_name", form);
  const watchedDisplayName = Form.useWatch("display_name", form);
  const isSubmitDisabled =
    !watchedDatasetId || !watchedAssetName?.trim() || !watchedDisplayName?.trim();

  const columns: ColumnsType<ConfirmIngestColumnOverride> = [
    {
      title: "Column",
      dataIndex: "name",
      key: "name",
      width: 240,
      render: (value) => <span className="font-medium text-slate-800">{value}</span>,
    },
    {
      title: "Data Type",
      dataIndex: "data_type",
      key: "data_type",
      width: 220,
      render: (_, record) => (
        <Input
          value={record.data_type}
          onChange={(event) =>
            setColumnOverrides((current) =>
              current.map((item) =>
                item.name === record.name
                  ? { ...item, data_type: event.target.value }
                  : item,
              ),
            )
          }
        />
      ),
    },
    {
      title: "Nullable",
      dataIndex: "nullable",
      key: "nullable",
      width: 140,
      render: (_, record) => (
        <Switch
          checked={record.nullable}
          onChange={(checked) =>
            setColumnOverrides((current) =>
              current.map((item) =>
                item.name === record.name ? { ...item, nullable: checked } : item,
              ),
            )
          }
        />
      ),
    },
    {
      title: "Position",
      dataIndex: "ordinal_position",
      key: "ordinal_position",
      width: 120,
    },
  ];

  return (
    <Modal
      title="Confirm File Ingestion"
      open={open}
      onCancel={onClose}
      onOk={() => form.submit()}
      okText="Confirm"
      confirmLoading={isSubmitting}
      okButtonProps={{ disabled: isSubmitDisabled }}
      width={980}
      destroyOnClose
      centered
    >
      <Form<ConfirmFileModalValues>
        form={form}
        layout="vertical"
        onFinish={async (values) => {
          await onSubmit({
            ...values,
            column_overrides: columnOverrides,
          });
        }}
        className="mt-4"
      >
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Form.Item
            name="dataset_id"
            label="Dataset"
            rules={[{ required: true, message: "Please select a dataset." }]}
          >
            <Select
              showSearch
              loading={isDatasetsLoading}
              placeholder="Select dataset"
              optionFilterProp="label"
              options={datasets.map((dataset) => ({
                label: dataset.display_name || dataset.name,
                value: dataset.id,
              }))}
              notFoundContent={isDatasetsLoading ? <Spin size="small" /> : undefined}
            />
          </Form.Item>

          <Form.Item
            name="asset_name"
            label="Asset Name"
            rules={[{ required: true, message: "Please enter the asset name." }]}
          >
            <Input placeholder="asset_name" />
          </Form.Item>

          <Form.Item
            name="display_name"
            label="Display Name"
            rules={[{ required: true, message: "Please enter the display name." }]}
          >
            <Input placeholder="Display Name" />
          </Form.Item>

          <Form.Item name="sensitivity" label="Sensitivity">
            <Select options={SENSITIVITY_OPTIONS} />
          </Form.Item>

          <Form.Item name="tier" label="Tier">
            <Select allowClear options={TIER_OPTIONS} />
          </Form.Item>

          <Form.Item name="domain_id" label="Domain ID">
            <Select
              allowClear
              loading={isOptionsLoading}
              placeholder="Select domain"
              options={domains.map((domain) => ({
                label: domain.display_name || domain.name,
                value: domain.id,
              }))}
            />
          </Form.Item>
        </div>

        <Form.Item name="description" label="Description">
          <Input.TextArea rows={3} placeholder="Description" />
        </Form.Item>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Form.Item name="subject_area_id" label="Subject Area ID">
            <Input placeholder="Subject area ID" />
          </Form.Item>

          <Form.Item
            name="is_pii"
            label=" "
            valuePropName="checked"
            className="flex items-end"
          >
            <Checkbox>Contains PII</Checkbox>
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
                  <Form.Item name="tag_ids" label="Tags">
                    <Select mode="tags" tokenSeparators={[","]} placeholder="Add tag IDs" />
                  </Form.Item>

                  <Form.Item name="glossary_term_ids" label="Glossary Terms">
                    <Select mode="tags" tokenSeparators={[","]} placeholder="Add glossary term IDs" />
                  </Form.Item>

                  <Form.Item name="owner_ids" label="Owners" className="md:col-span-2">
                    <Select
                      mode="multiple"
                      allowClear
                      loading={isOptionsLoading}
                      placeholder="Select owners"
                      options={owners.map((owner) => ({
                        label: owner.display_name || owner.username || owner.email,
                        value: owner.id,
                      }))}
                    />
                  </Form.Item>
                </div>
              ),
            },
            {
              key: "columns",
              label: "Column Overrides",
              children:
                columnOverrides.length > 0 ? (
                  <div className="overflow-x-auto">
                    <Table
                      dataSource={columnOverrides}
                      columns={columns}
                      rowKey="name"
                      pagination={false}
                      className="custom-confirm-column-table"
                    />
                  </div>
                ) : (
                  <Empty description="No inferred schema available" />
                ),
            },
          ]}
        />
      </Form>
    </Modal>
  );
}
