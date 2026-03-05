"use client";

import React, { useEffect } from "react";
import { Modal, Form, Input, Select, Divider } from "antd";
import { Shield, Info, ListChecks } from "lucide-react";
import { useRoles } from "../hooks/useRoles";
import { usePolicies } from "@/features/policies/hooks/usePolicies";
import { Role, CreateRolePayload } from "../types";

const { TextArea } = Input;

interface RoleModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialValues?: Role | null;
}

export function RoleModal({ isOpen, onClose, initialValues }: RoleModalProps) {
  const [form] = Form.useForm();
  const { createRole, updateRole, isCreating, isUpdating } = useRoles();
  const { policies, isLoading: isLoadingPolicies } = usePolicies({
    skip: 0,
    limit: 100,
  });

  const isEdit = !!initialValues;

  // Reset form when modal closes or initialValues change
  useEffect(() => {
    if (isOpen) {
      if (initialValues) {
        form.setFieldsValue({
          name: initialValues.name,
          description: initialValues.description,
          policy_ids: initialValues.policies?.map((p) => p.id) || [],
        });
      } else {
        form.resetFields();
      }
    }
  }, [isOpen, initialValues, form]);

  const onFinish = async (values: CreateRolePayload) => {
    try {
      if (isEdit && initialValues) {
        await updateRole({
          id: initialValues.id,
          payload: {
            name: values.name,
            description: values.description,
            policy_ids: values.policy_ids,
          },
        });
      } else {
        await createRole({
          name: values.name,
          description: values.description,
          policy_ids: values.policy_ids,
        });
      }
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
              {isEdit ? "Edit Role" : "Create New Role"}
            </h3>
            <p className="text-[12px] text-slate-500 font-medium m-0">
              {isEdit
                ? "Update role attributes and policies."
                : "Define a new role and assign resource policies."}
            </p>
          </div>
        </div>
      }
      open={isOpen}
      onCancel={onClose}
      footer={null}
      width={560}
      forceRender
      className="role-modal"
    >
      <Divider className="my-4 opacity-50" />

      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        requiredMark={false}
        className="mt-4"
      >
        <Form.Item
          name="name"
          label={
            <span className="flex items-center gap-2 font-semibold text-[13px] text-slate-700">
              <Shield size={14} className="text-blue-500" /> Role Name
            </span>
          }
          rules={[
            { required: true, message: "Please enter role name" },
            { min: 3, message: "Role name must be at least 3 characters" },
          ]}
        >
          <Input
            placeholder="e.g. Data Analyst"
            className="h-9 rounded-lg border-slate-200 text-[13px]"
          />
        </Form.Item>

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
            placeholder="Describe the responsibilities of this role..."
            autoSize={{ minRows: 3, maxRows: 6 }}
            className="rounded-lg border-slate-200 text-[13px]"
          />
        </Form.Item>

        <Form.Item
          name="policy_ids"
          label={
            <span className="flex items-center gap-2 font-semibold text-[13px] text-slate-700">
              <ListChecks size={14} className="text-purple-500" /> Assign
              Policies
            </span>
          }
          rules={[
            { required: true, message: "Please select at least one policy" },
          ]}
        >
          <Select
            mode="multiple"
            showSearch
            placeholder="Search and select policies..."
            loading={isLoadingPolicies}
            className="custom-select w-full"
            optionFilterProp="children"
            filterOption={(input, option) =>
              (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
            }
            options={policies.map((p: any) => ({
              label: p.name,
              value: p.id,
            }))}
            tagRender={(props) => {
              const { label, closable, onClose } = props;
              return (
                <span className="flex items-center gap-1 bg-blue-50 text-blue-700 px-2 py-0.5 rounded-md text-[11px] font-bold border border-blue-100 mr-1 mt-1">
                  {label}
                  {closable && (
                    <span
                      onClick={onClose}
                      className="cursor-pointer hover:text-blue-900 ml-1 leading-none"
                    >
                      ×
                    </span>
                  )}
                </span>
              );
            }}
            classNames={{
              popup: {
                root: "rounded-lg border-slate-200 shadow-xl p-1",
              },
            }}
          />
        </Form.Item>

        <Divider className="my-6 opacity-30" />

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="h-9 px-6 rounded-lg font-semibold border border-slate-200 hover:bg-slate-50 transition-colors text-[13px] text-slate-600"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isCreating || isUpdating}
            className="h-9 px-6 rounded-lg font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-[13px]"
          >
            {isCreating || isUpdating ? (
              <>
                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white" />
                {isEdit ? "Updating..." : "Creating..."}
              </>
            ) : isEdit ? (
              "Update Role"
            ) : (
              "Create Role"
            )}
          </button>
        </div>
      </Form>

      <style jsx global>{`
        .role-modal .ant-modal-content {
          border-radius: 12px;
          overflow: hidden;
          padding: 24px;
        }
        .role-modal .ant-modal-header {
          margin-bottom: 0;
          padding-bottom: 0;
        }
        .custom-select .ant-select-selector {
          border-radius: 8px !important;
          border-color: #e2e8f0 !important;
          min-height: 40px !important;
          padding: 4px 8px !important;
        }
        .ant-select-item-option-selected:not(.ant-select-item-option-disabled) {
          background-color: #eff6ff !important;
          font-weight: 600 !important;
          color: #2563eb !important;
        }
      `}</style>
    </Modal>
  );
}
