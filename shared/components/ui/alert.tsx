import * as React from "react";

import { cn } from "@/shared/utils/cn";

function Alert({
  className,
  variant = "default",
  ...props
}: React.ComponentProps<"div"> & { variant?: "default" | "destructive" }) {
  return (
    <div
      role="alert"
      className={cn(
        "relative w-full rounded-lg border px-4 py-3 text-sm",
        variant === "destructive"
          ? "border-red-300 bg-red-50 text-red-700"
          : "border-slate-300 bg-white text-slate-700",
        className,
      )}
      {...props}
    />
  );
}

export { Alert };

