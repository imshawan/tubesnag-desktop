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
import {Textarea} from "@/components/ui/textarea";
import {Label} from "@/components/ui/label";
import {AlertCircle, CheckCircle2, Layers} from "lucide-react";
import {cn} from "@/utils/tailwind";
import {audioFormats} from "@/constants";
import {parseUrlList} from "@/utils/download";
import {QualitySelector} from "@/components/quality-selector";
import {FormatSelector} from "@/components/format-selector";
import {AudioBitrateSelector} from "@/components/audio-bitrate-selector";

export function BulkDownloadDialog({
                                       open,
                                       onOpenChange,
                                       onDownload,
                                       isLoading,
                                   }: DownloadDialogProps) {
    const {t} = useTranslation();
    const [text, setText] = useState("");
    const [quality, setQuality] = useState<QualityType>("best");
    const [error, setError] = useState("");
    const [format, setFormat] = useState<FormatType>("mp4");
    const [audioBitrate, setAudioBitrate] = useState<AudioBitrate>("192");

    const urls = useMemo(() => parseUrlList(text), [text]);
    const linkCount = useMemo(() => urls.length, [urls]);
    const isAudioFormat = useMemo(() => audioFormats.includes(format), [format]);

    // Reset state when dialog opens
    useEffect(() => {
        if (open) {
            setText("");
            setError("");
        }
    }, [open]);

    const handleFormatChange = (value: FormatType) => {
        setFormat(value);
    }

    const handleSubmit = () => {
        if (linkCount === 0) {
            setError(t("bulkDownload.errorEmpty"));
            return;
        }
        onDownload(urls, quality, format, false, audioBitrate);
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-120">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Layers className="size-5 text-muted-foreground"/>
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
                                {linkCount > 0 && <CheckCircle2 className="size-3"/>}
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
                                <AlertCircle className="size-3"/> {error}
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
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)} className="text-sm p-4">
                        {t("bulkDownload.cancel")}
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={isLoading || linkCount === 0}
                        className="text-sm p-4"
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
