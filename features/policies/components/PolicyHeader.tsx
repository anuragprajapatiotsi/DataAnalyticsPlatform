"use client";

import React from "react";
import { Button } from "antd";
import { Plus } from "lucide-react";
import Link from "next/link";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/shared/components/ui/breadcrumb";

interface PolicyHeaderProps {
  onAddPolicy: () => void;
}

export function PolicyHeader({ onAddPolicy }: PolicyHeaderProps) {
  return (
    <div className="flex flex-col gap-6 mb-8">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link
                href="/settings"
                className="hover:text-blue-600 transition-colors"
              >
                Settings
              </Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link
                href="/settings/access-control"
                className="hover:text-blue-600 transition-colors"
              >
                Access Control
              </Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage className="font-bold text-slate-900">
              Policies
            </BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-[28px] font-bold text-slate-900 m-0 leading-tight">
            Policies
          </h1>
          <p className="text-[14px] text-slate-500 font-medium">
            Define policies with a set of rules for fine-grained access control.
          </p>
        </div>

        <Button
          type="primary"
          icon={<Plus className="h-4 w-4" />}
          onClick={onAddPolicy}
          className="bg-blue-600 hover:bg-blue-700 h-11 px-6 rounded-lg font-bold shadow-sm transition-all flex items-center gap-2"
        >
          Add Policy
        </Button>
      </div>
    </div>
  );
}
