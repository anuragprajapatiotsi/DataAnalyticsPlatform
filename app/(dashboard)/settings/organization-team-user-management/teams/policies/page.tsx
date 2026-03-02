"use client";

import React from "react";
import { PoliciesList } from "@/features/teams/components/PoliciesList";
import { useAuthContext } from "@/context/auth-context";
import { redirect } from "next/navigation";

export default function PoliciesPage() {
  const { user, isLoading } = useAuthContext();
  const isAdmin = !!(user?.is_admin || user?.is_global_admin);

  if (!isLoading && !isAdmin) {
    redirect("/settings/organization-team-user-management/teams");
  }

  return <PoliciesList />;
}
