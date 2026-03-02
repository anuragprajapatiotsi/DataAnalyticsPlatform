"use client";

import React from "react";
import { Users, FileBox, Shield, FileText } from "lucide-react";
import { Tabs } from "antd";
import { cn } from "@/utils/cn";

export type TeamTabKey = "users" | "assets" | "roles" | "policies";

interface TeamDetailsTabsProps {
  activeTab: TeamTabKey;
  onTabChange: (key: TeamTabKey) => void;
  isAdmin: boolean;
  counts: {
    users: number;
    assets: number;
    roles: number;
    policies: number;
  };
}

export function TeamDetailsTabs({
  activeTab,
  onTabChange,
  isAdmin,
  counts,
}: TeamDetailsTabsProps) {
  const items = [
    {
      key: "users",
      label: (
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4" />
          <span>Users</span>
          <span className="bg-slate-100 text-slate-500 rounded-full px-2 py-0.5 text-[12px] font-bold">
            {counts.users}
          </span>
        </div>
      ),
    },
    {
      key: "assets",
      label: (
        <div className="flex items-center gap-2">
          <FileBox className="h-4 w-4" />
          <span>Assets</span>
          <span className="bg-slate-100 text-slate-500 rounded-full px-2 py-0.5 text-[12px] font-bold">
            {counts.assets}
          </span>
        </div>
      ),
    },
    {
      key: "roles",
      label: (
        <div className="flex items-center gap-2">
          <Shield className="h-4 w-4" />
          <span>Roles</span>
          <span className="bg-slate-100 text-slate-500 rounded-full px-2 py-0.5 text-[12px] font-bold">
            {counts.roles}
          </span>
        </div>
      ),
    },
    {
      key: "policies",
      label: (
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4" />
          <span>Policies</span>
          <span className="bg-slate-100 text-slate-500 rounded-full px-2 py-0.5 text-[12px] font-bold">
            {counts.policies}
          </span>
        </div>
      ),
    },
  ];

  return (
    <div className="team-details-tabs mb-8 border-b border-slate-200">
      <Tabs
        activeKey={activeTab}
        onChange={(key) => onTabChange(key as TeamTabKey)}
        items={items}
        className="custom-antd-tabs"
      />
      <style jsx global>{`
        .custom-antd-tabs .ant-tabs-nav {
          margin-bottom: 0 !important;
        }
        .custom-antd-tabs .ant-tabs-nav::before {
          border-bottom: none !important;
        }
        .custom-antd-tabs .ant-tabs-tab {
          padding: 16px 24px !important;
          margin: 0 !important;
          transition: all 0.3s ease;
        }
        .custom-antd-tabs .ant-tabs-tab-active {
          background-color: transparent !important;
        }
        .custom-antd-tabs .ant-tabs-tab:hover {
          color: #2563eb !important;
          background-color: #f8fafc !important;
        }
        .custom-antd-tabs .ant-tabs-tab-btn {
          font-weight: 600 !important;
          font-size: 14px !important;
          color: #64748b !important;
          display: flex !important;
          align-items: center !important;
          gap: 8px !important;
        }
        .custom-antd-tabs .ant-tabs-tab-active .ant-tabs-tab-btn {
          color: #2563eb !important;
        }
        .custom-antd-tabs .ant-tabs-ink-bar {
          background: #2563eb !important;
          height: 3px !important;
          border-radius: 3px 3px 0 0 !important;
        }
      `}</style>
    </div>
  );
}
