import {Label} from "@/components/ui/label";
import {Select, SelectContent, SelectItem, SelectTrigger} from "@/components/ui/select";
import {DOWNLOAD_FORMAT_TYPES, DOWNLOAD_FORMATS} from "@/constants";
import {useEffect, useMemo} from "react";
import {useTranslation} from "react-i18next";

interface FormatSelectorProps {
    value: string;
    onValueChange: (value: FormatType) => void;
    disabled?: boolean;
    quality: QualityType;
}

export function FormatSelector({value, onValueChange, quality}: FormatSelectorProps) {
    const {t} = useTranslation();

    const enableAudioFormats = useMemo(() => quality && quality === "audio", [quality])
    const selectedFormat = useMemo(() =>
        DOWNLOAD_FORMATS.find(f => f.value === value), [value]);
    const SelectedIcon = selectedFormat?.icon;
    const formats = useMemo(() =>
        DOWNLOAD_FORMATS.filter(f =>
            DOWNLOAD_FORMAT_TYPES[f.value] === (enableAudioFormats ? "audio" : "video")), [enableAudioFormats])

    useEffect(() => {
        if (!formats.some(f => f.value === value)) {
            onValueChange(formats[0].value)
        }
    }, [quality]);

    return (
        <div className="grid gap-2">
            <Label>{t("downloads.format")}</Label>
            <Select value={value} onValueChange={onValueChange}>
                <SelectTrigger className="py-6">
                    {selectedFormat && SelectedIcon && (
                        <div className="flex items-center gap-2">
                            <SelectedIcon className="size-4"/>
                            <div className="text-left">
                                <span className="text-xs">{selectedFormat.label()}</span>
                                <div className="text-xs text-muted-foreground">{selectedFormat.sub()}</div>
                            </div>
                        </div>
                    )}
                </SelectTrigger>
                <SelectContent>
                    {formats.map((f) => {
                        const Icon = f.icon
                        return (
                            <SelectItem key={f.value} value={f.value}>
                                <div className="flex items-center gap-2">
                                    <Icon className="size-4"/>
                                    <span className="text-xs">{f.label()}</span>
                                </div>
                            </SelectItem>
                        )
                    })}
                </SelectContent>
            </Select>
        </div>
    )
}