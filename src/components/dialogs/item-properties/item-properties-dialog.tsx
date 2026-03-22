import {Dialog, DialogContent, DialogHeader, DialogTitle,} from "@/components/ui/dialog"
import {Progress} from "@/components/ui/progress"
import {Button} from "@/components/ui/button"
import {Badge} from "@/components/ui/badge"
import {Separator} from "@/components/ui/separator"
import {
	AlertCircle,
	Calendar,
	Check,
	Copy,
	ExternalLink,
	FileVideo,
	Folder,
	HardDrive,
	Hash,
	Link as LinkIcon,
	ListVideo,
	Music,
	Settings2,
	Tv,
	Video
} from "lucide-react"
import {useEffect, useRef, useState} from "react"
import {useDownloads} from "@/hooks/useDownloads"
import {formatBytes} from "@/lib/utils/common"
import {DetailItem} from "@/components/dialogs/item-properties/detail-item";
import {CopyField} from "@/components/dialogs/item-properties/copy-field";
import {MediaTypeBadge} from "@/components/dialogs/item-properties/media-type-badge";
import {fileToDataUrl} from "@/lib/ytdlp/ytdlp";
import {ScrollArea} from "@/components/ui/scroll-area";
import {useTranslation} from "react-i18next";
import {useActiveDownloads} from "@/hooks/useActiveDownloads";

interface ItemPropertiesDialogProps {
	onOpenFolder: (download: DownloadItem) => void;
}

export function ItemPropertiesDialog({onOpenFolder}: Readonly<ItemPropertiesDialogProps>) {
	const {t} = useTranslation()
	const [copied, setCopied] = useState<"url" | "path" | "id" | null>(null)
	const [dataUrl, setDataUrl] = useState<string>('');
	const imageCache = useRef<Record<string, string>>({});

	const {downloadItemPropertyOpen: item, setDownloadItemPropertyOpen} = useDownloads()
	const {currentDownloadId} = useActiveDownloads();

	const [displayItem, setDisplayItem] = useState(item)

	useEffect(() => {
		if (item) setDisplayItem(item)
	}, [item])

	useEffect(() => {
		if (!item?.thumbnail) return;

		if (item.thumbnail.startsWith("http"))
			return setDataUrl(item.thumbnail || "");
		if (imageCache.current[item.thumbnail]) {
			setDataUrl(imageCache.current[item.thumbnail]);
		} else {
			fileToDataUrl(item.thumbnail)
				.then(url => {
					imageCache.current[item.thumbnail || ""] = url;
					setDataUrl(url);
				})
				.catch(() => setDataUrl(''));
		}
	}, [item]);

	const open: boolean = item !== null

	const onOpenChange = (isOpen: boolean) => {
		if (!isOpen) {
			setCopied(null)
			setDownloadItemPropertyOpen(null)
		}
	}

	const handleCopy = (text: string, type: "url" | "path" | "id") => {
		if (!text) return
		navigator.clipboard.writeText(text)
		setCopied(type)
		setTimeout(() => setCopied(null), 2000)
	}

	const getStatusVariant = (status: string) => {
		switch (status) {
			case "completed":
				return "default"
			case "failed":
				return "destructive"
			case "downloading":
				return "secondary"
			default:
				return "outline"
		}
	}

	if (!displayItem) return null

	const isPlaylist = displayItem.type === "playlist";
	const hasChildren = isPlaylist && displayItem.videos && displayItem.videos.length > 0;
	const isDownloadErrored = (displayItem && (displayItem.status === "downloading" || displayItem.status === "pending"))
		&& currentDownloadId !== displayItem.id;

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent
				className="sm:max-w-[650px] flex flex-col max-h-[90vh] p-0 gap-0 overflow-hidden bg-background shadow-2xl">

				<div className="shrink-0 bg-card p-6 border-b relative z-10 shadow-sm">
					<DialogHeader className="space-y-0 text-left">
						<div className="flex flex-col sm:flex-row items-start gap-5">

							{/* Media Thumbnail */}
							<div
								className="shrink-0 w-full sm:w-50 aspect-video rounded-md bg-muted flex items-center justify-center border overflow-hidden shadow-sm relative group">
								{(displayItem.thumbnail && dataUrl) ? (
									<img src={dataUrl} alt="Thumbnail"
									     className="w-full h-full object-cover"/>
								) : (
									<TypeIcon displayItem={displayItem} isPlaylist={isPlaylist} className="size-10 text-muted-foreground/30"/>
								)}
								<div
									className="absolute bottom-1.5 right-1.5 bg-black/70 backdrop-blur-md px-1.5 py-0.5 rounded text-[10px] font-bold text-white uppercase tracking-wider">
									{displayItem.quality}
								</div>
							</div>

							{/* Core Identity */}
							<div className="flex flex-col gap-2 flex-1 min-w-0 w-full">
								<div className="space-y-1">
									<DialogTitle
										className="text-base leading-snug break-words line-clamp-2"
										title={displayItem.title}
									>
										{displayItem.title}
									</DialogTitle>

									<div className="flex items-center gap-2 text-sm text-muted-foreground pt-1">
										<Tv className="size-3.5 shrink-0"/>
										<span className="truncate">{displayItem.channel || t("itemProperties.unknownChannel")}</span>
									</div>
								</div>

								{/* Dynamic Status / Progress Area */}
								<div className="space-y-2 mt-1">
									<div className="flex items-center gap-2">
										<Badge variant={isDownloadErrored ? "destructive" : getStatusVariant(displayItem.status)}
										       className="capitalize px-2.5 shadow-sm">
											{isDownloadErrored ? t("common.broken") : displayItem.status}
										</Badge>
										<MediaTypeBadge type={displayItem.type} format={displayItem.format} />
									</div>

									{/* Real Progress Bar */}
									{displayItem.status === "downloading" && (
										<div className="flex items-center gap-3 pt-1">
											<Progress value={displayItem.progress} className="h-2 flex-1"/>
											<span
												className="text-xs font-mono font-medium tabular-nums w-10 text-right text-muted-foreground">
                                                {Math.round(displayItem.progress)}%
                                            </span>
										</div>
									)}
								</div>
							</div>
						</div>
					</DialogHeader>
				</div>

				{/* --- BODY (Scrollable) --- */}
				<ScrollArea className="p-6 space-y-8 h-[480px]">

					{/* Error Banner */}
					{displayItem.error && (
						<div
							className="p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive flex items-start gap-3 shadow-sm">
							<AlertCircle className="size-5 shrink-0 mt-0.5"/>
							<div className="space-y-1">
								<p className="font-semibold">{t("itemProperties.operationFailed")}</p>
								<p className="text-sm opacity-90 leading-relaxed break-words">{displayItem.error}</p>
							</div>
						</div>
					)}

					{/* Section: Locations */}
					<section className="space-y-4">
						<h3 className="text-sm font-semibold text-foreground tracking-tight flex items-center gap-2">
							<Folder className="size-4 text-muted-foreground"/>
							{t("itemProperties.locations")}
						</h3>
						<div className="space-y-4 pl-1">
							<CopyField
								label={t("itemProperties.sourceURL")}
								icon={LinkIcon}
								value={displayItem.url}
								isCopied={copied === "url"}
								onCopy={() => handleCopy(displayItem.url, "url")}
							/>
							<CopyField
								label={t("itemProperties.localDestination")}
								icon={Folder}
								value={displayItem.downloadPath}
								isCopied={copied === "path"}
								onCopy={() => handleCopy(displayItem.downloadPath, "path")}
							/>
						</div>
					</section>

					{/* Section: Technical Specs */}
					<section className="space-y-4 mt-6">
						<h3 className="text-sm font-semibold text-foreground tracking-tight flex items-center gap-2">
							<Settings2 className="size-4 text-muted-foreground"/>
							{t("itemProperties.technicalSpecs")}
						</h3>
						<dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 pl-1">
							<DetailItem icon={Hash} label={t("itemProperties.internalID")} value={displayItem.id} mono/>
							<DetailItem icon={Calendar} label={t("itemProperties.dateAdded")}
							            value={displayItem.date ? new Date(displayItem.date).toLocaleString() : "N/A"}/>
							<DetailItem icon={HardDrive} label={t("itemProperties.totalSize")}
							            value={displayItem.size > 0 ? formatBytes(displayItem.size) : t("itemProperties.calculating")}/>
							<DetailItem icon={Settings2} label={t("itemProperties.mediaFormat")}
							            value={displayItem.format ? displayItem.format.toUpperCase() : t("itemProperties.auto")}/>
							<DetailItem icon={Video} label={t("itemProperties.requestedQuality")} value={displayItem.quality} capitalize/>
							<DetailItem icon={FileVideo} label={t("itemProperties.contentType")} value={displayItem.type} capitalize/>
						</dl>
					</section>

					{/* Section: Playlist Context (If it's part of a playlist) */}
					{displayItem.parentId && (
						<>
							<Separator className="bg-border/60"/>
							<section className="space-y-4">
								<h3 className="text-sm font-semibold text-foreground tracking-tight flex items-center gap-2">
									<ListVideo className="size-4 text-muted-foreground"/>
									{t("itemProperties.playlistAssociation")}
								</h3>
								<div
									className="flex items-center gap-3 p-4 bg-background border rounded-lg shadow-sm ml-1">
									<div className="p-2 bg-muted rounded-md"><ListVideo
										className="size-4 text-muted-foreground"/></div>
									<div className="min-w-0 flex-1">
										<p className="text-xs font-medium text-muted-foreground">{t("itemProperties.extractedFromPlaylist")}</p>
										<p className="text-sm font-medium line-clamp-2"
										   title={displayItem.parentTitle || displayItem.parentId}>
											{displayItem.parentTitle || displayItem.parentId}
										</p>
									</div>
								</div>
							</section>
						</>
					)}

					{/* Section: Playlist Items (If it IS a playlist) */}
					{hasChildren && (
						<>
							<Separator className="bg-border/60"/>
							<section className="space-y-4">
								<div className="flex items-center justify-between">
									<h3 className="text-sm font-semibold text-foreground tracking-tight flex items-center gap-2">
										<ListVideo className="size-4 text-muted-foreground"/>
										{t("itemProperties.playlistItems")}
									</h3>
									<Badge variant="secondary"
									       className="font-mono">{displayItem.videos?.length}</Badge>
								</div>

								<div
									className="rounded-lg border bg-background overflow-hidden shadow-sm ml-1 divide-y divide-border/50">
									{displayItem.videos?.map((childVideo, idx) => (
										<div key={childVideo.id || idx}
										     className="flex items-center gap-4 p-3 hover:bg-muted/50 transition-colors">
											<div
												className="text-xs font-mono text-muted-foreground w-4 text-right">{idx + 1}</div>
											<div className="shrink-0 size-10 rounded bg-muted border overflow-hidden">
												{childVideo.thumbnail ? (
													<img src={childVideo.thumbnail} alt=""
													     className="w-full h-full object-cover"/>
												) : (
													<div className="w-full h-full flex items-center justify-center">
														<Video className="size-4 text-muted-foreground"/></div>
												)}
											</div>
											<div className="flex-1 min-w-0">
												<p className="text-sm font-medium truncate leading-tight">{childVideo.title}</p>
												<div className="flex items-center gap-2 mt-1">
													<Badge variant={getStatusVariant(childVideo.status)}
													       className="px-1.5 py-0 text-[10px]">
														{childVideo.status}
													</Badge>
													<span
														className="text-[11px] text-muted-foreground">{childVideo.size > 0 ? formatBytes(childVideo.size) : "Unknown size"}</span>
												</div>
											</div>
										</div>
									))}
								</div>
							</section>
						</>
					)}
				</ScrollArea>

			{/* --- FOOTER (Fixed) --- */}
			<div className="shrink-0 p-4 bg-card border-t flex items-center justify-between">
				<Button variant="ghost" onClick={() => handleCopy(displayItem.id, "id")}
				        className="text-xs text-muted-foreground hidden sm:flex">
					{copied === "id" ? <Check className="size-3 mr-2"/> : <Copy className="size-3 mr-2"/>}
					{t("itemProperties.copyID")}
				</Button>
				<div className="flex items-center gap-3 w-full sm:w-auto justify-end">
					<Button className="text-sm p-4" variant="outline" onClick={() => onOpenChange(false)}>
						{t("common.cancel")}
					</Button>
					{displayItem.status === "completed" && (
						<Button className="gap-2 text-sm p-4 shadow-sm" onClick={() => onOpenFolder(displayItem)}>
							<ExternalLink className="size-4"/>
							{t("itemProperties.openDirectory")}
						</Button>
					)}
				</div>
			</div>

			</DialogContent>
		</Dialog>
	)
}

function TypeIcon ({displayItem, isPlaylist, className}: Readonly<{
	displayItem: DownloadItem,
	isPlaylist: boolean,
	className?: string
}>) {
	if (displayItem.type === "audio") {
		return <Music className={className} />;
	} else if (isPlaylist) {
		return <ListVideo className={className} />;
	} else {
		return <FileVideo className={className} />;
	}
}