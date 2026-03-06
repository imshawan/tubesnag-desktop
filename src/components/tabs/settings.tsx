import { Folder, Monitor } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { RadioItem } from "@/components/radio-item";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setQuality, setDownloadPath, setAutoStart } from "@/store/slices/settings-slice";

interface SettingsProps {
  onBrowseFolder: () => void;
}

export function Settings({ onBrowseFolder }: SettingsProps) {
  const dispatch = useAppDispatch();
  const quality = useAppSelector((state) => state.settings.quality);
  const downloadPath = useAppSelector((state) => state.settings.downloadPath);
  const autoStart = useAppSelector((state) => state.settings.autoStart);

  return (
    <div className="flex flex-col gap-8 animate-in fade-in duration-500 max-w-3xl">
      <div className="space-y-1">
        <h2 className="text-2xl font-semibold tracking-tight">Settings</h2>
        <p className="text-sm text-muted-foreground">Customize your download preferences.</p>
      </div>

      <div className="space-y-6">
        <section className="rounded-xl border border-border/50 bg-card p-6">
          <div className="mb-4 flex items-center gap-2">
            <Monitor className="size-4 text-primary" />
            <h2 className="text-base font-semibold">Download Quality</h2>
          </div>
          <div className="grid gap-2">
            <RadioItem
              value="best"
              selectedValue={quality}
              onChange={(v) => dispatch(setQuality(v))}
              label="Best Quality"
              desc="Highest available resolution and bitrate (4K/8K)"
            />
            <RadioItem
              value="high"
              selectedValue={quality}
              onChange={(v) => dispatch(setQuality(v))}
              label="High Quality"
              desc="1080p or best available"
            />
            <RadioItem
              value="medium"
              selectedValue={quality}
              onChange={(v) => dispatch(setQuality(v))}
              label="Medium Quality"
              desc="720p or best available"
            />
            <RadioItem
              value="low"
              selectedValue={quality}
              onChange={(v) => dispatch(setQuality(v))}
              label="Low Quality"
              desc="480p (Data saver)"
            />
          </div>
        </section>

        <section className="rounded-xl border border-border/50 bg-card p-6">
          <div className="mb-4 flex items-center gap-2">
            <Folder className="size-4 text-primary" />
            <h2 className="text-base font-semibold">Storage Location</h2>
          </div>
          <div className="space-y-3">
            <Label htmlFor="download-path">Save downloads to</Label>
            <div className="flex gap-2">
              <Input
                id="download-path"
                value={downloadPath}
                onChange={(e) => dispatch(setDownloadPath(e.target.value))}
                placeholder="C:/Users/Downloads"
                className="font-mono text-sm bg-muted/30"
              />
              <Button variant="outline" onClick={onBrowseFolder}>
                Browse
              </Button>
            </div>
            <p className="text-[10px] text-muted-foreground">
              Changes are auto-saved to config.json
            </p>
          </div>
        </section>

        <section className="rounded-xl border border-border/50 bg-card p-6">
          <h2 className="text-base font-semibold mb-4">General</h2>
          <div className="flex items-center justify-between rounded-lg border border-border/30 bg-background/50 p-4">
            <div className="space-y-0.5">
              <Label htmlFor="autostart" className="text-base">
                Auto-start downloads
              </Label>
              <p className="text-xs text-muted-foreground">
                Begin downloading immediately when added
              </p>
            </div>
            <Switch
              id="autostart"
              checked={autoStart}
              onCheckedChange={(v) => dispatch(setAutoStart(v))}
            />
          </div>
        </section>
      </div>
    </div>
  );
}
