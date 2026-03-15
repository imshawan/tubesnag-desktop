import {useEffect, useMemo, useState} from "react";
import {useTranslation} from "react-i18next";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {Switch} from "@/components/ui/switch";
import {ArrowDownUp, ListVideo} from "lucide-react";
import {cn} from "@/lib/utils/tailwind";
import {QualitySelector} from "@/components/quality-selector";
import {FormatSelector} from "@/components/format-selector";
import {AudioBitrateSelector} from "@/components/audio-bitrate-selector";
import {audioFormats} from "@/lib/ytdlp/constants";

export function PlaylistDownloadDialog({
                                           open,
                                           onOpenChange,
                                           onDownload,
                                           isLoading,
                                       }: DownloadDialogProps) {
    const {t} = useTranslation();
    const [url, setUrl] = useState<string>("");
    const [quality, setQuality] = useState<QualityType>("best");
    const [format, setFormat] = useState<FormatType>("mp4");
    const [reverse, setReverse] = useState(false);
    const [error, setError] = useState("");
    const [audioBitrate, setAudioBitrate] = useState<AudioBitrate>("192");

    const isAudioFormat = useMemo(() => audioFormats.includes(format), [format]);

    useEffect(() => {
        if (open) {
            // setUrl("");
            setError("");
            // Reset defaults
            // setQuality("best");
            // setFormat("mp4");
            // setReverse(false);
        }
    }, [open]);

    const handleFormatChange: (value: FormatType) => void = (value: FormatType) => {
        setFormat(value);

    }

    const handleSubmit = () => {
        if (!url.trim()) {
            setError(t("playlistDownload.errorUrlRequired"));
            return;
        }
        if (!url.includes("list=")) {
            setError(t("playlistDownload.errorInvalidPlaylist"));
            return;
        }

        onDownload([url], quality, format, reverse, audioBitrate);
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-120">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <ListVideo className="size-5 text-muted-foreground"/>
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
                                <ListVideo className="size-4"/>
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
                                    "text-sm"
                                )}
                            />
                        </div>
                        {error && (
                            <p className="text-[0.8rem] font-medium text-destructive">
                                {error}
                            </p>
                        )}
                    </div>

                    <QualitySelector value={quality} onValueChange={setQuality}/>
                    <FormatSelector value={format} onValueChange={handleFormatChange} quality={quality}/>

                    <AudioBitrateSelector
                        value={audioBitrate}
                        onChange={setAudioBitrate}
                        disabled={!isAudioFormat}
                    />

                    {/* Reverse Toggle */}
                    <div className="flex items-center justify-between rounded-lg border p-3 bg-muted/20">
                        <div className="space-y-0.5">
                            <div className="flex items-center gap-2">
                                <ArrowDownUp className="size-3.5 text-muted-foreground"/>
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
                    <Button variant="outline" onClick={() => onOpenChange(false)} className="text-sm p-4">
                        {t("playlistDownload.cancel")}
                    </Button>
                    <Button onClick={handleSubmit} disabled={isLoading} className="text-sm p-4">
                        {isLoading ? t("playlistDownload.processing") : t("playlistDownload.processPlaylist")}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
