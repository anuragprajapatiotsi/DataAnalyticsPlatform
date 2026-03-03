"use client";

import React from "react";
import Link from "next/link";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/shared/components/ui/breadcrumb";
import { Role } from "../../types";
import { Skeleton } from "@/shared/components/ui/skeleton";

interface RoleDetailsHeaderProps {
  role?: Role;
  isLoading: boolean;
}

export function RoleDetailsHeader({ role, isLoading }: RoleDetailsHeaderProps) {
  if (isLoading) {
    return (
      <div className="flex flex-col gap-6 mb-8">
        <div className="h-5 w-48 bg-slate-100 animate-pulse rounded" />
        <div className="flex flex-col gap-2">
          <div className="h-10 w-64 bg-slate-100 animate-pulse rounded" />
          <div className="h-5 w-full max-w-2xl bg-slate-100 animate-pulse rounded" />
        </div>
      </div>
    );
  }

  if (!role) return null;

  return (
    <div className="flex flex-col gap-6 mb-10">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link
                href="/settings"
                className="hover:text-blue-600 transition-colors capitalize"
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
                className="hover:text-blue-600 transition-colors capitalize"
              >
                Access Control
              </Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link
                href="/settings/access-control/roles"
                className="hover:text-blue-600 transition-colors capitalize"
              >
                Roles
              </Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage className="font-bold text-slate-900">
              {role.name}
            </BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="flex flex-col gap-1.5">
        <h1 className="text-[32px] font-extrabold text-slate-900 tracking-tight leading-tight m-0">
          {role.name}
        </h1>
        <p className="text-[15px] text-slate-500 font-medium max-w-3xl leading-relaxed m-0">
          {role.description || "No description provided for this role."}
        </p>
      </div>
    </div>
  );
}
