import { useState, useCallback } from "react"

export interface DownloadItem {
  id: string
  url: string
  title?: string
  status: "pending" | "downloading" | "completed" | "error"
  progress: number
  error?: string
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
  addDownload: (urls: string[]) => void
  updateDownload: (id: string, updates: Partial<DownloadItem>) => void
  removeDownload: (id: string) => void
  clearCompleted: () => void
  clearAll: () => void
}

export function useDownloads(): UseDownloadReturn {
  const [downloads, setDownloads] = useState<DownloadItem[]>([])

  const isDownloading = downloads.some((d) => d.status === "downloading")

  const totalProgress =
    downloads.length > 0
      ? Math.round(
          downloads.reduce((sum, d) => sum + d.progress, 0) / downloads.length
        )
      : 0

  const addDownload = useCallback((urls: string[]) => {
    const newDownloads = urls.map((url) => ({
      id: `${Date.now()}-${Math.random()}`,
      url,
      status: "pending" as const,
      progress: 0,
    }))
    setDownloads((prev) => [...prev, ...newDownloads])
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
      prev.filter((d) => d.status !== "completed" && d.status !== "error")
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

