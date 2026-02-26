"use client";

import type { LucideIcon } from "lucide-react";

import Link from "next/link";
import { cn } from "@/utils/cn";

interface SettingsCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  iconColorClass: string;
  iconBgClass: string;
  href?: string;
}

export function SettingsCard({
  title,
  description,
  icon: Icon,
  iconColorClass,
  iconBgClass,
  href,
}: SettingsCardProps) {
  const content = (
    <div className="group flex cursor-pointer flex-row items-start gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-300 hover:shadow-md hover:border-slate-300 h-full">
      <div
        className={cn(
          "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition-all duration-300 group-hover:scale-105",
          iconBgClass,
          iconColorClass,
        )}
      >
        <Icon className="h-5 w-5" />
      </div>
      <div className="space-y-1.5 pt-0.5">
        <h3 className="text-[15px] font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
          {title}
        </h3>
        <p className="max-w-[240px] text-[13px] leading-relaxed text-slate-500 font-medium">
          {description}
        </p>
      </div>
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="block h-full">
        {content}
      </Link>
    );
  }

  return content;
}
