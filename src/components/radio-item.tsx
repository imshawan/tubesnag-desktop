import { cn } from "@/lib/utils/tailwind";
import { Check } from "lucide-react";

interface RadioItemProps {
  value: string;
  selectedValue: string;
  onChange: (value: string) => void;
  label: string;
  desc?: string;
}

export function RadioItem({
  value,
  selectedValue,
  onChange,
  label,
  desc,
}: RadioItemProps) {
  const isSelected = value === selectedValue;
  return (
    <div
      onClick={() => onChange(value)}
      className={cn(
        "flex cursor-pointer items-start space-x-3 rounded-lg border p-3 transition-all hover:bg-accent",
        isSelected ? "border-primary bg-primary/5" : "border-transparent",
      )}
    >
      <div
        className={cn(
          "mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full border border-primary",
          isSelected ? "bg-primary text-primary-foreground" : "opacity-50",
        )}
      >
        {isSelected && <Check className="size-3" />}
      </div>
      <div className="space-y-1">
        <p className="font-medium leading-none text-sm">{label}</p>
        <p className="text-xs text-muted-foreground">{desc}</p>
      </div>
    </div>
  );
}
