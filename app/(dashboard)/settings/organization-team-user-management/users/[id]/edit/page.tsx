"use client";

import React from "react";
import { useParams } from "next/navigation";
import { Card } from "@/shared/components/ui/card";
import { PageHeader } from "@/shared/components/layout/PageHeader";
import { useUser } from "@/features/users/hooks/useUser";
import { EditUserForm } from "@/features/users/components/EditUserForm";
import { Skeleton } from "@/shared/components/ui/skeleton";

export default function EditUserPage() {
  const { id } = useParams() as { id: string };
  const { data: user, isLoading } = useUser(id);

  const breadcrumbItems = [
    { label: "Settings", href: "/settings" },
    {
      label: "Team & User Management",
      href: "/settings/organization-team-user-management",
    },
    {
      label: "Users",
      href: "/settings/organization-team-user-management/users",
    },
    { label: "Edit User" },
  ];

  return (
    <div className="flex flex-col space-y-6 animate-in fade-in duration-500 max-w-[1200px] mx-auto">
      <PageHeader
        title="Edit User"
        description="Modify user details and access permissions."
        breadcrumbItems={breadcrumbItems}
      />

      <Card className="rounded-lg border border-slate-200 bg-white shadow-sm p-6">
        {isLoading ? (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
            </div>
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        ) : user ? (
          <EditUserForm user={user} />
        ) : (
          <div className="text-center py-12">
            <p className="text-slate-500">User not found</p>
          </div>
        )}
      </Card>
    </div>
  );
}
