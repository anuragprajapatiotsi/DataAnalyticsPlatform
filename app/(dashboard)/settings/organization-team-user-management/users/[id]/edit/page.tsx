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
    <div className="flex flex-col space-y-4 animate-in fade-in duration-300 max-w-[1100px] mx-auto">

      <PageHeader
        title="Edit User"
        description="Modify user details and access permissions."
        breadcrumbItems={breadcrumbItems}
      />

      <Card className="rounded-lg border border-slate-200 bg-white shadow-sm p-5">

        {isLoading ? (
          <div className="space-y-4">

            <div className="grid grid-cols-2 gap-x-4 gap-y-2">
              <Skeleton className="h-14 w-full" />
              <Skeleton className="h-14 w-full" />
              <Skeleton className="h-14 w-full" />
              <Skeleton className="h-14 w-full" />
            </div>

            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />

          </div>
        ) : user ? (
          <EditUserForm user={user} />
        ) : (
          <div className="text-center py-8">
            <p className="text-sm text-slate-500">User not found</p>
          </div>
        )}

      </Card>
    </div>
  );
}