/**
 * Type definitions for TubeSnag Desktop
 */

import { DOWNLOAD_FORMATS } from "@/constants";

declare global {
  interface Window {
    electron?: {
      getDiskUsage: (path: string) => Promise<{ used: string; total: string; percentage: number }>;
      selectFolder: () => Promise<string | null>;
    };
  }
  var electron: Window['electron'];
}

export type DownloadType = "single" | "bulk" | "playlist"
export type QualityType = "best" | "high" | "medium" | "low"
export type DownloadStatus = "pending" | "downloading" | "completed" | "error"
export type ToastType = "success" | "error" | "info" | "warning"
export type FormatType = typeof DOWNLOAD_FORMATS[number]["value"];

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
// Utility Types
export type AsyncFunction<T = void> = () => Promise<T>
export type VoidFunction = () => void
export type EventHandler<T = Event> = (event: T) => void

// Type Guards
export function isValidDownloadType(value: unknown): value is DownloadType;
export function isValidQualityType(value: unknown): value is QualityType;
export function isValidDownloadStatus(value: unknown): value is DownloadStatus;
export function isValidToastType(value: unknown): value is ToastType;
export function isDownloadItem(value: unknown): value is DownloadItem;
export function isDownloadHistory(value: unknown): value is DownloadHistory;

