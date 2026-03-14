import {useEffect, useMemo, useState} from "react"
import {useTranslation} from "react-i18next"
import {Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle} from "@/components/ui/dialog"
import {Button} from "@/components/ui/button"
import {Input} from "@/components/ui/input"
import {Label} from "@/components/ui/label"
import {Link} from "lucide-react"
import {cn} from "@/utils/tailwind"
import {audioFormats} from "@/constants"
import {normalizeSingleVideoUrl} from "@/utils/download";
import {AudioBitrateSelector} from "@/components/audio-bitrate-selector";
import {QualitySelector} from "@/components/quality-selector";
import {FormatSelector} from "@/components/format-selector";

export function SingleDownloadDialog({open, onOpenChange, onDownload, isLoading}: DownloadDialogProps) {
    const {t} = useTranslation()
    const [url, setUrl] = useState("");
    const [quality, setQuality] = useState<QualityType>("best");
    const [format, setFormat] = useState<FormatType>("mp4");
    const [error, setError] = useState("");
    const [downloading, setDownloading] = useState(false);
    const [audioBitrate, setAudioBitrate] = useState<AudioBitrate>("192");

    useEffect(() => {
        if (open) {
            setUrl("");
            setError("")
        }
    }, [open])

    const isAudioFormat = useMemo(() => audioFormats.includes(format), [format]);

    const handleFormatChange = (value: FormatType) => {
        setFormat(value);
    }

    const handleSubmit = async () => {
        if (!url.trim()) {
            setError(t("singleDownload.errorEmpty"));
            return
        }

        setDownloading(true)
        try {
            await onDownload([normalizeSingleVideoUrl(url)], quality, format, false, audioBitrate);
            onOpenChange(false)
        } catch (err) {
            setError(err instanceof Error ? err.message : t("singleDownload.downloadFailed"));
        } finally {
            setDownloading(false);
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
                            <Link className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground"/>
                            <Input
                                id="single-url"
                                placeholder={t("singleDownload.placeholder")}
                                value={url}
                                onChange={(e) => {
                                    setUrl(e.target.value);
                                    setError("");
                                }}
                                className={cn("pl-9", error && "border-destructive focus-visible:ring-destructive", "text-sm")}
                                disabled={downloading}
                            />
                        </div>
                        {error && <p className="text-[0.8rem] font-medium text-destructive">{error}</p>}
                    </div>

                    <QualitySelector value={quality} onValueChange={setQuality}/>
                    <FormatSelector value={format} onValueChange={handleFormatChange} quality={quality}/>
                    <AudioBitrateSelector
                        value={audioBitrate}
                        onChange={setAudioBitrate}
                        disabled={downloading || !isAudioFormat}
                    />
                </div>


                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)} className="text-sm p-4"
                            disabled={downloading}>{t("singleDownload.cancel")}</Button>
                    <Button onClick={handleSubmit} disabled={isLoading || downloading} className="text-sm p-4">
                        {downloading ? t("singleDownload.starting") : t("singleDownload.download")}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
