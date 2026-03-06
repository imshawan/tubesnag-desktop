import { Search, Filter, Music, FileVideo, CheckCircle2, AlertCircle, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setHistorySearch, setHistoryFilter } from "@/store/slices/app-slice";
import { useTranslation } from "react-i18next";
import type { DownloadItem } from "@/hooks/useDownloads";

interface HistoryProps {
  downloads: DownloadItem[];
  onOpenFile: (download: DownloadItem) => void;
  onClearCompleted: () => void;
  onClearAll: () => void;
  completedCount: number;
}

export function History({ downloads, onOpenFile, onClearCompleted, onClearAll, completedCount }: HistoryProps) {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const historySearch = useAppSelector((state) => state.app.historySearch);
  const historyFilter = useAppSelector((state) => state.app.historyFilter);

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-semibold tracking-tight">{t("history.title")}</h2>
          <p className="text-sm text-muted-foreground">{t("history.subtitle")}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={onClearCompleted} disabled={completedCount === 0}>
            {t("history.clearCompleted")}
          </Button>
          <Button variant="destructive" size="sm" onClick={onClearAll} disabled={downloads.length === 0}>
            {t("history.clearAll")}
          </Button>
        </div>
      </div>

      <div className="rounded-xl border border-border/50 bg-card shadow-sm overflow-hidden">
        <div className="p-4 border-b border-border/40 bg-muted/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-2.5 top-2.5 size-3.5 text-muted-foreground" />
              <Input
                placeholder={t("history.searchPlaceholder")}
                value={historySearch}
                onChange={(e) => dispatch(setHistorySearch(e.target.value))}
                className="pl-8 h-8 text-xs bg-background"
              />
            </div>
            <Select value={historyFilter} onValueChange={(v) => dispatch(setHistoryFilter(v))}>
              <SelectTrigger className="h-8 w-[130px] text-xs bg-background">
                <div className="flex items-center gap-2">
                  <Filter className="size-3 text-muted-foreground" />
                  <SelectValue placeholder={t("history.allStatus")} />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("history.allStatus")}</SelectItem>
                <SelectItem value="completed">{t("history.completed")}</SelectItem>
                <SelectItem value="downloading">{t("history.downloading")}</SelectItem>
                <SelectItem value="failed">{t("history.failed")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <span className="text-xs text-muted-foreground whitespace-nowrap">
            {t("history.showing")} {downloads.length} {t("history.items")}
          </span>
        </div>

        {downloads.length > 0 ? (
          <div className="divide-y divide-border/40 max-h-[600px] overflow-y-auto">
            {downloads.map((download) => (
              <div
                key={download.id}
                className="flex items-center justify-between p-4 hover:bg-muted/30 cursor-pointer transition-colors"
                onClick={() => onOpenFile(download)}
              >
                <div className="flex items-center gap-4">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted/50 border border-border/50">
                    {download.type === "audio" ? (
                      <Music className="size-5 text-muted-foreground" />
                    ) : (
                      <FileVideo className="size-5 text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex flex-col">
                    <span className="font-medium text-sm">{download.title}</span>
                    <div className="flex gap-2 text-xs text-muted-foreground">
                      <span>{download.url}</span>
                      <span>•</span>
                      <span>{download.date}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-xs text-muted-foreground hidden sm:block">
                    {download.quality} • {download.size}
                  </span>
                  {download.status === "completed" ? (
                    <div className="flex items-center gap-1.5 bg-emerald-500/10 text-emerald-500 px-2 py-0.5 rounded text-[10px] font-medium border border-emerald-500/20">
                      <CheckCircle2 className="size-3" /> {t("history.completed")}
                    </div>
                  ) : download.status === "failed" ? (
                    <div className="flex items-center gap-1.5 bg-rose-500/10 text-rose-500 px-2 py-0.5 rounded text-[10px] font-medium border border-rose-500/20">
                      <AlertCircle className="size-3" /> {t("history.failed")}
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 bg-amber-500/10 text-amber-500 px-2 py-0.5 rounded text-[10px] font-medium border border-amber-500/20">
                      <Zap className="size-3" /> {Math.round(download.progress)}%
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-16 flex flex-col items-center justify-center text-muted-foreground">
            <div className="bg-muted/50 p-4 rounded-full mb-3">
              <Search className="size-6 opacity-50" />
            </div>
            <p className="text-sm font-medium">{t("history.noResults")}</p>
            <p className="text-xs opacity-70 mt-1">{t("history.tryAdjusting")}</p>
          </div>
        )}
      </div>
    </div>
  );
}
