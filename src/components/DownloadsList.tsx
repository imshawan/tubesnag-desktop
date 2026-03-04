import { AlertCircle, CheckCircle, Download, Trash2, XCircle, Loader } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { DownloadItem } from "@/hooks/useDownloads"
import { cn } from "@/utils/tailwind"

interface DownloadsListProps {
  downloads: DownloadItem[]
  onRemove: (id: string) => void
  onClearCompleted: () => void
  onClearAll: () => void
}

export function DownloadsList({
  downloads,
  onRemove,
  onClearCompleted,
  onClearAll,
}: DownloadsListProps) {
  if (downloads.length === 0) {
    return null
  }

  const completed = downloads.filter(
    (d) => d.status === "completed" || d.status === "error"
  )
  const active = downloads.filter(
    (d) => d.status === "downloading" || d.status === "pending"
  )

  return (
    <div className="space-y-4 rounded-lg border border-border bg-card/50 p-4 backdrop-blur-sm">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-foreground">Downloads</h3>
          <p className="text-xs text-muted-foreground mt-1">
            {active.length} active • {completed.length} completed
          </p>
        </div>
        <div className="flex gap-2">
          {completed.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearCompleted}
              className="text-xs"
            >
              Clear Completed
            </Button>
          )}
          {downloads.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearAll}
              className="text-xs"
            >
              Clear All
            </Button>
          )}
        </div>
      </div>

      {/* Active Downloads */}
      {active.length > 0 && (
        <div className="space-y-3">
          {active.map((download) => (
            <DownloadItemCard
              key={download.id}
              download={download}
              onRemove={onRemove}
            />
          ))}
        </div>
      )}

      {/* Completed Downloads */}
      {completed.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground px-1">Completed</p>
          <div className="space-y-2">
            {completed.map((download) => (
              <DownloadItemCard
                key={download.id}
                download={download}
                onRemove={onRemove}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function DownloadItemCard({
  download,
  onRemove,
}: {
  download: DownloadItem
  onRemove: (id: string) => void
}) {
  const getStatusIcon = () => {
    switch (download.status) {
      case "downloading":
        return <Loader className="h-4 w-4 animate-spin text-primary" />
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "error":
        return <XCircle className="h-4 w-4 text-destructive" />
      default:
        return <AlertCircle className="h-4 w-4 text-muted-foreground" />
    }
  }

  const getStatusText = () => {
    switch (download.status) {
      case "downloading":
        return `Downloading... ${download.progress}%`
      case "completed":
        return "Completed"
      case "error":
        return `Error: ${download.error || "Unknown error"}`
      default:
        return "Pending"
    }
  }

  const getBackgroundClass = () => {
    if (download.status === "error") {
      return "bg-destructive/5 hover:bg-destructive/10"
    }
    if (download.status === "completed") {
      return "bg-green-500/5 hover:bg-green-500/10"
    }
    return "bg-background/50 hover:bg-background/70"
  }

  return (
    <div className={cn("rounded-md border border-border/50 p-3 space-y-2 transition-colors", getBackgroundClass())}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-start gap-2 flex-1 min-w-0">
          {getStatusIcon()}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground truncate">
              {download.title || "Video"}
            </p>
            <p className="text-xs text-muted-foreground truncate">
              {download.url}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">{getStatusText()}</p>
          </div>
        </div>
        {download.status !== "downloading" && download.status !== "pending" && (
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 shrink-0"
            onClick={() => onRemove(download.id)}
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        )}
      </div>

      {download.status === "downloading" && (
        <div className="space-y-1">
          <div className="h-1.5 w-full rounded-full bg-secondary overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-300"
              style={{ width: `${download.progress}%` }}
            />
          </div>
          <p className="text-xs text-muted-foreground text-right">{download.progress}%</p>
        </div>
      )}
    </div>
  )
}


