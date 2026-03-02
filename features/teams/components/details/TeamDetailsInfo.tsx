"use client";

import React, { useState } from "react";
import {
  Globe,
  User,
  Mail,
  CreditCard,
  Users,
  Layers,
  Edit3,
  Check,
  X,
  Plus,
} from "lucide-react";
import { Button, Input, Skeleton, Tooltip, Badge } from "antd";
import type { TeamDetail } from "../../types";

interface TeamDetailsInfoProps {
  team: TeamDetail;
  isAdmin: boolean;
  onUpdateDescription: (description: string) => void;
  isLoading?: boolean;
}

export function TeamDetailsInfo({
  team,
  isAdmin,
  onUpdateDescription,
  isLoading,
}: TeamDetailsInfoProps) {
  const [isEditingDesc, setIsEditingDesc] = useState(false);
  const [tempDesc, setTempDesc] = useState(team.description || "");

  const handleDescSave = () => {
    onUpdateDescription(tempDesc);
    setIsEditingDesc(false);
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
        {[...Array(6)].map((_, i) => (
          <Skeleton.Button key={i} active block className="h-24 rounded-xl" />
        ))}
      </div>
    );
  }

  const statCards = [
    {
      label: "Domains",
      value: team.domains?.length ? team.domains.join(", ") : "All Domains",
      icon: <Globe className="h-4 w-4 text-indigo-500" />,
    },
    {
      label: "Owners",
      value: team.owners?.length
        ? team.owners.map((o) => o.name).join(", ")
        : "No Owners",
      icon: <User className="h-4 w-4 text-amber-500" />,
    },
    {
      label: "Email",
      value: team.email || "No Email",
      icon: <Mail className="h-4 w-4 text-blue-500" />,
    },
    {
      label: "Subscription",
      value: team.subscription || "No Subscription",
      icon: <CreditCard className="h-4 w-4 text-emerald-500" />,
    },
    {
      label: "Team Type",
      value: team.team_type,
      icon: <Layers className="h-4 w-4 text-purple-500" />,
      isBadge: true,
    },
    {
      label: "Total Users",
      value: team.total_users || 0,
      icon: <Users className="h-4 w-4 text-rose-500" />,
    },
  ];

  return (
    <div className="flex flex-col gap-6 mb-10">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {statCards.map((card, index) => (
          <div
            key={index}
            className="flex flex-col gap-3 p-4 bg-white border border-slate-200 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300"
          >
            <div className="flex items-center gap-2 text-slate-500 font-medium text-[13px]">
              {card.icon}
              {card.label}
            </div>
            <div className="text-[15px] font-bold text-slate-900 truncate">
              {card.isBadge ? (
                <Badge className="bg-slate-100 text-slate-700 border-none px-2 py-0.5 capitalize">
                  {card.value}
                </Badge>
              ) : (
                card.value
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 bg-slate-50/50 border-b border-slate-100">
          <h3 className="text-[16px] font-bold text-slate-900 m-0">
            Description
          </h3>
          {isAdmin && !isEditingDesc && (
            <Button
              type="text"
              icon={<Edit3 className="h-4 w-4 text-blue-600" />}
              onClick={() => setIsEditingDesc(true)}
              className="text-blue-600 font-semibold hover:bg-blue-50"
            >
              Edit
            </Button>
          )}
        </div>
        <div className="p-6">
          {isEditingDesc ? (
            <div className="flex flex-col gap-4">
              <Input.TextArea
                value={tempDesc}
                onChange={(e) => setTempDesc(e.target.value)}
                rows={4}
                placeholder="Enter team description..."
                className="rounded-lg border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
              <div className="flex items-center justify-end gap-2">
                <Button
                  icon={<X className="h-4 w-4" />}
                  onClick={() => {
                    setIsEditingDesc(false);
                    setTempDesc(team.description || "");
                  }}
                  className="rounded-lg h-10 px-4"
                >
                  Cancel
                </Button>
                <Button
                  type="primary"
                  icon={<Check className="h-4 w-4" />}
                  onClick={handleDescSave}
                  className="bg-blue-600 hover:bg-blue-700 h-10 px-6 rounded-lg shadow-sm"
                >
                  Save Changes
                </Button>
              </div>
            </div>
          ) : (
            <p className="text-[14px] text-slate-600 leading-relaxed m-0 whitespace-pre-wrap">
              {team.description || "No description provided for this team."}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
