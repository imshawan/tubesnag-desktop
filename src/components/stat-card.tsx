import { cn } from "@/utils/tailwind";

interface StatCardProps {
    icon: React.ElementType;
    label: string;
    value: string | number;
    colorClass?: string;
    subtext?: string;
}

export function StatCard({ icon: Icon, label, value, colorClass, subtext }: StatCardProps) {
  return (
    <div className="flex flex-col rounded-xl border border-border/50 bg-card p-5 shadow-sm transition-all hover:shadow-md">
      <div className="mb-4 flex items-center justify-between">
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          {label}
        </span>
        <Icon className={cn("size-4", colorClass)} />
      </div>
      <div className="text-2xl font-bold text-foreground">{value}</div>
      <div className="text-xs text-muted-foreground mt-1">{subtext}</div>
    </div>
  );
}