"use client";

import { Button } from "@/components/ui/button";
import { Plus, FileText } from "lucide-react";
import { Card } from "@/components/ui/card";

export function TeamsEmptyState() {
  return (
    <Card className="flex flex-col items-center justify-center py-20 bg-slate-50/50 border-dashed border-2 border-slate-200 mt-6 shadow-none">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-slate-100 mb-6">
        <FileText className="h-10 w-10 text-slate-300" />
      </div>
      <span className="text-slate-600 text-[15px] font-semibold mb-2">
        No teams found
      </span>
      <p className="text-slate-500 text-[14px] text-center max-w-[280px] mb-8">
        Adding a new Team is easy, just give it a spin!
      </p>
      <Button
        disabled
        className="h-10 px-8 rounded-lg bg-blue-600 hover:bg-blue-700 font-semibold shadow-sm"
      >
        <Plus className="mr-2 h-4 w-4" />
        Add Team
      </Button>
    </Card>
  );
}
