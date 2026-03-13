"use client";

import React, { useState } from "react";
import { UsersHeader } from "@/features/users/components/UsersHeader";
import { UsersTable } from "@/features/users/components/UsersTable";
import { useAdminUsers } from "@/features/users/hooks/useAdminUsers";
import { Pagination } from "antd";
import { PageHeader } from "@/shared/components/layout/PageHeader";

export default function UsersManagementPage() {
  const [filters, setFilters] = useState({
    search: "",
    is_active: true,
    skip: 0,
    limit: 10,
  });

  const { data: users = [], isLoading } = useAdminUsers(filters);

  const handleSearchChange = (search: string) => {
    setFilters((prev) => ({ ...prev, search, skip: 0 }));
  };

  const handleIsActiveChange = (is_active: boolean) => {
    setFilters((prev) => ({ ...prev, is_active, skip: 0 }));
  };

  const currentPage = Math.floor(filters.skip / filters.limit) + 1;

  const breadcrumbItems = [
    { label: "Settings", href: "/settings" },
    {
      label: "Team & User Management",
      href: "/settings/organization-team-user-management",
    },
    { label: "Users" },
  ];

  return (
    <div className="flex flex-col space-y-4 animate-in fade-in duration-500 max-w-[1400px] mx-auto">
      <PageHeader
        title="Users"
        description="View and manage regular users in your organization."
        breadcrumbItems={breadcrumbItems}
      />

      <div>
        <UsersHeader
          onSearchChange={handleSearchChange}
          isActive={filters.is_active}
          onIsActiveChange={handleIsActiveChange}
        />
      </div>

      <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-150">
        <UsersTable users={users} isLoading={isLoading} />
      </div>

      <div className="flex items-center justify-between bg-slate-50/50 p-3 px-4 rounded-lg border border-slate-200/60">
        <div className="text-[13px] text-slate-500 font-medium">
          Showing{" "}
          <span className="text-slate-900 font-semibold">{users.length}</span>{" "}
          results
        </div>

        <Pagination
          current={currentPage}
          pageSize={filters.limit}
          total={
            users.length === filters.limit
              ? (currentPage + 1) * filters.limit
              : currentPage * filters.limit
          }
          onChange={(page) => {
            const newSkip = (page - 1) * filters.limit;
            setFilters((prev) => ({ ...prev, skip: newSkip }));
          }}
          showSizeChanger={false}
          className="custom-pagination"
        />
      </div>

      <style jsx global>{`
        .custom-pagination .ant-pagination-item {
          border-radius: 8px;
          border-color: #e2e8f0;
          font-weight: 600;
        }
        .custom-pagination .ant-pagination-item-active {
          background-color: #2563eb;
          border-color: #2563eb;
        }
        .custom-pagination .ant-pagination-item-active a {
          color: white !important;
        }
        .custom-pagination .ant-pagination-prev .ant-pagination-item-link,
        .custom-pagination .ant-pagination-next .ant-pagination-item-link {
          border-radius: 8px;
          border-color: #e2e8f0;
        }
      `}</style>
    </div>
  );
}
