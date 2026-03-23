"use client";

import React from "react";
import { useParams, useRouter } from "next/navigation";
import { ServiceWizard } from "@/features/services/components/ServiceWizard";
import { PageHeader, BreadcrumbItem } from "@/shared/components/layout/PageHeader";
import { serviceService } from "@/features/services/services/service.service";
import { message } from "antd";
import { ServiceEndpointRequest } from "@/features/services/types";
import { api } from "@/shared/api/axios";

export default function AddServicePage() {
  const params = useParams();
  const router = useRouter();
  const categorySlug = params.category as string;

  const breadcrumbItems: BreadcrumbItem[] = [
    { label: "Settings", href: "/settings" },
    { label: "Services", href: "/settings/services" },
    { 
      label: categorySlug.charAt(0).toUpperCase() + categorySlug.slice(1).replace(/-/g, " "), 
      href: `/settings/services/${categorySlug}` 
    },
    { label: "Add Service" },
  ];

  const handleFinish = async (data: any) => {
    console.log("ServiceWizard onFinish raw data:", data);
    const hide = message.loading("Creating service endpoint...", 0);
    try {
      // Align database detection with ServiceWizard keywords
      const databaseKeywords = ["database", "databases", "postgres", "postgresql", "mysql", "mongodb", "redis", "sqlserver", "oracle", "mariadb", "sqlite"];
      const isDatabase = databaseKeywords.some(kw => categorySlug.toLowerCase().includes(kw));

      let payload: any = {};

      if (isDatabase && data.json_config) {
        // DATABASE FLOW - NEW API CONTRACT - STRICT CONTAINMENT
        try {
          const parsed = JSON.parse(data.json_config);

          // Validation for required fields
          if (!parsed.base_url) throw new Error("Connection URL (base_url) is required.");
          if (!parsed.extra?.host) throw new Error("Database host is required.");
          if (!parsed.extra?.port) throw new Error("Database port is required.");
          if (!parsed.extra?.user) throw new Error("Database username is required.");
          if (!parsed.extra?.password) throw new Error("Database password is required.");
          if (!parsed.extra?.database) throw new Error("Database name is required.");

          // EXPLICIT ROOT FIELDS ONLY - No spreading!
          payload = {
            service_name: data.service_name || categorySlug,
            description: data.service_description || data.description || "",
            base_url: parsed.base_url,
            extra: parsed.extra,
            internal_connection: parsed.internal_connection ?? true,
            auto_trigger_bots: parsed.auto_trigger_bots ?? false,
            setting_node_id: data.setting_node_id || null,
          };
        } catch (e: any) {
          throw new Error(e.message || "Invalid JSON configuration.");
        }
      } else {
        // NON-DATABASE OR LEGACY FLOW - STRICT CONTAINMENT
        const serviceName = data.service_name || data.integration_slug || categorySlug;
        const description = data.service_description || data.description || "";
        const baseUrl = data.host || data.baseUrl || data.path || "";
        
        const internalCheck = (url: string) => {
          const lowerUrl = url.toLowerCase();
          return (
            lowerUrl.includes("localhost") ||
            lowerUrl.includes("127.0.0.1") ||
            lowerUrl.startsWith("/") ||
            lowerUrl.includes(".local")
          );
        };

        const extra: any = {};
        
        // Transfer all other fields to extra, EXCLUDING restricted root fields
        const restricted = ['name', 'description', 'host', 'baseUrl', 'path', 'integration_slug', 'integration_label', 'type', 'json_config', 'service_name', 'service_description', 'setting_node_id', 'port', 'user', 'password', 'database', 'username', 'password'];
        
        Object.keys(data).forEach((key) => {
          if (!restricted.includes(key) && data[key] !== undefined) {
            extra[key] = data[key];
          }
        });

        // Still add a description if available
        if (description) extra.description = description;

        // EXPLICIT ROOT FIELDS ONLY
        payload = {
          service_name: serviceName,
          base_url: baseUrl,
          description: description,
          extra,
          internal_connection: internalCheck(baseUrl),
          auto_trigger_bots: false,
          setting_node_id: data.setting_node_id || null
        };
      }

      console.log("CRITICAL: Final Payload to backend:", JSON.stringify(payload, null, 2));

      await api.post("/service-endpoints?name=primary", payload);
      hide();
      message.success("Service endpoint created successfully!");
      router.push(`/settings/services/${categorySlug}`);
    } catch (error: any) {
      hide();
      console.error("Failed to create service endpoint:", error);
      message.error(error.message || "Failed to create service endpoint. Please try again.");
    }
  };

  const handleCancel = () => {
    router.back();
  };

  const displayTitle = categorySlug.charAt(0).toUpperCase() + categorySlug.slice(1).replace(/-/g, " ");

  return (
    <div className="animate-in fade-in duration-500 py-6 max-w-4xl mx-auto ">
      <ServiceWizard
        serviceType={categorySlug}
        onFinish={handleFinish}
        onCancel={handleCancel}
        title={`Add New ${displayTitle}`}
        description={`Complete the steps below to connect and configure your ${categorySlug} source.`}
        breadcrumbItems={breadcrumbItems}
      />
    </div>
  );
}
