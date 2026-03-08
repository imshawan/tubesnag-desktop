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
        };
    }

    type DownloadType = "single" | "bulk" | "playlist" | null;

    var electron: Window['electron'];

    type DownloadItemType = "video" | "audio" | "playlist";
    type QualityType = "best" | "high" | "medium" | "low"
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
    }

    interface PlaylistInfo {
        title: string;
        thumbnail: string;
        channel: string;
        videoUrls: string[];
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

