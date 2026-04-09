"use client";

import { useMemo, useState } from "react";

import { PageHeader } from "@/shared/components/layout/PageHeader";
import { useAdminUsers } from "@/features/users/hooks/useAdminUsers";

import { DomainModal } from "./domain-modal";
import { DomainsTable } from "./domains-table";
import { useDomains } from "../hooks/useDomains";
import type { CatalogDomain } from "../types";

export function DomainsPage() {
  const {
    domains,
    isLoading,
    isFetching,
    refetch,
    createDomain,
    updateDomain,
    deleteDomain,
    isCreating,
    isUpdating,
  } = useDomains();
  const { data: users = [] } = useAdminUsers({ skip: 0, limit: 200 });

  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDomain, setEditingDomain] = useState<CatalogDomain | null>(null);

  const filteredDomains = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) {
      return domains;
    }

    return domains.filter((domain) => {
      const ownerNames = domain.owners
        .map((owner) => owner.display_name || owner.name || owner.email || "")
        .join(" ");
      const expertNames = domain.experts
        .map((expert) => expert.display_name || expert.name || expert.email || "")
        .join(" ");

      return [
        domain.name,
        domain.display_name,
        domain.description,
        domain.domain_type,
        ownerNames,
        expertNames,
      ]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(query));
    });
  }, [domains, searchQuery]);

  const breadcrumbItems = [
    { label: "Dashboard", href: "/" },
    { label: "Domains" },
  ];

  return (
    <div className="mx-auto flex max-w-[1440px] flex-col gap-5 animate-in fade-in slide-in-from-bottom-2 duration-500 p-4">
      <PageHeader
        title="Domains"
        description="Organize catalog assets by business domain, ownership, and subject matter expertise."
        breadcrumbItems={breadcrumbItems}
      />

      <DomainsTable
        domains={filteredDomains}
        isLoading={isLoading}
        isRefreshing={isFetching}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onRefresh={() => void refetch()}
        onCreateClick={() => {
          setEditingDomain(null);
          setIsModalOpen(true);
        }}
        onEditClick={(domain) => {
          setEditingDomain(domain);
          setIsModalOpen(true);
        }}
        onDeleteConfirm={(id) => void deleteDomain(id)}
      />

      <DomainModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        initialValues={editingDomain}
        users={users}
        isLoading={isCreating || isUpdating}
        onSubmit={async (values) => {
          if (editingDomain) {
            await updateDomain({
              id: editingDomain.id,
              payload: {
                ...values,
                icon: editingDomain.icon || "sparkles",
                color: editingDomain.color || "#2563eb",
                is_active: values.is_active ?? true,
              },
            });
          } else {
            await createDomain({
              name: values.name,
              display_name: values.display_name,
              description: values.description,
              domain_type: values.domain_type,
              icon: "sparkles",
              color: "#2563eb",
              owner_ids: values.owner_ids ?? [],
              expert_ids: values.expert_ids ?? [],
            });
          }

          setIsModalOpen(false);
          setEditingDomain(null);
        }}
      />
    </div>
  );
}
