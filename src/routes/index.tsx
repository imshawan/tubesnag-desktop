import {Github, Layers, ListVideo, PlayCircle, Search,} from "lucide-react";
import {createFileRoute} from "@tanstack/react-router";
import {useEffect, useRef} from "react";
import {useTranslation} from "react-i18next";
import ExternalLink from "@/components/external-link";
import ToggleTheme from "@/components/toggle-theme";
import {useDownloads} from "@/hooks/useDownloads";
import {useApp} from "@/hooks/useApp";
import {ScrollArea} from "@/components/ui/scroll-area";
import {BulkDownloadDialog} from "@/components/dialogs/bulk-download";
import {PlaylistDownloadDialog} from "@/components/dialogs/playlist-download";
import {SingleDownloadDialog} from "@/components/dialogs/single-download";
import {GlobalSearch} from "@/components/global-search";
import {ActionCard} from "@/components/action-card";
import {Help} from "@/components/tabs/help";
import {History as HistoryTab} from "@/components/tabs/history";
import {Downloads as DownloadsTab} from "@/components/tabs/downloads";
import {Settings as SettingsTab} from "@/components/tabs/settings";
import {Sidebar} from "@/components/sidebar";

import {RecentActivity} from "@/components/recent-activity";
import {getDiskUsageStats} from "@/lib/utils/setup";
import {
    deleteFileFromSystem,
    downloadWithYtdlp,
    getPlaylistVideos,
    openFile,
    openFolder,
    selectFolder
} from "@/lib/ytdlp/ytdlp";
import {useToast} from "@/context/toast-context";
import {Statistics} from "@/components/statistics";
import {generateUUID} from "@/lib/utils/common";
import {useActiveDownloads} from "@/hooks/useActiveDownloads";
import {useSettings} from "@/hooks/useSettings";
import {getActiveDownloads, getCompletedDownloads} from "@/lib/database";
import {createDownloadItemFromUrls} from "@/lib/ytdlp/download";
import LangDisplay from "@/components/lang-display";
import {useConfirmation} from "@/context/confirmation-context";
import {ItemPropertiesDialog} from "@/components/dialogs/item-properties/item-properties-dialog";

function HomePage() {
    const pollingRef = useRef<NodeJS.Timeout | null>(null);
    const {t} = useTranslation();
    const {addToast} = useToast();
    const { confirm } = useConfirmation();

    const {
        activeTab,
        activeDialog,
        searchOpen,
        setActiveDialog,
        setSearchOpen,
        toggleSearchOpen,
        setStorage,
        setDownloadPath,
        setActiveTab
    } = useApp();

    const {
        setDownloads: setCompletedDownloads,
        completedDownloads,
        clearCompleted,
        clearAll,
        removeDownload
    } = useDownloads();

    const {saveVideosToPlaylistFolders, downloadPath} = useSettings();

    const {
        setDownloads: setActiveDownloads,
        addPlaylistDownload, addActiveDownloadItem,
        updateActiveDownloadItem, updateActivePlaylistVideoDownloadItem,
        removeActiveDownloadItem
    } = useActiveDownloads();

    const updateDiskUsage = async () => {
        const data = await getDiskUsageStats(downloadPath);
        if (data) setStorage(data);
    };

    useEffect(() => {
        const startPolling = async () => {
            const data = await updateDiskUsage();
            if (data === null || data === undefined) {
                return; // Stop polling
            }
            pollingRef.current = setInterval(async () => {
                const result = await updateDiskUsage();
                if (result === null || result === undefined) {
                    if (pollingRef.current) {
                        clearInterval(pollingRef.current);
                        pollingRef.current = null;
                    }
                }
            }, 30000);
        };

        startPolling().catch(console.error);

        return () => {
            if (pollingRef.current) {
                clearInterval(pollingRef.current);
                pollingRef.current = null;
            }
        };
    }, [downloadPath]);

    useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                toggleSearchOpen();
            }
            if (e.key === "Escape") setSearchOpen(false);
        };
        document.addEventListener("keydown", down);
        return () => document.removeEventListener("keydown", down);
    }, [toggleSearchOpen, setSearchOpen]);

    useEffect(() => {
        getActiveDownloads()
            .then(setActiveDownloads)
            .catch(err => {
                console.error("Failed to load active downloads:", err);
                addToast(t("dashboard.failedLoadActiveDownloads"), "error");
            });

        getCompletedDownloads()
            .then(setCompletedDownloads)
            .catch(err => {
                console.error("Failed to load completed downloads:", err);
                addToast(t("dashboard.failedLoadHistory"), "error");
            });
    }, []);

    // Do not do writes to DB here or something because this does not have complete/updated video list info
    const onDownloadComplete = (download: Partial<DownloadItem>) => {
        const message = t("downloads.completedDownloading", {title: download.title});
        addToast(message, "success", 5000);
    }

    const handleSingleDownload: OnDownloadFn = async (
        url: string[],
        selectedQuality: QualityType,
        format: FormatType,
        reverse,
        audioBitrate: AudioBitrate,
    ) => {
        const newDownloads = createDownloadItemFromUrls(url, selectedQuality, format, downloadPath);
        if (newDownloads.length === 0) return;

        const download = newDownloads[0];
        addActiveDownloadItem(download);
        setActiveDialog(null);
        setActiveTab("downloads");

        addToast(t("singleDownload.addedToQueue"), "success");

        try {
            await downloadWithYtdlp({
                url: url[0],
                outputPath: downloadPath,
                quality: selectedQuality,
                downloadId: download.id,
                format,
                audioBitrate,
                onProgress: (progress) => {
                    // console.log(progress)
                    updateActiveDownloadItem(download.id, {progress, status: "downloading"});
                },
                onData: (data) => {
                    updateActiveDownloadItem(download.id, data);
                },
                onDuplicate: (filename, metadata) => {
                    addToast(`File already downloaded: ${filename}`, "warning");
                    updateActiveDownloadItem(download.id, {status: "duplicate", ...metadata});
                },
                onComplete: onDownloadComplete,
                onError: (e) => {
                    console.error("Download error:", e);
                    addToast(`${t("dashboard.downloadFailed")} - ${e.error}`, "error");
                    updateActiveDownloadItem(download.id, {status: "failed"});
                }
            });
        } catch (error) {
            console.error("Download failed:", error);
            updateActiveDownloadItem(download.id, {status: "failed"});
        }
    };

    const handleBulkDownloadStart: OnDownloadFn = async (
        urls: string[],
        selectedQuality: QualityType,
        format: FormatType,
        reverse,
        audioBitrate,
    ) => {
        const newDownloads = createDownloadItemFromUrls(urls, selectedQuality, format, downloadPath);
        setActiveDialog(null);
        setActiveTab("downloads");

        addToast(t("bulkDownload.addedToQueue"), "success");

        for (const download of newDownloads) {
            addActiveDownloadItem(download);

            try {
                await downloadWithYtdlp({
                    url: download.url,
                    outputPath: downloadPath,
                    quality: selectedQuality,
                    downloadId: download.id,
                    format,
                    audioBitrate,
                    onProgress: (progress) => {
                        updateActiveDownloadItem(download.id, {progress, status: "downloading"});
                    },
                    onData: (data) => {
                        updateActiveDownloadItem(download.id, data);
                    },
                    onDuplicate: (filename, metadata) => {
                        addToast(`Duplicate: ${filename}`, "warning");
                        updateActiveDownloadItem(download.id, {status: "duplicate", ...metadata});
                    },
                    onComplete: onDownloadComplete,
                    onError: (e) => {
                        addToast(`${t("dashboard.downloadFailed")} - ${e.error}`, "error");
                        updateActiveDownloadItem(download.id, {status: "failed"});
                    }
                });
            } catch (error) {
                console.error("Download failed:", error);
                updateActiveDownloadItem(download.id, {status: "failed"});
            }
        }
    };

    const handlePlaylistDownload: OnDownloadFn = async (
        urls: string[],
        selectedQuality: QualityType,
        format: FormatType,
        reverse: boolean,
        audioBitrate: AudioBitrate,
    ) => {
        const playlistUrl = urls[0];
        setActiveDialog(null);

        try {
            addToast(t("playlistDownload.addedToQueue"), "info");
            setActiveTab("downloads")

            const playlistId = generateUUID();

            const result = await getPlaylistVideos(playlistUrl, reverse, playlistId);

            const {videoUrls} = result;
            if (!videoUrls || videoUrls.length === 0) {
                addToast(t("playlistDownload.noVideosFound"), "error");
                return;

            }
            const playlistItem = addPlaylistDownload(playlistId, playlistUrl, result, selectedQuality, format, downloadPath);

            for (const download of playlistItem.videos || []) {
                try {
                    await downloadWithYtdlp({
                        url: download.url,
                        outputPath: downloadPath,
                        quality: selectedQuality,
                        downloadId: download.id,
                        format,
                        audioBitrate,
                        saveToPlaylistFolder: saveVideosToPlaylistFolders,
                        playlistName: result.title,
                        onProgress: (progress) => {
                            updateActivePlaylistVideoDownloadItem(playlistId, download.id, {
                                progress,
                                status: "downloading"
                            });
                        },
                        onData: (data) => {
                            updateActivePlaylistVideoDownloadItem(playlistId, download.id, data);
                        },
                        onDuplicate: (filename, metadata) => {
                            addToast(`Duplicate: ${filename}`, "warning");
                            updateActivePlaylistVideoDownloadItem(playlistId, download.id, {status: "duplicate", ...metadata});
                        },
                        onError: (e) => {
                            addToast(`${t("dashboard.downloadFailed")} - ${e.error}`, "error");
                            updateActiveDownloadItem(download.id, {status: "failed"});
                        }
                    });
                } catch (error) {
                    console.error("Download failed:", error);
                    updateActivePlaylistVideoDownloadItem(playlistId, download.id, {status: "failed"});
                }
            }
            onDownloadComplete(playlistItem);
        } catch (error) {
            console.error("Playlist processing failed:", error);
            addToast(
                error instanceof Error ? error.message : t("playlistDownload.processingFailed"),
                "error"
            );
        }
    };

    const handleOpenFile = async (download: DownloadItem) => {
        if (download.status === "completed") {
            try {
                await openFile(download);
                addToast(t("dashboard.fileOpened"), "success");
            } catch (error) {
                console.error("Failed to open file:", error);
                addToast(t("dashboard.failedToOpenFile"), "error");
            }
        } else if (download.status === "failed") {
            addToast(t("dashboard.downloadFailed"), "error");
        }
    };

    const handleOpenFolder = async (download: DownloadItem) => {
        await openFolder(download);
    };

    const handleRetry = async (download: DownloadItem) => {
        addToast(t("dashboard.retryingDownload"), "info");
        handleSingleDownload([download.url], download.quality, download.format as FormatType, false, "192" as AudioBitrate);
    };

    const handleDelete = async (download: DownloadItem, downloadListType: DownloadListType) => {
        const confirmed = await confirm({
            title: t("dashboard.deleteConfirm"),
            description: download.title,
            type: "warning",
            confirmText: t("contextMenu.delete"),
            cancelText: t("common.cancel"),
        })

        const parent = download.parentId ? download.parentId : download.id;
        const child = download.parentId ? download.id : undefined; // if parentId exists that means it's an item of playlist
        if (confirmed) {
            if (downloadListType === "active") {
                removeActiveDownloadItem(parent, child);
            } else if (downloadListType === "completed") {
                removeDownload(parent, child);
            }
            deleteFileFromSystem(download).finally(() => {
            });
            addToast(t("dashboard.downloadDeleted"), "success");
        }
    };

    const handleShare = (download: DownloadItem) => {
        const shareText = `${download.title} - Downloaded with TubeSnag`;
        if (navigator.share) {
            navigator.share({
                title: download.title,
                text: shareText,
                url: download.url,
            }).catch(() => {
                navigator.clipboard.writeText(download.url).then(() => addToast(t("dashboard.urlCopied"), "success"))
                    .catch(() => addToast(t("dashboard.failedCopyUrl"), "error"))
            });
        } else {
            navigator.clipboard.writeText(download.url).then(() => addToast(t("dashboard.urlCopied"), "success"))
                .catch(() => addToast(t("dashboard.failedCopyUrl"), "error"));
        }
    };


    const handleBrowseFolder = async () => {
        try {
            const path = await selectFolder();
            if (path) {
                setDownloadPath(path);
            }
        } catch (error: any) {
            console.error(t("dashboard.failedSelectFolder"), error);
            addToast(t("dashboard.failedSelectFolder", {reason: error.message}), "error");
        }
    };

    return (
        <div
            className="flex h-screen w-full bg-background text-foreground overflow-hidden font-sans selection:bg-primary/20">
            <div className="absolute inset-0 overflow-hidden pointer-events-none z-10">
                <div
                    className="absolute -top-40 -right-40 w-[300px] h-[300px] bg-gradient-to-br from-blue-500/20 via-purple-500/20 to-transparent rounded-full blur-[100px] animate-pulse"/>
                <div
                    className="absolute top-1/2 left-7/12 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-linear-to-br from-primary/10 to-transparent rounded-full blur-3xl"/>
            </div>

            <Sidebar/>


            <main className="flex flex-1 flex-col bg-background relative">
                <header
                    className="flex h-16 shrink-0 items-center justify-between border-b border-border/40 px-6 backdrop-blur-sm bg-background/80">
                    <div className="flex flex-1 max-w-md items-center">
                        <button
                            onClick={() => setSearchOpen(true)}
                            className="group flex h-9 w-full items-center gap-2 rounded-md border border-input bg-background/50 px-3 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                        >
                            <Search className="size-4 shrink-0 opacity-50"/>
                            <span className="flex-1 text-left">{t("dashboard.searchDownloads")}</span>
                            <kbd
                                className="pointer-events-none hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
                                <span className="text-xs">⌘</span>K
                            </kbd>
                        </button>
                    </div>
                    <div className="flex items-center gap-3 pl-4">
                        <ExternalLink
                            href="https://github.com/imshawan"
                            className="text-muted-foreground hover:text-foreground transition-colors"
                        >
                            <Github className="size-5"/>
                        </ExternalLink>
                        <div className="h-4 w-px bg-border"/>
                        <LangDisplay/>
                        <ToggleTheme/>
                    </div>
                </header>

                <ScrollArea className="flex-1">
                    <div className="p-8 pb-20 max-w-6xl mx-auto">
                        {activeTab === "dashboard" && (
                            <div className="flex flex-col gap-8 animate-in fade-in duration-500">
                                <div className="space-y-1">
                                    <h2 className="text-2xl font-semibold tracking-tight">
                                        {t("dashboard.overview")}
                                    </h2>
                                    <p className="text-sm text-muted-foreground">
                                        {t("dashboard.manageDownloads")}
                                    </p>
                                </div>

                                <Statistics/>

                                <div className="space-y-4">
                                    <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                                        {t("dashboard.startNewDownload")}
                                    </h3>
                                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                                        <ActionCard
                                            title={t("dashboard.singleVideo")}
                                            description={t("dashboard.downloadMp4Mp3")}
                                            icon={PlayCircle}
                                            gradient="from-blue-500/10 to-indigo-500/10"
                                            iconColor="text-blue-500"
                                            onClick={() => setActiveDialog("single")}
                                        />
                                        <ActionCard
                                            title={t("dashboard.playlist")}
                                            description={t("dashboard.batchDownloadSeries")}
                                            icon={ListVideo}
                                            gradient="from-emerald-500/10 to-teal-500/10"
                                            iconColor="text-emerald-500"
                                            onClick={() => setActiveDialog("playlist")}
                                        />
                                        <ActionCard
                                            title={t("dashboard.bulkImport")}
                                            description={t("dashboard.pasteMultipleLinks")}
                                            icon={Layers}
                                            gradient="from-orange-500/10 to-amber-500/10"
                                            iconColor="text-orange-500"
                                            onClick={() => setActiveDialog("bulk")}
                                        />
                                    </div>
                                </div>

                                <RecentActivity
                                    onOpenFile={handleOpenFile}
                                    onOpenFolder={handleOpenFolder}
                                    onRetry={handleRetry}
                                    onDelete={handleDelete}
                                    onShare={handleShare}
                                />
                            </div>
                        )}

                        {activeTab === "downloads" && (
                            <DownloadsTab
                                onOpenFile={handleOpenFile}
                                onOpenFolder={handleOpenFolder}
                                onRetry={handleRetry}
                                onDelete={handleDelete}
                                onShare={handleShare}
                            />
                        )}

                        {activeTab === "history" && (
                            <HistoryTab
                                onOpenFile={handleOpenFile}
                                onOpenFolder={handleOpenFolder}
                                onRetry={handleRetry}
                                onDelete={handleDelete}
                                onShare={handleShare}
                                onClearCompleted={clearCompleted}
                                onClearAll={clearAll}
                                completedCount={completedDownloads.length}
                            />
                        )}

                        {activeTab === "settings" && (
                            <SettingsTab onBrowseFolder={handleBrowseFolder}/>
                        )}

                        {activeTab === "help" && <Help/>}
                    </div>
                </ScrollArea>
            </main>

            <GlobalSearch
                isOpen={searchOpen}
                onClose={() => setSearchOpen(false)}
                onSelect={handleOpenFile}
            />

            <SingleDownloadDialog
                open={activeDialog === "single"}
                onOpenChange={(v) => !v && setActiveDialog(null)}
                onDownload={handleSingleDownload}
            />
            <BulkDownloadDialog
                open={activeDialog === "bulk"}
                onOpenChange={(v) => !v && setActiveDialog(null)}
                onDownload={handleBulkDownloadStart}
            />
            <PlaylistDownloadDialog
                open={activeDialog === "playlist"}
                onOpenChange={(v) => !v && setActiveDialog(null)}
                onDownload={handlePlaylistDownload}
            />
            <ItemPropertiesDialog onOpenFolder={handleOpenFolder} />
        </div>
    );
}

export const Route = createFileRoute("/")((
    {
        component: HomePage,
    }
));
