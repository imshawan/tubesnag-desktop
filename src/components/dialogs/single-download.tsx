import {useEffect, useState} from "react"
import {useTranslation} from "react-i18next"
import {Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle} from "@/components/ui/dialog"
import {Button} from "@/components/ui/button"
import {Input} from "@/components/ui/input"
import {Label} from "@/components/ui/label"
import {RadioGroup, RadioGroupItem} from "@/components/ui/radio-group"
import {Link} from "lucide-react"
import {cn} from "@/utils/tailwind"
import {DOWNLOAD_FORMATS, VIDEO_QUALITIES} from "@/constants"

interface SingleDownloadDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onDownload: (url: string, quality: QualityType, format?: string) => void
  isLoading?: boolean
}

export function SingleDownloadDialog({ open, onOpenChange, onDownload, isLoading }: SingleDownloadDialogProps) {
  const { t } = useTranslation()
  const [url, setUrl] = useState("")
  const [quality, setQuality] = useState<QualityType>("best")
  const [format, setFormat] = useState("mp4")
  const [error, setError] = useState("")
  const [downloading, setDownloading] = useState(false)

  useEffect(() => { if (open) { setUrl(""); setError("") } }, [open])

  const handleSubmit = async () => {
    if (!url.trim()) { setError(t("singleDownload.errorEmpty")); return }
    
    setDownloading(true)
    try {
      await onDownload(url, quality, format)
      onOpenChange(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : t("singleDownload.downloadFailed"))
    } finally {
      setDownloading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-120">
        <DialogHeader>
          <DialogTitle>{t("singleDownload.title")}</DialogTitle>
          <DialogDescription>
            {t("singleDownload.description")}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="single-url">{t("singleDownload.videoLink")}</Label>
            <div className="relative">
              <Link className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input 
                id="single-url" 
                placeholder={t("singleDownload.placeholder")}
                value={url}
                onChange={(e) => { setUrl(e.target.value); setError(""); }}
                className={cn("pl-9", error && "border-destructive focus-visible:ring-destructive")}
                disabled={downloading}
              />
            </div>
            {error && <p className="text-[0.8rem] font-medium text-destructive">{error}</p>}
          </div>

          <div className="grid gap-2">
            <Label>{t("downloads.quality")}</Label>
            <RadioGroup value={quality} onValueChange={(v) => setQuality(v as QualityType)} className="grid grid-cols-3 gap-2">
               {VIDEO_QUALITIES.map((q) => {
                 const Icon = q.icon
                 return (
                   <label
                    key={q.id}
                    className={cn(
                        "flex cursor-pointer flex-col items-center justify-center rounded-md border-2 border-muted bg-transparent p-2 hover:bg-accent peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary transition-all text-xs font-medium gap-1",
                        quality === q.id && "border-primary bg-accent"
                    )}
                   >
                       <RadioGroupItem value={q.id} className="sr-only" />
                       <Icon className="size-4" />
                       {q.label()}
                   </label>
                 )
               })}
            </RadioGroup>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="format-select">{t("downloads.format")}</Label>
            <RadioGroup value={format} onValueChange={setFormat} className="grid grid-cols-3 gap-2">
              {DOWNLOAD_FORMATS.map((f) => (
                <label
                  key={f.value}
                  className={cn(
                    "flex cursor-pointer items-center justify-center rounded-md border-2 border-muted bg-transparent p-2 hover:bg-accent peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary transition-all text-xs font-medium",
                    format === f.value && "border-primary bg-accent"
                  )}
                >
                  <RadioGroupItem value={f.value} className="sr-only" />
                  {f.label()}
                </label>
              ))}
            </RadioGroup>
          </div>
        </div>

        <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={downloading}>{t("singleDownload.cancel")}</Button>
            <Button onClick={handleSubmit} disabled={isLoading || downloading}>
                {downloading ? t("singleDownload.starting") : t("singleDownload.download")}
            </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
