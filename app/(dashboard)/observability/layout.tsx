import { ReactNode } from "react";

export default function ObservabilityLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col h-full overflow-hidden bg-gray-50/50">
      <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
        <div className="mx-auto max-w-7xl animate-in fade-in slide-in-from-bottom-3 duration-500">
          {children}
        </div>
      </div>
    </div>
  );
}
