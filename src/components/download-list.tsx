import { AlertCircle, Music, FileVideo, CheckCircle2, Zap, Layers, ChevronDown, ChevronUp } from "lucide-react";
import { useTranslation } from "react-i18next";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/utils/tailwind";
import type { DownloadItem } from "@/store/slices/downloads-slice";
import {useCallback, useEffect, useMemo, useState} from "react";
import {formatBytes} from "@/utils/common";
import {fileToDataUrl} from "@/utils/ytdlp";

interface DownloadListProps {
  items: DownloadItem[];
  onOpenFile: (download: DownloadItem) => void;
  maxHeight?: string;
}

export function DownloadList({ items, onOpenFile, maxHeight = "h-[600px]" }: DownloadListProps) {
  const { t } = useTranslation();
  const [expandedPlaylist, setExpandedPlaylist] = useState<string | null>(null);
  const formattedSizes = useMemo(() => {
    return items.reduce((acc, item) => {
      const size = formatBytes(item.size);
      acc[item.id] = size.includes("NaN") || size.includes("undefined") ? "0 B" : size;
      return acc;
    }, {} as Record<string, string>);
  }, [items]);

  const renderStatusBadge = (download: DownloadItem) => {
    if (download.status === "completed") {
      return (
        <div className="flex items-center gap-1.5 bg-emerald-500/10 text-emerald-500 px-2 py-0.5 rounded text-[10px] font-medium border border-emerald-500/20">
          <CheckCircle2 className="size-3" /> {t("history.completed")}
        </div>
      );
    } else if (download.status === "failed") {
      return (
        <div className="flex items-center gap-1.5 bg-rose-500/10 text-rose-500 px-2 py-0.5 rounded text-[10px] font-medium border border-rose-500/20">
          <AlertCircle className="size-3" /> {t("history.failed")}
        </div>
      );
    } else {
      return (
        <div className="flex items-center gap-1.5 bg-amber-500/10 text-amber-500 px-2 py-0.5 rounded text-[10px] font-medium border border-amber-500/20">
          <Zap className="size-3" /> {Math.round(download.progress)}%
        </div>
      );
    }
  };

  const ThumbnailIcon = ({item}: {item: DownloadItem}) => {
    const [dataUrl, setDataUrl] = useState<string>('');

    useEffect(() => {
      if (!item.thumbnail || item.thumbnail.startsWith("http"))
        return setDataUrl(item.thumbnail || "");
      fileToDataUrl(item.thumbnail).then(setDataUrl).catch(() => setDataUrl(''));
    }, [item.thumbnail]);

    if (item.thumbnail) {
      return (
          <img
              src={dataUrl}
              alt={item.title}
              className="size-10 rounded-lg object-cover border border-border/50" />
      );
    }
    const Icon = item.type === "audio" ? Music : FileVideo;
    return (
        <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted/50 border border-border/50">
          {<Icon className="size-5 text-muted-foreground" />}
        </div>
    );
  }

  const renderDownloadRow = (download: DownloadItem, isPlaylistChild = false) => {
    const size = formattedSizes[download.id];
    return (
        <div
            key={download.id}
            className={cn(
                "flex items-center justify-between p-4 hover:bg-muted/30 cursor-pointer transition-colors",
                isPlaylistChild && "pl-12 bg-muted/5"
            )}
            onClick={() => onOpenFile(download)}
        >
          <div className="flex items-center gap-4">
            <ThumbnailIcon item={download} />
            <div className="flex flex-col">
              <span className="font-medium text-sm">{download.title}</span>
              <div className="flex gap-2 text-xs text-muted-foreground">
                <span>{download.channel}</span>
                <span>•</span>
                <span>{download.date}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4">
        <span className="text-xs text-muted-foreground hidden sm:block capitalize">
          {download.type} • {size}
        </span>
            {renderStatusBadge(download)}
          </div>
        </div>
    );
  }

  const DefaultIcon = ({item}: {item: DownloadItem}) => {
    const Icon = item.type === "audio" ? Music : FileVideo;
    return (
        <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted/50 border border-border/50">
          {<Icon className="size-5 text-muted-foreground" />}
        </div>
    )
  }

  return (
    <ScrollArea className={maxHeight}>
      <div className="divide-y divide-border/40">
        {items.map((item) => (
          item.type === "playlist" ? (
            <div key={item.id}>
              <div
                className="flex items-center justify-between p-4 hover:bg-blue-500/5 cursor-pointer transition-colors border-l-4 border-blue-500"
                onClick={() => setExpandedPlaylist(expandedPlaylist === item.id ? null : item.id)}
              >
              <div className="flex items-center gap-4 flex-1">
                {item.thumbnail ? (
                  <img src={item.thumbnail} alt={item.title} className="size-10 rounded-lg object-cover border border-blue-500/30" />
                ) : (
                    <DefaultIcon item={item} />
                )}
                <div className="flex flex-col">
                  <span className="font-semibold text-sm text-blue-600">{item.title}</span>
                  <span className="text-xs text-muted-foreground">{item.videos?.length || 0} videos</span>
                </div>
              </div>
                <div className="flex items-center gap-4">
                  <span className="text-xs text-muted-foreground hidden sm:block">
                    {item.quality}
                  </span>
                  {renderStatusBadge(item)}
                  {expandedPlaylist === item.id ? (
                    <ChevronUp className="size-4 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="size-4 text-muted-foreground" />
                  )}
                </div>
              </div>
              {expandedPlaylist === item.id && item.videos && (
                <div className="bg-muted/5 divide-y divide-border/20">
                  {item.videos.map((video) => renderDownloadRow(video, true))}
                </div>
              )}
            </div>
          ) : (
            renderDownloadRow(item, false)
          )
        ))}
      </div>
    </ScrollArea>
  );
}
