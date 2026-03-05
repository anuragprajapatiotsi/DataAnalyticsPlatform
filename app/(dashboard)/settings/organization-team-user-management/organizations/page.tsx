"use client";

import React, { useState } from "react";
import { useOrganizations } from "@/features/organizations/hooks/useOrganizations";
import { OrganizationsTable } from "@/features/organizations/components/OrganizationsTable";
import { OrgModal } from "@/features/organizations/components/OrgModal";
import { PageHeader } from "@/shared/components/layout/PageHeader";
import type { Organization } from "@/shared/types";

export default function OrganizationsPage() {
  const {
    organizations,
    isLoading,
    createOrganization,
    updateOrganization,
    deleteOrganization,
    isCreating,
    isUpdating,
  } = useOrganizations();

  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOrg, setEditingOrg] = useState<Organization | null>(null);

  const filteredOrgs = organizations.filter(
    (org) =>
      org.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      org.contact_email.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handleCreate = () => {
    setEditingOrg(null);
    setIsModalOpen(true);
  };

  const handleEdit = (org: Organization) => {
    setEditingOrg(org);
    setIsModalOpen(true);
  };

  const handleSubmit = async (values: any) => {
    if (editingOrg) {
      await updateOrganization({ id: editingOrg.id, data: values });
    } else {
      await createOrganization(values);
    }
    setIsModalOpen(false);
  };

  const breadcrumbItems = [
    { label: "Settings", href: "/settings" },
    {
      label: "Team & User Management",
      href: "/settings/organization-team-user-management",
    },
    { label: "Organizations" },
  ];

  return (
    <div className="flex flex-col space-y-6 animate-in fade-in duration-500">
      <PageHeader
        title="Organizations"
        description="Manage your organization's sub-entities."
        breadcrumbItems={breadcrumbItems}
      />

      <div className="animate-in fade-in duration-300 ">
        <OrganizationsTable
          organizations={filteredOrgs}
          isLoading={isLoading}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onCreateClick={handleCreate}
          onEditClick={handleEdit}
          onDeleteConfirm={deleteOrganization}
        />

        <OrgModal
          open={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleSubmit}
          initialValues={editingOrg}
          isLoading={isCreating || isUpdating}
        />
      </div>
    </div>
  );
}
