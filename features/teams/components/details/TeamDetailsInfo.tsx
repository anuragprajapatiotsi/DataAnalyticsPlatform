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
      value: team.domains?.length ? team.domains.join(", ") : "No Domains",
      icon: <Globe className="h-4 w-4 text-slate-400" />,
    },
    {
      label: "Owners",
      value: team.owners?.length
        ? team.owners.map((o) => o.name).join(", ")
        : "No Owners",
      icon: <User className="h-4 w-4 text-slate-400" />,
    },
    {
      label: "Email",
      value: team.email || "No Email",
      icon: <Mail className="h-4 w-4 text-slate-400" />,
    },
    {
      label: "Subscription",
      value: team.subscription || "No Subscription",
      icon: <CreditCard className="h-4 w-4 text-slate-400" />,
    },
    {
      label: "Type",
      value: team.team_type || "Group",
      icon: <Layers className="h-4 w-4 text-slate-400" />,
    },
    {
      label: "Users",
      value: team.total_users || 0,
      icon: <Users className="h-4 w-4 text-slate-400" />,
    },
  ];

  return (
    <div className="flex flex-col gap-6 mb-8">
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden animate-in fade-in slide-in-from-top-4 duration-700">
        <div className="p-8">
          <div className="flex items-start justify-between mb-8">
            <div className="flex flex-col gap-6 w-full">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
                {statCards.map((card, index) => (
                  <div key={index} className="flex flex-col gap-1.5 min-w-0">
                    <div className="flex items-center gap-2 text-slate-500 font-semibold text-[11px] uppercase tracking-wider">
                      {card.icon}
                      {card.label}
                    </div>
                    <div
                      className="text-[14px] font-bold text-slate-900 truncate"
                      title={String(card.value)}
                    >
                      {card.value}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <Button className="ml-4 h-10 px-6 rounded-lg font-bold text-slate-600 border-slate-200 hover:text-red-600 hover:border-red-200 hover:bg-red-50 transition-all duration-300">
              Leave Team
            </Button>
          </div>

          <div className="border-t border-slate-100 pt-8 mt-2">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-[14px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <Edit3 className="h-3.5 w-3.5" />
                Description
              </h4>
              {isAdmin && !isEditingDesc && (
                <Button
                  type="text"
                  icon={<Edit3 className="h-3.5 w-3.5" />}
                  onClick={() => setIsEditingDesc(true)}
                  className="text-blue-600 font-bold hover:bg-blue-50 text-[13px] h-auto py-1"
                >
                  Edit
                </Button>
              )}
            </div>

            {isEditingDesc ? (
              <div className="flex flex-col gap-4 animate-in fade-in duration-300">
                <Input.TextArea
                  value={tempDesc}
                  onChange={(e) => setTempDesc(e.target.value)}
                  rows={4}
                  placeholder="Enter team description..."
                  className="rounded-xl border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 p-4 text-[14px]"
                />
                <div className="flex items-center justify-end gap-2">
                  <Button
                    onClick={() => {
                      setIsEditingDesc(false);
                      setTempDesc(team.description || "");
                    }}
                    className="rounded-lg h-10 px-6 font-semibold"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="primary"
                    icon={<Check className="h-4 w-4" />}
                    onClick={handleDescSave}
                    className="bg-blue-600 hover:bg-blue-700 h-10 px-8 rounded-lg shadow-md font-bold transition-all hover:scale-[1.02]"
                  >
                    Save Changes
                  </Button>
                </div>
              </div>
            ) : (
              <p className="text-[15px] text-slate-600 leading-relaxed m-0 whitespace-pre-wrap max-w-4xl font-medium">
                {team.description ||
                  "No description provided for this team. Click edit to add one."}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
