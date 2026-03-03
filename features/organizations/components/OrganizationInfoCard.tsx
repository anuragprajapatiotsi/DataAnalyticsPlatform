"use client";

import { Card, CardContent } from "@/shared/components/ui/card";
import { Tooltip } from "@/shared/components/ui/tooltip";
import { Edit2, Info } from "lucide-react";

export function OrganizationInfoCard() {
  return (
    <Card className="border-slate-200 rounded-xl shadow-none">
      <CardContent className="p-6">
        <div className="grid grid-cols-5 gap-6">
          <div className="flex flex-col gap-1.5">
            <span className="text-[12px] font-bold text-slate-400 uppercase tracking-wider">
              Domains
            </span>
            <span className="text-[14px] text-slate-700 font-semibold">
              No Domains
            </span>
          </div>
          <div className="flex flex-col gap-1.5">
            <span className="text-[12px] font-bold text-slate-400 uppercase tracking-wider">
              Owners
            </span>
            <div className="flex items-center gap-2">
              <span className="text-[14px] text-slate-700 font-semibold">
                No Owners
              </span>
              <Edit2 className="text-slate-400 cursor-pointer hover:text-blue-500 h-3.5 w-3.5 transition-colors" />
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <span className="text-[12px] font-bold text-slate-400 uppercase tracking-wider">
              Email
            </span>
            <span className="text-[14px] text-slate-700 font-semibold">--</span>
          </div>
          <div className="flex flex-col gap-1.5">
            <span className="text-[12px] font-bold text-slate-400 uppercase tracking-wider">
              Subscription
            </span>
            <span className="text-[14px] text-slate-700 font-semibold">--</span>
          </div>
          <div className="flex flex-col gap-1.5">
            <span className="text-[12px] font-bold text-slate-400 uppercase tracking-wider">
              Total Users
            </span>
            <div className="flex items-center gap-2">
              <span className="text-[14px] text-slate-700 font-semibold">
                0
              </span>
              <Tooltip content="Total users in this organization">
                <Info className="text-slate-400 h-3.5 w-3.5 cursor-help" />
              </Tooltip>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

