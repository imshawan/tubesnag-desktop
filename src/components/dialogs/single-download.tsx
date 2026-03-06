import { useState, useEffect } from "react"
import { useTranslation } from "react-i18next"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Film, Check, Link } from "lucide-react"
import { cn } from "@/utils/tailwind"
import { QualityType } from "@/types/index"
import { VIDEO_QUALITIES } from "@/constants"

interface SingleDownloadDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onDownload: (urls: string[], quality: QualityType) => void
  isLoading?: boolean
}

export function SingleDownloadDialog({ open, onOpenChange, onDownload, isLoading }: SingleDownloadDialogProps) {
  const { t } = useTranslation()
  const [url, setUrl] = useState("")
  const [quality, setQuality] = useState<QualityType>("best")
  const [error, setError] = useState("")

  useEffect(() => { if (open) { setUrl(""); setError("") } }, [open])

  const handleSubmit = () => {
    if (!url.trim()) { setError(t("singleDownload.errorEmpty")); return }
    onDownload([url], quality)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle>{t("singleDownload.title")}</DialogTitle>
          <DialogDescription>
            {t("singleDownload.description")}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 py-4">
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
              />
            </div>
            {error && <p className="text-[0.8rem] font-medium text-destructive">{error}</p>}
          </div>

          <div className="grid gap-2">
            <Label>{t("singleDownload.quality")}</Label>
            <RadioGroup value={quality} onValueChange={(v) => setQuality(v as QualityType)} className="grid grid-cols-2 gap-4">
               {VIDEO_QUALITIES.map((q) => (
                   <label
                    key={q.id}
                    className={cn(
                        "flex cursor-pointer flex-col justify-between rounded-md border-2 border-muted bg-transparent p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary transition-all",
                        quality === q.id && "border-primary bg-accent"
                    )}
                   >
                       <RadioGroupItem value={q.id} className="sr-only" />
                       <div className="flex items-center justify-between mb-1">
                           <Film className="h-4 w-4 text-muted-foreground" />
                           {quality === q.id && <Check className="h-3 w-3 text-primary" />}
                       </div>
                       <span className="font-semibold text-sm leading-none">{q.label()}</span>
                       <span className="text-xs text-muted-foreground mt-1">{q.sub()}</span>
                   </label>
               ))}
            </RadioGroup>
          </div>
        </div>

        <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)}>{t("singleDownload.cancel")}</Button>
            <Button onClick={handleSubmit} disabled={isLoading}>
                {isLoading ? t("singleDownload.starting") : t("singleDownload.download")}
            </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
