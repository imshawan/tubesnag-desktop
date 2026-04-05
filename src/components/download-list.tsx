import {ChevronDown, ChevronUp, FileVideo, ListVideo, Music} from "lucide-react";
import {ScrollArea} from "@/components/ui/scroll-area";
import {cn} from "@/lib/utils/tailwind";
import {RefObject, useEffect, useRef, useState} from "react";
import {formatBytes} from "@/lib/utils/common";
import {fileToDataUrl} from "@/lib/ytdlp/ytdlp";
import {DownloadContextMenu} from "@/components/download-context-menu";
import {timeFromNow} from "@/lib/utils/date";
import {DownloadStatusBadge} from "@/components/download-status-badge";
import {useTranslation} from "react-i18next";
import { useApp } from "@/hooks/useApp";
import { Checkbox } from "./ui/checkbox";
import { DownloadType } from "@/lib/utils/enums";
import { useDownloads } from "@/hooks/useDownloads";

interface DownloadListProps {
	items: DownloadItem[];
	onOpenFile: (download: DownloadItem) => void;
	onOpenFolder: (download: DownloadItem) => void;
	onRetry: (download: DownloadItem) => void;
	onDelete: (download: DownloadItem, downloadListType: DownloadListType) => void;
	onShare: (download: DownloadItem) => void;
	maxHeight?: string;
	downloadListType: DownloadListType;
	maxItems?: number;
}

export function DownloadList({
	                             items,
	                             onOpenFile,
	                             onOpenFolder,
	                             onRetry,
	                             onDelete,
	                             onShare,
	                             downloadListType,
	                             maxHeight = "h-[600px]",
	                             maxItems = 0
                             }: Readonly<DownloadListProps>) {
	const {t} = useTranslation();
	const [expandedPlaylist, setExpandedPlaylist] = useState<string | null>(null);
	const imageCache = useRef<Record<string, string>>({});

	const {addToSelectedDownloads, removeFromSelctedDownloads, selectedDownloads} = useDownloads();
	const {activeTab, isSelectionEnabled} = useApp();

	const getSizeString = (size: string) =>
		size.includes("NaN") || size.includes("undefined") ? "0 B" : size;

	const handleSelect = (item: DownloadItem) => {
		if (activeTab === "history" && isSelectionEnabled) {
			if (selectedDownloads.has(item.id.toString())) {
				removeFromSelctedDownloads([item])
			} else {
				addToSelectedDownloads(item)
			}
		}
	}

	const renderDownloadRow = (download: DownloadItem, idx: number, isPlaylistChild = false) => {
		const size = getSizeString(formatBytes(download.size));
		const disabled = !!(maxItems) && !!(idx) && maxItems === idx;
		const timeWithTranslation = timeFromNow(download.date);

		return (
			<DownloadContextMenu
				key={download.id}
				download={download}
				onOpen={onOpenFile}
				onOpenFolder={onOpenFolder}
				onRetry={onRetry}
				onDelete={onDelete}
				onShare={onShare}
				downloadListType={downloadListType}
				disabled={disabled}
			>
				<div
					className={cn(
						"flex items-center justify-between p-4 transition-colors",
						isPlaylistChild && "pl-12 bg-muted/5",
						disabled ? "cursor-auto" : "cursor-pointer hover:bg-muted/30",
					)}
					onClick={() => handleSelect(download)}
				>
					<div className="flex items-center gap-4">
						<ThumbnailIcon item={download} imageCache={imageCache}/>
						<div className="flex flex-col">
							<span className="font-medium text-sm">{download.title}</span>
							<div className="flex gap-2 text-xs text-muted-foreground">
								<span>{download.channel}</span>
								<span>•</span>
								<span>{t(timeWithTranslation[1].toString(), {time: timeWithTranslation[0]})}{Number(timeWithTranslation[0]) > 0 ? ` ${t("timeAgo.ago")}` : null}</span>
								<span>•</span>
								<span className="capitalize">{download.type}</span>
								<span>•</span>
								<span>{size}</span>
							</div>
						</div>
					</div>
					<div className="flex items-center gap-2">
						<QualityBadge quality={download.quality}/>
						<DownloadStatusBadge data={download}/>
					</div>
				</div>
			</DownloadContextMenu>
		);
	}

	const renderPlaylistRow = (item: DownloadItem) => {
		return (
			<DownloadContextMenu
				key={item.id}
				download={item}
				onOpen={onOpenFile}
				onOpenFolder={onOpenFolder}
				onRetry={onRetry}
				onDelete={onDelete}
				onShare={onShare}
				downloadListType={downloadListType}
			>
				<div key={item.id}>
					<div
						className="flex items-center justify-between p-4 hover:bg-blue-500/5 cursor-pointer transition-colors border-l-4 border-blue-500"
						onClick={() => {
							setExpandedPlaylist(expandedPlaylist === item.id ? null : item.id);
							handleSelect(item);
						}}
					>
						<div className="flex items-center gap-4 flex-1">
							<div className="relative">
								{item.thumbnail ? (
									<img src={item.thumbnail} alt={item.title}
										 className="size-10 rounded-lg object-cover border border-blue-500/30"/>
								) : (
									<DefaultIcon item={item}/>
								)}
								<CheckboxOverlay item={item} />
							</div>
							<div className="flex flex-col">
								<span className="font-semibold text-sm text-blue-600">{item.title}</span>
								<span
									className="text-xs text-muted-foreground">{item.videos?.length || 0} videos</span>
							</div>
						</div>
						<div className="flex items-center gap-4">
                  <span className="text-xs text-muted-foreground hidden sm:block">
                    {item.quality}
                  </span>
							<DownloadStatusBadge data={item}/>
							{expandedPlaylist === item.id ? (
								<ChevronUp className="size-4 text-muted-foreground"/>
							) : (
								<ChevronDown className="size-4 text-muted-foreground"/>
							)}
						</div>
					</div>
					{expandedPlaylist === item.id && item.videos && (
						<div className="bg-muted/5 divide-y divide-border/20">
							{item.videos.map((video, i) => renderDownloadRow(video, 0, true))}
						</div>
					)}
				</div>
			</DownloadContextMenu>
		)
	}

	return (
		<ScrollArea className={maxHeight}>
			<div className="divide-y divide-border/40">
				{items.map((item, idx) => (
					item.type === "playlist" ? renderPlaylistRow(item) : renderDownloadRow(item, idx, false)
				))}
			</div>
		</ScrollArea>
	);
}

function QualityBadge({quality}: Readonly<{ quality: string }>) {
	const getQualityColor = (q: string) => {
		if (q.includes("best")) return "bg-yellow-500/10 text-yellow-600 border-yellow-500/20 font-medium";
		if (q.includes("8k") || q.includes("4320")) return "bg-violet-600/10 text-violet-600 border-violet-600/20 font-bold";
		if (q.includes("4k") || q.includes("2160")) return "bg-purple-500/10 text-purple-500 border-purple-500/20";
		if (q.includes("1440") || q.includes("2K")) return "bg-blue-500/10 text-blue-500 border-blue-500/20";
		if (q.includes("1080") || q.includes("FHD")) return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
		if (q.includes("720") || q.includes("HD")) return "bg-amber-500/10 text-amber-500 border-amber-500/20";
		if (q.includes("480") || q.includes("SD")) return "bg-rose-500/10 text-rose-500 border-rose-500/20";
		if (q.includes("360")) return "bg-sky-500/10 text-sky-500 border-sky-500/20";
		if (q.includes("240") || q.includes("144")) return "bg-slate-500/10 text-slate-500 border-slate-500/20";
		if (q.includes("audio") || q.includes("kbps")) return "bg-pink-500/10 text-pink-500 border-pink-500/20";

		return "bg-gray-500/10 text-gray-500 border-gray-500/20";
	};

	return (
		<div className={`px-2 py-0.5 rounded text-[10px] font-medium border ${getQualityColor(quality)}`}>
			{quality}
		</div>
	);

}

function DefaultIcon({item}: Readonly<{ item: DownloadItem }>) {
	const Icon = item.type === DownloadType.Audio ? Music : (item.type === DownloadType.Playlist ? ListVideo : FileVideo);
	return (
		<div
			className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted/50 border border-border/50">
			{<Icon className="size-5 text-muted-foreground"/>}
		</div>
	)
}

function ThumbnailIcon ({item, imageCache, selectorVisibleOnHover = false}: { item: DownloadItem, imageCache: RefObject<Record<string, string>>, selectorVisibleOnHover?: boolean }) {
	const [dataUrl, setDataUrl] = useState<string>('');

    useEffect(() => {
        if (!item.thumbnail || item.thumbnail.startsWith("http"))
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
    }, [item.thumbnail]);

    // Helper to render the actual base visual
    const renderBaseVisual = () => {
        if (item.thumbnail && dataUrl) {
            return (
                <img
                    src={dataUrl}
                    alt={item.title}
                    className="size-full rounded-lg object-cover border border-border/50"
                />
            );
        }
        const Icon = item.type === DownloadType.Audio ? Music : (item.type === DownloadType.Playlist ? ListVideo : FileVideo);
        return (
            <div className="flex size-full items-center justify-center rounded-lg bg-muted/50 border border-border/50">
                <Icon className="size-5 text-muted-foreground" />
            </div>
        );
    };

    return (
        <div className="group relative size-10 shrink-0">
            {/* The underlying Image or Icon */}
            {renderBaseVisual()}

            {!item.parentId ? <CheckboxOverlay item={item} /> : null}
        </div>
    );
}

function CheckboxOverlay ({item, selectorVisibleOnHover = false}: { item: DownloadItem, selectorVisibleOnHover?: boolean }) {
	const [isSelected, setIsSelected] = useState(false);

	const {activeTab, isSelectionEnabled} = useApp();
	const {addToSelectedDownloads, removeFromSelctedDownloads, selectedDownloads} = useDownloads();

	useEffect(() => {
		setIsSelected(selectedDownloads.has(item.id.toString()));
	}, [selectedDownloads]);


	const onSelection = (checked: boolean) => {
		setIsSelected(checked);

		if (checked) {
			addToSelectedDownloads(item);
		} else {
			removeFromSelctedDownloads([item]);
		}
	}

	const showCheckboxOverlay = (activeTab === "history" && isSelectionEnabled);

	return (
		<>
		{/* The Checkbox Overlay */}
            {(showCheckboxOverlay || selectorVisibleOnHover) ? (<div
                className={cn(
                    "absolute inset-0 flex items-center justify-center rounded-lg transition-all duration-200",
                    showCheckboxOverlay 
                        ? "bg-black/40 opacity-100" // Always visible with dark backdrop
                        :  (selectorVisibleOnHover ? "bg-black/40 opacity-0 group-hover:opacity-100" : null)
                )}
            >
                <Checkbox
                    checked={isSelected}
                    onCheckedChange={(checked) => onSelection(checked as boolean)}
                    className={cn(
                        "size-4 border-white/70 shadow-sm",
                        isSelected && "border-primary bg-blue-400"
                    )}
                    // Prevent the click from bubbling up if the row itself is also clickable
                    onClick={(e: any) => e.stopPropagation()} 
                />
            </div>) : null}
		</>
	)
}