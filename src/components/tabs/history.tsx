import {Filter, Search} from "lucide-react";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import {useAppDispatch, useAppSelector} from "@/store/hooks";
import {setHistoryFilter, setHistorySearch, setHistoryTypeFilter} from "@/store/slices/app-slice";
import {useTranslation} from "react-i18next";
import type {DownloadItem} from "@/store/slices/downloads-slice";
import {DownloadList} from "@/components/download-list";
import {useDownloads} from "@/hooks/useDownloads";
import {useMemo} from "react";

interface HistoryProps {
  onOpenFile: (download: DownloadItem) => void;
  onClearCompleted: () => void;
  onClearAll: () => void;
  completedCount: number;
}

export function History({ onOpenFile, onClearCompleted, onClearAll, completedCount }: HistoryProps) {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { downloads } = useDownloads();
  const historySearch = useAppSelector((state) => state.app.historySearch);
  const historyFilter = useAppSelector((state) => state.app.historyFilter);
  const historyTypeFilter = useAppSelector((state) => state.app.historyTypeFilter);

  const filteredDownloads = useMemo(() => {
    return downloads.filter((item) => {
        return historyTypeFilter === "all" ? true : item.type === historyTypeFilter;
    });
  }, [downloads, historyTypeFilter]);

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
          <div className="flex items-center gap-2 w-full sm:w-auto flex-wrap">
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
            <Select value={historyTypeFilter} onValueChange={(v) => dispatch(setHistoryTypeFilter(v))}>
              <SelectTrigger className="h-8 w-[130px] text-xs bg-background">
                <div className="flex items-center gap-2">
                  <Filter className="size-3 text-muted-foreground" />
                  <SelectValue placeholder="Type" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="playlist">Playlists</SelectItem>
                <SelectItem value="video">Videos</SelectItem>
                <SelectItem value="audio">Audio</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <span className="text-xs text-muted-foreground whitespace-nowrap">
            {t("history.showing")} {filteredDownloads.length} {t("history.items")}
          </span>
        </div>

        {filteredDownloads.length > 0 ? (
          <DownloadList items={filteredDownloads} onOpenFile={onOpenFile} />
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
