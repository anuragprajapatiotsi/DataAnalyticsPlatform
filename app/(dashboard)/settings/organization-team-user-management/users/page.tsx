"use client";

import React, { useState, useCallback } from "react";
import { UsersHeader } from "@/features/users/components/UsersHeader";
import { UsersTable } from "@/features/users/components/UsersTable";
import { useAdminUsers } from "@/features/users/hooks/useAdminUsers";
import { Pagination } from "antd";
import { PageHeader } from "@/shared/components/layout/PageHeader";
import { useTeams } from "@/features/teams/hooks/useTeams";
import { useRoles } from "@/features/roles/hooks/useRoles";
import { usePolicies } from "@/features/policies/hooks/usePolicies";
import { GetUserParams } from "@/features/users/types";


export default function UsersManagementPage() {
  const [filters, setFilters] = useState<GetUserParams>({
    search: "",
    is_active: true,
    is_admin: undefined,
    is_verified: undefined,
    team_id: undefined,
    role_id: undefined,
    policy_id: undefined,
    domain_id: undefined,
    skip: 0,
    limit: 5,
  });

  const { data: users = [], isLoading } = useAdminUsers(filters);
  const { teams } = useTeams({ limit: 100 });
  const { roles } = useRoles({ limit: 100 });
  const { policies } = usePolicies({ limit: 100 });

  const domainOptions = [
    { label: "Finance", value: "finance" },
    { label: "Marketing", value: "marketing" },
    { label: "Operations", value: "operations" },
    { label: "Data Platform", value: "data-platform" },
  ];

  const handleSearchChange = useCallback((search: string) => {
    setFilters((prev) => ({ ...prev, search, skip: 0 }));
  }, []);

  const handleFilterChange = useCallback((newFilters: Partial<GetUserParams>) => {
    setFilters((prev) => ({ ...prev, ...newFilters, skip: 0 }));
  }, []);

  const limit = filters.limit ?? 5;
  const skip = filters.skip ?? 0;
  const currentPage = Math.floor(skip / limit) + 1;

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
          filters={filters}
          onFiltersChange={handleFilterChange}
          teams={teams}
          roles={roles as any}
          policies={policies}
          domains={domainOptions}
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
          pageSize={limit}
          total={
            users.length === limit
              ? (currentPage + 1) * limit
              : currentPage * limit
          }
          onChange={(page) => {
            const newSkip = (page - 1) * limit;
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
