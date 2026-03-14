import {Label} from "@/components/ui/label";
import {Select, SelectContent, SelectItem, SelectTrigger} from "@/components/ui/select";
import {DOWNLOAD_FORMAT_TYPES, VIDEO_QUALITIES} from "@/constants";
import {useMemo} from "react";
import {useTranslation} from "react-i18next";

interface QualitySelectorProps {
    value: QualityType;
    onValueChange: (quality: QualityType) => void;
}

export function QualitySelector({value, onValueChange}: QualitySelectorProps) {
    const { t } = useTranslation();

    const selectedQuality = useMemo(() =>
        VIDEO_QUALITIES.find((q) => q.id === value), [value]);
    const SelectedIcon = selectedQuality?.icon

    return (
        <div className="grid gap-2">
            <Label>{t("downloads.quality")}</Label>
            <Select
                value={value}
                onValueChange={(v) => onValueChange(v as QualityType)}
            >
                <SelectTrigger className="py-6">
                    {selectedQuality && SelectedIcon && (
                        <div className="flex items-center gap-2">
                            <SelectedIcon className="size-4"/>
                            <div className="text-left">
                                <span className="text-xs">{selectedQuality.label()}</span>
                                <div className="text-xs text-muted-foreground">{selectedQuality.sub()}</div>
                            </div>
                        </div>
                    )}
                </SelectTrigger>
                <SelectContent>
                    {VIDEO_QUALITIES.map((q) => {
                        const Icon = q.icon
                        return (
                            <SelectItem key={q.id} value={q.id}>
                                <div className="flex items-center gap-2">
                                    <Icon className="size-4"/>
                                    <div>
                                        <div className="text-xs font-medium">{q.label()}</div>
                                        <div className="text-xs text-muted-foreground">{q.sub()}</div>
                                    </div>
                                </div>
                            </SelectItem>
                        )
                    })}
                </SelectContent>
            </Select>
        </div>
    );
}