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

import { SettingsItem } from "@/shared/types";

interface ServiceWizardProps {
  serviceType: string;
  onFinish: (data: any) => void;
  onCancel: () => void;
}

interface StepItem {
  title: string;
  content: React.ReactNode;
  fields?: string[]; // Field names to validate for this step
}

export function ServiceWizard({ serviceType, onFinish, onCancel }: ServiceWizardProps) {
  const [form] = Form.useForm();
  const databaseKeywords = ["database", "databases", "postgres", "postgresql", "mysql", "mongodb", "redis", "sqlserver", "oracle", "mariadb", "sqlite"];
  const isDatabaseFlow = databaseKeywords.some(keyword => {
    const lowerType = serviceType.toLowerCase();
    // Match exact keyword or handle cases like "PostgreSQL Database"
    return lowerType === keyword || lowerType.includes(`${keyword} `) || lowerType.includes(` ${keyword}`) || lowerType.includes("database");
  });
  const [currentStep, setCurrentStep] = useState(0);
  const [isTestSuccessful, setIsTestSuccessful] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string; detail?: string } | null>(null);

  const integrationLabel = Form.useWatch("integration_label", form);
  
  // Early initialization for specific database types (skipping selection step)
  React.useEffect(() => {
    if (isDatabaseFlow && !form.getFieldValue("json_config")) {
      const lowerType = serviceType.toLowerCase();
      let protocol = lowerType.includes("postgres") ? "postgresql" : (lowerType.includes("mysql") ? "mysql" : lowerType);
      
      const defaultJson = JSON.stringify({
        service_name: lowerType,
        base_url: `${protocol}://host:5432`,
        extra: {
          host: "host",
          user: "",
          password: "",
          database: "",
          port: 5432
        },
        internal_connection: true,
        auto_trigger_bots: false
      }, null, 2);
      form.setFieldsValue({ json_config: defaultJson });
    }
  }, [isDatabaseFlow, serviceType, form]);

  const steps: StepItem[] = [];

  // Step 1: Selection (Only for databases)
  if (isDatabaseFlow) {
    steps.push({
      title: "Select Type",
      fields: ["db_id"],
      content: (
        <DatabaseSelectionStep
          form={form}
          onSelect={(db) => {
            const serviceName = db.slug;
            let protocol = serviceName.toLowerCase().includes("postgres") ? "postgresql" : (serviceName.toLowerCase().includes("mysql") ? "mysql" : serviceName.toLowerCase());
            
            const defaultJson = JSON.stringify({
              service_name: serviceName,
              base_url: `${protocol}://host:5432`,
              extra: {
                host: "host",
                user: "",
                password: "",
                database: "",
                port: 5432
              }
            }, null, 2);

            form.setFieldsValue({
              db_id: db.id,
              integration_slug: db.slug,
              service_name: db.slug,
              integration_label: db.display_label,
              json_config: defaultJson,
            });
            setIsTestSuccessful(false); // Reset test success when type changes
          }}
        />
      ),
    });
  }

  // Step: Basic Info
  steps.push({
    title: "Basic Info",
    fields: ["name", "description"],
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
    title: "Preview",
    content: <PreviewStep form={form} />,
  });

  const handleTestDatabaseConnection = async () => {
    try {
      setTesting(true);
      setTestResult(null);
      
      const jsonConfig = form.getFieldValue("json_config");
      await form.validateFields(["json_config"]);
      
      const parsed = JSON.parse(jsonConfig);
      const currentLabel = integrationLabel || serviceType;
      const driver = currentLabel.toLowerCase().includes("postgres") ? "postgres" : (currentLabel.toLowerCase().includes("mysql") ? "mysql" : currentLabel.toLowerCase());
      
      const testPayload = {
        service: parsed.service_name,
        service_type: "database",
        driver: driver,
        connection_object: {
          host: parsed.extra?.host || parsed.base_url.split("://")[1]?.split(":")[0] || "host",
          port: parsed.extra?.port,
          user: parsed.extra?.user,
          password: parsed.extra?.password,
          database: parsed.extra?.database
        }
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
        message.warning("Please test your connection successfully before proceeding.");
        return;
      }

      setCurrentStep((prev) => prev + 1);
    } catch (error: any) {
      // Log full error object for debugging
      console.error("Step validation failed detailed (JSON):", JSON.stringify(error, null, 2));
      console.error("Step validation failed full object:", error);
      
      // If error is from antd validation, it contains errorFields
      if (error?.errorFields?.length > 0) {
        message.error(`Please fix: ${error.errorFields[0].errors[0]}`);
      } else {
        message.error("Validation failed. Please check your inputs.");
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

  const nextButtonDisabled = isDatabaseFlow && currentStep === 2 && !isTestSuccessful;

  return (
    <Form
      form={form}
      layout="vertical"
      initialValues={{ type: serviceType }}
      preserve={true}
      requiredMark={false}
      className="max-w-5xl mx-auto space-y-4 pb-6"
    >
      {/* Hidden fields to preserve state and ensure registration across steps with rules */}
      <Form.Item name="json_config" noStyle hidden rules={[{ required: isDatabaseFlow, message: "JSON config is required" }]}><Input /></Form.Item>
      <Form.Item name="db_id" noStyle hidden rules={[{ required: isDatabaseFlow, message: "Selection is required" }]}><Input /></Form.Item>
      <Form.Item name="integration_slug" noStyle hidden><Input /></Form.Item>
      <Form.Item name="integration_label" noStyle hidden><Input /></Form.Item>

      <div className="px-4 md:px-0">
        <Steps
          current={currentStep}
          items={steps.map((item) => ({ title: item.title }))}
          className="mb-0 overflow-x-auto pb-2"
          responsive={true}
          size="small"
        />
      </div>

      <Card 
        className="border-slate-200 shadow-md rounded-lg overflow-hidden flex flex-col"
        styles={{ body: { padding: '0', display: 'flex', flexDirection: 'column', height: '100%', minHeight: '350px' } }}
      >
        <div 
          className="p-4 md:p-6 flex-1 overflow-y-auto min-h-0 custom-scrollbar"
          style={{ maxHeight: 'calc(100vh - 380px)' }}
        >
          {steps[currentStep].content}
        </div>

        <div className="bg-slate-50/50 border-t border-slate-100 p-3 md:px-6 flex flex-row justify-between items-center mt-auto shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
          <Button
            onClick={currentStep === 0 ? onCancel : handleBack}
            className="h-9 px-4 rounded-md font-semibold border-slate-200 text-slate-600 hover:text-slate-800 bg-white shadow-sm"
          >
            {currentStep === 0 ? "Cancel" : "Back"}
          </Button>

          <div className="flex gap-2">
            {isDatabaseFlow && currentStep === 2 && (
              <Button 
                onClick={handleTestDatabaseConnection}
                loading={testing}
                className="h-9 px-4 rounded-md font-bold border-blue-200 text-blue-600 hover:bg-blue-50 bg-white shadow-sm flex items-center gap-2"
              >
                {!testing && <Play size={14} className="fill-current" />}
                Test Connection
              </Button>
            )}

            {currentStep < steps.length - 1 ? (
              <Button
                type="primary"
                onClick={handleNext}
                disabled={nextButtonDisabled}
                className={`h-9 px-6 rounded-md font-bold flex items-center justify-center gap-2 shadow-sm ${
                  nextButtonDisabled ? "opacity-50" : "bg-blue-600 hover:bg-blue-700"
                }`}
              >
                Next
                <ChevronRight size={14} />
              </Button>
            ) : (
              <Button
                type="primary"
                onClick={handleSubmit}
                className="h-9 px-8 rounded-md font-bold bg-green-600 hover:bg-green-700 border-none flex items-center justify-center gap-2 shadow-md transition-all hover:scale-[1.02]"
              >
                Create
                <Check size={16} />
              </Button>
            )}
          </div>
        </div>
      </Card>
    </Form>
  );
}
