"use client";

import Link from "next/link";
import { useRoles } from "@/features/roles/hooks/useRoles";
import { RolesTable } from "@/features/roles/components/RolesTable";
import { Layout } from "lucide-react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/shared/components/ui/breadcrumb";

export default function RolesPage() {
  const { data, isLoading } = useRoles({ skip: 0, limit: 10 });

  return (
    <div className="flex flex-col gap-6 p-8 pb-20 animate-in fade-in duration-500">
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
                Roles
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="flex flex-col gap-1">
          <h1 className="text-[28px] font-bold text-slate-900 m-0 leading-tight">
            Roles
          </h1>
          <p className="text-[14px] text-slate-500 font-medium max-w-2xl">
            Define and manage user roles to control access levels across your
            organization.
          </p>
        </div>
      </div>

      <RolesTable roles={data?.data || []} isLoading={isLoading} />
    </div>
  );
}
