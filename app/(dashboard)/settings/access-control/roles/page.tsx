"use client";

import React, { useState } from "react";
import { useRoles } from "@/features/roles/hooks/useRoles";
import { RolesTable } from "@/features/roles/components/RolesTable";
import { PageHeader } from "@/shared/components/layout/PageHeader";
import { RolesHeader } from "@/features/roles/components/RolesHeader";
import { RoleModal } from "@/features/roles/components/CreateRoleModal";
import { Role } from "@/features/roles/types";
import { Input, Button } from "antd";
import { Search, Plus } from "lucide-react";

export default function RolesPage() {
  const [params, setParams] = useState({
    skip: 0,
    limit: 50,
    search: "",
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);

  const { roles, total, isLoading, deleteRole } = useRoles(params);

  const handleAddClick = () => {
    setEditingRole(null);
    setIsModalOpen(true);
  };

  const handleEditClick = (role: Role) => {
    setEditingRole(role);
    setIsModalOpen(true);
  };

  const handleDeleteConfirm = async (id: string) => {
    await deleteRole(id);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditingRole(null);
  };

  const handleSearch = (value: string) => {
    setParams((prev) => ({ ...prev, search: value, skip: 0 }));
  };

  const handlePageChange = (page: number) => {
    setParams((prev) => ({ ...prev, skip: (page - 1) * prev.limit }));
  };

  const currentPage = Math.floor(params.skip / params.limit) + 1;
  const isFiltered = params.search;

  const handleClearFilters = () => {
    setParams({
      skip: 0,
      limit: 50,
      search: "",
    });
  };

  const breadcrumbItems = [
    { label: "Settings", href: "/settings" },
    { label: "Access Control", href: "/settings/access-control" },
    { label: "Roles" },
  ];

  return (
    <div className="flex flex-col h-[calc(100vh-80px)] px-6 py-6 space-y-4 animate-in fade-in duration-500 max-w-[1400px] mx-auto overflow-hidden">
      <div className="flex justify-between items-start">
        <PageHeader
          title="Roles"
          description="Define and manage user roles to control access levels across your organization."
          breadcrumbItems={breadcrumbItems}
        />
        <Button
          type="primary"
          icon={<Plus size={16} />}
          onClick={handleAddClick}
          className="bg-blue-600 hover:bg-blue-700 h-10 px-6 rounded-lg font-semibold shadow-sm transition-all flex items-center gap-2 mt-1"
        >
          Add Role
        </Button>
      </div>

      <div className="flex flex-row gap-4 items-center justify-between bg-white p-3 px-4 rounded-lg border border-slate-200 shadow-sm transition-all overflow-x-auto whitespace-nowrap">
        <div className="flex flex-row gap-3 items-center flex-1 min-w-0">
          <div className="flex items-center gap-4 flex-1">
            <Input
              placeholder="Search roles..."
              allowClear
              value={params.search}
              onChange={(e) => {
                const val = e.target.value;
                setParams((prev) => ({ ...prev, search: val }));
                if (!val) handleSearch("");
              }}
              onPressEnter={() => handleSearch(params.search)}
              className="flex-1 max-w-[650px] h-10 roles-search"
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
              Search Roles
            </Button>
          </div>

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
            {total || roles.length}
          </span>
        </div>
      </div>

      <div className="flex-1 min-h-0 flex flex-col animate-in fade-in slide-in-from-bottom-2 duration-300">
        <RolesTable
          roles={roles}
          isLoading={isLoading}
          onEditClick={handleEditClick}
          onDeleteConfirm={handleDeleteConfirm}
          total={total}
          current={currentPage}
          pageSize={params.limit}
          onPageChange={handlePageChange}
        />
      </div>

      <RoleModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        initialValues={editingRole}
      />

      <style jsx global>{`
        .roles-search .ant-input-affix-wrapper {
          border-radius: 10px !important;
          border-color: #e2e8f0 !important;
          padding-left: 12px !important;
          height: 40px !important;
        }
        .roles-search .ant-input-affix-wrapper:hover,
        .roles-search .ant-input-affix-wrapper:focus {
          border-color: #2563eb !important;
        }
      `}</style>
    </div>
  );
}
