import {useTranslation} from "react-i18next";
import {DownloadList} from "@/components/download-list";
import {useAppSelector} from "@/store/hooks";

interface DownloadsTabProps {
    onOpenFile: (download: DownloadItem) => void;
    onOpenFolder: (download: DownloadItem) => void;
    onRetry: (download: DownloadItem) => void;
    onDelete: (download: DownloadItem, downloadListType: DownloadListType) => void;
    onShare: (download: DownloadItem) => void;
}

export function Downloads({onOpenFile, onOpenFolder, onRetry, onDelete, onShare}: DownloadsTabProps) {
    const {t} = useTranslation();
    const activeDownloads = useAppSelector((state) => state.activeDownloads.items);
    const hasDownloads = activeDownloads.length > 0;

    return (
        <div className="flex flex-col gap-6 animate-in fade-in duration-500">
            <div className="space-y-1">
                <h2 className="text-2xl font-semibold tracking-tight">{t("downloads.title")}</h2>
                <p className="text-sm text-muted-foreground">{t("downloads.subtitle")}</p>
            </div>

            <div className="rounded-xl border border-border/50 bg-card shadow-sm overflow-hidden">
                {hasDownloads ? (
                    <DownloadList items={activeDownloads} onOpenFile={onOpenFile} onOpenFolder={onOpenFolder}
                                  onRetry={onRetry} onDelete={onDelete} onShare={onShare} downloadListType="active"/>
                ) : (
                    <div className="py-16 flex flex-col items-center justify-center text-muted-foreground">
                        <div className="bg-muted/50 p-4 rounded-full mb-3">
                            <svg className="size-6 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                      d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
                            </svg>
                        </div>
                        <p className="text-sm font-medium">{t("downloads.noActive")}</p>
                        <p className="text-xs opacity-70 mt-1">{t("downloads.startNewDownload")}</p>
                    </div>
                )}
            </div>
        </div>
    );
}
