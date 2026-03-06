import {
  Download,
  PlayCircle,
  ListVideo,
  Layers,
  Settings,
  Zap,
  Clock,
  Github,
  Search,
  LayoutGrid,
  History,
  HardDrive,
  CheckCircle2,
  AlertCircle,
  Folder,
  Monitor,
  HelpCircle,
  FileVideo,
  MoreVertical,
  Music,
  Youtube,
  Filter,
} from "lucide-react";
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, useTransition, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { getAppVersion } from "@/actions/app";
import ExternalLink from "@/components/external-link";
import LangToggle from "@/components/lang-toggle";
import ToggleTheme from "@/components/toggle-theme";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useDownloads } from "@/hooks/useDownloads";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/utils/tailwind";
import { StorageIndicator } from "@/components/storage-indicator";
import { AppHeader } from "@/components/app-header";
import { BulkDownloadDialog } from "@/components/dialogs/bulk-download";
import { PlaylistDownloadDialog } from "@/components/dialogs/playlist-download";
import { SingleDownloadDialog } from "@/components/dialogs/single-download";
import type { DownloadType, QualityType } from "@/types/index";
import { StatCard } from "@/components/stat-card";
import { NavButton } from "@/components/nav-button";
import { GlobalSearch } from "@/components/global-search";
import { ActionCard } from "@/components/action-card";
import { RadioItem } from "@/components/radio-item";
import { Help } from "@/components/tabs/help";

function HomePage() {
  const [appVersion, setAppVersion] = useState("0.0.0");
  const [, startGetAppVersion] = useTransition();
  const [selectedMode, setSelectedMode] = useState<DownloadType>("single");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("dashboard");
  const { t } = useTranslation();

  const [activeDialog, setActiveDialog] = useState<
    "single" | "bulk" | "playlist" | null
  >(null);

  // --- SETTINGS STATE ---
  const [quality, setQuality] = useState(
    localStorage.getItem("downloadQuality") || "best",
  );
  const [downloadPath, setDownloadPath] = useState(
    localStorage.getItem("downloadPath") || "",
  );
  const [autoStart, setAutoStart] = useState(
    localStorage.getItem("autoStart") === "true",
  );

  // --- SEARCH, FILTERS & PAGINATION STATE ---
  const [searchOpen, setSearchOpen] = useState(false);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  // HISTORY SPECIFIC STATES
  const [historySearch, setHistorySearch] = useState("");
  const [historyFilter, setHistoryFilter] = useState("all");

  // --- DATA ---
  const {
    downloads: realDownloads,
    clearCompleted,
    addDownload,
    clearAll,
    updateDownload,
  } = useDownloads();

  const [storage, setStorage] = useState({
    used: "0",
    total: "0",
    percentage: 0,
  });

  const updateDiskUsage = async () => {
    if (globalThis.electron && globalThis.electron.getDiskUsage) {
      // @ts-ignore
      const data = await globalThis.electron.getDiskUsage(downloadPath);
      if (data) setStorage(data);
    }
  };

  // Update when component mounts or path changes
  useEffect(() => {
    updateDiskUsage();

    // Optional: Refresh storage every 30 seconds
    const interval = setInterval(updateDiskUsage, 30000);
    return () => clearInterval(interval);
  }, [downloadPath]);

  // --- EFFECT: PERSIST SETTINGS ---
  const saveSettings = () => {
    localStorage.setItem("downloadQuality", quality);
    localStorage.setItem("downloadPath", downloadPath);
    localStorage.setItem("autoStart", autoStart.toString());
  };

  useEffect(() => {
    saveSettings();
  }, [quality, downloadPath, autoStart]);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setSearchOpen((open) => !open);
      }
      if (e.key === "Escape") setSearchOpen(false);
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  useEffect(
    () => startGetAppVersion(() => getAppVersion().then(setAppVersion)),
    [],
  );

  // --- FILTER LOGIC ---
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

    // Simulate initial progress for demo
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
      // Check for Electron IPC
      // @ts-ignore
      if (globalThis.electron && globalThis.electron.selectFolder) {
        // Use the Bridge exposed in preload.js
        // @ts-ignore
        const path = await globalThis.electron.selectFolder();
        if (path) {
          setDownloadPath(path);
        }
      } else {
        // Fallback for Development/Browser mode
        console.warn("Electron IPC not detected. Using mock path.");
        setDownloadPath("C:\\Users\\Electron\\Downloads");
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
      {/* SIDEBAR */}
      <aside className="flex w-64 flex-col gap-2 relative h-full border-r border-border/40 bg-muted/10 p-4">
        <AppHeader appName={t("appName")} appVersion={appVersion} />

        <div className="space-y-1">
          <NavButton
            icon={LayoutGrid}
            label="Dashboard"
            isActive={activeTab === "dashboard"}
            onClick={() => setActiveTab("dashboard")}
          />
          <NavButton
            icon={History}
            label="History"
            isActive={activeTab === "history"}
            onClick={() => setActiveTab("history")}
          />
          <NavButton
            icon={Settings}
            label="Settings"
            isActive={activeTab === "settings"}
            onClick={() => setActiveTab("settings")}
          />
          <NavButton
            icon={HelpCircle}
            label="Help"
            isActive={activeTab === "help"}
            onClick={() => setActiveTab("help")}
          />
        </div>

        <StorageIndicator used={storage.used} total={storage.total} percentage={storage.percentage} />
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex flex-1 flex-col bg-background relative">
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-border/40 px-6 backdrop-blur-sm bg-background/80">
          <div className="flex flex-1 max-w-md items-center">
            <button
              onClick={() => setSearchOpen(true)}
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
            {/* 1. DASHBOARD VIEW */}
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
                      onClick={() => setActiveDialog("single")}
                    />
                    <ActionCard
                      title="Playlist"
                      description="Batch download series"
                      icon={ListVideo}
                      gradient="from-emerald-500/10 to-teal-500/10"
                      iconColor="text-emerald-500"
                      onClick={() => setActiveDialog("playlist")}
                    />
                    <ActionCard
                      title="Bulk Import"
                      description="Paste multiple links"
                      icon={Layers}
                      gradient="from-orange-500/10 to-amber-500/10"
                      iconColor="text-orange-500"
                      onClick={() => setActiveDialog("bulk")}
                    />
                  </div>
                </div>

                {/* Dashboard Recent Activity */}
                <div className="flex flex-1 flex-col overflow-hidden rounded-xl border border-border/50 bg-card shadow-sm">
                  <div className="flex items-center justify-between border-b border-border/50 px-6 py-4 bg-muted/10">
                    <h3 className="font-medium">Recent Activity</h3>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setActiveTab("history")}
                      className="h-7 text-xs text-muted-foreground hover:text-foreground"
                    >
                      View All
                    </Button>
                  </div>

                  <div className="bg-background/50 p-0">
                    {dashboardDownloads.length > 0 ? (
                      <div className="w-full">
                        <div className="divide-y divide-border/40">
                          {dashboardDownloads.map((download) => (
                            <div
                              key={download.id}
                              className="group flex items-center justify-between p-4 transition-colors hover:bg-muted/30 cursor-pointer"
                              onClick={() => handleOpenFile(download)}
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
                                    {download.title || "Unknown Video"}
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
                                        style={{
                                          width: `${download.progress}%`,
                                        }}
                                      />
                                    </div>
                                    <span className="text-[10px] text-primary font-medium">
                                      {Math.round(download.progress)}%
                                    </span>
                                  </div>
                                ) : download.status === "failed" ? (
                                  <span className="text-xs font-medium text-rose-500 bg-rose-500/10 px-2 py-0.5 rounded-full border border-rose-500/20">
                                    Failed
                                  </span>
                                ) : (
                                  <span className="text-xs font-medium text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                                    Completed
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
                        <p className="text-sm">No recent downloads.</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* 2. HISTORY VIEW */}
            {activeTab === "history" && (
              <div className="flex flex-col gap-6 animate-in fade-in duration-500">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <h2 className="text-2xl font-semibold tracking-tight">
                      History
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      View and manage your download history.
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={clearCompleted}
                      disabled={completedDownloadsCount === 0}
                    >
                      Clear Completed
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={clearAll}
                      disabled={realDownloads.length === 0}
                    >
                      Clear All
                    </Button>
                  </div>
                </div>

                <div className="rounded-xl border border-border/50 bg-card shadow-sm overflow-hidden">
                  {/* HISTORY TOOLBAR */}
                  <div className="p-4 border-b border-border/40 bg-muted/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      <div className="relative w-full sm:w-64">
                        <Search className="absolute left-2.5 top-2.5 size-3.5 text-muted-foreground" />
                        <Input
                          placeholder="Search history..."
                          value={historySearch}
                          onChange={(e) => setHistorySearch(e.target.value)}
                          className="pl-8 h-8 text-xs bg-background"
                        />
                      </div>
                      {/* STATUS FILTER */}
                      <Select
                        value={historyFilter}
                        onValueChange={setHistoryFilter}
                      >
                        <SelectTrigger className="h-8 w-[130px] text-xs bg-background">
                          <div className="flex items-center gap-2">
                            <Filter className="size-3 text-muted-foreground" />
                            <SelectValue placeholder="Status" />
                          </div>
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Status</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                          <SelectItem value="downloading">
                            Downloading
                          </SelectItem>
                          <SelectItem value="failed">Failed</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      Showing {filteredHistory.length} items
                    </span>
                  </div>

                  {filteredHistory.length > 0 ? (
                    <div className="divide-y divide-border/40 max-h-[600px] overflow-y-auto">
                      {filteredHistory.map((download) => (
                        <div
                          key={download.id}
                          className="flex items-center justify-between p-4 hover:bg-muted/30 cursor-pointer transition-colors"
                          onClick={() => handleOpenFile(download)}
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
                              <span className="font-medium text-sm">
                                {download.title}
                              </span>
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
                                <CheckCircle2 className="size-3" /> Completed
                              </div>
                            ) : download.status === "failed" ? (
                              <div className="flex items-center gap-1.5 bg-rose-500/10 text-rose-500 px-2 py-0.5 rounded text-[10px] font-medium border border-rose-500/20">
                                <AlertCircle className="size-3" /> Failed
                              </div>
                            ) : (
                              <div className="flex items-center gap-1.5 bg-amber-500/10 text-amber-500 px-2 py-0.5 rounded text-[10px] font-medium border border-amber-500/20">
                                <Zap className="size-3" />{" "}
                                {Math.round(download.progress)}%
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
                      <p className="text-sm font-medium">No results found</p>
                      <p className="text-xs opacity-70 mt-1">
                        Try adjusting your filters or search query.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 3. SETTINGS VIEW */}
            {activeTab === "settings" && (
              <div className="flex flex-col gap-8 animate-in fade-in duration-500 max-w-3xl">
                <div className="space-y-1">
                  <h2 className="text-2xl font-semibold tracking-tight">
                    Settings
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Customize your download preferences.
                  </p>
                </div>

                <div className="space-y-6">
                  <section className="rounded-xl border border-border/50 bg-card p-6">
                    <div className="mb-4 flex items-center gap-2">
                      <Monitor className="size-4 text-primary" />
                      <h2 className="text-base font-semibold">
                        Download Quality
                      </h2>
                    </div>
                    <div className="grid gap-2">
                      <RadioItem
                        value="best"
                        selectedValue={quality}
                        onChange={setQuality}
                        label="Best Quality"
                        desc="Highest available resolution and bitrate (4K/8K)"
                      />
                      <RadioItem
                        value="high"
                        selectedValue={quality}
                        onChange={setQuality}
                        label="High Quality"
                        desc="1080p or best available"
                      />
                      <RadioItem
                        value="medium"
                        selectedValue={quality}
                        onChange={setQuality}
                        label="Medium Quality"
                        desc="720p or best available"
                      />
                      <RadioItem
                        value="low"
                        selectedValue={quality}
                        onChange={setQuality}
                        label="Low Quality"
                        desc="480p (Data saver)"
                      />
                    </div>
                  </section>

                  <section className="rounded-xl border border-border/50 bg-card p-6">
                    <div className="mb-4 flex items-center gap-2">
                      <Folder className="size-4 text-primary" />
                      <h2 className="text-base font-semibold">
                        Storage Location
                      </h2>
                    </div>
                    <div className="space-y-3">
                      <Label htmlFor="download-path">Save downloads to</Label>
                      <div className="flex gap-2">
                        <Input
                          id="download-path"
                          value={downloadPath}
                          onChange={(e) => setDownloadPath(e.target.value)}
                          placeholder="C:/Users/Downloads"
                          className="font-mono text-sm bg-muted/30"
                        />
                        <Button variant="outline" onClick={handleBrowseFolder}>
                          Browse
                        </Button>
                      </div>
                      <p className="text-[10px] text-muted-foreground">
                        Changes are auto-saved to config.json
                      </p>
                    </div>
                  </section>

                  <section className="rounded-xl border border-border/50 bg-card p-6">
                    <h2 className="text-base font-semibold mb-4">General</h2>
                    <div className="flex items-center justify-between rounded-lg border border-border/30 bg-background/50 p-4">
                      <div className="space-y-0.5">
                        <Label htmlFor="autostart" className="text-base">
                          Auto-start downloads
                        </Label>
                        <p className="text-xs text-muted-foreground">
                          Begin downloading immediately when added
                        </p>
                      </div>
                      <Switch
                        id="autostart"
                        checked={autoStart}
                        onCheckedChange={setAutoStart}
                      />
                    </div>
                  </section>
                </div>
              </div>
            )}

            {/* 4. HELP VIEW */}
            {activeTab === "help" && <Help />}
          </div>
        </ScrollArea>
      </main>

      {/* Command Palette Overlay */}
      <GlobalSearch
        isOpen={searchOpen}
        onClose={() => setSearchOpen(false)}
        data={realDownloads}
        onSelect={handleOpenFile}
      />

      {/* Dynamic Dialogs */}
      <SingleDownloadDialog
        open={activeDialog === "single"}
        onOpenChange={(v) => !v && setActiveDialog(null)}
        onDownload={handleDownloadStart}
      />
      <BulkDownloadDialog
        open={activeDialog === "bulk"}
        onOpenChange={(v) => !v && setActiveDialog(null)}
        onDownload={handleDownloadStart}
      />
      <PlaylistDownloadDialog
        open={activeDialog === "playlist"}
        onOpenChange={(v) => !v && setActiveDialog(null)}
        onDownload={handleDownloadStart}
      />
    </div>
  );
}

export const Route = createFileRoute("/")({
  component: HomePage,
});
