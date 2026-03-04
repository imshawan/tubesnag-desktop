import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { AlertCircle } from "lucide-react"

export type DownloadType = "single" | "bulk" | "playlist"
export type QualityType = "best" | "high" | "medium" | "low"

interface DownloadOptionsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onDownload: (type: DownloadType, urls: string[], quality: QualityType) => void
  isLoading?: boolean
}

export function DownloadOptionsDialog({
  open,
  onOpenChange,
  onDownload,
  isLoading = false,
}: DownloadOptionsDialogProps) {
  const [downloadType, setDownloadType] = useState<DownloadType>("single")
  const [quality, setQuality] = useState<QualityType>("best")
  const [input, setInput] = useState("")
  const [error, setError] = useState("")

  const validateUrls = (urls: string[]): boolean => {
    const youtubeUrlPattern = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+/
    return urls.every((url) => youtubeUrlPattern.test(url.trim()))
  }

  const handleDownload = () => {
    setError("")
    const trimmedInput = input.trim()

    if (!trimmedInput) {
      setError("Please enter a URL")
      return
    }

    let urls: string[] = []

    if (downloadType === "single") {
      urls = [trimmedInput]
    } else if (downloadType === "bulk") {
      urls = trimmedInput
        .split(",")
        .map((url) => url.trim())
        .filter((url) => url.length > 0)

      if (urls.length === 0) {
        setError("Please enter at least one URL")
        return
      }
    } else {
      urls = [trimmedInput]
    }

    if (!validateUrls(urls)) {
      setError("Invalid YouTube URL format")
      return
    }

    onDownload(downloadType, urls, quality)
    setInput("")
    setError("")
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Download Options</DialogTitle>
          <DialogDescription>
            Choose how you want to download videos
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Download Type Selection */}
          <div>
            <Label className="mb-3 block font-medium">Download Type</Label>
            <RadioGroup value={downloadType} onValueChange={(value) => {
              setDownloadType(value as DownloadType)
              setError("")
              setInput("")
            }}>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="single" id="single" />
                  <Label htmlFor="single" className="font-medium cursor-pointer flex-1">
                    <div>
                      <p>Single Video</p>
                      <p className="text-xs text-muted-foreground font-normal">
                        Download one video
                      </p>
                    </div>
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="bulk" id="bulk" />
                  <Label htmlFor="bulk" className="font-medium cursor-pointer flex-1">
                    <div>
                      <p>Bulk Download</p>
                      <p className="text-xs text-muted-foreground font-normal">
                        Comma-separated URLs
                      </p>
                    </div>
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="playlist" id="playlist" />
                  <Label htmlFor="playlist" className="font-medium cursor-pointer flex-1">
                    <div>
                      <p>Playlist</p>
                      <p className="text-xs text-muted-foreground font-normal">
                        Download entire playlist
                      </p>
                    </div>
                  </Label>
                </div>
              </div>
            </RadioGroup>
          </div>

          {/* Quality Selection */}
          <div>
            <Label className="mb-3 block font-medium">Video Quality</Label>
            <RadioGroup value={quality} onValueChange={(value) => setQuality(value as QualityType)}>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="best" id="quality-best" />
                  <Label htmlFor="quality-best" className="cursor-pointer flex-1 font-normal">
                    <div>
                      <p className="font-medium text-sm">Best Quality</p>
                      <p className="text-xs text-muted-foreground">
                        Highest available resolution and bitrate
                      </p>
                    </div>
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="high" id="quality-high" />
                  <Label htmlFor="quality-high" className="cursor-pointer flex-1 font-normal">
                    <div>
                      <p className="font-medium text-sm">High Quality</p>
                      <p className="text-xs text-muted-foreground">
                        1080p or best available
                      </p>
                    </div>
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="medium" id="quality-medium" />
                  <Label htmlFor="quality-medium" className="cursor-pointer flex-1 font-normal">
                    <div>
                      <p className="font-medium text-sm">Medium Quality</p>
                      <p className="text-xs text-muted-foreground">
                        720p or best available
                      </p>
                    </div>
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="low" id="quality-low" />
                  <Label htmlFor="quality-low" className="cursor-pointer flex-1 font-normal">
                    <div>
                      <p className="font-medium text-sm">Low Quality</p>
                      <p className="text-xs text-muted-foreground">
                        480p or best available (smaller file size)
                      </p>
                    </div>
                  </Label>
                </div>
              </div>
            </RadioGroup>
          </div>

          {/* URL Input */}
          <div className="space-y-2">
            <Label htmlFor="url-input">
              {downloadType === "bulk" ? "YouTube URLs (comma-separated)" : "YouTube URL"}
            </Label>
            <Input
              id="url-input"
              placeholder={
                downloadType === "bulk"
                  ? "https://youtu.be/xxx, https://youtu.be/yyy, ..."
                  : "https://youtu.be/xxx or https://www.youtube.com/..."
              }
              value={input}
              onChange={(e) => {
                setInput(e.target.value)
                setError("")
              }}
              disabled={isLoading}
            />
          </div>

          {error && (
            <div className="flex items-center gap-2 rounded-md bg-destructive/10 p-3 text-sm text-destructive">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {error}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button onClick={handleDownload} disabled={isLoading}>
            {isLoading ? "Processing..." : "Start Download"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}


