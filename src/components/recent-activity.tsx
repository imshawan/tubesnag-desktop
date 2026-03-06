import { Clock, AlertCircle, Music, Youtube, MoreVertical } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { cn } from "@/utils/tailwind";
import { useAppDispatch } from "@/store/hooks";
import { setActiveTab } from "@/store/slices/app-slice";
import type { DownloadItem } from "@/hooks/useDownloads";

interface RecentActivityProps {
  downloads: DownloadItem[];
  onOpenFile: (download: DownloadItem) => void;
}

export function RecentActivity({ downloads, onOpenFile }: RecentActivityProps) {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();

  return (
    <div className="flex flex-1 flex-col overflow-hidden rounded-xl border border-border/50 bg-card shadow-sm">
      <div className="flex items-center justify-between border-b border-border/50 px-6 py-4 bg-muted/10">
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

      <div className="bg-background/50 p-0">
        {downloads.length > 0 ? (
          <div className="w-full">
            <div className="divide-y divide-border/40">
              {downloads.map((download) => (
                <div
                  key={download.id}
                  className="group flex items-center justify-between p-4 transition-colors hover:bg-muted/30 cursor-pointer"
                  onClick={() => onOpenFile(download)}
                >
                  <div className="flex items-center gap-4 overflow-hidden">
                    <div
                      className={cn(
                        "flex size-10 shrink-0 items-center justify-center rounded-lg border border-border/50 transition-colors",
                        download.status === "failed"
                          ? "bg-rose-500/10 border-rose-500/20"
                          : download.status === "downloading"
                            ? "bg-amber-500/10 border-amber-500/20"
                            : "bg-muted group-hover:bg-background",
                      )}
                    >
                      {download.status === "failed" ? (
                        <AlertCircle className="size-5 text-rose-500" />
                      ) : download.type === "audio" ? (
                        <Music className="size-5 text-purple-500" />
                      ) : (
                        <Youtube className="size-5 text-red-500" />
                      )}
                    </div>
                    <div className="flex flex-col overflow-hidden">
                      <span className="font-medium truncate text-sm text-foreground">
                        {download.title || t("recentActivity.unknownVideo")}
                      </span>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span className="truncate max-w-[150px]">
                          {download.channel}
                        </span>
                        <span className="h-1 w-1 rounded-full bg-border" />
                        <span>{download.quality}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-6 shrink-0">
                    {download.status === "downloading" ? (
                      <div className="flex flex-col items-end gap-1 w-24">
                        <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                          <div
                            className="h-full bg-primary rounded-full transition-all duration-300 animate-pulse"
                            style={{ width: `${download.progress}%` }}
                          />
                        </div>
                        <span className="text-[10px] text-primary font-medium">
                          {Math.round(download.progress)}%
                        </span>
                      </div>
                    ) : download.status === "failed" ? (
                      <span className="text-xs font-medium text-rose-500 bg-rose-500/10 px-2 py-0.5 rounded-full border border-rose-500/20">
                        {t("history.failed")}
                      </span>
                    ) : (
                      <span className="text-xs font-medium text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                        {t("history.completed")}
                      </span>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <MoreVertical className="size-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex h-40 flex-col items-center justify-center space-y-2 text-muted-foreground">
            <Clock className="size-6 text-muted-foreground/30" />
            <p className="text-sm">{t("recentActivity.noRecentDownloads")}</p>
          </div>
        )}
      </div>
    </div>
  );
}
