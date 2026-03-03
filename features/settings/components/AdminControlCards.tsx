"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { UserPlus, Users2, Globe, Ban, Trash2, Settings } from "lucide-react";
import { cn } from "@/shared/utils/cn";

interface Action {
  label: string;
  icon: React.ElementType;
  variant?: "default" | "outline" | "ghost";
  danger?: boolean;
}

interface Control {
  title: string;
  description: string;
  actions: Action[];
}

export function AdminControlCards() {
  const controls: Control[] = [
    {
      title: "Manage Users",
      description:
        "Create new user accounts, disable accounts, or manage their permissions and authentication methods.",
      actions: [
        {
          label: "Create User",
          icon: UserPlus,
          variant: "default",
        },
        { label: "Disable Users", icon: Ban, danger: true, variant: "outline" },
      ],
    },
    {
      title: "Manage Teams",
      description:
        "Create specialized teams, define hierarchy, and manage collective access controls for groups.",
      actions: [
        {
          label: "Create Team",
          icon: Users2,
          variant: "default",
        },
        {
          label: "Delete Teams",
          icon: Trash2,
          danger: true,
          variant: "outline",
        },
      ],
    },
    {
      title: "Organization Settings",
      description:
        "Update your organization name, primary contact email, and manage organization-level owners.",
      actions: [
        {
          label: "Edit Settings",
          icon: Settings,
          variant: "default",
        },
        { label: "Change Domain", icon: Globe, variant: "outline" },
      ],
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      {controls.map((control) => (
        <Card
          key={control.title}
          className="border-slate-200 rounded-xl shadow-none hover:shadow-sm transition-shadow"
        >
          <CardHeader className="pb-4">
            <CardTitle className="text-[18px] font-bold text-slate-900">
              {control.title}
            </CardTitle>
            <CardDescription className="text-[14px] text-slate-500 max-w-2xl font-medium">
              {control.description}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              {control.actions.map((action) => (
                <Button
                  key={action.label}
                  variant={action.variant}
                  className={cn(
                    "rounded-lg h-10 font-semibold shadow-none",
                    action.danger &&
                      "text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 hover:border-red-300",
                  )}
                >
                  <action.icon className="mr-2 h-4 w-4" />
                  {action.label}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

