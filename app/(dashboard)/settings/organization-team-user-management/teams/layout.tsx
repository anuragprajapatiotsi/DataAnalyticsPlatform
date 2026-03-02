"use client";

import React from "react";
import { TeamsTabs } from "@/features/teams/components/TeamsTabs";
import { useAuthContext } from "@/context/auth-context";

export default function TeamsSectionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useAuthContext();
  const isAdmin = !!(user?.is_admin || user?.is_global_admin);

  return (
    <div className="flex flex-col animate-in fade-in duration-500">
      <TeamsTabs isAdmin={isAdmin} />
      <div className="flex-1">{children}</div>
    </div>
  );
}
