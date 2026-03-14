import { Music } from "lucide-react"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useTranslation } from "react-i18next"
import { AUDIO_BITRATES } from "@/constants"
import { cn } from "@/utils/tailwind"

interface AudioBitrateSelectorProps {
  value: string
  onChange: (bitrate: AudioBitrate) => void
  disabled?: boolean
}

export function AudioBitrateSelector({
  value,
  onChange,
  disabled = false
}: AudioBitrateSelectorProps) {
  const { t } = useTranslation()

  const selectedBitrate = AUDIO_BITRATES[value as keyof typeof AUDIO_BITRATES]
  const SelectedIcon = Music

  return (
    <div className="grid gap-2">
      <Label>{t("downloads.audioBitrate")}</Label>
      <Select
        value={value}
        onValueChange={onChange}
        disabled={disabled}
      >
        <SelectTrigger className={cn(disabled && "opacity-50 cursor-not-allowed", "py-6")}>
          <SelectValue>
            {selectedBitrate && (
              <div className="flex items-center gap-2">
                <SelectedIcon className="size-4" />
                <div className="text-left">
                  <span className="text-xs">{selectedBitrate.label()}</span>
                  <div className="text-xs text-muted-foreground">{selectedBitrate.sub()}</div>
                </div>
              </div>
            )}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {Object.entries(AUDIO_BITRATES).map(([key, bitrate]) => (
            <SelectItem key={key} value={key}>
              <div className="flex items-center gap-2">
                <Music className="size-4" />
                <div>
                  <div className="text-xs font-medium">{bitrate.label()}</div>
                  <div className="text-xs text-muted-foreground">{bitrate.sub()}</div>
                </div>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
