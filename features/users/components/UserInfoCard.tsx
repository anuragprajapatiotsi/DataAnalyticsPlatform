"use client";

import React from "react";
import { AdminUser } from "../types";
import {
  Shield,
  Mail,
  User,
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
} from "lucide-react";

interface UserInfoCardProps {
  user?: AdminUser;
  isLoading: boolean;
}

export function UserInfoCard({ user, isLoading }: UserInfoCardProps) {
  if (isLoading) {
    return (
      <div className="rounded-lg border border-slate-200 bg-white shadow-sm p-6 animate-pulse">
        <div className="h-24 bg-slate-100 rounded-lg mb-4" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-16 bg-slate-50 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (!user) return null;

  const infoItems = [
    {
      label: "Email",
      value: user.email,
      icon: <Mail className="h-4 w-4 text-slate-400" />,
    },
    {
      label: "Username",
      value: `@${user.username}`,
      icon: <User className="h-4 w-4 text-slate-400" />,
    },
    {
      label: "Admin Status",
      value: user.is_admin ? "Administrator" : "Standard User",
      icon: <Shield className="h-4 w-4 text-slate-400" />,
      tag: user.is_admin
        ? "bg-red-50 text-red-700"
        : "bg-blue-50 text-blue-700",
    },
    {
      label: "Active Status",
      value: user.is_active ? "Active" : "Inactive",
      icon: user.is_active ? (
        <CheckCircle2 className="h-4 w-4 text-emerald-500" />
      ) : (
        <XCircle className="h-4 w-4 text-slate-400" />
      ),
      tag: user.is_active
        ? "bg-emerald-50 text-emerald-700"
        : "bg-slate-50 text-slate-600",
    },
  ];

  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm p-5 transition-all hover:shadow-md">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-5">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white text-lg font-bold shadow-lg shadow-blue-100">
            {user.display_name.charAt(0)}
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 mb-0.5">
              {user.display_name}
            </h2>
            <p className="text-slate-500 text-[13px] font-medium">
              {user.description || "No description provided."}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 border-t border-slate-100 pt-5 mt-1">
        {infoItems.map((item, idx) => (
          <div
            key={idx}
            className="flex flex-col gap-1.5 p-3 rounded-xl bg-slate-50/50 hover:bg-slate-50 transition-colors"
          >
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
              {item.icon}
              {item.label}
            </span>
            <div className="flex items-center">
              {item.tag ? (
                <span
                  className={`px-2 py-0.5 rounded-full text-[12px] font-bold ${item.tag}`}
                >
                  {item.value}
                </span>
              ) : (
                <span className="text-[13px] font-bold text-slate-700 truncate">
                  {item.value || "N/A"}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-5 border-t border-slate-100 pt-4">
        <div className="flex items-center gap-2.5 text-slate-400 font-medium text-[11px]">
          <Calendar className="h-3.5 w-3.5" />
          <span>
            Created:{" "}
            {user.created_at
              ? new Date(user.created_at).toLocaleDateString()
              : "N/A"}
          </span>
        </div>
        <div className="flex items-center gap-2.5 text-slate-400 font-medium text-[11px]">
          <Clock className="h-3.5 w-3.5" />
          <span>
            Last Login:{" "}
            {user.last_login
              ? new Date(user.last_login).toLocaleString()
              : "Never"}
          </span>
        </div>
      </div>
    </div>
  );
}
