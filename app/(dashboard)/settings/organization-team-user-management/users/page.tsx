"use client";

import React, { useState } from "react";
import { UsersHeader } from "@/features/users/components/UsersHeader";
import { UsersTable } from "@/features/users/components/UsersTable";
import { useAdminUsers } from "@/features/users/hooks/useAdminUsers";
import { Button, Pagination } from "antd";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function UsersManagementPage() {
  const [filters, setFilters] = useState({
    search: "",
    is_active: true,
    skip: 0,
    limit: 10, // Requirement sample shows limit=50, but let's use 10 for better UI testing unless specified
  });

  const { data: users = [], isLoading } = useAdminUsers(filters);

  const handleSearchChange = (search: string) => {
    setFilters((prev) => ({ ...prev, search, skip: 0 }));
  };

  const handleIsActiveChange = (is_active: boolean) => {
    setFilters((prev) => ({ ...prev, is_active, skip: 0 }));
  };

  const handlePageChange = (direction: "next" | "prev") => {
    const newSkip =
      direction === "next"
        ? filters.skip + filters.limit
        : Math.max(0, filters.skip - filters.limit);

    setFilters((prev) => ({ ...prev, skip: newSkip }));
  };

  const currentPage = Math.floor(filters.skip / filters.limit) + 1;

  return (
    <div className="flex flex-col  animate-in fade-in duration-500 max-w-[1400px] mx-auto">
      <UsersHeader
        onSearchChange={handleSearchChange}
        isActive={filters.is_active}
        onIsActiveChange={handleIsActiveChange}
      />

      <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-150">
        <UsersTable users={users} isLoading={isLoading} />
      </div>

      <div className="flex items-center justify-between mt-8 bg-white p-4 px-6 rounded-2xl border border-slate-200 shadow-sm animate-in fade-in slide-in-from-bottom-2 duration-500 delay-300">
        <div className="text-[13px] text-slate-500 font-medium">
          Showing{" "}
          <span className="text-slate-900 font-bold tracking-tight">
            {users.length}
          </span>{" "}
          results
        </div>

        <Pagination
          current={currentPage}
          pageSize={filters.limit}
          total={
            users.length === filters.limit
              ? (currentPage + 1) * filters.limit
              : currentPage * filters.limit
          } // This is a workaround since we don't have total count. In real app, API should return total.
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
