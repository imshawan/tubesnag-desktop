import { Download } from "lucide-react";

interface AppHeaderProps {
  appName: string;
  appVersion: string;
}

export function AppHeader({ appName, appVersion }: AppHeaderProps) {
  return (
    <div className="flex items-center gap-3 px-2 py-4 mb-4">
      <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-md">
        <Download className="size-5" />
      </div>
      <div>
        <h1 className="text-sm font-bold tracking-tight">{appName}</h1>
        <p className="text-[10px] text-muted-foreground font-mono">
          v{appVersion}
        </p>
      </div>
    </div>
  );
}
