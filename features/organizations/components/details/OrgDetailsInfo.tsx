"use client";

import React from "react";
import {
  Globe,
  Mail,
  Shield,
  Calendar,
  Layers,
  CheckCircle2,
  XCircle,
  Star
} from "lucide-react";
import { Badge } from "antd";
import type { Organization } from "@/shared/types";

interface OrgDetailsInfoProps {
  organization: Organization;
  isLoading?: boolean;
}

export function OrgDetailsInfo({
  organization,
  isLoading,
}: OrgDetailsInfoProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-20 bg-slate-100 animate-pulse rounded-lg" />
        ))}
      </div>
    );
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "2-digit",
      year: "numeric",
    });
  };

  const statCards = [
    {
      label: "Slug",
      value: organization.slug,
      icon: <Layers className="h-3.5 w-3.5" />,
    },
    {
      label: "Contact Email",
      value: organization.contact_email || "N/A",
      icon: <Mail className="h-3.5 w-3.5" />,
    },
    {
      label: "Status",
      value: organization.is_active ? (
        <Badge status="success" text="Active" className="text-slate-900 font-bold" />
      ) : (
        <Badge status="error" text="Inactive" className="text-slate-900 font-bold" />
      ),
      icon: <Shield className="h-3.5 w-3.5" />,
    },
    {
      label: "Default Org",
      value: organization.is_default ? "Primary" : "Secondary",
      icon: <Star className="h-3.5 w-3.5" />,
    },
    {
      label: "Created",
      value: formatDate(organization.created_at),
      icon: <Calendar className="h-3.5 w-3.5" />,
    },
    {
      label: "Updated",
      value: formatDate(organization.updated_at),
      icon: <Calendar className="h-3.5 w-3.5" />,
    },
  ];

  return (
    <div className="flex flex-col gap-4 mb-6">
      <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
        <div className="px-5 py-4">
          {/* Main Info Grid - Unified 6-column grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-y-4 lg:gap-0 mb-4">
            {statCards.map((card, index) => (
              <div
                key={index}
                className={`flex flex-col min-w-0 ${
                  index < statCards.length - 1
                    ? "lg:border-r lg:border-slate-100 lg:pr-4 lg:mr-4"
                    : "pr-2"
                }`}
              >
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                  {card.icon}
                  {card.label}
                </span>
                <span className="text-[13px] font-bold text-slate-800 truncate" title={String(card.value)}>
                  {card.value}
                </span>
              </div>
            ))}
          </div>

          {/* Description Section - Tighter integration */}
          <div className="border-t border-slate-50 pt-3 mt-1">
             <div className="flex flex-col">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 block">Description</span>
                <p className="text-[13px] text-slate-600 font-medium leading-relaxed m-0 line-clamp-2 hover:line-clamp-none transition-all duration-300">
                  {organization.description || "No description provided for this organization."}
                </p>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
