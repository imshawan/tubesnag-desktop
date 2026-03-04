/**
 * Type definitions for TubeSnag Desktop
 */

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
  constructor(message: string, public errors: string[] = []) {
    super(message)
    this.name = "ValidationError"
  }
}

export class DownloadError extends Error {
  constructor(message: string, public downloadId?: string) {
    super(message)
    this.name = "DownloadError"
  }
}

export class NetworkError extends Error {
  constructor(message: string) {
    super(message)
    this.name = "NetworkError"
  }
}

// Utility Types
export type AsyncFunction<T = void> = () => Promise<T>
export type VoidFunction = () => void
export type EventHandler<T = Event> = (event: T) => void

// Type Guards
export const isValidDownloadType = (value: unknown): value is DownloadType => {
  return ["single", "bulk", "playlist"].includes(value as string)
}

export const isValidQualityType = (value: unknown): value is QualityType => {
  return ["best", "high", "medium", "low"].includes(value as string)
}

export const isValidDownloadStatus = (
  value: unknown
): value is DownloadStatus => {
  return ["pending", "downloading", "completed", "error"].includes(
    value as string
  )
}

export const isValidToastType = (value: unknown): value is ToastType => {
  return ["success", "error", "info", "warning"].includes(value as string)
}

export const isDownloadItem = (value: unknown): value is DownloadItem => {
  if (typeof value !== "object" || value === null) return false
  const item = value as Record<string, unknown>
  return (
    typeof item.id === "string" &&
    typeof item.url === "string" &&
    isValidDownloadStatus(item.status) &&
    typeof item.progress === "number"
  )
}

export const isDownloadHistory = (value: unknown): value is DownloadHistory => {
  return isDownloadItem(value) && (value as any).downloadedAt instanceof Date
}

