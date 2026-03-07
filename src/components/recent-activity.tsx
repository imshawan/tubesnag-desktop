import { Clock } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { useAppDispatch } from "@/store/hooks";
import { setActiveTab } from "@/store/slices/app-slice";
import { useDownloads } from "@/hooks/useDownloads";
import { DownloadList } from "@/components/download-list";

interface RecentActivityProps {
  onOpenFile: (download: DownloadItem) => void;
}

export function RecentActivity({ onOpenFile }: RecentActivityProps) {
  const { t } = useTranslation();
  const { downloads } = useDownloads();
  const dispatch = useAppDispatch();

  return (
    <div className="flex flex-col h-[500px] rounded-xl border border-border/50 bg-card shadow-sm overflow-hidden">
      <div className="flex items-center justify-between border-b border-border/50 px-6 py-4 bg-muted/10 shrink-0">
        <h3 className="font-medium">{t("recentActivity.title")}</h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => dispatch(setActiveTab("history"))}
          className="h-7 text-xs text-muted-foreground hover:text-foreground"
        >
          {t("recentActivity.viewAll")}
        </Button>
      </div>

      <div className="bg-background/50 p-0 flex-1 overflow-hidden">
        {downloads.length > 0 ? (
          <DownloadList items={downloads} onOpenFile={onOpenFile} maxHeight="h-full" />
        ) : (
          <div className="flex h-full flex-col items-center justify-center space-y-2 text-muted-foreground">
            <Clock className="size-6 text-muted-foreground/30" />
            <p className="text-sm">{t("recentActivity.noRecentDownloads")}</p>
          </div>
        )}
      </div>
    </div>
  );
}
