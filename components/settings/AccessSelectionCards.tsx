"use client";

import React from "react";
import { Users2, User, UserCog } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/utils/cn";

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
        "group flex cursor-pointer flex-row items-start gap-4 rounded-2xl border border-slate-200 p-5 transition-all duration-300 hover:shadow-md",
        active
          ? "border-blue-500 ring-1 ring-blue-500"
          : "hover:border-slate-300",
      )}
      onClick={onClick}
    >
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#faf5ff] text-pink-500 transition-all duration-300 group-hover:scale-105">
        <Icon className="h-5 w-5" />
      </div>
      <div className="space-y-1.5 pt-0.5">
        <h3
          className={cn(
            "text-[15px] font-semibold transition-colors",
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

interface AccessSelectionCardsProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
}

export function AccessSelectionCards({
  activeSection,
  onSectionChange,
}: AccessSelectionCardsProps) {
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

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-3 mb-10">
      {sections.map((section) => (
        <SelectionCard
          key={section.id}
          title={section.title}
          description={section.description}
          icon={section.icon}
          active={activeSection === section.id}
          onClick={() => onSectionChange(section.id)}
        />
      ))}
    </div>
  );
}
