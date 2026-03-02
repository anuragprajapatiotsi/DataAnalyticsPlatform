"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { AccessSelectionCards } from "@/components/settings/AccessSelectionCards";

export default function OrganizationManagementLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  // Helper to get active section from URL
  const getActiveSection = () => {
    if (pathname.includes("/organizations")) return "organization";
    if (pathname.includes("/teams")) return "teams";
    if (pathname.includes("/users")) return "users";
    if (pathname.includes("/admins")) return "admin";
    return "organization";
  };

  // Helper to get section label for breadcrumb
  const getSectionLabel = () => {
    const section = getActiveSection();
    switch (section) {
      case "organization":
        return "Organizations";
      case "teams":
        return "Teams";
      case "users":
        return "Users";
      case "admin":
        return "Admins";
      default:
        return "";
    }
  };

  return (
    <div className="h-full overflow-y-auto p-6 pb-20 custom-scrollbar animate-in fade-in duration-500">
      <div className="w-full">
        <div className="mb-10">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link href="/settings">Settings</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link href="/settings/organization-team-user-management">
                    Team & User Management
                  </Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              {pathname !== "/settings/organization-team-user-management" && (
                <>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <BreadcrumbPage>{getSectionLabel()}</BreadcrumbPage>
                  </BreadcrumbItem>
                </>
              )}
            </BreadcrumbList>
          </Breadcrumb>

          {pathname === "/settings/organization-team-user-management" ||
          pathname === "/settings/organization-team-user-management/teams" ||
          pathname ===
            "/settings/organization-team-user-management/organizations" ||
          pathname === "/settings/organization-team-user-management/users" ||
          pathname === "/settings/organization-team-user-management/admins" ? (
            <div className="mt-8">
              <h1 className="text-[24px] font-bold text-slate-900 mb-1">
                Team & User Management
              </h1>
              <p className="text-[14px] text-slate-500">
                Streamline access to users and teams in OpenMetadata.
              </p>
            </div>
          ) : null}
        </div>

        <div className="mt-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
          {children}
        </div>
      </div>
    </div>
  );
}
