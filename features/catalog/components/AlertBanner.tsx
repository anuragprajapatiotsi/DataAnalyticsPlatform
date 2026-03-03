"use client";

import { AlertCircle, X } from "lucide-react";
import { cn } from "@/shared/utils/cn";

interface AlertBannerProps {
  message?: string;
  onClose: () => void;
}

export function AlertBanner({ message, onClose }: AlertBannerProps) {
  return (
    <div className="mb-4 flex items-center justify-between rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-red-800 shadow-sm animate-in fade-in slide-in-from-top-2">
      <div className="flex items-center gap-3">
        <AlertCircle className="h-5 w-5 shrink-0 text-red-500" />
        <p className="text-sm font-medium">
          {message || (
            <>
              An exception with message{" "}
              <span className="font-semibold">[elasticsearch]</span> was thrown
              while processing request.
            </>
          )}
        </p>
      </div>
      <button
        onClick={onClose}
        className="rounded-md p-1 transition-colors hover:bg-red-100 text-red-500"
        aria-label="Dismiss alert"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

