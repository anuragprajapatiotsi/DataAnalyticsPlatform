"use client";

import React, { useState } from "react";
import { cn } from "@/utils/cn";

interface TooltipProps {
  content: string;
  children: React.ReactNode;
  side?: "top" | "right" | "bottom" | "left";
}

export function Tooltip({ content, children, side = "right" }: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div
      className="relative flex items-center"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      {isVisible && (
        <div
          className={cn(
            "fixed z-[100] ml-2 px-3 py-1.5 text-xs font-medium text-white bg-slate-900 rounded-md shadow-lg whitespace-nowrap animate-in fade-in zoom-in-95 duration-200 pointer-events-none",
            side === "right" && "left-[72px]",
          )}
        >
          {content}
          {/* Arrow */}
          <div className="absolute left-[-4px] top-1/2 -translate-y-1/2 border-y-[4px] border-y-transparent border-r-[4px] border-r-slate-900" />
        </div>
      )}
    </div>
  );
}
