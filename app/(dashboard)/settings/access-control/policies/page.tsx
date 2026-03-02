"use client";

import React, { useState } from "react";
import { PolicyHeader } from "@/features/policies/components/PolicyHeader";
import { PolicyTable } from "@/features/policies/components/PolicyTable";
import { usePolicies } from "@/features/policies/hooks/usePolicies";
import { message } from "antd";

export default function PoliciesPage() {
  const [params, setParams] = useState({ skip: 0, limit: 50, name: "primary" });

  const { policies, isLoading, deletePolicy, isDeleting } = usePolicies(params);

  const handleAddPolicy = () => {
    message.info("Add Policy functionality coming soon");
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

      <div className="animate-in fade-in slide-in-from-bottom-2 duration-700">
        <PolicyTable
          policies={policies}
          isLoading={isLoading}
          onDelete={handleDeletePolicy}
          isDeleting={isDeleting}
        />
      </div>

      {/* Implementation Note: Pagination and Search can be added here in the future */}
    </div>
  );
}
