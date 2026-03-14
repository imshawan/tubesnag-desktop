import {Github, Layers, ListVideo, PlayCircle, Search,} from "lucide-react";
import {createFileRoute} from "@tanstack/react-router";
import {useEffect, useTransition} from "react";
import {useTranslation} from "react-i18next";
import ExternalLink from "@/components/external-link";
import LangToggle from "@/components/lang-toggle";
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
import {getDiskUsageStats} from "@/utils/setup";
import {downloadWithYtdlp, getPlaylistVideos} from "@/utils/ytdlp";
import {useToast} from "@/context/ToastContext";
import {Statistics} from "@/components/statistics";
import {generateUUID} from "@/utils/common";
import {useActiveDownloads} from "@/hooks/useActiveDownloads";
import {useSettings} from "@/hooks/useSettings";

function HomePage() {
    const {t} = useTranslation();
    const {addToast} = useToast();

    const {
        activeTab,
        activeDialog,
        searchOpen,
        downloadPath,
        setActiveDialog,
        setSearchOpen,
        toggleSearchOpen,
        setStorage,
        setDownloadPath,
    } = useApp();

    const {
        downloads: realDownloads,
        completedDownloads,
        clearCompleted,
        addDownload,
        clearAll,
    } = useDownloads();

    const {saveVideosToPlaylistFolders} = useSettings();

    const {
        addPlaylistDownload, addActiveDownloadItem,
        updateActiveDownloadItem, updateActivePlaylistVideoDownloadItem
    } = useActiveDownloads();

    const updateDiskUsage = async () => {
        const data = await getDiskUsageStats(downloadPath);
        if (data) setStorage(data);
    };

    useEffect(() => {
        updateDiskUsage();
        const interval = setInterval(updateDiskUsage, 30000);
        return () => clearInterval(interval);
    }, [downloadPath, setStorage]);

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

    const handleSingleDownload = async (
        url: string,
        selectedQuality: QualityType,
        format?: string,
    ) => {
        const newDownloads = addDownload([url], selectedQuality, downloadPath);
        if (newDownloads.length === 0) return;

        const download = newDownloads[0];
        addActiveDownloadItem(download);
        setActiveDialog(null);

        try {
            await downloadWithYtdlp({
                url,
                outputPath: downloadPath,
                quality: selectedQuality,
                downloadId: download.id,
                // format,
                onProgress: (progress) => {
                    console.log(progress)
                    updateActiveDownloadItem(download.id, {progress});
                },
                onData: (data) => {
                    updateActiveDownloadItem(download.id, data);
                },
                onDuplicate: (filename, metadata) => {
                    addToast(`File already downloaded: ${filename}`, "warning");
                    updateActiveDownloadItem(download.id, {status: "duplicate", ...metadata});
                },
            });
        } catch (error) {
            console.error("Download failed:", error);
            updateActiveDownloadItem(download.id, {status: "failed"});
        }
    };

    const handleDownloadStart = async (
        urls: string[],
        selectedQuality: QualityType,
    ) => {
        const newDownloads = addDownload(urls, selectedQuality, downloadPath);
        setActiveDialog(null);

        for (const download of newDownloads) {
            addActiveDownloadItem(download);

            try {
                await downloadWithYtdlp({
                    url: download.url,
                    outputPath: downloadPath,
                    quality: selectedQuality,
                    downloadId: download.id,
                    onProgress: (progress) => {
                        updateActiveDownloadItem(download.id, {progress});
                    },
                    onData: (data) => {
                        console.log("ondata", data)
                        updateActiveDownloadItem(download.id, data);
                    },
                    onDuplicate: (filename, metadata) => {
                        addToast(`Duplicate: ${filename}`, "warning");
                        console.log("Duplicate found:", metadata);
                        updateActiveDownloadItem(download.id, {status: "duplicate", ...metadata});
                    },
                });
            } catch (error) {
                console.error("Download failed:", error);
                updateActiveDownloadItem(download.id, {status: "failed"});
            }
        }
    };

    const handlePlaylistDownload = async (
        urls: string[],
        selectedQuality: QualityType,
        format: FormatType,
        reverse: boolean,
    ) => {
        const playlistUrl = urls[0];
        setActiveDialog(null);

        try {
            addToast(t("playlistDownload.addedToQueue"), "info");

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
                    });
                } catch (error) {
                    console.error("Download failed:", error);
                    updateActivePlaylistVideoDownloadItem(playlistId, download.id, {status: "failed"});
                }
            }
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
            const confirmed = window.confirm(
                `${t("dashboard.openingFile")}\n\n${download.title}\n\n${t("dashboard.openFileConfirm")}`
            );

            if (confirmed && globalThis.electron?.openFile) {
                console.log("Opening file:", download.downloadPath)
                try {
                    await globalThis.electron.openFile(download.downloadPath);
                    addToast(t("dashboard.fileOpened"), "success");
                } catch (error) {
                    console.error("Failed to open file:", error);
                    addToast(t("dashboard.failedToOpenFile"), "error");
                }
            }
        } else if (download.status === "failed") {
            addToast(t("dashboard.downloadFailed"), "error");
        }
    };


    const handleBrowseFolder = async () => {
        try {
            if (globalThis.electron && globalThis.electron.selectFolder) {
                const path = await globalThis.electron.selectFolder();
                if (path) {
                    setDownloadPath(path);
                }
            } else {
                console.warn(t("dashboard.electronNotDetected"));
                addToast(t("dashboard.mockPathSet"), "warning");
            }
        } catch (error) {
            console.error(t("dashboard.failedSelectFolder"), error);
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
                        <LangToggle/>
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
                                />
                            </div>
                        )}

                        {activeTab === "downloads" && (
                            <DownloadsTab
                                onOpenFile={handleOpenFile}
                            />
                        )}

                        {activeTab === "history" && (
                            <HistoryTab
                                onOpenFile={handleOpenFile}
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
                data={realDownloads}
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
                onDownload={handleDownloadStart}
            />
            <PlaylistDownloadDialog
                open={activeDialog === "playlist"}
                onOpenChange={(v) => !v && setActiveDialog(null)}
                onDownload={handlePlaylistDownload}
            />
        </div>
    );
}

export const Route = createFileRoute("/")((
    {
        component: HomePage,
    }
));
