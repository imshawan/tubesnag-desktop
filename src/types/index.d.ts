/**
 * Type definitions for TubeSnag Desktop
 */

import { DOWNLOAD_FORMATS } from "@/constants";

export interface DependencyStatus {
  db: boolean;
  ytdlp: boolean;
  ffmpeg: boolean;
}

export interface DependencyProgress {
  db: { downloading: boolean; progress: number };
  ytdlp: { downloading: boolean; progress: number };
  ffmpeg: { downloading: boolean; progress: number };
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
    };
  }
  var electron: Window['electron'];
}

export type DownloadType = "single" | "bulk" | "playlist"
export type QualityType = "best" | "high" | "medium" | "low"
export type DownloadStatus = "pending" | "downloading" | "completed" | "error"
export type ToastType = "success" | "error" | "info" | "warning"
export type FormatType = typeof DOWNLOAD_FORMATS[number]["value"];

export interface YtDlpConfig {url: string, filename: string}

export interface FfmpegConfig {url: string, filename: string, archiveType: string}

export interface DownloadItem {
  id: string
  url: string
  title?: string
  status: DownloadStatus
  progress: number
  error?: string
  quality?: QualityType
  type?: DownloadType
  startedAt?: Date
  completedAt?: Date
  fileSize?: number
  duration?: number
}

export interface DownloadHistory extends DownloadItem {
  downloadedAt: Date
  filePath?: string
}

export interface AppSettings {
  quality: QualityType
  downloadPath: string
  autoStart: boolean
  theme: "light" | "dark" | "system"
  language: string
}

