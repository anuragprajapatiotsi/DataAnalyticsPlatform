"use client";

import React, { useState, useEffect } from "react";
import { Modal, Form, Input, Select, Tag, Divider, message } from "antd";
import { Shield, Info, ListTree, Activity, Filter } from "lucide-react";
import { useCreatePolicy } from "../hooks/useCreatePolicy";
import { Resource } from "../types";

const { Option, OptGroup } = Select;
const { TextArea } = Input;

interface AddPolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const STATIC_CONDITIONS = [
  { name: "hasAnyRole" },
  { name: "hasDomain" },
  { name: "inAnyTeam" },
  { name: "isOwner" },
  { name: "matchAllTags" },
  { name: "matchAnyCertification" },
  { name: "matchAnyTag" },
  { name: "matchTeam" },
  { name: "noDomain" },
  { name: "noOwner" },
];

export function AddPolicyModal({ isOpen, onClose }: AddPolicyModalProps) {
  const [form] = Form.useForm();
  const { resources, isLoadingResources, isCreating, createPolicy } =
    useCreatePolicy();
  const [selectedResource, setSelectedResource] = useState<Resource | null>(
    null,
  );

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      form.resetFields();
      setSelectedResource(null);
    }
  }, [isOpen, form]);

  const handleResourceChange = (resourceKey: string) => {
    // Find the resource in the grouped data
    let found: Resource | null = null;
    resources.forEach((group: any) => {
      const res = group.resources.find(
        (r: any) => r.key === resourceKey || r.label === resourceKey,
      );
      if (res) found = res;
    });

    if (found) {
      setSelectedResource(found);
      form.setFieldsValue({
        resource: (found as Resource).key || (found as Resource).label,
        operations: (found as Resource).operations,
      });
    }
  };

  const onFinish = async (values: any) => {
    try {
      const payload = {
        name: values.name,
        description: values.description,
        rule_name: values.rule_name,
        resource: values.resource,
        operations: values.operations,
        conditions: [
          {
            attr: values.condition,
            op: "=",
            value: "true",
          },
        ],
      };

      await createPolicy(payload);
      onClose();
    } catch (error) {
      // Error handled by mutation
    }
  };

  return (
    <Modal
      title={
        <div className="flex items-center gap-3 py-1">
          <div className="bg-blue-50 p-2 rounded-lg border border-blue-100">
            <Shield size={18} className="text-blue-600" />
          </div>
          <div className="flex flex-col gap-0.5">
            <h3 className="text-[18px] font-semibold text-slate-900 m-0 leading-tight">
              Create New Policy
            </h3>
            <p className="text-[12px] text-slate-500 font-medium m-0">
              Define access rules and permissions for resources.
            </p>
          </div>
        </div>
      }
      open={isOpen}
      onCancel={onClose}
      footer={null}
      width={640}
      forceRender
      className="policy-modal"
    >
      <Divider className="my-4 opacity-50" />

      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        requiredMark={false}
        className="mt-4"
        initialValues={{ operations: [] }}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
          <Form.Item
            name="name"
            label={
              <span className="flex items-center gap-2 font-semibold text-[13px] text-slate-700">
                <Shield size={14} className="text-blue-500" /> Policy Name
              </span>
            }
            rules={[{ required: true, message: "Please enter policy name" }]}
          >
            <Input
              placeholder="e.g. Admin Access"
              className="h-9 rounded-lg border-slate-200 text-[13px]"
            />
          </Form.Item>

          <Form.Item
            name="rule_name"
            label={
              <span className="flex items-center gap-2 font-semibold text-[13px] text-slate-700">
                <ListTree size={14} className="text-purple-500" /> Rule Name
              </span>
            }
            rules={[{ required: true, message: "Please enter rule name" }]}
          >
            <Input
              placeholder="e.g. read_all_data"
              className="h-9 rounded-lg border-slate-200 text-[13px]"
            />
          </Form.Item>
        </div>

        <Form.Item
          name="description"
          label={
            <span className="flex items-center gap-2 font-semibold text-[13px] text-slate-700">
              <Info size={14} className="text-slate-400" /> Description
            </span>
          }
          rules={[{ required: true, message: "Please enter description" }]}
        >
          <TextArea
            placeholder="What does this policy permit?"
            autoSize={{ minRows: 2, maxRows: 4 }}
            className="rounded-lg border-slate-200 text-[13px]"
          />
        </Form.Item>

        <Divider className="my-6 opacity-30">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest bg-white px-2">
            Resource & Permissions
          </span>
        </Divider>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
          <Form.Item
            name="resource"
            label={
              <span className="flex items-center gap-2 font-semibold text-[13px] text-slate-700">
                <Activity size={14} className="text-emerald-500" /> Resource
              </span>
            }
            rules={[{ required: true, message: "Please select a resource" }]}
          >
            <Select
              showSearch
              placeholder="Select resource"
              loading={isLoadingResources}
              onChange={handleResourceChange}
              className="h-11 custom-select"
              classNames={{
                popup: {
                  root: "rounded-lg border-slate-200 shadow-xl",
                },
              }}
            >
              {(resources as any[]).map((group) => (
                <OptGroup key={group.group} label={group.group}>
                  {group.resources.map((res: any) => (
                    <Option
                      key={res.key || res.label}
                      value={res.key || res.label}
                    >
                      {res.label}
                    </Option>
                  ))}
                </OptGroup>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="condition"
            label={
              <span className="flex items-center gap-2 font-semibold text-[13px] text-slate-700">
                <Filter size={14} className="text-amber-500" /> Condition
              </span>
            }
            rules={[{ required: true, message: "Please select a condition" }]}
          >
            <Select
              placeholder="Select condition"
              className="h-11 custom-select"
              classNames={{
                popup: {
                  root: "rounded-lg border-slate-200 shadow-xl",
                },
              }}
            >
              {STATIC_CONDITIONS.map((cond) => (
                <Option key={cond.name} value={cond.name}>
                  {cond.name}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </div>

        <Form.Item
          noStyle
          shouldUpdate={(prevValues, currentValues) =>
            prevValues.operations !== currentValues.operations
          }
        >
          {({ getFieldValue }) => (
            <Form.Item
              name="operations"
              label={
                <div className="flex items-center justify-between w-full">
                  <span className="flex items-center gap-2 font-semibold text-[13px] text-slate-700">
                    <Shield size={14} className="text-blue-500" /> Operations
                  </span>
                  <span className="text-[10px] font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded uppercase tracking-tight">
                    Auto-populated
                  </span>
                </div>
              }
              rules={[{ required: true, message: "Operations are required" }]}
            >
              <div className="min-h-[36px] p-2 border border-slate-200 rounded-lg bg-slate-50/50 flex flex-wrap gap-2">
                {getFieldValue("operations")?.length > 0 ? (
                  getFieldValue("operations").map((op: string) => (
                    <Tag
                      key={op}
                      color="blue"
                      className="rounded-md px-2 py-0.5 m-0 border-blue-100 text-blue-600 font-semibold uppercase text-[10px] tracking-tight"
                    >
                      {op}
                    </Tag>
                  ))
                ) : (
                  <span className="text-slate-400 text-sm italic ml-1">
                    Select a resource to load operations...
                  </span>
                )}
                {/* Hidden select to satisfy Form.Item validation */}
                <Select mode="multiple" style={{ display: "none" }} />
              </div>
            </Form.Item>
          )}
        </Form.Item>

        <Divider className="my-6 opacity-30" />

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="h-9 px-4 rounded-lg font-semibold border border-slate-200 hover:bg-slate-50 transition-colors text-[13px]"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isCreating}
            className="h-9 px-4 rounded-lg font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-[13px]"
          >
            {isCreating ? "Creating..." : "Create Policy"}
          </button>
        </div>
      </Form>

      <style jsx global>{`
        .policy-modal .ant-modal-content {
          border-radius: 8px;
          overflow: hidden;
          padding: 24px;
        }
        .policy-modal .ant-modal-header {
          margin-bottom: 0;
          padding-bottom: 0;
        }
        .custom-select .ant-select-selector {
          border-radius: 8px !important;
          border-color: #e2e8f0 !important;
          height: 44px !important;
          padding-top: 6px !important;
        }
        .ant-select-group-title {
          font-weight: 800;
          color: #64748b;
          text-transform: uppercase;
          font-size: 11px;
          letter-spacing: 0.05em;
          padding: 8px 12px;
        }
      `}</style>
    </Modal>
  );
}
