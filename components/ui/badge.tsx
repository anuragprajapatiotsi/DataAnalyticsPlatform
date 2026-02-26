import * as React from "react";
import { cn } from "@/utils/cn";

const badgeVariants = {
  default: "bg-slate-100 text-slate-600 hover:bg-slate-200/80",
  secondary: "bg-slate-100 text-slate-900 hover:bg-slate-100/80",
  outline: "text-slate-950 border border-slate-200 hover:bg-slate-100/80",
  primary: "bg-blue-600 text-white hover:bg-blue-600/80",
};

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: keyof typeof badgeVariants;
}

function Badge({ className, variant = "default", ...props }: BadgeProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-sm px-1.5 py-0.5 text-[12px] font-bold transition-colors focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2",
        badgeVariants[variant],
        className,
      )}
      {...props}
    />
  );
}

export { Badge };
