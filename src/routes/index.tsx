import {
  PlayCircle,
  ListVideo,
  Layers,
  Zap,
  Github,
  Search,
  HardDrive,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useTransition, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { getAppVersion } from "@/actions/app";
import ExternalLink from "@/components/external-link";
import LangToggle from "@/components/lang-toggle";
import ToggleTheme from "@/components/toggle-theme";
import { useDownloads } from "@/hooks/useDownloads";
import { ScrollArea } from "@/components/ui/scroll-area";
import { BulkDownloadDialog } from "@/components/dialogs/bulk-download";
import { PlaylistDownloadDialog } from "@/components/dialogs/playlist-download";
import { SingleDownloadDialog } from "@/components/dialogs/single-download";
import type { QualityType } from "@/types/index";
import { StatCard } from "@/components/stat-card";
import { GlobalSearch } from "@/components/global-search";
import { ActionCard } from "@/components/action-card";
import { Help } from "@/components/tabs/help";
import { History as HistoryTab } from "@/components/tabs/history";
import { Settings as SettingsTab } from "@/components/tabs/settings";
import { Sidebar } from "@/components/sidebar";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  setAppVersion,
  setActiveDialog,
  setSearchOpen,
  toggleSearchOpen,
  setStorage,
} from "@/store/slices/app-slice";
import { setDownloadPath } from "@/store/slices/settings-slice";
import { RecentActivity } from "@/components/recent-activity";

function HomePage() {
  const dispatch = useAppDispatch();
  const { t } = useTranslation();
  const [, startGetAppVersion] = useTransition();

  const appVersion = useAppSelector((state) => state.app.appVersion);
  const activeTab = useAppSelector((state) => state.app.activeTab);
  const activeDialog = useAppSelector((state) => state.app.activeDialog);
  const searchOpen = useAppSelector((state) => state.app.searchOpen);
  const itemsPerPage = useAppSelector((state) => state.app.itemsPerPage);
  const historySearch = useAppSelector((state) => state.app.historySearch);
  const historyFilter = useAppSelector((state) => state.app.historyFilter);
  const downloadPath = useAppSelector((state) => state.settings.downloadPath);

  const {
    downloads: realDownloads,
    clearCompleted,
    addDownload,
    clearAll,
    updateDownload,
  } = useDownloads();

  const updateDiskUsage = async () => {
    if (globalThis.electron && globalThis.electron.getDiskUsage) {
      const data = await globalThis.electron.getDiskUsage(downloadPath);
      if (data) dispatch(setStorage(data));
    }
  };

  useEffect(() => {
    updateDiskUsage();
    const interval = setInterval(updateDiskUsage, 30000);
    return () => clearInterval(interval);
  }, [downloadPath]);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        dispatch(toggleSearchOpen());
      }
      if (e.key === "Escape") dispatch(setSearchOpen(false));
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [dispatch]);

  useEffect(() => {
    startGetAppVersion(async () => {
      const v = await getAppVersion();
      dispatch(setAppVersion(v));
    });
  }, [dispatch]);

  const dashboardDownloads = useMemo(() => {
    return realDownloads.slice(0, itemsPerPage);
  }, [realDownloads, itemsPerPage]);

  const filteredHistory = useMemo(() => {
    return realDownloads.filter((item) => {
      const matchesSearch =
        item.title.toLowerCase().includes(historySearch.toLowerCase()) ||
        item.url.toLowerCase().includes(historySearch.toLowerCase());
      const matchesStatus =
        historyFilter === "all" ? true : item.status === historyFilter;
      return matchesSearch && matchesStatus;
    });
  }, [realDownloads, historySearch, historyFilter]);

  const handleDownloadStart = (
    urls: string[],
    selectedQuality: QualityType,
  ) => {
    const newDownloads = addDownload(urls, selectedQuality);
    setTimeout(() => {
      if (newDownloads.length > 0) {
        updateDownload(newDownloads[0].id, {
          ...newDownloads[0],
          title: "Processing Video...",
          progress: 5,
        });
      }
    }, 1000);
  };

  const handleOpenFile = (download: any) => {
    if (download.status === "completed") {
      alert(`Opening file from: ${downloadPath}\n\n${download.title}`);
    } else if (download.status === "failed") {
      alert("This download failed. Retry?");
    }
  };

  const handleBrowseFolder = async () => {
    try {
      if (globalThis.electron && globalThis.electron.selectFolder) {
        const path = await globalThis.electron.selectFolder();
        if (path) {
          dispatch(setDownloadPath(path));
        }
      } else {
        console.warn("Electron IPC not detected. Using mock path.");
        dispatch(setDownloadPath("C:\\Users\\Electron\\Downloads"));
        alert("Mock path set! To fix, add 'selectFolder' to your preload.js.");
      }
    } catch (error) {
      console.error("Failed to select folder:", error);
    }
  };

  const activeDownloadsCount = realDownloads.filter(
    (d) => d.status === "downloading",
  ).length;
  const completedDownloadsCount = realDownloads.filter(
    (d) => d.status === "completed",
  ).length;

  return (
    <div className="flex h-screen w-full bg-background text-foreground overflow-hidden font-sans selection:bg-primary/20">
      <Sidebar />

      <main className="flex flex-1 flex-col bg-background relative">
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-border/40 px-6 backdrop-blur-sm bg-background/80">
          <div className="flex flex-1 max-w-md items-center">
            <button
              onClick={() => dispatch(setSearchOpen(true))}
              className="group flex h-9 w-full items-center gap-2 rounded-md border border-input bg-background/50 px-3 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            >
              <Search className="size-4 shrink-0 opacity-50" />
              <span className="flex-1 text-left">Search downloads...</span>
              <kbd className="pointer-events-none hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
                <span className="text-xs">⌘</span>K
              </kbd>
            </button>
          </div>
          <div className="flex items-center gap-3 pl-4">
            <ExternalLink
              href="https://github.com/imshawan"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <Github className="size-5" />
            </ExternalLink>
            <div className="h-4 w-[1px] bg-border" />
            <LangToggle />
            <ToggleTheme />
          </div>
        </header>

        <ScrollArea className="flex-1">
          <div className="p-8 pb-20 max-w-6xl mx-auto">
            {activeTab === "dashboard" && (
              <div className="flex flex-col gap-8 animate-in fade-in duration-500">
                <div className="space-y-1">
                  <h2 className="text-2xl font-semibold tracking-tight">
                    Overview
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Manage your downloads and active queues.
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <StatCard
                    icon={Zap}
                    label="Active Tasks"
                    value={activeDownloadsCount}
                    colorClass="text-amber-500"
                    subtext={
                      activeDownloadsCount > 0 ? "Processing..." : "Idle"
                    }
                  />
                  <StatCard
                    icon={CheckCircle2}
                    label="Completed"
                    value={completedDownloadsCount}
                    colorClass="text-emerald-500"
                    subtext="All time"
                  />
                  <StatCard
                    icon={HardDrive}
                    label="Total Size"
                    value="2.4 GB"
                    colorClass="text-blue-500"
                    subtext="Saved locally"
                  />
                  <StatCard
                    icon={AlertCircle}
                    label="Failed"
                    value={1}
                    colorClass="text-rose-500"
                    subtext="Requires attention"
                  />
                </div>

                <div className="space-y-4">
                  <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                    Start New Download
                  </h3>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    <ActionCard
                      title="Single Video"
                      description="Download MP4/MP3"
                      icon={PlayCircle}
                      gradient="from-blue-500/10 to-indigo-500/10"
                      iconColor="text-blue-500"
                      onClick={() => dispatch(setActiveDialog("single"))}
                    />
                    <ActionCard
                      title="Playlist"
                      description="Batch download series"
                      icon={ListVideo}
                      gradient="from-emerald-500/10 to-teal-500/10"
                      iconColor="text-emerald-500"
                      onClick={() => dispatch(setActiveDialog("playlist"))}
                    />
                    <ActionCard
                      title="Bulk Import"
                      description="Paste multiple links"
                      icon={Layers}
                      gradient="from-orange-500/10 to-amber-500/10"
                      iconColor="text-orange-500"
                      onClick={() => dispatch(setActiveDialog("bulk"))}
                    />
                  </div>
                </div>

                <RecentActivity
                  downloads={dashboardDownloads}
                  onOpenFile={handleOpenFile}
                />
              </div>
            )}

            {activeTab === "history" && (
              <HistoryTab
                downloads={filteredHistory}
                onOpenFile={handleOpenFile}
                onClearCompleted={clearCompleted}
                onClearAll={clearAll}
                completedCount={completedDownloadsCount}
              />
            )}

            {activeTab === "settings" && (
              <SettingsTab onBrowseFolder={handleBrowseFolder} />
            )}

            {activeTab === "help" && <Help />}
          </div>
        </ScrollArea>
      </main>

      <GlobalSearch
        isOpen={searchOpen}
        onClose={() => dispatch(setSearchOpen(false))}
        data={realDownloads}
        onSelect={handleOpenFile}
      />

      <SingleDownloadDialog
        open={activeDialog === "single"}
        onOpenChange={(v) => !v && dispatch(setActiveDialog(null))}
        onDownload={handleDownloadStart}
      />
      <BulkDownloadDialog
        open={activeDialog === "bulk"}
        onOpenChange={(v) => !v && dispatch(setActiveDialog(null))}
        onDownload={handleDownloadStart}
      />
      <PlaylistDownloadDialog
        open={activeDialog === "playlist"}
        onOpenChange={(v) => !v && dispatch(setActiveDialog(null))}
        onDownload={handleDownloadStart}
      />
    </div>
  );
}

export const Route = createFileRoute("/")({
  component: HomePage,
});
