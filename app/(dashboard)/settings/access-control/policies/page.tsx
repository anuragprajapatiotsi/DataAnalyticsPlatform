"use client";

import React, { useState } from "react";
import { PolicyHeader } from "@/features/policies/components/PolicyHeader";
import { PolicyTable } from "@/features/policies/components/PolicyTable";
import { AddPolicyModal } from "@/features/policies/components/AddPolicyModal";
import { usePolicies } from "@/features/policies/hooks/usePolicies";

export default function PoliciesPage() {
  const [params, setParams] = useState({ skip: 0, limit: 50, name: "primary" });
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { policies, isLoading, deletePolicy, isDeleting } = usePolicies(params);

  const handleAddPolicy = () => {
    setIsModalOpen(true);
  };

  const handleDeletePolicy = async (id: string) => {
    try {
      await deletePolicy(id);
    } catch (error) {
      // Error handled by hook
    }
  };

  return (
    <div className="flex flex-col p-8 pb-20 animate-in fade-in duration-500">
      <PolicyHeader onAddPolicy={handleAddPolicy} />

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm animate-in fade-in slide-in-from-bottom-2 duration-700">
        <PolicyTable
          policies={policies}
          isLoading={isLoading}
          onDelete={handleDeletePolicy}
          isDeleting={isDeleting}
        />
      </div>

      <AddPolicyModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />

      {/* Implementation Note: Pagination and Search can be added here in the future */}
    </div>
  );
}
