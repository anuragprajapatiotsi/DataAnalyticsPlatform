"use client";

import React, { useState } from "react";
import { useRoles } from "@/features/roles/hooks/useRoles";
import { RolesTable } from "@/features/roles/components/RolesTable";
import { PageHeader } from "@/shared/components/layout/PageHeader";
import { RolesHeader } from "@/features/roles/components/RolesHeader";
import { RoleModal } from "@/features/roles/components/CreateRoleModal";
import { Role } from "@/features/roles/types";

export default function RolesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);

  const { data, isLoading, deleteRole } = useRoles({
    skip: 0,
    limit: 50,
    search: searchQuery,
  });

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

  const breadcrumbItems = [
    { label: "Settings", href: "/settings" },
    { label: "Access Control", href: "/settings/access-control" },
    { label: "Roles" },
  ];

  return (
    <div className="flex flex-col px-6 py-6 pb-20 space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500 max-w-[1400px] mx-auto">
      <PageHeader
        title="Roles"
        description="Define and manage user roles to control access levels across your organization."
        breadcrumbItems={breadcrumbItems}
      />

      <RolesHeader
        onSearchChange={setSearchQuery}
        onCreateClick={() => {
          setEditingRole(null);
          setIsModalOpen(true);
        }}
      />

      <div className="animate-in fade-in duration-300">
        <RolesTable
          roles={data || []}
          isLoading={isLoading}
          onEditClick={handleEditClick}
          onDeleteConfirm={handleDeleteConfirm}
        />
      </div>

      <RoleModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        initialValues={editingRole}
      />
    </div>
  );
}
