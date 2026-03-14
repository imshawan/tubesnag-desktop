import React, { createContext, useContext } from "react"
import { useDownloads } from "@/hooks/useDownloads"

interface DownloadContextType {}

const DownloadContext = createContext<DownloadContextType | undefined>(undefined)

export function DownloadProvider({ children }: { children: React.ReactNode }) {
  const downloadState = useDownloads()

  return (
    <DownloadContext.Provider value={downloadState}>
      {children}
    </DownloadContext.Provider>
  )
}

export function useDownloadContext() {
  const context = useContext(DownloadContext)
  if (!context) {
    throw new Error("useDownloadContext must be used within a DownloadProvider")
  }
  return context
}

