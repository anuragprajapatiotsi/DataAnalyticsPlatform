"use client";

import React, { useState } from "react";
import { Form, Input, InputNumber, Select, Button, message, Alert } from "antd";
import { Play, CheckCircle2 } from "lucide-react";
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
  const isDatabase = databaseKeywords.some((keyword) => {
    const lowerType = serviceType?.toLowerCase() || "";
    return (
      lowerType === keyword ||
      lowerType.includes(`${keyword} `) ||
      lowerType.includes(` ${keyword}`) ||
      lowerType.includes("database")
    );
  });
  const isApi = serviceType?.toLowerCase().includes("api");

  const jsonConfig = Form.useWatch("json_config", form);

  return (
    <div className="space-y-2 animate-in fade-in slide-in-from-bottom-1 duration-300">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight leading-tight">
            Connection Configuration
          </h2>
          <p className="text-slate-500 text-sm mt-1">
            {isDatabase
              ? `Edit the JSON request body to connect to your ${serviceType} instance.`
              : `Configure how we should securely connect to your ${serviceType} instance.`}
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
                      if (!parsed.base_url) {
                        missingFields.push("base_url");
                      } else {
                      const urlRegex = /^[a-z]+:\/\/[a-zA-Z0-9.-]+(:\d+)?$/;
                        if (!urlRegex.test(parsed.base_url)) {
                          return Promise.reject(
                            "base_url must be in format protocol://host:port",
                          );
                        }
                      }

                      if (!parsed.extra) {
                        missingFields.push("extra");
                      } else {
                        if (!parsed.extra.host)
                          missingFields.push("extra.host");
                        if (!parsed.extra.user && parsed.extra.user !== "")
                          missingFields.push("extra.user");
                        if (
                          !parsed.extra.password &&
                          parsed.extra.password !== ""
                        )
                          missingFields.push("extra.password");
                        if (
                          !parsed.extra.database &&
                          parsed.extra.database !== ""
                        )
                          missingFields.push("extra.database");
                        if (!parsed.extra.port)
                          missingFields.push("extra.port");

                        // Check for empty strings in required credentials
                        if (parsed.extra.user === "")
                          missingFields.push("extra.user (cannot be empty)");
                        if (parsed.extra.password === "")
                          missingFields.push(
                            "extra.password (cannot be empty)",
                          );
                        if (parsed.extra.database === "")
                          missingFields.push(
                            "extra.database (cannot be empty)",
                          );
                      }

                      if (missingFields.length > 0) {
                        return Promise.reject(
                          `Required fields: ${missingFields.join(", ")}`,
                        );
                      }

                      return Promise.resolve();
                    } catch (e) {
                      return Promise.reject("Invalid JSON format");
                    }
                  },
                },
              ]}
              className="mb-0"
              help={null}
              validateStatus={undefined}
              noStyle
            >
              {(() => {
                const fieldErrors = form.getFieldError("json_config");
                const hasFieldError = fieldErrors.length > 0;
                const hasConnectionError = testResult && !testResult.success;
                const showAnyError = hasFieldError || hasConnectionError;
                const showSuccess = !hasFieldError && testResult && testResult.success === true;

                return (
                  <div className="flex flex-col gap-3">
                    {/* Integrated Unified Error Message Above Editor */}
                    {showAnyError && (
                      <div className="bg-red-50 border border-red-200 rounded-xl p-4 animate-in fade-in slide-in-from-top-1 duration-200">
                        <div className="flex flex-col gap-2">
                          <div className="flex items-center gap-2 text-red-700">
                            <span className="text-[12px] font-bold uppercase tracking-tight">
                              {hasConnectionError ? "Connection Failed" : "Validation Error"}
                            </span>
                          </div>
                          <p className="text-[12px] text-red-600 leading-tight font-medium">
                            {hasConnectionError ? testResult.message : fieldErrors[0]}
                          </p>
                          {hasConnectionError && testResult.detail && (
                            <div className="p-2 bg-red-100/50 rounded font-mono text-[10px] break-all border border-red-200/50 mt-1 text-red-800">
                              {testResult.detail}
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Integrated Unified Success Message Above Editor */}
                    {showSuccess && (
                      <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 animate-in fade-in slide-in-from-top-1 duration-200">
                        <div className="flex items-center gap-2 text-emerald-700">
                          <CheckCircle2 size={16} className="shrink-0" />
                          <span className="text-[12px] font-bold uppercase tracking-tight">
                            Connection Successful
                          </span>
                        </div>
                        <p className="text-[12px] text-emerald-600 leading-tight font-medium mt-1">
                          {testResult.message || "Successfully connected to the service."}
                        </p>
                      </div>
                    )}

                    <div className={cn(
                      "border rounded-xl overflow-hidden bg-slate-950 transition-all duration-200 shadow-lg",
                      showAnyError 
                        ? "border-red-500 ring-2 ring-red-500/20 shadow-red-500/5" 
                        : showSuccess
                        ? "border-emerald-500 ring-2 ring-emerald-500/20 shadow-emerald-500/5"
                        : "border-slate-200 ring-1 ring-slate-800"
                    )}>
                      <Editor
                        height="350px"
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
                          renderLineHighlight: "all",
                          cursorBlinking: "smooth",
                          fixedOverflowWidgets: true,
                        }}
                        onChange={(value) => {
                          form.setFieldsValue({ json_config: value });
                          form.validateFields(["json_config"]);
                        }}
                      />
                    </div>
                  </div>
                );
              })()}
            </Form.Item>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50/50 p-6 rounded-xl border border-slate-100">
            {isApi && (
              <>
                <Form.Item
                  name="baseUrl"
                  label={
                    <span className="font-bold text-slate-700 text-xs uppercase tracking-wider">
                      Base URL
                    </span>
                  }
                  rules={[{ required: true, message: "Base URL is required" }]}
                  className="col-span-1 md:col-span-2"
                >
                  <Input
                    placeholder="https://api.service.com/v1"
                    className="h-10 rounded-lg border-slate-200 shadow-sm"
                  />
                </Form.Item>

                <Form.Item
                  name="authType"
                  label={
                    <span className="font-bold text-slate-700 text-xs uppercase tracking-wider">
                      Authentication Method
                    </span>
                  }
                  className="col-span-1 md:col-span-2"
                >
                  <Select className="h-10" placeholder="Select authentication">
                    <Select.Option value="none">
                      No Authentication
                    </Select.Option>
                    <Select.Option value="bearer">Bearer Token</Select.Option>
                    <Select.Option value="apikey">
                      API Key / Secret
                    </Select.Option>
                  </Select>
                </Form.Item>
              </>
            )}

            {!isDatabase && !isApi && (
              <Form.Item
                name="path"
                label={
                  <span className="font-bold text-slate-700 text-xs uppercase tracking-wider">
                    Root Path / Workspace ID
                  </span>
                }
                rules={[{ required: true, message: "Path is required" }]}
                className="col-span-1 md:col-span-2"
              >
                <Input
                  placeholder="/data/v1/storage"
                  className="h-10 rounded-lg border-slate-200 shadow-sm"
                />
              </Form.Item>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
