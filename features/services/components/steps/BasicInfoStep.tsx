"use client";

import React from "react";
import { Form, Input } from "antd";

interface BasicInfoStepProps {
  form: any;
}

export function BasicInfoStep({ form }: BasicInfoStepProps) {
  return (
    <div className="space-y-1 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div>
        <h2 className="text-lg font-bold text-slate-900 tracking-tight">
          Basic Information
        </h2>
        <p className="text-slate-500  text-sm">
          Give your service a recognizable name and a brief description.
        </p>
      </div>

      <div className="max-w-xl space-y-0.5 mt-2">
        <Form.Item
          name="service_name"
          label={
            <span className="font-bold text-slate-700 text-xs uppercase tracking-wider">
              Service Name
            </span>
          }
          rules={[{ required: true, message: "Please enter a service name" }]}
          className="mb-1"
        >
          <Input
            placeholder="e.g. Analytics Production DB"
            className="h-9 rounded-lg border-slate-200 focus:border-blue-500 text-sm"
          />
        </Form.Item>

        <Form.Item
          name="description"
          label={
            <span className="font-bold text-slate-700 text-xs uppercase tracking-wider">
              Description
            </span>
          }
          className="mb-0"
        >
          <Input.TextArea
            placeholder="What data does this service provide?"
            rows={2}
            className="rounded-lg border-slate-200 focus:border-blue-500 text-sm resize-none"
          />
        </Form.Item>
      </div>
    </div>
  );
}
