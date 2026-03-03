"use client";

import { cn } from "@/utils/cn";

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-full w-full overflow-hidden bg-[#f8fafc]">
      <div className="flex-1 overflow-hidden">{children}</div>
    </div>
  );
}
