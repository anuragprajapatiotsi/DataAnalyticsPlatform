"use client";

import React, { useState } from "react";
import { Steps, Button, Card, Divider, message, Form, Input } from "antd";
import { ChevronRight, Check, Play } from "lucide-react";
import {
  DatabaseSelectionStep,
  BasicInfoStep,
  ConnectionDetailsStep,
  PreviewStep,
} from "./steps";
import { serviceService } from "../services/service.service";
import { cn } from "@/shared/utils/cn";
import { PageHeader, BreadcrumbItem } from "@/shared/components/layout/PageHeader";

import { SettingsItem } from "@/shared/types";

interface ServiceWizardProps {
  serviceType: string;
  onFinish: (data: any) => void;
  onCancel: () => void;
  title?: string;
  description?: string;
  breadcrumbItems?: BreadcrumbItem[];
}

interface StepItem {
  title: string;
  content: React.ReactNode;
  fields?: string[]; // Field names to validate for this step
}

export function ServiceWizard({
  serviceType,
  onFinish,
  onCancel,
  title,
  description,
  breadcrumbItems,
}: ServiceWizardProps) {
  const [form] = Form.useForm();
  const databaseKeywords = [
    "database",
    "databases",
    "postgres",
    "postgresql",
    "mysql",
    "mongodb",
    "redis",
    "sqlserver",
    "oracle",
    "mariadb",
    "sqlite",
  ];
  const isDatabaseFlow = databaseKeywords.some((keyword) => {
    const lowerType = serviceType.toLowerCase();
    // Match exact keyword or handle cases like "PostgreSQL Database"
    return (
      lowerType === keyword ||
      lowerType.includes(`${keyword} `) ||
      lowerType.includes(` ${keyword}`) ||
      lowerType.includes("database")
    );
  });
  const [currentStep, setCurrentStep] = useState(0);
  const [isTestSuccessful, setIsTestSuccessful] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    message: string;
    detail?: string;
  } | null>(null);

  const integrationLabel = Form.useWatch("integration_label", form);

  // Early initialization for specific database types (skipping selection step)
  React.useEffect(() => {
    if (isDatabaseFlow && !form.getFieldValue("json_config")) {
      const lowerType = serviceType.toLowerCase();
      let protocol = lowerType.includes("postgres")
        ? "postgresql"
        : lowerType.includes("mysql")
          ? "mysql"
          : lowerType;

      const defaultJson = JSON.stringify(
        {
          base_url: `${protocol}://host:5432`,
          extra: {
            host: "host",
            port: 5432,
            user: "",
            password: "",
            database: "",
          },
          internal_connection: true,
          auto_trigger_bots: false,
        },
        null,
        2,
      );
      form.setFieldsValue({
        json_config: defaultJson,
        service_name: lowerType, // Initialize for direct routes
        description: `Service for ${lowerType}`, // Initialize for direct routes
        integration_slug: lowerType, // Initialize for direct routes
      });
    }
  }, [isDatabaseFlow, serviceType, form]);

  const steps: StepItem[] = [];

  // Step 1: Selection (Only for databases)
  if (isDatabaseFlow) {
    steps.push({
      title: "Select Service Type",
      fields: ["db_id"],
      content: (
        <DatabaseSelectionStep
          form={form}
          onSelect={(db) => {
            const serviceName = db.slug;
            let protocol = serviceName.toLowerCase().includes("postgres")
              ? "postgresql"
              : serviceName.toLowerCase().includes("mysql")
                ? "mysql"
                : serviceName.toLowerCase();

            form.setFieldsValue({
              db_id: db.id,
              setting_node_id: db.id, // Explicitly capture for new contract
              integration_slug: db.slug,
              service_name: db.slug, // Source of truth from Step 1
              description: db.description || db.display_label, // Source of truth from Step 1
              integration_label: db.display_label,
              json_config: JSON.stringify(
                {
                  base_url: `${protocol}://host:5432`,
                  extra: {
                    host: "host",
                    port: 5432,
                    user: "",
                    password: "",
                    database: "",
                  },
                  internal_connection: true,
                  auto_trigger_bots: false,
                },
                null,
                2
              ),
            });
            setIsTestSuccessful(false); // Reset test success when type changes
          }}
        />
      ),
    });
  }

  // Step: Basic Info
  steps.push({
    title: "Configure Service",
    fields: ["service_name", "description"],
    content: <BasicInfoStep form={form} />,
  });

  // Step: Connection Details
  steps.push({
    title: "Connection Details",
    fields: isDatabaseFlow ? ["json_config"] : ["baseUrl", "path"],
    content: (
      <ConnectionDetailsStep
        form={form}
        serviceType={integrationLabel || serviceType}
        onTestSuccess={() => setIsTestSuccessful(true)}
        testResult={testResult}
      />
    ),
  });

  // Step: Preview
  steps.push({
    title: "Preview & Create",
    content: <PreviewStep form={form} />,
  });

  const handleTestDatabaseConnection = async () => {
    try {
      setTesting(true);
      setTestResult(null);

      const jsonConfig = form.getFieldValue("json_config");
      await form.validateFields(["json_config", "service_name"]);

      const parsed = JSON.parse(jsonConfig);
      const serviceName = form.getFieldValue("service_name") || serviceType;
      const integrationSlug = form.getFieldValue("integration_slug") || "";
      
      // Determine driver from service name or slug
      const driverSource = (integrationSlug || serviceName).toLowerCase();
      const driver = driverSource.includes("postgres")
        ? "postgres"
        : driverSource.includes("mysql")
          ? "mysql"
          : driverSource.includes("mssql") || driverSource.includes("sqlserver")
            ? "mssql"
            : driverSource;

      // Strict validation for required fields in connection_object
      if (!parsed.extra?.host) throw new Error("Database host is required for testing.");
      if (!parsed.extra?.port) throw new Error("Database port is required for testing.");
      if (!parsed.extra?.user) throw new Error("Database username is required for testing.");
      if (!parsed.extra?.password) throw new Error("Database password is required for testing.");
      if (!parsed.extra?.database) throw new Error("Database name is required for testing.");

      const testPayload = {
        service: serviceName,
        service_type: "database",
        driver: driver,
        connection_object: {
          host: parsed.extra.host,
          port: parsed.extra.port,
          user: parsed.extra.user,
          password: parsed.extra.password,
          database: parsed.extra.database,
        },
      };

      const result = await serviceService.testDatabaseConnection(testPayload);
      setTestResult(result);
      if (result.success) {
        setIsTestSuccessful(true);
        message.success(result.message);
      }
    } catch (error: any) {
      console.error("Test connection error:", error);
      message.error(error.message || "Please fix JSON errors before testing.");
    } finally {
      setTesting(false);
    }
  };

  const handleNext = async () => {
    try {
      // Validate only fields for the current step
      const fieldsToValidate = steps[currentStep].fields;
      if (fieldsToValidate) {
        await form.validateFields(fieldsToValidate);
      }
      // Additional check for database flow: must have tested connection
      // For databases, Connection Details is step 2 (Select -> Basic -> Connection)
      if (isDatabaseFlow && currentStep === 2 && !isTestSuccessful) {
        message.warning(
          "Please test your connection successfully before proceeding.",
        );
        return;
      }

      setCurrentStep((prev) => prev + 1);
    } catch (error: any) {
      // Log full error object for debugging
      console.error(
        "Step validation failed detailed (JSON):",
        JSON.stringify(error, null, 2),
      );
      console.error("Step validation failed full object:", error);

      // If error is from antd validation, it contains errorFields
      if (error?.errorFields?.length > 0) {
        const errorMsg = error.errorFields[0].errors[0];
        message.error(`Please fix: ${errorMsg}`);
      } else {
        message.error(error.message || "Validation failed. Please check your inputs.");
      }
    }
  };

  const handleBack = () => {
    setCurrentStep((prev) => prev - 1);
  };

  const handleSubmit = async () => {
    try {
      const validated = await form.validateFields();
      const allValues = form.getFieldsValue(true);
      onFinish({ ...allValues, ...validated });
    } catch (error: any) {
      console.error("Final submit validation failed:", error);
      message.error("Please fix the errors before submitting.");
    }
  };

  const nextButtonDisabled =
    isDatabaseFlow && currentStep === 2 && !isTestSuccessful;

  return (
    <Form
      form={form}
      layout="vertical"
      initialValues={{ type: serviceType }}
      preserve={true}
      requiredMark={false}
      className="max-w-4xl mx-auto space-y-6 pb-8 px-4 sm:px-6 lg:px-8"
    >
      {/* Hidden fields to preserve state and ensure registration across steps with rules */}
      <Form.Item
        name="json_config"
        noStyle
        hidden
        rules={[
          { required: isDatabaseFlow, message: "JSON config is required" },
        ]}
      >
        <Input />
      </Form.Item>
      <Form.Item
        name="db_id"
        noStyle
        hidden
        rules={[{ required: isDatabaseFlow, message: "Selection is required" }]}
      >
        <Input />
      </Form.Item>
      <Form.Item
        name="service_name"
        noStyle
        hidden
        rules={[
          { required: isDatabaseFlow, message: "Service name is required" },
        ]}
      >
        <Input />
      </Form.Item>
      <Form.Item name="setting_node_id" noStyle hidden>
        <Input />
      </Form.Item>
      <Form.Item name="description" noStyle hidden>
        <Input />
      </Form.Item>
      <Form.Item name="integration_slug" noStyle hidden>
        <Input />
      </Form.Item>
      <Form.Item name="integration_label" noStyle hidden>
        <Input />
      </Form.Item>

      <div className="bg-white border border-slate-200 shadow-xl rounded-2xl overflow-hidden flex flex-col h-[calc(100vh-120px)] max-h-[850px] min-h-[500px]">
        {/* Header Section (Breadcrumb + Title + Stepper) - Pinned */}
        <div className="shrink-0 pt-8 pb-6 px-8 border-b border-slate-100 bg-slate-50/30 flex flex-col gap-6">
          {(title || breadcrumbItems) && (
            <div className="text-left">
              <PageHeader
                title={title || ""}
                description={description || ""}
                breadcrumbItems={breadcrumbItems || []}
              />
            </div>
          )}

          <div className="w-full flex justify-center">
            <Steps
              current={currentStep}
              items={steps.map((item) => ({ title: item.title }))}
              className="w-full max-w-2xl custom-steps"
              responsive={true}
              size="small"
              titlePlacement="vertical"
            />
          </div>
        </div>

        {/* Scrollable Content Section */}
        <div className="flex-1 overflow-y-auto min-h-0 custom-scrollbar p-6 md:p-10">
          <div className="max-w-4xl mx-auto pb-24">
            {steps[currentStep].content}
          </div>
        </div>

        {/* Sticky Footer Section - Pinned */}
        <div className="shrink-0 bg-slate-50 border-t border-slate-200 p-5 md:px-10 flex flex-row justify-between items-center backdrop-blur-sm shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.03)] z-10">
          <Button
            onClick={currentStep === 0 ? onCancel : handleBack}
            className="h-11 px-8 rounded-xl font-semibold border-slate-300 text-slate-600 hover:text-slate-800 bg-white shadow-sm transition-all hover:border-slate-400 active:scale-95"
          >
            {currentStep === 0 ? "Cancel" : "Back"}
          </Button>

          <div className="flex gap-4">
            {isDatabaseFlow && currentStep === 2 && (
              <Button
                onClick={handleTestDatabaseConnection}
                loading={testing}
                className="h-11 px-6 rounded-xl font-bold border-blue-200 text-blue-600 hover:bg-blue-50 bg-white shadow-sm flex items-center gap-2 transition-all hover:border-blue-300 active:scale-95"
              >
                {!testing && <Play size={16} className="fill-current" />}
                Test Connection
              </Button>
            )}

            {currentStep < steps.length - 1 ? (
              <Button
                type="primary"
                onClick={handleNext}
                disabled={nextButtonDisabled}
                className={cn(
                  "h-11 px-10 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-blue-500/10 transition-all active:scale-95",
                  nextButtonDisabled
                    ? "opacity-50"
                    : "bg-blue-600 hover:bg-blue-700 border-none"
                )}
              >
                Next Step
                <ChevronRight size={18} />
              </Button>
            ) : (
              <Button
                type="primary"
                onClick={handleSubmit}
                className="h-11 px-12 rounded-xl font-bold bg-green-600 hover:bg-green-700 border-none flex items-center justify-center gap-2 shadow-lg shadow-green-500/10 transition-all hover:scale-[1.02] active:scale-95"
              >
                Create Service
                <Check size={20} />
              </Button>
            )}
          </div>
        </div>
      </div>
    </Form>
  );
}
