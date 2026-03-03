import { Button } from "@/shared/components/ui/button";
import { Plus } from "lucide-react";

interface ObservabilityHeaderProps {
  title: string;
  subtitle: string;
}

export function ObservabilityHeader({
  title,
  subtitle,
}: ObservabilityHeaderProps) {
  return (
    <div className="flex items-center justify-between pb-2">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
        <p className="text-sm text-slate-500 mt-1 max-w-2xl">{subtitle}</p>
      </div>
      <Button className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg gap-2">
        <Plus className="h-4 w-4" />
        Add a Test case
      </Button>
    </div>
  );
}

