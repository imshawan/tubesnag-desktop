/**
 * Type definitions for TubeSnag Desktop
 */

import {DOWNLOAD_FORMATS} from "@/constants";

export interface DependencyStatus {
    db: boolean;
    ytdlp: boolean;
    ffmpeg: boolean;
}

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
            openFile: (filePath: string) => Promise<void>;
        };
    }

    type DownloadType = "single" | "bulk" | "playlist" | null;

    var electron: Window['electron'];

    type AudioBitrate = "128" | "192" | "256" | "320";
    type DownloadItemType = "video" | "audio" | "playlist";
    type QualityType = "best" | "4k" | "1440p" | "1080p" | "720p" | "480p" | "360p" | "audio"
    type DownloadStatus = "pending" | "downloading" | "completed" | "failed" | "duplicate"
    type FormatType = typeof DOWNLOAD_FORMATS[number]["value"];

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
        format?: string;
        thumbnail?: string;
        videos?: DownloadItem[];
        downloadPath: string;
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
    }

    interface YtDlpDownloadOptions {
        url: string;
        outputPath: string;
        quality: QualityType;
        format?: FormatType;
        audioBitrate?: AudioBitrate;
        downloadId: string;
        onProgress?: (progress: number) => void;
        onData?: (data: Partial<DownloadItem>) => void;
        onComplete?: (data: Partial<DownloadItem>) => void;
        onDuplicate?: (filename: string, metadata: any) => void;
        onError?: (data: {error: string; downloadId: string }) => void;
        saveToPlaylistFolder?: boolean
        playlistName?: string
    }

    interface DownloadDialogProps {
        open: boolean;
        onOpenChange: (open: boolean) => void;
        onDownload: OnDownloadFn;
        isLoading?: boolean;
    }

    type OnDownloadFn = (
        urls: string[],
        quality: QualityType,
        format: FormatType,
        reverse: boolean,
        audioBitrate: AudioBitrate
    ) => void;
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

