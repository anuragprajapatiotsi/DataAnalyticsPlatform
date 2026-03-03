"use client";

import React, { useState, useMemo } from "react";
import { Modal, Table, Checkbox, Input, Space, Button } from "antd";
import { Search, Shield } from "lucide-react";
import { Policy } from "../../types";

interface RolePolicySelectionModalProps {
  open: boolean;
  onClose: () => void;
  onAdd: (policyIds: string[]) => Promise<void>;
  allPolicies: Policy[];
  alreadyAssignedPolicyIds: string[];
  isLoading: boolean;
  isSubmitting: boolean;
}

export function RolePolicySelectionModal({
  open,
  onClose,
  onAdd,
  allPolicies,
  alreadyAssignedPolicyIds,
  isLoading,
  isSubmitting,
}: RolePolicySelectionModalProps) {
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  const availablePolicies = useMemo(() => {
    return allPolicies.filter((p) => !alreadyAssignedPolicyIds.includes(p.id));
  }, [allPolicies, alreadyAssignedPolicyIds]);

  const filteredPolicies = useMemo(() => {
    return availablePolicies.filter(
      (p) =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.resource &&
          p.resource.toLowerCase().includes(searchQuery.toLowerCase())),
    );
  }, [availablePolicies, searchQuery]);

  const handleAdd = async () => {
    if (selectedRowKeys.length > 0) {
      await onAdd(selectedRowKeys as string[]);
      setSelectedRowKeys([]);
      onClose();
    }
  };

  const columns = [
    {
      title: "Policy Name",
      dataIndex: "name",
      key: "name",
      render: (text: string) => (
        <span className="font-bold text-slate-900">{text}</span>
      ),
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
      render: (text: string) => (
        <p className="text-[13px] text-slate-500 line-clamp-1 max-w-xs">
          {text || "No description"}
        </p>
      ),
    },
    {
      title: "Resource",
      dataIndex: "resource",
      key: "resource",
      render: (text: string) => (
        <span className="text-[12px] px-2 py-0.5 bg-slate-100 rounded text-slate-600 font-medium">
          {text || "N/A"}
        </span>
      ),
    },
  ];

  return (
    <Modal
      title={
        <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
          <Shield className="h-5 w-5 text-blue-600" />
          <span className="text-[18px] font-bold text-slate-900">
            Add Policies to Role
          </span>
        </div>
      }
      open={open}
      onCancel={onClose}
      width={800}
      footer={[
        <Button
          key="cancel"
          onClick={onClose}
          className="rounded-lg h-10 px-6 font-medium"
        >
          Cancel
        </Button>,
        <Button
          key="add"
          type="primary"
          onClick={handleAdd}
          loading={isSubmitting}
          disabled={selectedRowKeys.length === 0}
          className="bg-blue-600 hover:bg-blue-700 h-10 px-8 rounded-lg font-bold shadow-sm"
        >
          Add {selectedRowKeys.length > 0 ? `(${selectedRowKeys.length})` : ""}{" "}
          Policies
        </Button>,
      ]}
      centered
      className="role-policy-selection-modal"
    >
      <div className="py-4 flex flex-col gap-6">
        <div className="flex flex-col gap-1.5">
          <p className="text-[14px] text-slate-500 font-medium m-0">
            Select one or more policies to attach to this role. Only policies
            not already assigned are shown.
          </p>
        </div>

        <Input
          placeholder="Search policies by name, description or resource..."
          prefix={<Search className="h-4 w-4 text-slate-400 mr-2" />}
          className="h-11 rounded-xl bg-slate-50 border-slate-200"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />

        <div className="border border-slate-100 rounded-xl overflow-hidden">
          <Table
            rowSelection={{
              type: "checkbox",
              selectedRowKeys,
              onChange: (keys) => setSelectedRowKeys(keys),
            }}
            columns={columns}
            dataSource={filteredPolicies}
            rowKey="id"
            loading={isLoading}
            pagination={{
              pageSize: 5,
              showSizeChanger: false,
              className: "px-4 pb-4",
            }}
            className="policy-selection-table"
          />
        </div>
      </div>
    </Modal>
  );
}
