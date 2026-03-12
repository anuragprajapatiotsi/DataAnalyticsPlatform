"use client";

import React, { useState, useEffect } from "react";
import { Modal, Form, Input, Select, Tag, Divider, message } from "antd";
import { Shield, Info, ListTree, Activity, Filter } from "lucide-react";
import { useCreatePolicy } from "../hooks/useCreatePolicy";
import { Policy, Resource } from "../types";

const { Option, OptGroup } = Select;
const { TextArea } = Input;

interface AddPolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialValues?: Policy | null;
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

export function AddPolicyModal({
  isOpen,
  onClose,
  initialValues,
}: AddPolicyModalProps) {
  const [form] = Form.useForm();
  const {
    resources,
    isLoadingResources,
    isCreating,
    createPolicy,
    isUpdating,
    updatePolicy,
  } = useCreatePolicy();
  const [selectedResource, setSelectedResource] = useState<Resource | null>(
    null,
  );

  const isEdit = !!initialValues;

  // Reset form when modal closes or initialValues change
  useEffect(() => {
    if (isOpen) {
      if (initialValues) {
        form.setFieldsValue({
          name: initialValues.name,
          description: initialValues.description,
          rule_name: initialValues.rule_name,
          resource: initialValues.resource,
          operations: initialValues.operations,
          condition: initialValues.conditions?.[0]?.attr,
        });

        // Try to find and set the selected resource object to show operations list
        let found: Resource | null = null;
        resources.forEach((group: any) => {
          const res = group.resources.find(
            (r: any) =>
              r.key === initialValues.resource ||
              r.label === initialValues.resource,
          );
          if (res) found = res;
        });
        if (found) setSelectedResource(found);
      } else {
        form.resetFields();
        setSelectedResource(null);
      }
    }
  }, [isOpen, initialValues, form, resources]);

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
        operations: [], // Clear previously selected operations
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

      if (isEdit && initialValues) {
        await updatePolicy({ id: initialValues.id, payload });
      } else {
        await createPolicy(payload);
      }
      onClose();
    } catch (error) {
      // Error handled by mutation
    }
  };

  return (
    <Modal
      title={
        <div className="flex items-center">
          <div className="flex flex-col">
            <h3 className="text-[18px] font-semibold text-slate-900 m-0 leading-tight">
              {isEdit ? "Edit Policy" : "Create New Policy"}
            </h3>
            <p className="text-[12px] text-slate-500 font-medium mb-2">
              {isEdit
                ? "Update access rules and permissions."
                : "Define access rules and permissions for resources."}
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
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        requiredMark={false}
        initialValues={{ operations: [] }}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-1">
          {" "}
          <Form.Item
            name="name"
            label={
              <span className="flex items-center gap-1 font-semibold text-[13px] text-slate-700">
                <Shield size={14} className="text-blue-500" /> Policy Name
              </span>
            }
            rules={[{ required: true, message: "Please enter policy name" }]}
          >
            <Input
              placeholder="e.g. Admin Access"
              className="h-8 rounded-lg border-slate-200 text-[13px]"
            />
          </Form.Item>
          <Form.Item
            name="rule_name"
            label={
              <span className="flex items-center gap-1 font-semibold text-[13px] text-slate-700">
                <ListTree size={14} className="text-purple-500" /> Rule Name
              </span>
            }
            rules={[{ required: true, message: "Please enter rule name" }]}
          >
            <Input
              placeholder="e.g. read_all_data"
              className="h-8 rounded-lg border-slate-200 text-[13px]"
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-1">
          {" "}
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
              className="h-8 custom-select"
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
              className="h-8 custom-select"
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
          name="operations"
          label={
            <span className="flex items-center gap-2 font-semibold text-[13px] text-slate-700">
              <Shield size={14} className="text-blue-500" /> Operations
            </span>
          }
          rules={[
            { required: true, message: "Please select at least one operation" },
          ]}
        >
          <Select
            mode="multiple"
            placeholder={
              selectedResource
                ? "Select specific operations"
                : "Select a resource first..."
            }
            disabled={!selectedResource}
            loading={isLoadingResources}
            className="h-8 custom-select w-full"
            classNames={{
              popup: {
                root: "rounded-lg border-slate-200 shadow-xl",
              },
            }}
          >
            {selectedResource?.operations?.map((op) => (
              <Option key={op} value={op}>
                {op.toUpperCase()}
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Divider className="my-6 opacity-30" />

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="h-8 px-4 rounded-lg font-semibold border border-slate-200 hover:bg-slate-50 transition-colors text-[13px]"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isCreating || isUpdating}
            className="h-8 px-4 rounded-lg font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-[13px]"
          >
            {isCreating || isUpdating ? (
              <>
                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white" />
                {isEdit ? "Updating..." : "Creating..."}
              </>
            ) : isEdit ? (
              "Update Policy"
            ) : (
              "Create Policy"
            )}
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
