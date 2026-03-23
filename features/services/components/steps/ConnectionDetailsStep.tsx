"use client";

import React, { useState } from "react";
import { Form, Input, InputNumber, Select, Button, message, Alert } from "antd";
import { Play } from "lucide-react";
import Editor from "@monaco-editor/react";
import { serviceService } from "../../services/service.service";
import { cn } from "@/shared/utils/cn";

interface ConnectionDetailsStepProps {
  form: any;
  serviceType: string;
  onTestSuccess: () => void;
  testResult: { success: boolean; message: string; detail?: string } | null;
}

export function ConnectionDetailsStep({
  form,
  serviceType,
  onTestSuccess,
  testResult,
}: ConnectionDetailsStepProps) {
  const databaseKeywords = ["database", "databases", "postgres", "postgresql", "mysql", "mongodb", "redis", "sqlserver", "oracle", "mariadb", "sqlite"];
  const isDatabase = databaseKeywords.some(keyword => {
    const lowerType = serviceType?.toLowerCase() || "";
    return lowerType === keyword || lowerType.includes(`${keyword} `) || lowerType.includes(` ${keyword}`) || lowerType.includes("database");
  });
  const isApi = serviceType?.toLowerCase().includes("api");

  const jsonConfig = Form.useWatch("json_config", form);

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight leading-tight">Connection Configuration</h2>
          <p className="text-slate-500 text-sm mt-1">
            {isDatabase 
              ? `Edit the JSON request body to connect to your ${serviceType} instance.`
              : `Configure how we should securely connect to your ${serviceType} instance.`
            }
          </p>
        </div>
        {isDatabase && (
          <span className="text-[10px] font-bold bg-blue-50 text-blue-600 px-3 py-1 rounded-full uppercase tracking-wider border border-blue-100 shadow-sm">
            JSON Mode
          </span>
        )}
      </div>

      <div className="mt-2">
        {isDatabase ? (
          <div className="space-y-4">
            <Form.Item
              name="json_config"
              rules={[
                { required: true, message: "JSON configuration is required" },
                {
                  validator: (_, value) => {
                    try {
                      if (!value) return Promise.resolve();
                      const parsed = JSON.parse(value);
                      
                      const missingFields = [];
                      if (!parsed.service_name) missingFields.push("service_name");
                      if (!parsed.base_url) {
                        missingFields.push("base_url");
                      } else {
                        // Validate protocol://host:port format
                        const urlRegex = /^[a-z]+:\/\/[a-zA-Z0-9.-]+(:\d+)?$/;
                        if (!urlRegex.test(parsed.base_url)) {
                          return Promise.reject("base_url must be in format protocol://host:port");
                        }
                      }

                      if (!parsed.extra) {
                        missingFields.push("extra");
                      } else {
                        if (!parsed.extra.host) missingFields.push("extra.host");
                        if (!parsed.extra.user && parsed.extra.user !== "") missingFields.push("extra.user");
                        if (!parsed.extra.password && parsed.extra.password !== "") missingFields.push("extra.password");
                        if (!parsed.extra.database && parsed.extra.database !== "") missingFields.push("extra.database");
                        if (!parsed.extra.port) missingFields.push("extra.port");
                        
                        // Check for empty strings in required credentials
                        if (parsed.extra.user === "") missingFields.push("extra.user (cannot be empty)");
                        if (parsed.extra.password === "") missingFields.push("extra.password (cannot be empty)");
                        if (parsed.extra.database === "") missingFields.push("extra.database (cannot be empty)");
                      }

                      if (missingFields.length > 0) {
                        return Promise.reject(`Required fields: ${missingFields.join(", ")}`);
                      }
                      
                      return Promise.resolve();
                    } catch (e) {
                      return Promise.reject("Invalid JSON format");
                    }
                  }
                }
              ]}
              className="mb-0"
            >
              <div className="border border-slate-200 rounded-xl overflow-hidden bg-slate-950 shadow-lg ring-1 ring-slate-800">
                <Editor
                  height="320px"
                  defaultLanguage="json"
                  theme="vs-dark"
                  value={jsonConfig || "{}"}
                  options={{
                    minimap: { enabled: false },
                    fontSize: 13,
                    lineNumbers: "on",
                    scrollBeyondLastLine: false,
                    automaticLayout: true,
                    tabSize: 2,
                    formatOnPaste: true,
                    formatOnType: true,
                    padding: { top: 16, bottom: 16 },
                    renderLineHighlight: 'all',
                    cursorBlinking: 'smooth',
                  }}
                  onChange={(value) => form.setFieldsValue({ json_config: value })}
                />
              </div>
            </Form.Item>
            
            <p className="text-[11px] text-slate-400 italic px-1">
              * The values above will be sent exactly as represented to the service endpoint.
            </p>

            {testResult && (
              <Alert
                message={
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold uppercase tracking-tight">
                      {testResult.success ? "Connection Verified" : "Connection Failed"}
                    </span>
                  </div>
                }
                description={
                  <div className="mt-1 space-y-1">
                    <p className="text-xs leading-relaxed opacity-90">{testResult.message}</p>
                    {testResult.detail && (
                      <div className="p-2 bg-black/5 rounded font-mono text-[10px] break-all border border-black/5 mt-2">
                        {testResult.detail}
                      </div>
                    )}
                  </div>
                }
                type={testResult.success ? "success" : "error"}
                showIcon
                closable
                className={cn(
                  "p-3 rounded-xl border shadow-sm animate-in zoom-in-95 duration-200",
                  testResult.success ? "bg-green-50/50 border-green-200" : "bg-red-50/50 border-red-200"
                )}
              />
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50/50 p-6 rounded-xl border border-slate-100">
            {isApi && (
              <>
                <Form.Item
                  name="baseUrl"
                  label={<span className="font-bold text-slate-700 text-xs uppercase tracking-wider">Base URL</span>}
                  rules={[{ required: true, message: "Base URL is required" }]}
                  className="col-span-1 md:col-span-2"
                >
                  <Input placeholder="https://api.service.com/v1" className="h-10 rounded-lg border-slate-200 shadow-sm" />
                </Form.Item>

                <Form.Item
                  name="authType"
                  label={<span className="font-bold text-slate-700 text-xs uppercase tracking-wider">Authentication Method</span>}
                  className="col-span-1 md:col-span-2"
                >
                  <Select className="h-10" placeholder="Select authentication">
                    <Select.Option value="none">No Authentication</Select.Option>
                    <Select.Option value="bearer">Bearer Token</Select.Option>
                    <Select.Option value="apikey">API Key / Secret</Select.Option>
                  </Select>
                </Form.Item>
              </>
            )}

            {!isDatabase && !isApi && (
              <Form.Item
                name="path"
                label={<span className="font-bold text-slate-700 text-xs uppercase tracking-wider">Root Path / Workspace ID</span>}
                rules={[{ required: true, message: "Path is required" }]}
                className="col-span-1 md:col-span-2"
              >
                <Input placeholder="/data/v1/storage" className="h-10 rounded-lg border-slate-200 shadow-sm" />
              </Form.Item>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
