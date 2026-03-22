/**
 * Type definitions for TubeSnag Desktop
 */

import {DOWNLOAD_FORMATS} from "@/lib/ytdlp/constants";
import {ForwardRefExoticComponent, RefAttributes} from "react";
import {LucideProps} from "lucide-react";

declare global {
    interface Window {
        electron?: {
            getDiskUsage: (path: string) => Promise<{ used: string; total: string; percentage: number }>;
            selectFolder: () => Promise<string | null>;
            checkDependencies: () => Promise<DependencyStatus>;
            installDependencies: () => Promise<DependencyStatus>;
            onInstallProgress?: (callback: (data: { dependency: string; progress: number }) => void) => void;
            offInstallProgress?: (callback: (data: { dependency: string; progress: number }) => void) => void;
            fileToDataUrl: (filePath: string) => Promise<string>;
            getPlatform: () => Promise<NodeJS.Platform>;
            getAppVersion: () => Promise<string>;
            on: (channel: string, listener: (data: any) => void) => void;
            off: (channel: string, listener: (data: any) => void) => void;
            invoke: (channel: string, args: any) => Promise<any>;
            getPlaylistVideos: (url: string, reverse: boolean, playlistId: string) => Promise<PlaylistInfo>;
            openFile: (item: DownloadItem) => Promise<void>;
            openFolder: (item: DownloadItem) => Promise<void>;
            deleteFileFromSystem: (item: DownloadItem) => Promise<void>;
            deleteDownloadedPlaylistResources: (item: DownloadItem) => Promise<void>;
            db: {
                createActiveDownload: (downloadItem: DownloadItem) => Promise<{ success: boolean }>;
                getActiveDownloads: () => Promise<DownloadItem[]>;
                getActiveDownloadById: (id: string) => Promise<DownloadItem | null>;
                updateActiveDownload: (parentId: string, childId: string | null, updates: any) => Promise<{ success: boolean }>;
                deleteActiveDownload: (id: string) => Promise<{ success: boolean }>;
                deleteAllActiveDownloads: () => Promise<{ success: boolean }>;

                getCompletedDownloads: () => Promise<DownloadItem[]>;
                getCompletedDownloadById: (id: string) => Promise<DownloadItem | null>;
                deleteCompletedDownload: (id: string) => Promise<{ success: boolean }>;
                deleteAllCompletedDownloads: () => Promise<{ success: boolean }>;

                deleteActiveDownloadsVideoFromPlaylist: (playlistId: string, videoId: string) => Promise<{ success: boolean }>;
                deleteCompletedDownloadsVideoFromPlaylist: (playlistId: string, videoId: string) => Promise<{ success: boolean }>;

                moveActiveToCompleted: (id: string) => Promise<{ success: boolean }>;
            };
        };
    }

    type DownloadType = "single" | "bulk" | "playlist" | null;

    var electron: Window['electron'];

    type AudioBitrate = "128" | "192" | "256" | "320";
    type DownloadItemType = "video" | "audio" | "playlist";
    type QualityType = "best" | "8k" | "4k" | "1440p" | "1080p" | "720p" | "480p" | "360p" | "240p" | "144p" | "audio" | "unknown"
    type DownloadStatus = "pending" | "downloading" | "completed" | "failed" | "duplicate"
    type FormatType = typeof DOWNLOAD_FORMATS[number]["value"];

    interface DependencyStatus {
        db: boolean;
        ytdlp: boolean;
        ffmpeg: boolean;
    }

    interface DownloadItem {
        id: string;
        url: string;
        title: string;
        status: DownloadStatus;
        progress: number;
        error?: string;
        size: number;
        quality: QualityType;
        type: DownloadItemType;
        date: string;
        channel: string;
        format?: FormatType;
        thumbnail?: string;
        videos?: DownloadItem[];
        downloadPath: string;
        parentId?: string;
        parentTitle?: string;
    }

    interface PlaylistInfo {
        title: string;
        thumbnail: string;
        channel: string;
        videoUrls: string[];
    }

    interface YtDlpMeta {
        title: string;
        channel: string;
        ext: string;
        filesize?: number;
        filesize_approx?: number;
        format_id: string;
        format: string;
        quality: string;
        height: number;
        width: number;
        audio_codec: string;
        audio_bitrate: number;
        audio_sample_rate: number;
        audio_ext: string | null
    }

    interface YtDlpDownloadOptions {
        url: string;
        outputPath: string;
        quality: QualityType;
        format?: FormatType;
        audioBitrate?: AudioBitrate;
        downloadId: string;
        onProgress?: (progress: number, speed?: string) => void;
        onData?: (data: Partial<DownloadItem>) => void;
        onComplete?: (data: Partial<DownloadItem>) => void;
        onDuplicate?: (filename: string, metadata: any) => void;
        onError?: (data: {error: string; key: string, downloadId: string }) => void;
        saveToPlaylistFolder?: boolean
        playlistName?: string
    }

    interface DownloadDialogProps {
        open: boolean;
        onOpenChange: (open: boolean) => void;
        onDownload: OnDownloadFn;
        isLoading?: boolean;
    }

    type DownloadListType = "active" | "completed";

    type OnDownloadFn = (
        urls: string[],
        quality: QualityType,
        format: FormatType,
        reverse: boolean,
        audioBitrate: AudioBitrate,
        existingId?: string,
        runBotVerificationFirst?: boolean
    ) => void;

    interface VideoQuality {
        id: QualityType
        label: () => string
        sub: () => string
        icon: ForwardRefExoticComponent<Omit<LucideProps, "ref"> & RefAttributes<SVGSVGElement>>
    }
}

export interface YtDlpConfig {
    url: string,
    filename: string
}

export interface AppSettings {
    quality: QualityType
    downloadPath: string
    autoStart: boolean
    theme: "light" | "dark" | "system"
    language: string
}

