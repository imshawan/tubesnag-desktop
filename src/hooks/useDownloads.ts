import { useState, useCallback } from "react"
import { QualityType } from "../types/index"

export type Status = "pending" | "downloading" | "completed" | "failed"

export interface DownloadItem {
  id: string
  url: string
  title: string
  status: Status
  progress: number
  error?: string
  size: string;
    quality: string;
    type: string;
    date: string;
    channel: string;
}

export interface DownloadState {
  downloads: DownloadItem[]
  isDownloading: boolean
  totalProgress: number
}

export interface UseDownloadReturn {
  downloads: DownloadItem[]
  isDownloading: boolean
  totalProgress: number
  addDownload: (urls: string[], quality: QualityType) => DownloadItem[]
  updateDownload: (id: string, updates: Partial<DownloadItem>) => void
  removeDownload: (id: string) => void
  clearCompleted: () => void
  clearAll: () => void
}

const MOCK_DATA: DownloadItem[] = [
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

export function useDownloads(): UseDownloadReturn {
  const [downloads, setDownloads] = useState<DownloadItem[]>(MOCK_DATA)

  const isDownloading = downloads.some((d) => d.status === "downloading")

  const totalProgress =
    downloads.length > 0
      ? Math.round(
          downloads.reduce((sum, d) => sum + d.progress, 0) / downloads.length
        )
      : 0

  const addDownload = useCallback((urls: string[], quality: QualityType) => {
    const tempId = `${Date.now()}-${Math.random()}`;

    const newDownloads = urls.map((url) => ({
      id: tempId,
        url,
        title: "Fetching video info...",
        channel: "Please wait",
        status: "pending" as Status,
        progress: 0,
        size: "Calculating...",
        quality: quality,
        type: "video",
        date: "Just now",
    }))
    setDownloads((prev) => [...prev, ...newDownloads]);

    return newDownloads;
  }, [])

  const updateDownload = useCallback(
    (id: string, updates: Partial<DownloadItem>) => {
      setDownloads((prev) =>
        prev.map((d) => (d.id === id ? { ...d, ...updates } : d))
      )
    },
    []
  )

  const removeDownload = useCallback((id: string) => {
    setDownloads((prev) => prev.filter((d) => d.id !== id))
  }, [])

  const clearCompleted = useCallback(() => {
    setDownloads((prev) =>
      prev.filter((d) => d.status !== "completed" && d.status !== "failed")
    )
  }, [])

  const clearAll = useCallback(() => {
    setDownloads([])
  }, [])

  return {
    downloads,
    isDownloading,
    totalProgress,
    addDownload,
    updateDownload,
    removeDownload,
    clearCompleted,
    clearAll,
  }
}

