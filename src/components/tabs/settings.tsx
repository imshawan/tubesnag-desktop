import {CheckCircle2, Folder, Languages, LayoutList, Monitor} from "lucide-react";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {Switch} from "@/components/ui/switch";
import {useTranslation} from "react-i18next";
import {useSettings} from "@/hooks/useSettings";
import LangToggle from "@/components/lang-toggle";
import {VIDEO_QUALITIES} from "@/lib/ytdlp/constants";
import {cn} from "@/lib/utils/tailwind";
import {Separator} from "@/components/ui/separator";

interface SettingsProps {
	onBrowseFolder: () => void;
}

export function Settings({onBrowseFolder}: Readonly<SettingsProps>) {
	const {t} = useTranslation();
	const {
		quality,
		downloadPath,
		autoStart,
		recentItemsPerPage,
		itemsPerPage,
		setSaveVideosToPlaylistFolders,
		saveVideosToPlaylistFolders,
		setSelectedQuality,
		setAutoStartForDownloads,
		setSelectedDownloadPath,
		setDownloadItemsPerPage,
		setRecentDownloadItemsPerPage
	} = useSettings();

	return (
		<div className="flex flex-col gap-8 animate-in fade-in duration-500 max-w-3xl">
			<div className="space-y-1">
				<h2 className="text-2xl font-semibold tracking-tight">{t("settings.title")}</h2>
				<p className="text-sm text-muted-foreground">{t("settings.subtitle")}</p>
			</div>

			<div className="space-y-6">
				<section className="rounded-xl border border-border/50 bg-card p-6">
					<div className="mb-4 flex items-center gap-2">
						<Languages className="size-4 text-primary"/>
						<h2 className="text-base font-semibold">Language</h2>
					</div>
					<div className="space-y-3">
						<Label htmlFor="language-select">App Language</Label>
						<LangToggle/>
						<p className="text-[10px] text-muted-foreground">
							Select your preferred language for the application interface
						</p>
					</div>
				</section>

				<section className="rounded-xl border border-border/50 bg-card p-6">
					<h2 className="text-base font-semibold mb-4">{t("settings.general")}</h2>
					<div
						className="flex items-center justify-between rounded-lg border border-border/30 bg-background/50 p-4">
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
							onCheckedChange={(v) => setAutoStartForDownloads(v)}
						/>
					</div>

					<div
						className="flex items-center justify-between rounded-lg border border-border/30 bg-background/50 p-4 mt-1">
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

				<section className="rounded-xl border border-border/50 bg-card p-6 shadow-sm">
					<div className="mb-6 flex items-center gap-2">
						<Monitor className="size-5 text-primary"/>
						<h2 className="text-lg font-semibold tracking-tight">{t("settings.downloadQuality")}</h2>
					</div>

					{/* Responsive Grid: 1 col mobile, 2 col tablet, 3 col desktop */}
					<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
						{VIDEO_QUALITIES.map((q) =>
							<VideoQualitySelector
								key={q.id}
								qualityItem={q}
								selected={quality}
								setSelectedQuality={setSelectedQuality}
							/>)}
					</div>
				</section>

				<section className="rounded-xl border border-border/50 bg-card p-6 shadow-sm mt-6">
					<div className="mb-6 flex items-center gap-2">
						<LayoutList className="size-5 text-primary" />
						<h2 className="text-lg font-semibold tracking-tight">{t("settings.displayPreferences")}</h2>
					</div>

					<div className="flex flex-col gap-6">

						{/* Setting 1: Main Downloads List */}
						<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
							<div className="space-y-1">
								<p className="text-sm font-medium text-foreground">
									{t("settings.itemsPerPage")}
								</p>
								<p className="text-xs text-muted-foreground leading-relaxed max-w-sm">
									{t("settings.itemsPerPageDesc")}
								</p>
							</div>

							{/* Segmented Control */}
							<div className="flex items-center p-1 bg-muted/30 border border-border/50 rounded-lg w-fit">
								{[10, 25, 50, 100].map((val) => {
									const isSelected = itemsPerPage === val;
									return (
										<button
											key={`main-${val}`}
											onClick={() => setDownloadItemsPerPage(val)}
											className={cn(
												"px-4 py-1.5 text-xs font-semibold rounded-md transition-all duration-200",
												isSelected
													? "bg-background text-foreground shadow-sm ring-1 ring-border/50"
													: "text-muted-foreground hover:text-foreground hover:bg-muted/50"
											)}
										>
											{val}
										</button>
									);
								})}
							</div>
						</div>

						<Separator className="bg-border/50" />

						{/* Setting 2: Dashboard Recent Activity */}
						<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
							<div className="space-y-1">
								<p className="text-sm font-medium text-foreground">
									{t("settings.recentItems")}
								</p>
								<p className="text-xs text-muted-foreground leading-relaxed max-w-sm">
									{t("settings.recentItemsDesc")}
								</p>
							</div>

							{/* Segmented Control */}
							<div className="flex items-center p-1 bg-muted/30 border border-border/50 rounded-lg w-fit">
								{[5, 10, 15, 20].map((val) => {
									const isSelected = recentItemsPerPage === val;
									return (
										<button
											key={`recent-${val}`}
											onClick={() => setRecentDownloadItemsPerPage(val)}
											className={cn(
												"px-4 py-1.5 text-xs font-semibold rounded-md transition-all duration-200",
												isSelected
													? "bg-background text-foreground shadow-sm ring-1 ring-border/50"
													: "text-muted-foreground hover:text-foreground hover:bg-muted/50"
											)}
										>
											{val}
										</button>
									);
								})}
							</div>
						</div>

					</div>
				</section>

				<section className="rounded-xl border border-border/50 bg-card p-6">
					<div className="mb-4 flex items-center gap-2">
						<Folder className="size-4 text-primary"/>
						<h2 className="text-base font-semibold">{t("settings.storageLocation")}</h2>
					</div>
					<div className="space-y-3">
						<Label htmlFor="download-path">{t("settings.saveDownloadsTo")}</Label>
						<div className="flex gap-2">
							<Input
								id="download-path"
								value={downloadPath}
								onChange={(e) => setSelectedDownloadPath(e.target.value)}
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

				</section>

			</div>
		</div>
	);
}

function VideoQualitySelector({qualityItem, selected, setSelectedQuality}: Readonly<{
	qualityItem: VideoQuality,
	selected: QualityType,
	setSelectedQuality: (value: QualityType) => void
}>) {
	const isSelected = selected === qualityItem.id;
	const Icon = qualityItem.icon;

	return (
		<label
			key={qualityItem.id}
			className={cn(
				"relative flex cursor-pointer flex-col gap-2.5 rounded-xl border p-4 shadow-sm transition-all duration-200 hover:border-primary/50",
				isSelected
					? "border-primary bg-primary/5 ring-1 ring-primary"
					: "border-border/50 bg-background hover:bg-muted/30"
			)}
		>
			{/* Hidden native radio input for accessibility */}
			<input
				type="radio"
				name="download-quality"
				value={qualityItem.id}
				checked={selected === qualityItem.id}
				onChange={() => setSelectedQuality(qualityItem.id)}
				className="sr-only"
			/>

			<div className="flex items-center justify-between">
				<div className="flex items-center gap-2.5">
					{Icon && (
						<Icon
							className={cn(
								"size-4.5 shrink-0 transition-colors",
								isSelected ? "text-primary" : "text-muted-foreground"
							)}
						/>
					)}
					<span className={cn(
						"font-semibold tracking-tight transition-colors",
						isSelected ? "text-primary" : "text-foreground"
					)}>
                  {qualityItem.label()}
                </span>
				</div>

				{/* Animated checkmark when selected */}
				{isSelected && (
					<CheckCircle2 className="size-4 shrink-0 text-primary animate-in zoom-in duration-200"/>
				)}
			</div>

			{/* pl-[26px] aligns the sub-text cleanly underneath the label text, skipping the icon */}
			<span className="text-xs text-muted-foreground leading-relaxed pl-6.5">
              {qualityItem.sub()}
            </span>
		</label>
	)
}