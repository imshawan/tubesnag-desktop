import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Layers, AlertCircle, CheckCircle2, Check } from "lucide-react";
import { cn } from "@/utils/tailwind";
import { FormatType, QualityType } from "@/types/index";
import { DOWNLOAD_FORMATS, VIDEO_QUALITIES } from "@/constants";

interface BulkDownloadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDownload: (urls: string[], quality: QualityType) => void;
  isLoading?: boolean;
}

export function BulkDownloadDialog({
  open,
  onOpenChange,
  onDownload,
  isLoading,
}: BulkDownloadDialogProps) {
  const { t } = useTranslation();
  const [text, setText] = useState("");
  const [quality, setQuality] = useState<QualityType>("best");
  const [error, setError] = useState("");
  const [format, setFormat] = useState<FormatType>("mp4");

  // Reset state when dialog opens
  useEffect(() => {
    if (open) {
      setText("");
      setError("");
    }
  }, [open]);

  // Logic to split text by newlines or commas and filter empty strings
  const urls = text
    .split(/[\n,]+/)
    .map((u) => u.trim())
    .filter((u) => u.length > 0);
  const linkCount = urls.length;

  const handleSubmit = () => {
    if (linkCount === 0) {
      setError(t("bulkDownload.errorEmpty"));
      return;
    }
    onDownload(urls, quality);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Layers className="size-5 text-muted-foreground" />
            {t("bulkDownload.title")}
          </DialogTitle>
          <DialogDescription>
            {t("bulkDownload.description")}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 py-4">
          <div className="grid gap-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="bulk-text">{t("bulkDownload.videoLinks")}</Label>
              {/* Link Counter Badge */}
              <div
                className={cn(
                  "flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-medium border transition-colors",
                  linkCount > 0
                    ? "bg-primary/10 text-primary border-primary/20"
                    : "bg-muted text-muted-foreground border-transparent",
                )}
              >
                {linkCount > 0 && <CheckCircle2 className="size-3" />}
                {linkCount} {t("bulkDownload.detected")}
              </div>
            </div>

            {/* The Textarea for Bulk Input */}
            <Textarea
              id="bulk-text"
              placeholder="https://youtu.be/video1\nhttps://youtu.be/video2\nhttps://youtu.be/video3"
              value={text}
              onChange={(e) => {
                setText(e.target.value);
                setError("");
              }}
              className={cn(
                "min-h-[200px] font-mono text-xs leading-relaxed resize-none p-4",
                error && "border-destructive focus-visible:ring-destructive",
              )}
            />

            {error && (
              <p className="flex items-center gap-2 text-[0.8rem] font-medium text-destructive animate-in slide-in-from-top-1">
                <AlertCircle className="size-3" /> {error}
              </p>
            )}
          </div>

          <div className="flex items-center justify-between rounded-lg border p-3 bg-muted/40">
            <div className="space-y-0.5">
              <Label className="text-sm font-medium">{t("bulkDownload.targetQuality")}</Label>
              <p className="text-[0.8rem] text-muted-foreground">
                {t("bulkDownload.appliesToAll")}
              </p>
            </div>
            <Select
              value={quality}
              onValueChange={(v) => setQuality(v as QualityType)}
            >
              <SelectTrigger className="w-[140px] bg-background">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {VIDEO_QUALITIES.map((q) => (
                  <SelectItem key={q.id} value={q.id}>
                    {q.label()}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center justify-between rounded-lg border p-3 bg-muted/40">
            <div className="space-y-0.5">
              <Label className="text-sm font-medium">{t("bulkDownload.downloadFormat")}</Label>
              <p className="text-[0.8rem] text-muted-foreground">
                {t("bulkDownload.appliesToAllFormat")}
              </p>
            </div>
            <Select
              value={format}
              onValueChange={(v) => setFormat(v as FormatType)}
            >
              <SelectTrigger className="w-[140px] bg-background">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {DOWNLOAD_FORMATS.map((format) => (
                  <SelectItem key={format.value} value={format.value}>
                    {format.label()}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t("bulkDownload.cancel")}
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isLoading || linkCount === 0}
          >
            {isLoading
              ? t("bulkDownload.queueing")
              : linkCount > 0
                ? `${t("bulkDownload.download")} ${linkCount} ${linkCount === 1 ? "Video" : "Videos"}`
                : t("bulkDownload.download")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
