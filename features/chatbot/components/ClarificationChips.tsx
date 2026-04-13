"use client";

import { Button } from "@/shared/components/ui/button";

interface ClarificationChipsProps {
  options: string[];
  isLoading?: boolean;
  onSelect: (value: string) => void;
}

export function ClarificationChips({
  options,
  isLoading,
  onSelect,
}: ClarificationChipsProps) {
  if (!options.length) {
    return null;
  }

  return (
    <div className="mt-3 flex flex-wrap gap-2">
      {options.map((option) => (
        <Button
          key={option}
          variant="outline"
          size="sm"
          className="h-8 border-blue-200 text-blue-700 hover:bg-blue-50"
          onClick={() => onSelect(option)}
          disabled={isLoading}
        >
          {option}
        </Button>
      ))}
    </div>
  );
}
