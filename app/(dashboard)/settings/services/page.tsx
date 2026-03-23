"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/shared/components/layout/PageHeader";
import { ServiceHeader, ServiceTable } from "@/features/services/components";
import { useServices } from "@/features/services/hooks/useServices";
import { GetServicesParams, Service } from "@/features/services/types";
import { message, Modal } from "antd";
import { serviceService } from "@/features/services/services/service.service";

export default function ServicesPage() {
  const router = useRouter();
  const [params, setParams] = useState<GetServicesParams>({
    skip: 0,
    limit: 50,
  });

  const { data, isLoading } = useServices(params);

  const handleSearchChange = (search: string) => {
    setParams((prev) => ({ ...prev, search, skip: 0 }));
  };

  const handleAddClick = () => {
    // Navigate to the category selection page (we previously moved it to add-service.tsx)
    // Actually, let's just use the catch-all for now or create a specific page.
    // I will create /settings/services/add/page.tsx with the category selection logic.
    router.push("/settings/services/add");
  };

  const handleEdit = (service: Service) => {
    // Edit logic
    message.info(`Editing ${service.display_label} coming soon`);
  };

  const handleDelete = (id: string) => {
    Modal.confirm({
      title: "Are you sure you want to delete this service?",
      content: "This action cannot be undone.",
      okText: "Delete",
      okType: "danger",
      onOk: async () => {
        try {
          await serviceService.deleteService(id);
          message.success("Service deleted successfully");
          // Refresh data (handled by react-query window focus or we can invalidate)
        } catch (error) {
          message.error("Failed to delete service");
        }
      },
    });
  };

  const handleTest = async (id: string) => {
    const hide = message.loading("Testing connection...", 0);
    try {
      const result = await serviceService.testConnection(id);
      hide();
      if (result.success) {
        message.success(result.message || "Connection successful!");
      } else {
        message.error(result.message || "Connection failed");
      }
    } catch (error) {
      hide();
      message.error("Failed to test connection");
    }
  };

  const breadcrumbItems = [
    { label: "Settings", href: "/settings" },
    { label: "Services" },
  ];

  return (
    <div className="flex flex-col space-y-6 animate-in fade-in duration-500 max-w-[1400px] mx-auto px-6 pt-2 pb-20">
      <PageHeader
        title="Services"
        description="Connect and manage your data sources and integrations."
        breadcrumbItems={breadcrumbItems}
      />

      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <ServiceHeader 
          onSearchChange={handleSearchChange} 
          onAddClick={handleAddClick} 
        />
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <ServiceTable
          services={data?.data || []}
          isLoading={isLoading}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onTest={handleTest}
        />
      </div>
    </div>
  );
}
