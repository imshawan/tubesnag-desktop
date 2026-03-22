import { cn } from "@/lib/utils/tailwind";

interface ActionCardProps {
  title: string;
  description: string;
  icon: React.ElementType;
  gradient: string;
  iconColor: string;
  onClick: () => void;
}

export function ActionCard({
  title,
  description,
  icon: Icon,
  gradient,
  iconColor,
  onClick,
}: Readonly<ActionCardProps>) {
  return (
    <button
      onClick={onClick}
      className="group relative overflow-hidden rounded-xl border border-border/50 bg-card p-6 text-left transition-all hover:-translate-y-1 hover:shadow-lg"
    >
      <div
        className={cn(
          "absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100 bg-gradient-to-br",
          gradient,
        )}
      />
      <div className="relative z-10 flex flex-col h-full">
        <div className="mb-4 flex size-10 items-center justify-center rounded-lg bg-background border border-border/50 shadow-sm">
          <Icon className={cn("size-5", iconColor)} />
        </div>
        <h3 className="mb-1 text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
          {title}
        </h3>
        <p className="text-sm text-muted-foreground group-hover:text-foreground/80 transition-colors">
          {description}
        </p>
      </div>
    </button>
  );
}
