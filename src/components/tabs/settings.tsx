import { Folder, Monitor } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { RadioItem } from "@/components/radio-item";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setQuality, setDownloadPath, setAutoStart } from "@/store/slices/settings-slice";
import { useTranslation } from "react-i18next";
import {useSettings} from "@/hooks/useSettings";

interface SettingsProps {
  onBrowseFolder: () => void;
}

export function Settings({ onBrowseFolder }: SettingsProps) {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const {quality, downloadPath, autoStart, setSaveVideosToPlaylistFolders, saveVideosToPlaylistFolders} = useSettings();

  return (
    <div className="flex flex-col gap-8 animate-in fade-in duration-500 max-w-3xl">
      <div className="space-y-1">
        <h2 className="text-2xl font-semibold tracking-tight">{t("settings.title")}</h2>
        <p className="text-sm text-muted-foreground">{t("settings.subtitle")}</p>
      </div>

      <div className="space-y-6">
        <section className="rounded-xl border border-border/50 bg-card p-6">
          <div className="mb-4 flex items-center gap-2">
            <Monitor className="size-4 text-primary" />
            <h2 className="text-base font-semibold">{t("settings.downloadQuality")}</h2>
          </div>
          <div className="grid gap-2">
            <RadioItem
              value="best"
              selectedValue={quality}
              onChange={(v) => dispatch(setQuality(v))}
              label={t("settings.bestQuality")}
              desc={t("settings.bestQualityDesc")}
            />
            <RadioItem
              value="high"
              selectedValue={quality}
              onChange={(v) => dispatch(setQuality(v))}
              label={t("settings.highQuality")}
              desc={t("settings.highQualityDesc")}
            />
            <RadioItem
              value="medium"
              selectedValue={quality}
              onChange={(v) => dispatch(setQuality(v))}
              label={t("settings.mediumQuality")}
              desc={t("settings.mediumQualityDesc")}
            />
            <RadioItem
              value="low"
              selectedValue={quality}
              onChange={(v) => dispatch(setQuality(v))}
              label={t("settings.lowQuality")}
              desc={t("settings.lowQualityDesc")}
            />
          </div>
        </section>

        <section className="rounded-xl border border-border/50 bg-card p-6">
          <div className="mb-4 flex items-center gap-2">
            <Folder className="size-4 text-primary" />
            <h2 className="text-base font-semibold">{t("settings.storageLocation")}</h2>
          </div>
          <div className="space-y-3">
            <Label htmlFor="download-path">{t("settings.saveDownloadsTo")}</Label>
            <div className="flex gap-2">
              <Input
                id="download-path"
                value={downloadPath}
                onChange={(e) => dispatch(setDownloadPath(e.target.value))}
                placeholder="C:/Users/Downloads"
                className="font-mono text-sm bg-muted/30"
              />
              <Button variant="outline" onClick={onBrowseFolder}>
                {t("settings.browse")}
              </Button>
            </div>
            <p className="text-[10px] text-muted-foreground">
              {t("settings.autoSaved")}
            </p>
          </div>
        </section>

        <section className="rounded-xl border border-border/50 bg-card p-6">
          <h2 className="text-base font-semibold mb-4">{t("settings.general")}</h2>
          <div className="flex items-center justify-between rounded-lg border border-border/30 bg-background/50 p-4">
            <div className="space-y-0.5">
              <Label htmlFor="autostart" className="text-base">
                {t("settings.autoStartDownloads")}
              </Label>
              <p className="text-xs text-muted-foreground">
                {t("settings.autoStartDesc")}
              </p>
            </div>
            <Switch
              id="autostart"
              checked={autoStart}
              onCheckedChange={(v) => dispatch(setAutoStart(v))}
            />
          </div>

          <div className="flex items-center justify-between rounded-lg border border-border/30 bg-background/50 p-4 mt-1">
            <div className="space-y-0.5">
              <Label htmlFor="playlist-folders" className="text-base">
                {t("settings.savePlaylistFolders")}
              </Label>
              <p className="text-xs text-muted-foreground">
                {t("settings.savePlaylistFoldersDesc")}
              </p>
            </div>
            <Switch
                id="playlist-folders"
                checked={saveVideosToPlaylistFolders}
                onCheckedChange={(v) => setSaveVideosToPlaylistFolders(v)}
            />
          </div>
        </section>
        <section className="rounded-xl border border-border/50 bg-card p-6">

        </section>

      </div>
    </div>
  );
}
