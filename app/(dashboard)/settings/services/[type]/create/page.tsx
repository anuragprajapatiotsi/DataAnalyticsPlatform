"use client";

import React from "react";
import { useParams, useRouter } from "next/navigation";
import { ServiceWizard } from "@/features/services/components/ServiceWizard";
import { PageHeader } from "@/shared/components/layout/PageHeader";
import { serviceService } from "@/features/services/services/service.service";
import { message } from "antd";
import { ServiceEndpointRequest } from "@/features/services/types";
import { api } from "@/shared/api/axios";

export default function CreateServicePage() {
  const params = useParams();
  const router = useRouter();
  const serviceType = params.type as string;

  const breadcrumbItems = [
    { label: "Settings", href: "/settings" },
    { label: "Services", href: "/settings/services" },
    { label: "Add Service", href: "/settings/services/add" },
    { 
      label: serviceType.charAt(0).toUpperCase() + serviceType.slice(1).replace(/-/g, " "), 
      href: `/settings/services/${serviceType}` 
    },
    { label: "Create Service" },
  ];

  const handleFinish = async (data: any) => {
    console.log("ServiceWizard onFinish data:", data);
    const hide = message.loading("Creating service endpoint...", 0);
    try {
      let payload: ServiceEndpointRequest;

      // If we have json_config, use it directly as the payload
      if (data.json_config) {
        try {
          const parsed = JSON.parse(data.json_config);
          
          // Construct the final payload for database
          payload = {
            ...parsed,
            // Ensure display_name and description from Basic Info step are preserved in extra
            extra: {
              ...(parsed.extra || {}),
              display_name: data.name || parsed.extra?.display_name,
              description: data.description || parsed.extra?.description,
            },
            internal_connection: true,
            auto_trigger_bots: false
          } as any;

        } catch (e) {
          throw new Error("Invalid JSON configuration");
        }
      } else {
        // Fallback for non-database/legacy flows
        const serviceSlug = data.integration_slug || serviceType;
        let baseUrl = data.host || data.baseUrl || data.path || "";
        
        const isDatabase = serviceType?.toLowerCase().includes("database");
        if (isDatabase && data.host && data.port) {
          let protocol = serviceSlug.toLowerCase();
          if (protocol === "postgres") protocol = "postgresql";
          if (protocol === "sqlserver") protocol = "mssql";
          baseUrl = `${protocol}://${data.host}:${data.port}`;
        }
        
        const internalCheck = (url: string) => {
          const lowerUrl = url.toLowerCase();
          return lowerUrl.includes("localhost") || 
                 lowerUrl.includes("127.0.0.1") || 
                 lowerUrl.startsWith("/") ||
                 lowerUrl.includes(".local");
        };

        const extra: any = {
          display_name: data.name,
          description: data.description,
        };

        if (isDatabase) {
          extra.user = data.username;
          extra.password = data.password;
          extra.database = data.database;
          extra.port = data.port;
        } else {
          Object.keys(data).forEach(key => {
            if (!['name', 'description', 'host', 'baseUrl', 'path'].includes(key)) {
              extra[key] = data[key];
            }
          });
        }

        payload = {
          service_name: serviceSlug,
          base_url: baseUrl,
          extra,
          internal_connection: internalCheck(baseUrl),
        } as any;
      }

      console.log("FINAL Payload to backend:", JSON.stringify(payload, null, 2));
      
      // Update the endpoint with ?name=primary
      const response = await api.post("/service-endpoints?name=primary", payload);
      const endpoint = response.data;
      hide();
      message.success("Service endpoint created successfully!");
      router.push("/settings/services");
    } catch (error: any) {
      hide();
      console.error("Failed to create service endpoint:", error);
      message.error(error.message || "Failed to create service endpoint. Please try again.");
    }
  };

  const handleCancel = () => {
    router.back();
  };

  return (
    <div className="flex flex-col space-y-4 animate-in fade-in duration-500 max-w-[1400px] mx-auto px-6 pt-2 pb-8">
      <PageHeader
        title={`Add New ${serviceType.charAt(0).toUpperCase() + serviceType.slice(1)} Service`}
        description={`Complete the steps below to connect and configure your ${serviceType} source.`}
        breadcrumbItems={breadcrumbItems}
      />

      <div className="flex-1">
        <ServiceWizard 
          serviceType={serviceType} 
          onFinish={handleFinish} 
          onCancel={handleCancel} 
        />
      </div>
    </div>
  );
}
