import {Clock} from "lucide-react";
import {useTranslation} from "react-i18next";
import {Button} from "@/components/ui/button";
import {useDownloads} from "@/hooks/useDownloads";
import {DownloadList} from "@/components/download-list";
import {useApp} from "@/hooks/useApp";

interface RecentActivityProps {
    onOpenFile: (download: DownloadItem) => void;
    onOpenFolder: (download: DownloadItem) => void;
    onRetry: (download: DownloadItem) => void;
    onDelete: (download: DownloadItem, downloadListType: DownloadListType) => void;
    onShare: (download: DownloadItem) => void;
}

export function RecentActivity({onOpenFile, onOpenFolder, onRetry, onDelete, onShare}: RecentActivityProps) {
    const {t} = useTranslation();
    const {downloads} = useDownloads();
    const {setActiveTab} = useApp();

    return (
        <div className="flex flex-col h-125 rounded-xl border border-border/50 bg-card shadow-sm overflow-hidden">
            <div className="flex items-center justify-between border-b border-border/50 px-6 py-4 bg-muted/10 shrink-0">
                <h3 className="font-medium">{t("recentActivity.title")}</h3>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setActiveTab("history")}
                    className="h-7 text-xs text-muted-foreground hover:text-foreground"
                >
                    {t("recentActivity.viewAll")}
                </Button>
            </div>

            <div className="bg-background/50 p-0 flex-1 overflow-hidden">
                {downloads.length > 0 ? (
                    <DownloadList items={downloads}
                                  onRetry={onRetry}
                                  onDelete={onDelete}
                                  onShare={onShare}
                                  onOpenFolder={onOpenFolder}
                                  onOpenFile={onOpenFile}
                                  maxHeight="h-full"
                                  downloadListType="completed" // Means it is part of the completed downloads
                    />
                ) : (
                    <div className="flex h-full flex-col items-center justify-center space-y-2 text-muted-foreground">
                        <Clock className="size-6 text-muted-foreground/30"/>
                        <p className="text-sm">{t("recentActivity.noRecentDownloads")}</p>
                    </div>
                )}
            </div>
        </div>
    );
}
