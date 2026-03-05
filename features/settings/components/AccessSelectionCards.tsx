"use client";

import React from "react";
import { Users2, User, UserCog } from "lucide-react";
import { Card } from "@/shared/components/ui/card";
import { cn } from "@/shared/utils/cn";

interface SelectionCardProps {
  title: string;
  description: string;
  icon: React.ElementType;
  active?: boolean;
  onClick: () => void;
}

function SelectionCard({
  title,
  description,
  icon: Icon,
  active,
  onClick,
}: SelectionCardProps) {
  return (
    <Card
      className={cn(
        "group flex cursor-pointer flex-row items-start gap-4 rounded-lg border border-slate-200 p-6 transition-all duration-300 hover:shadow-md bg-white",
        active
          ? "border-blue-500 ring-1 ring-blue-500 shadow-sm"
          : "hover:border-slate-300",
      )}
      onClick={onClick}
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600 transition-all duration-300 group-hover:scale-105 border border-blue-100">
        <Icon size={18} />
      </div>
      <div className="space-y-1.5 pt-0.5">
        <h3
          className={cn(
            "text-[1px] font-semibold transition-colors",
            active
              ? "text-blue-600"
              : "text-slate-900 group-hover:text-blue-600",
          )}
        >
          {title}
        </h3>
        <p className="max-w-[280px] text-[13px] leading-relaxed text-slate-500 font-medium line-clamp-2">
          {description}
        </p>
      </div>
    </Card>
  );
}

import { useRouter } from "next/navigation";

interface AccessSelectionCardsProps {
  activeSection: string;
}

export function AccessSelectionCards({
  activeSection,
}: AccessSelectionCardsProps) {
  const router = useRouter();

  const sections = [
    {
      id: "organization",
      title: "Organization",
      description: "Manage your enterprise organization details and settings.",
      icon: Users2,
    },
    {
      id: "teams",
      title: "Teams",
      description: "Represent your entire organizational structure with ease.",
      icon: Users2,
    },
    {
      id: "users",
      title: "Users",
      description:
        "View and manage regular users in your organization. Full access controls.",
      icon: User,
    },
    {
      id: "admin",
      title: "Admins",
      description:
        "View and manage admin users in your organization. For advanced controls.",
      icon: UserCog,
    },
  ];

  const handleNavigation = (id: string) => {
    const path =
      id === "organization" ? "organizations" : id === "admin" ? "admins" : id;
    router.push(`/settings/organization-team-user-management/${path}`);
  };

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
      {sections.map((section) => (
        <SelectionCard
          key={section.id}
          title={section.title}
          description={section.description}
          icon={section.icon}
          active={activeSection === section.id}
          onClick={() => handleNavigation(section.id)}
        />
      ))}
    </div>
  );
}
