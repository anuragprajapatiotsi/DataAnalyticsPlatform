"use client";

import React, { useState } from "react";
import { PolicyHeader } from "@/features/policies/components/PolicyHeader";
import { PolicyTable } from "@/features/policies/components/PolicyTable";
import { AddPolicyModal } from "@/features/policies/components/AddPolicyModal";
import { usePolicies } from "@/features/policies/hooks/usePolicies";
import { useCreatePolicy } from "@/features/policies/hooks/useCreatePolicy";
import { Policy } from "@/features/policies/types";
import { Input, Select, Button } from "antd";
import { Search, Filter } from "lucide-react";

export default function PoliciesPage() {
  const [params, setParams] = useState({
    skip: 0,
    limit: 50,
    name: undefined as string | undefined,
    search: "",
    resource: undefined as string | undefined,
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPolicy, setSelectedPolicy] = useState<Policy | null>(null);

  const { policies, total, isLoading, deletePolicy, isDeleting } =
    usePolicies(params);
  const { resources, isLoadingResources } = useCreatePolicy();

  const handleAddPolicy = () => {
    setSelectedPolicy(null);
    setIsModalOpen(true);
  };

  const handleEditPolicy = (policy: Policy) => {
    setSelectedPolicy(policy);
    setIsModalOpen(true);
  };

  const handleDeletePolicy = async (id: string) => {
    try {
      await deletePolicy(id);
    } catch (error) {
      // Error handled by hook
    }
  };

  const handleSearch = (value: string) => {
    setParams((prev) => ({ ...prev, search: value, skip: 0 }));
  };

  const handleResourceChange = (value: string) => {
    setParams((prev) => ({ ...prev, resource: value || undefined, skip: 0 }));
  };

  const handleClearFilters = () => {
    setParams({
      skip: 0,
      limit: 50,
      name: undefined,
      search: "",
      resource: undefined,
    });
  };

  const handlePageChange = (page: number) => {
    setParams((prev) => ({ ...prev, skip: (page - 1) * prev.limit }));
  };

  const currentPage = Math.floor(params.skip / params.limit) + 1;
  const isFiltered = params.search || params.resource;

  return (
    <div className="flex flex-col h-[calc(100vh-80px)] px-6 pt-2 pb-6 space-y-4 animate-in fade-in duration-500 max-w-[1400px] mx-auto overflow-hidden">
      <PolicyHeader onAddPolicy={handleAddPolicy} />

      <div className="flex flex-row gap-4 items-center justify-between bg-white p-3 px-4 rounded-lg border border-slate-200 shadow-sm transition-all overflow-x-auto whitespace-nowrap">
        <div className="flex flex-row gap-3 items-center flex-1 min-w-0">
          <div className="flex items-center gap-4 flex-1">
            <Input
              placeholder="Search policies..."
              allowClear
              value={params.search}
              onChange={(e) => {
                const val = e.target.value;
                setParams((prev) => ({ ...prev, search: val }));
                if (!val) handleSearch("");
              }}
              onPressEnter={() => handleSearch(params.search)}
              className="flex-1 max-w-[650px] h-10 policies-search"
              size="large"
              prefix={<Search size={16} className="text-slate-400 mr-2" />}
            />
            <Button
              type="primary"
              onClick={() => handleSearch(params.search)}
              className="bg-blue-600 hover:bg-blue-700 h-10 px-6 rounded-lg font-semibold shadow-sm flex items-center justify-center transition-all whitespace-nowrap"
              loading={isLoading}
              size="large"
            >
              Search Policies
            </Button>
          </div>
          <Select
            placeholder="Filter Resource"
            allowClear
            value={params.resource}
            className="w-[180px] h-10 flex-shrink-0"
            onChange={handleResourceChange}
            loading={isLoadingResources}
            size="large"
          >
            {resources.map((group) => (
              <Select.OptGroup key={group.group} label={group.group}>
                {group.resources.map((res: any) => (
                  <Select.Option
                    key={res.key || res.label}
                    value={res.key || res.label}
                  >
                    {res.label}
                  </Select.Option>
                ))}
              </Select.OptGroup>
            ))}
          </Select>

          {isFiltered && (
            <Button
              type="text"
              onClick={handleClearFilters}
              className="text-slate-500 hover:text-blue-600 font-semibold text-[13px] px-2 h-9 flex items-center flex-shrink-0"
            >
              Clear All
            </Button>
          )}
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-md border border-slate-100 shadow-sm flex-shrink-0">
          <span className="text-[12px] text-slate-500 font-semibold uppercase tracking-tight">
            Total:
          </span>
          <span className="text-[13px] text-slate-900 font-bold leading-none">
            {total || policies.length}
          </span>
        </div>
      </div>

      <div className="flex-1 min-h-0 flex flex-col animate-in fade-in slide-in-from-bottom-2 duration-700">
        <PolicyTable
          policies={policies}
          isLoading={isLoading}
          onEdit={handleEditPolicy}
          onDelete={handleDeletePolicy}
          isDeleting={isDeleting}
          total={total}
          current={currentPage}
          pageSize={params.limit}
          onPageChange={handlePageChange}
        />
      </div>

      <AddPolicyModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedPolicy(null);
        }}
        initialValues={selectedPolicy}
      />

      <style jsx global>{`
        .policies-search .ant-input-affix-wrapper {
          border-radius: 10px !important;
          border-color: #e2e8f0 !important;
          padding-left: 12px !important;
          height: 40px !important;
        }
        .policies-search .ant-input-affix-wrapper:hover,
        .policies-search .ant-input-affix-wrapper:focus {
          border-color: #2563eb !important;
        }
        .ant-select-selector {
          border-radius: 10px !important;
          border-color: #e2e8f0 !important;
        }
      `}</style>
    </div>
  );
}
