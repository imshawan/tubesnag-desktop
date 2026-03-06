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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ListVideo, AlertCircle, ArrowDownUp } from "lucide-react";
import { cn } from "@/utils/tailwind";
import { FormatType, QualityType } from "@/types/index";
import { DOWNLOAD_FORMATS, VIDEO_QUALITIES } from "@/constants";

interface PlaylistDownloadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDownload: (
    urls: string[],
    quality: QualityType,
    format: FormatType,
    reverse: boolean,
  ) => void;
  isLoading?: boolean;
}

export function PlaylistDownloadDialog({
  open,
  onOpenChange,
  onDownload,
  isLoading,
}: PlaylistDownloadDialogProps) {
  const { t } = useTranslation();
  const [url, setUrl] = useState("");
  const [quality, setQuality] = useState<QualityType>("best");
  const [format, setFormat] = useState<FormatType>("mp4");
  const [reverse, setReverse] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (open) {
      setUrl("");
      setError("");
      // Reset defaults
      setQuality("best");
      setFormat("mp4");
      setReverse(false);
    }
  }, [open]);

  const handleSubmit = () => {
    if (!url.trim()) {
      setError(t("playlistDownload.errorUrlRequired"));
      return;
    }
    if (!url.includes("list=")) {
      setError(t("playlistDownload.errorInvalidPlaylist"));
      return;
    }

    onDownload([url], quality, format, reverse);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ListVideo className="size-5 text-muted-foreground" />
            {t("playlistDownload.title")}
          </DialogTitle>
          <DialogDescription>
            {t("playlistDownload.description")}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 py-4">
          {/* URL Input */}
          <div className="grid gap-2">
            <Label htmlFor="pl-url">{t("playlistDownload.playlistLink")}</Label>
            <div className="relative">
              <div className="absolute left-2.5 top-2.5 text-muted-foreground">
                <ListVideo className="size-4" />
              </div>
              <Input
                id="pl-url"
                placeholder="https://www.youtube.com/playlist?list=..."
                value={url}
                onChange={(e) => {
                  setUrl(e.target.value);
                  setError("");
                }}
                className={cn(
                  "pl-9",
                  error && "border-destructive focus-visible:ring-destructive",
                )}
              />
            </div>
            {error && (
              <p className="text-[0.8rem] font-medium text-destructive">
                {error}
              </p>
            )}
          </div>

          {/* Settings Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label>{t("playlistDownload.quality")}</Label>
              <Select
                value={quality}
                onValueChange={(v) => setQuality(v as QualityType)}
              >
                <SelectTrigger>
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
            <div className="grid gap-2">
              <Label>{t("playlistDownload.format")}</Label>
              <Select
                value={format}
                onValueChange={(v) => setFormat(v as FormatType)}
              >
                <SelectTrigger>
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

          {/* Reverse Toggle */}
          <div className="flex items-center justify-between rounded-lg border p-3 bg-muted/20">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <ArrowDownUp className="size-3.5 text-muted-foreground" />
                <Label
                  htmlFor="reverse-switch"
                  className="text-sm font-medium cursor-pointer"
                >
                  {t("playlistDownload.reverseOrder")}
                </Label>
              </div>
              <p className="text-[0.8rem] text-muted-foreground pl-5.5">
                {t("playlistDownload.downloadOldestFirst")}
              </p>
            </div>
            <Switch
              id="reverse-switch"
              checked={reverse}
              onCheckedChange={setReverse}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t("playlistDownload.cancel")}
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? t("playlistDownload.processing") : t("playlistDownload.processPlaylist")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
