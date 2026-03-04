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
  Check,
  HelpCircle,
  Shield,
  FileVideo,
  MoreVertical,
  ChevronLeft,
  ChevronRight,
  Play,
  Music,
  Youtube,
  Film,
  ChevronDown,
  Filter
} from "lucide-react";
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, useTransition, useMemo, useRef } from "react";
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
import {
  DownloadOptionsDialog,
  type DownloadType,
  type QualityType,
} from "@/components/DownloadOptionsDialog";
import { useDownloads } from "@/hooks/useDownloads";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/utils/tailwind";

// TAURI API IMPORT
// Ensure you have run: npm install @tauri-apps/api
import { open } from '@tauri-apps/plugin-dialog';

// --- DUMMY DATA GENERATOR ---
const MOCK_DATA = [
  { id: "1", title: "Next.js 14 Full Course 2024 | Build and Deploy a Full Stack App", channel: "Javascript Mastery", url: "https://youtu.be/wm5gMKuwSYk", progress: 100, status: "completed", size: "1.2 GB", quality: "1080p", type: "video", date: "2 mins ago" },
  { id: "2", title: "lofi hip hop radio - beats to relax/study to", channel: "Lofi Girl", url: "https://youtu.be/jfKfPfyJRdk", progress: 45, status: "downloading", size: "Unknown", quality: "Audio", type: "audio", date: "Just now" },
  { id: "3", title: "Rust for Beginners - Full Tutorial", channel: "FreeCodeCamp", url: "https://youtu.be/MsocPEZqCJ4", progress: 100, status: "completed", size: "850 MB", quality: "1080p", type: "video", date: "1 hour ago" },
  { id: "4", title: "Elden Ring: Shadow of the Erdtree - Official Trailer", channel: "Bandai Namco", url: "https://youtu.be/qLZenOn7WUo", progress: 100, status: "completed", size: "240 MB", quality: "4K", type: "video", date: "3 hours ago" },
  { id: "5", title: "Top 10 Linux Terminal Commands You Must Know", channel: "NetworkChuck", url: "https://youtu.be/lZAoFs75_cs", progress: 12, status: "downloading", size: "120 MB", quality: "1080p", type: "video", date: "Just now" },
  { id: "6", title: "System Design Interview - Rate Limiter", channel: "ByteByteGo", url: "https://youtu.be/FU4WlwfS3G0", progress: 100, status: "completed", size: "180 MB", quality: "1080p", type: "video", date: "Yesterday" },
  { id: "7", title: "Deep Learning for Coders with fastai & PyTorch", channel: "Jeremy Howard", url: "https://youtu.be/8SF_h3xF3cE", progress: 0, status: "failed", size: "0 B", quality: "1080p", type: "video", date: "Yesterday" },
  { id: "8", title: "React vs Vue - Which is better in 2024?", channel: "Fireship", url: "https://youtu.be/lkIFF4maKMU", progress: 100, status: "completed", size: "45 MB", quality: "1080p", type: "video", date: "2 days ago" },
  { id: "9", title: "Kubernetes Explained in 100 Seconds", channel: "Fireship", url: "https://youtu.be/PVLmVZ33JH8", progress: 100, status: "completed", size: "25 MB", quality: "1080p", type: "video", date: "2 days ago" },
  { id: "10", title: "Harvard CS50 - Lecture 1 - C", channel: "CS50", url: "https://youtu.be/zYD7nN17G3E", progress: 100, status: "completed", size: "2.1 GB", quality: "1080p", type: "video", date: "Last week" },
  { id: "11", title: "Chillstep Mix 2024", channel: "Music Lab", url: "https://youtu.be/xyz123", progress: 100, status: "completed", size: "150 MB", quality: "Audio", type: "audio", date: "Last week" },
  { id: "12", title: "How to Center a Div", channel: "Kevin Powell", url: "https://youtu.be/abc987", progress: 100, status: "completed", size: "30 MB", quality: "1080p", type: "video", date: "Last month" },
];

// --- SUBCOMPONENTS ---

function NavButton({ icon: Icon, label, isActive, onClick }: any) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-all duration-200",
        isActive
          ? "bg-primary/10 text-primary"
          : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
      )}
    >
      <Icon className="size-4" />
      {label}
    </button>
  );
}

function StatCard({ icon: Icon, label, value, colorClass, subtext }: any) {
  return (
    <div className="flex flex-col rounded-xl border border-border/50 bg-card p-5 shadow-sm transition-all hover:shadow-md">
      <div className="mb-4 flex items-center justify-between">
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          {label}
        </span>
        <Icon className={cn("size-4", colorClass)} />
      </div>
      <div className="text-2xl font-bold text-foreground">{value}</div>
      <div className="text-xs text-muted-foreground mt-1">{subtext}</div>
    </div>
  );
}

function ActionCard({ title, description, icon: Icon, gradient, iconColor, onClick }: any) {
  return (
    <button
      onClick={onClick}
      className="group relative overflow-hidden rounded-xl border border-border/50 bg-card p-6 text-left transition-all hover:-translate-y-1 hover:shadow-lg"
    >
      <div
        className={cn(
          "absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100 bg-gradient-to-br",
          gradient
        )}
      />
      <div className="relative z-10 flex flex-col h-full">
        <div className="mb-4 flex size-10 items-center justify-center rounded-lg bg-background border border-border/50 shadow-sm">
          <Icon className={cn("size-5", iconColor)} />
        </div>
        <h3 className="mb-1 text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
          {title}
        </h3>
        <p className="text-sm text-muted-foreground group-hover:text-foreground/80 transition-colors">
          {description}
        </p>
      </div>
    </button>
  );
}

function CustomRadioItem({ value, selectedValue, onChange, label, desc }: any) {
  const isSelected = value === selectedValue;
  return (
    <div
      onClick={() => onChange(value)}
      className={cn(
        "flex cursor-pointer items-start space-x-3 rounded-lg border p-3 transition-all hover:bg-accent",
        isSelected ? "border-primary bg-primary/5" : "border-transparent"
      )}
    >
      <div className={cn(
        "mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full border border-primary",
        isSelected ? "bg-primary text-primary-foreground" : "opacity-50"
      )}>
        {isSelected && <Check className="size-3" />}
      </div>
      <div className="space-y-1">
        <p className="font-medium leading-none text-sm">{label}</p>
        <p className="text-xs text-muted-foreground">{desc}</p>
      </div>
    </div>
  );
}

// --- COMMAND PALETTE COMPONENT ---
function CommandPalette({ isOpen, onClose, data, onSelect }: any) {
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery("");
    }
  }, [isOpen]);

  const filtered = data.filter((item: any) =>
    item.title.toLowerCase().includes(query.toLowerCase()) ||
    item.channel.toLowerCase().includes(query.toLowerCase())
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-background/80 px-4 pt-20 backdrop-blur-sm transition-all animate-in fade-in duration-200">
      <div
        className="fixed inset-0 z-40"
        onClick={onClose}
      />
      <div className="relative z-50 flex w-full max-w-3xl flex-col overflow-hidden rounded-xl border border-border/50 bg-popover shadow-2xl animate-in zoom-in-95 duration-200">
        <div className="flex items-center border-b border-border/40 px-4">
          <Search className="mr-2 size-5 text-muted-foreground opacity-50" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex h-14 w-full rounded-md bg-transparent py-3 text-lg outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
            placeholder="Type to search downloads..."
          />
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100">ESC</kbd>
            <span>to close</span>
          </div>
        </div>

        <ScrollArea className="h-[350px] w-full">
          <div className="p-2">
            {filtered.length === 0 ? (
              <div className="py-14 text-center text-sm text-muted-foreground">
                No results found.
              </div>
            ) : (
              <div className="space-y-1">
                <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
                  Results ({filtered.length})
                </div>
                {filtered.map((item: any) => (
                  <button
                    key={item.id}
                    onClick={() => { onSelect(item); onClose(); }}
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left text-sm transition-colors hover:bg-accent hover:text-accent-foreground group"
                  >
                    <div className={cn(
                      "flex size-10 shrink-0 items-center justify-center rounded-md border border-border/50",
                      item.type === "audio" ? "bg-purple-500/10 text-purple-500" : "bg-blue-500/10 text-blue-500"
                    )}>
                      {item.type === "audio" ? <Music className="size-5" /> : <Film className="size-5" />}
                    </div>
                    <div className="flex flex-1 flex-col overflow-hidden">
                      <span className="truncate font-medium">{item.title}</span>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{item.channel}</span>
                        <span>•</span>
                        <span>{item.size}</span>
                        <span>•</span>
                        <span className={cn(
                          item.status === "completed" ? "text-emerald-500" :
                            item.status === "failed" ? "text-rose-500" : "text-amber-500"
                        )}>
                           {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                         </span>
                      </div>
                    </div>
                    <Play className="size-4 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground" />
                  </button>
                ))}
              </div>
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}

// --- MAIN PAGE ---

function HomePage() {
  const [appVersion, setAppVersion] = useState("0.0.0");
  const [, startGetAppVersion] = useTransition();
  const [selectedMode, setSelectedMode] = useState<DownloadType>("video");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("dashboard");
  const { t } = useTranslation();

  // --- SETTINGS STATE ---
  const [quality, setQuality] = useState(localStorage.getItem("downloadQuality") || "best");
  const [downloadPath, setDownloadPath] = useState(localStorage.getItem("downloadPath") || "");
  const [autoStart, setAutoStart] = useState(localStorage.getItem("autoStart") === "true");

  // --- SEARCH, FILTERS & PAGINATION STATE ---
  const [searchOpen, setSearchOpen] = useState(false);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  // HISTORY SPECIFIC STATES
  const [historySearch, setHistorySearch] = useState("");
  const [historyFilter, setHistoryFilter] = useState("all");

  // --- DATA ---
  const {
    downloads: realDownloads,
    addDownload,
  } = useDownloads();

  const [displayDownloads, setDisplayDownloads] = useState<any[]>([]);
  const [storage, setStorage] = useState({ used: "0", total: "0", percentage: 0 });

  const updateDiskUsage = async () => {
    // @ts-ignore
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

  useEffect(() => {
    if (realDownloads.length === 0) {
      setDisplayDownloads(MOCK_DATA);
    } else {
      setDisplayDownloads(realDownloads);
    }
  }, [realDownloads]);

  // --- EFFECT: PERSIST SETTINGS ---
  const saveSettings = () => {
    localStorage.setItem("downloadQuality", quality);
    localStorage.setItem("downloadPath", downloadPath);
    localStorage.setItem("autoStart", autoStart.toString());
  };

  useEffect(() => { saveSettings() }, [quality, downloadPath, autoStart]);

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
    []
  );

  // --- FILTER LOGIC ---
  const dashboardDownloads = useMemo(() => {
    return displayDownloads.slice(0, itemsPerPage);
  }, [displayDownloads, itemsPerPage]);

  const filteredHistory = useMemo(() => {
    return displayDownloads.filter(item => {
      const matchesSearch = item.title.toLowerCase().includes(historySearch.toLowerCase()) ||
        item.url.toLowerCase().includes(historySearch.toLowerCase());
      const matchesStatus = historyFilter === "all" ? true : item.status === historyFilter;
      return matchesSearch && matchesStatus;
    });
  }, [displayDownloads, historySearch, historyFilter]);


  const handleModeSelect = (mode: DownloadType) => {
    setSelectedMode(mode);
    setDialogOpen(true);
  };

  const handleDownloadStart = (type: DownloadType, urls: string[], quality: QualityType) => {
    const newDownloads = urls.map((url, i) => ({
      id: `new-${Date.now()}-${i}`,
      title: "Fetching metadata...",
      channel: "Unknown Channel",
      url: url,
      progress: 0,
      status: "downloading",
      size: "Calculating...",
      quality: quality,
      type: "video",
      date: "Just now"
    }));
    setDisplayDownloads(prev => [...newDownloads, ...prev]);
    setDialogOpen(false);
    setTimeout(() => {
      setDisplayDownloads(prev => prev.map(d => d.id === newDownloads[0].id ? { ...d, title: "New Download Started", progress: 5 } : d));
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

  const activeDownloadsCount = displayDownloads.filter((d) => d.status === "downloading").length;
  const completedDownloadsCount = displayDownloads.filter((d) => d.status === "completed").length;

  const faqs = [
    { question: "What video formats are supported?", answer: "TubeSnag supports MP4, WebM, and audio formats. You can download in your preferred quality from 480p to 4K." },
    { question: "Can I download playlists?", answer: "Yes! You can download entire YouTube playlists at once. Just paste the playlist URL and select the playlist option." },
    { question: "How do I bulk download?", answer: "Simply paste multiple YouTube URLs separated by commas. TubeSnag will process them all automatically." },
  ];

  return (
    <div className="flex h-screen w-full bg-background text-foreground overflow-hidden font-sans selection:bg-primary/20">

      {/* SIDEBAR */}
      <aside className="flex w-64 flex-col gap-2 relative h-full border-r border-border/40 bg-muted/10 p-4">
        <div className="flex items-center gap-3 px-2 py-4 mb-4">
          <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-md">
            <Download className="size-5" />
          </div>
          <div>
            <h1 className="text-sm font-bold tracking-tight">{t("appName")}</h1>
            <p className="text-[10px] text-muted-foreground font-mono">v{appVersion}</p>
          </div>
        </div>

        <div className="space-y-1">
          <NavButton icon={LayoutGrid} label="Dashboard" isActive={activeTab === "dashboard"} onClick={() => setActiveTab("dashboard")} />
          <NavButton icon={History} label="History" isActive={activeTab === "history"} onClick={() => setActiveTab("history")} />
          <NavButton icon={Settings} label="Settings" isActive={activeTab === "settings"} onClick={() => setActiveTab("settings")} />
          <NavButton icon={HelpCircle} label="Help" isActive={activeTab === "help"} onClick={() => setActiveTab("help")} />
        </div>

        <div className="mt-auto mb-8 rounded-xl border border-border/50 bg-card p-4 shadow-sm">
          <div className="mb-2 flex items-center justify-between text-xs text-muted-foreground">
            <span>Storage</span>
            <span>{storage.percentage}%</span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
            <div className={`h-full rounded-full bg-primary`} style={{ width: `${storage.percentage}%` }} />
          </div>
          <div className="mt-2 text-[10px] text-muted-foreground">
            {storage.used} GB used of {storage.total} GB
          </div>
        </div>
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
            <ExternalLink href="https://github.com/imshawan" className="text-muted-foreground hover:text-foreground transition-colors">
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
                  <h2 className="text-2xl font-semibold tracking-tight">Overview</h2>
                  <p className="text-sm text-muted-foreground">Manage your downloads and active queues.</p>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <StatCard icon={Zap} label="Active Tasks" value={activeDownloadsCount} colorClass="text-amber-500" subtext={activeDownloadsCount > 0 ? "Processing..." : "Idle"} />
                  <StatCard icon={CheckCircle2} label="Completed" value={completedDownloadsCount} colorClass="text-emerald-500" subtext="All time" />
                  <StatCard icon={HardDrive} label="Total Size" value="2.4 GB" colorClass="text-blue-500" subtext="Saved locally" />
                  <StatCard icon={AlertCircle} label="Failed" value={1} colorClass="text-rose-500" subtext="Requires attention" />
                </div>

                <div className="space-y-4">
                  <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Start New Download</h3>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    <ActionCard title="Single Video" description="Download MP4/MP3" icon={PlayCircle} gradient="from-blue-500/10 to-indigo-500/10" iconColor="text-blue-500" onClick={() => handleModeSelect("video")} />
                    <ActionCard title="Playlist" description="Batch download series" icon={ListVideo} gradient="from-emerald-500/10 to-teal-500/10" iconColor="text-emerald-500" onClick={() => handleModeSelect("playlist")} />
                    <ActionCard title="Bulk Import" description="Paste multiple links" icon={Layers} gradient="from-orange-500/10 to-amber-500/10" iconColor="text-orange-500" onClick={() => handleModeSelect("bulk")} />
                  </div>
                </div>

                {/* Dashboard Recent Activity */}
                <div className="flex flex-1 flex-col overflow-hidden rounded-xl border border-border/50 bg-card shadow-sm">
                  <div className="flex items-center justify-between border-b border-border/50 px-6 py-4 bg-muted/10">
                    <h3 className="font-medium">Recent Activity</h3>
                    <Button variant="ghost" size="sm" onClick={() => setActiveTab("history")} className="h-7 text-xs text-muted-foreground hover:text-foreground">View All</Button>
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
                                <div className={cn(
                                  "flex size-10 shrink-0 items-center justify-center rounded-lg border border-border/50 transition-colors",
                                  download.status === "failed" ? "bg-rose-500/10 border-rose-500/20" :
                                    download.status === "downloading" ? "bg-amber-500/10 border-amber-500/20" : "bg-muted group-hover:bg-background"
                                )}>
                                  {download.status === "failed" ? <AlertCircle className="size-5 text-rose-500" /> :
                                    download.type === "audio" ? <Music className="size-5 text-purple-500" /> :
                                      <Youtube className="size-5 text-red-500" />
                                  }
                                </div>
                                <div className="flex flex-col overflow-hidden">
                                  <span className="font-medium truncate text-sm text-foreground">{download.title || "Unknown Video"}</span>
                                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                    <span className="truncate max-w-[150px]">{download.channel}</span>
                                    <span className="h-1 w-1 rounded-full bg-border" />
                                    <span>{download.quality}</span>
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-center gap-6 shrink-0">
                                {download.status === "downloading" ? (
                                  <div className="flex flex-col items-end gap-1 w-24">
                                    <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                                      <div className="h-full bg-primary rounded-full transition-all duration-300 animate-pulse" style={{ width: `${download.progress}%` }} />
                                    </div>
                                    <span className="text-[10px] text-primary font-medium">{Math.round(download.progress)}%</span>
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

                                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
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
                    <h2 className="text-2xl font-semibold tracking-tight">History</h2>
                    <p className="text-sm text-muted-foreground">View and manage your download history.</p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={clearCompleted} disabled={completedDownloadsCount === 0}>Clear Completed</Button>
                    <Button variant="destructive" size="sm" onClick={clearAll} disabled={displayDownloads.length === 0}>Clear All</Button>
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
                      <Select value={historyFilter} onValueChange={setHistoryFilter}>
                        <SelectTrigger className="h-8 w-[130px] text-xs bg-background">
                          <div className="flex items-center gap-2">
                            <Filter className="size-3 text-muted-foreground" />
                            <SelectValue placeholder="Status" />
                          </div>
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Status</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                          <SelectItem value="downloading">Downloading</SelectItem>
                          <SelectItem value="failed">Failed</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">Showing {filteredHistory.length} items</span>
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
                              {download.type === "audio" ? <Music className="size-5 text-muted-foreground" /> : <FileVideo className="size-5 text-muted-foreground" />}
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
                            <span className="text-xs text-muted-foreground hidden sm:block">{download.quality} • {download.size}</span>
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
                      <p className="text-sm font-medium">No results found</p>
                      <p className="text-xs opacity-70 mt-1">Try adjusting your filters or search query.</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 3. SETTINGS VIEW */}
            {activeTab === "settings" && (
              <div className="flex flex-col gap-8 animate-in fade-in duration-500 max-w-3xl">
                <div className="space-y-1">
                  <h2 className="text-2xl font-semibold tracking-tight">Settings</h2>
                  <p className="text-sm text-muted-foreground">Customize your download preferences.</p>
                </div>

                <div className="space-y-6">
                  <section className="rounded-xl border border-border/50 bg-card p-6">
                    <div className="mb-4 flex items-center gap-2">
                      <Monitor className="size-4 text-primary" />
                      <h2 className="text-base font-semibold">Download Quality</h2>
                    </div>
                    <div className="grid gap-2">
                      <CustomRadioItem value="best" selectedValue={quality} onChange={setQuality} label="Best Quality" desc="Highest available resolution and bitrate (4K/8K)" />
                      <CustomRadioItem value="high" selectedValue={quality} onChange={setQuality} label="High Quality" desc="1080p or best available" />
                      <CustomRadioItem value="medium" selectedValue={quality} onChange={setQuality} label="Medium Quality" desc="720p or best available" />
                      <CustomRadioItem value="low" selectedValue={quality} onChange={setQuality} label="Low Quality" desc="480p (Data saver)" />
                    </div>
                  </section>

                  <section className="rounded-xl border border-border/50 bg-card p-6">
                    <div className="mb-4 flex items-center gap-2">
                      <Folder className="size-4 text-primary" />
                      <h2 className="text-base font-semibold">Storage Location</h2>
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
                        <Button variant="outline" onClick={handleBrowseFolder}>Browse</Button>
                      </div>
                      <p className="text-[10px] text-muted-foreground">Changes are auto-saved to config.json</p>
                    </div>
                  </section>

                  <section className="rounded-xl border border-border/50 bg-card p-6">
                    <h2 className="text-base font-semibold mb-4">General</h2>
                    <div className="flex items-center justify-between rounded-lg border border-border/30 bg-background/50 p-4">
                      <div className="space-y-0.5">
                        <Label htmlFor="autostart" className="text-base">Auto-start downloads</Label>
                        <p className="text-xs text-muted-foreground">Begin downloading immediately when added</p>
                      </div>
                      <Switch id="autostart" checked={autoStart} onCheckedChange={setAutoStart} />
                    </div>
                  </section>
                </div>
              </div>
            )}

            {/* 4. HELP VIEW */}
            {activeTab === "help" && (
              <div className="flex flex-col gap-8 animate-in fade-in duration-500 max-w-4xl mx-auto">
                <div className="text-center space-y-2 mb-4">
                  <div className="flex items-center justify-center gap-3">
                    <HelpCircle className="size-8 text-primary" />
                    <h1 className="text-3xl font-bold">Help & Documentation</h1>
                  </div>
                  <p className="text-muted-foreground">Learn how to use TubeSnag and get answers to common questions.</p>
                </div>

                <div>
                  <h2 className="text-lg font-semibold mb-4">Key Features</h2>
                  <div className="grid gap-4 sm:grid-cols-3">
                    <div className="rounded-xl border border-border/50 bg-card p-5">
                      <Download className="mb-3 size-6 text-primary" />
                      <h3 className="mb-1 font-semibold">Multiple Modes</h3>
                      <p className="text-sm text-muted-foreground">Download single videos, bulk URLs, or playlists.</p>
                    </div>
                    <div className="rounded-xl border border-border/50 bg-card p-5">
                      <Zap className="mb-3 size-6 text-primary" />
                      <h3 className="mb-1 font-semibold">Lightning Fast</h3>
                      <p className="text-sm text-muted-foreground">High-speed concurrent downloads.</p>
                    </div>
                    <div className="rounded-xl border border-border/50 bg-card p-5">
                      <Shield className="mb-3 size-6 text-primary" />
                      <h3 className="mb-1 font-semibold">100% Private</h3>
                      <p className="text-sm text-muted-foreground">No tracking, no data collection.</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h2 className="text-lg font-semibold">Frequently Asked Questions</h2>
                  <div className="space-y-3">
                    {faqs.map((faq, index) => (
                      <details
                        key={index}
                        className="group rounded-xl border border-border/50 bg-card/50 px-5 py-3 transition-all hover:bg-card/80 open:bg-card open:shadow-sm"
                      >
                        <summary className="flex cursor-pointer items-center justify-between font-medium outline-none">
                          {faq.question}
                          <ChevronDown className="size-4 text-muted-foreground transition-transform duration-200 group-open:rotate-180" />
                        </summary>
                        <p className="mt-3 text-sm text-muted-foreground leading-relaxed animate-in slide-in-from-top-2">
                          {faq.answer}
                        </p>
                      </details>
                    ))}
                  </div>
                </div>

                <div className="rounded-xl border border-border/50 bg-primary/5 p-6 text-center">
                  <p className="text-sm text-muted-foreground">
                    Need more help? Check out the{" "}
                    <ExternalLink href="https://github.com/imshawan/tubesnag-desktop" className="font-medium text-primary hover:underline">
                      GitHub repository
                    </ExternalLink>
                    {" "}for additional resources.
                  </p>
                </div>
              </div>
            )}

          </div>
        </ScrollArea>
      </main>

      {/* Command Palette Overlay */}
      <CommandPalette
        isOpen={searchOpen}
        onClose={() => setSearchOpen(false)}
        data={displayDownloads}
        onSelect={handleOpenFile}
      />

      {/* Dialog */}
      <DownloadOptionsDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onDownload={handleDownloadStart}
        isLoading={false}
        initialTab={selectedMode}
      />
    </div>
  );
}

export const Route = createFileRoute("/")({
  component: HomePage,
});