"use client";

import React from "react";
import { Button } from "antd";
import { Plus } from "lucide-react";
import { PageHeader } from "@/shared/components/layout/PageHeader";

interface PolicyHeaderProps {
  onAddPolicy: () => void;
}

export function PolicyHeader({ onAddPolicy }: PolicyHeaderProps) {
  const breadcrumbItems = [
    { label: "Settings", href: "/settings" },
    { label: "Access Control", href: "/settings/access-control" },
    { label: "Policies" },
  ];

  return (
    <PageHeader
      title="Policies"
      description="Define policies with a set of rules for fine-grained access control."
      breadcrumbItems={breadcrumbItems}
    >
      <Button
        type="primary"
        icon={<Plus size={16} />}
        onClick={onAddPolicy}
        className="bg-blue-600 hover:bg-blue-700 h-9 px-6 rounded-lg font-semibold shadow-sm transition-all flex items-center gap-2"
      >
        Add Policy
      </Button>
    </PageHeader>
  );
}
