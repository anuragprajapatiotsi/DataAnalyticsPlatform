"use client";

import React, { useEffect, useRef, useState } from "react";
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
  const lastToastRef = useRef<string | null>(null);
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

  const hostFieldValue = Form.useWatch("host", form);
  const portFieldValue = Form.useWatch("port", form);
  const databaseFieldValue = Form.useWatch("database", form);

  const getPreviewUrl = () => {
    let protocol = serviceType?.toLowerCase().includes("postgres")
      ? "postgresql"
      : serviceType?.toLowerCase().includes("mysql")
        ? "mysql"
        : "database";

    return `${protocol}://${hostFieldValue || "host"}:${portFieldValue || "port"}/${databaseFieldValue || "database"}`;
  };

  useEffect(() => {
    if (!testResult) {
      lastToastRef.current = null;
      return;
    }

    const nextKey = `${testResult.success}-${testResult.message}-${testResult.detail || ""}`;
    if (lastToastRef.current === nextKey) {
      return;
    }

    lastToastRef.current = nextKey;

    if (testResult.success) {
      message.success(testResult.message || "Connection successful.");
      return;
    }

    message.error(testResult.detail || testResult.message || "Connection failed.");
  }, [testResult]);

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
            Database Connection
          </span>
        )}
      </div>

      <div className="mt-2">
        {isDatabase ? (
          <div className="flex flex-col gap-4">
            {testResult && (
              <div
                className={cn(
                  "border rounded-xl p-4 animate-in fade-in duration-200",
                  testResult.success
                    ? "bg-emerald-50 border-emerald-200"
                    : "bg-red-50 border-red-200",
                )}
              >
                <div
                  className={cn(
                    "flex items-center gap-2",
                    testResult.success ? "text-emerald-700" : "text-red-700",
                  )}
                >
                  {testResult.success && (
                    <CheckCircle2 size={16} className="shrink-0" />
                  )}
                  <span className="text-[12px] font-bold uppercase tracking-tight">
                    {testResult.success
                      ? "Connection Successful"
                      : "Connection Failed"}
                  </span>
                </div>
                <p
                  className={cn(
                    "text-[12px] leading-tight font-medium mt-1",
                    testResult.success ? "text-emerald-600" : "text-red-600",
                  )}
                >
                  {testResult.message}
                </p>
                {!testResult.success && testResult.detail && (
                  <div className="p-2 bg-red-100/50 rounded font-mono text-[10px] break-all border border-red-200/50 mt-2 text-red-800">
                    {testResult.detail}
                  </div>
                )}
              </div>
            )}

            <div className="bg-blue-50/50 border border-blue-100 rounded-lg p-4">
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-blue-600 uppercase tracking-wider mb-1">
                  Connection URL Preview
                </span>
                <span className="text-[13px] font-mono text-slate-700 bg-white p-2 rounded border border-blue-100 mt-1 truncate">
                  {getPreviewUrl()}
                </span>
                <span className="text-[11px] text-slate-500 mt-2 font-medium">
                  This connection string URL will be generated automatically on
                  submission based on your inputs.
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50/50 p-6 rounded-xl border border-slate-100">
              <Form.Item
                name="host"
                label={
                  <span className="font-bold text-slate-700 text-xs uppercase tracking-wider">
                    Host
                  </span>
                }
                rules={[{ required: true, message: "Host is required" }]}
                className="col-span-1"
              >
                <Input
                  placeholder="e.g. localhost, db.example.com"
                  className="h-10 border-slate-200 shadow-sm rounded-lg"
                />
              </Form.Item>

              <Form.Item
                name="port"
                label={
                  <span className="font-bold text-slate-700 text-xs uppercase tracking-wider">
                    Port
                  </span>
                }
                rules={[{ required: true, message: "Port is required" }]}
                className="col-span-1"
              >
                <InputNumber
                  className="w-full h-10 border-slate-200 shadow-sm rounded-lg"
                  controls={false}
                />
              </Form.Item>

              <Form.Item
                name="database"
                label={
                  <span className="font-bold text-slate-700 text-xs uppercase tracking-wider">
                    Database Name
                  </span>
                }
                rules={[
                  { required: true, message: "Database name is required" },
                ]}
                className="col-span-1 md:col-span-2"
              >
                <Input
                  placeholder="e.g. production_db"
                  className="h-10 border-slate-200 shadow-sm rounded-lg"
                />
              </Form.Item>

              <Form.Item
                name="user"
                label={
                  <span className="font-bold text-slate-700 text-xs uppercase tracking-wider">
                    Username{" "}
                  </span>
                }
                className="col-span-1"
              >
                <Input
                  placeholder="Database user"
                  className="h-10 border-slate-200 shadow-sm rounded-lg"
                />
              </Form.Item>

              <Form.Item
                name="password"
                label={
                  <span className="font-bold text-slate-700 text-xs uppercase tracking-wider">
                    Password{" "}
                  </span>
                }
                className="col-span-1"
              >
                <Input.Password
                  placeholder="Database password"
                  className="h-10 border-slate-200 shadow-sm rounded-lg"
                />
              </Form.Item>
            </div>
          </div>
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
