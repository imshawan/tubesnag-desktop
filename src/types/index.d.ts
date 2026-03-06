/**
 * Type definitions for TubeSnag Desktop
 */

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

export interface Video {
  id: string
  url: string
  title?: string
  duration?: number
  thumbnail?: string
  channel?: string
  uploadedAt?: Date
}

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

export interface DownloadRequest {
  type: DownloadType
  urls: string[]
  quality: QualityType
}

export interface DownloadResponse {
  success: boolean
  message?: string
  downloadId?: string
  error?: string
}

export interface DownloadProgress {
  downloadId: string
  progress: number
  status: DownloadStatus
  error?: string
}

export interface ValidationResult {
  valid: boolean
  errors: string[]
}

export interface Toast {
  id: string
  message: string
  type: ToastType
  duration?: number
}

// API Response Types
export interface YoutubeVideoInfo {
  videoId: string
  title: string
  duration: number
  thumbnail: string
  channel: string
  uploadedAt: Date
}

export interface PlaylistInfo {
  playlistId: string
  title: string
  description: string
  videos: YoutubeVideoInfo[]
  videoCount: number
}

// Hook Types
export interface UseDownloadReturn {
  downloads: DownloadItem[]
  isDownloading: boolean
  totalProgress: number
  addDownload: (urls: string[]) => void
  updateDownload: (id: string, updates: Partial<DownloadItem>) => void
  removeDownload: (id: string) => void
  clearCompleted: () => void
  clearAll: () => void
}

export interface UseToastReturn {
  toasts: Toast[]
  addToast: (message: string, type: ToastType, duration?: number) => void
  removeToast: (id: string) => void
}

// Dialog Props
export interface DownloadOptionsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onDownload: (type: DownloadType, urls: string[], quality: QualityType) => void
  isLoading?: boolean
}

// Component Props
export interface DownloadsListProps {
  downloads: DownloadItem[]
  onRemove: (id: string) => void
  onClearCompleted: () => void
  onClearAll: () => void
}

export interface DownloadItemCardProps {
  download: DownloadItem
  onRemove: (id: string) => void
}

// Error Types
export class ValidationError extends Error {
  errors: string[];
  constructor(message: string, errors?: string[]);
}

export class DownloadError extends Error {
  downloadId?: string;
  constructor(message: string, downloadId?: string);
}

export class NetworkError extends Error {
  constructor(message: string);
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

