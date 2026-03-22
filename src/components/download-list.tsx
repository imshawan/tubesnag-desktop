import {
	AlertCircle,
	CheckCircle2,
	ChevronDown,
	ChevronUp,
	FileVideo,
	FileX,
	LucideProps,
	Music,
	Zap
} from "lucide-react";
import {useTranslation} from "react-i18next";
import {ScrollArea} from "@/components/ui/scroll-area";
import {cn} from "@/lib/utils/tailwind";
import {useEffect, useMemo, useRef, useState} from "react";
import {formatBytes} from "@/lib/utils/common";
import {fileToDataUrl} from "@/lib/ytdlp/ytdlp";
import {DownloadContextMenu} from "@/components/download-context-menu";
import {timeFromNow} from "@/lib/utils/date";
import {useActiveDownloads} from "@/hooks/useActiveDownloads";

interface DownloadListProps {
	items: DownloadItem[];
	onOpenFile: (download: DownloadItem) => void;
	onOpenFolder: (download: DownloadItem) => void;
	onRetry: (download: DownloadItem) => void;
	onDelete: (download: DownloadItem, downloadListType: DownloadListType) => void;
	onShare: (download: DownloadItem) => void;
	maxHeight?: string;
	downloadListType: DownloadListType;
}

export function DownloadList({
	                             items,
	                             onOpenFile,
	                             onOpenFolder,
	                             onRetry,
	                             onDelete,
	                             onShare,
	                             downloadListType,
	                             maxHeight = "h-[600px]"
                             }: Readonly<DownloadListProps>) {
	const {t} = useTranslation();
	const {currentDownloadId} = useActiveDownloads();
	const [expandedPlaylist, setExpandedPlaylist] = useState<string | null>(null);
	const imageCache = useRef<Record<string, string>>({});

	const getSizeString = (size: string) =>
		size.includes("NaN") || size.includes("undefined") ? "0 B" : size;

	const formattedSizes = useMemo(() => {
		return items.reduce((acc, item) => {
			acc[item.id] = getSizeString(formatBytes(item.size));
			if (item.videos?.length) {
				item.videos.forEach(video => {
					acc[video.id] = getSizeString(formatBytes(video.size));
				});
			}

			return acc;
		}, {} as Record<string, string>);
	}, [items]);

	const renderStatusBadge = (download: DownloadItem) => {
		const isDownloadErrored = (download.status === "downloading" || download.status === "pending")
			&& currentDownloadId !== download.id;

		if (download.status === "completed" || download.progress === 100) {
			return (
				<div
					className="flex items-center gap-1.5 bg-emerald-500/10 text-emerald-500 px-2 py-0.5 rounded text-[10px] font-medium border border-emerald-500/20">
					<CheckCircle2 className="size-3"/> {t("history.completed")}
				</div>
			);
		} else if (download.status === "failed") {
			return (
				<div
					className="flex items-center gap-1.5 bg-rose-500/10 text-rose-500 px-2 py-0.5 rounded text-[10px] font-medium border border-rose-500/20">
					<AlertCircle className="size-3"/> {t("history.failed")}
				</div>
			);
		} else if (isDownloadErrored) {
			return (<div
				className="flex items-center gap-1.5 bg-rose-500/10 text-rose-500 px-2 py-0.5 rounded text-[10px] font-medium border border-rose-500/20">
				<FileX className="size-3"/> {t("common.broken")}
			</div>);
		} else if (download.status === "downloading") {
			return (<div
				className={"flex items-center gap-1.5 bg-blue-500/10 text-blue-500 px-2 py-0.5 rounded text-[10px] font-medium border border-blue-500/20"}>
				<Zap className="size-3"/> {download.progress}%
			</div>);
		} else {
			return (
				<div
					className="flex items-center gap-1.5 bg-amber-500/10 text-amber-500 px-2 py-0.5 rounded text-[10px] font-medium border border-amber-500/20">
					<Zap className="size-3"/> {t("history.pending")}
				</div>
			);
		}
	};

	const ThumbnailIcon = ({item}: { item: DownloadItem }) => {
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

		if (item.thumbnail) {
			return (
				<img
					src={dataUrl}
					alt={item.title}
					className="size-10 rounded-lg object-cover border border-border/50"/>
			);
		}
		const Icon: React.ForwardRefExoticComponent<Omit<LucideProps, "ref"> & React.RefAttributes<SVGSVGElement>>
			= item.type === "audio" ? Music : FileVideo;
		return (
			<div
				className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted/50 border border-border/50">
				{<Icon className="size-5 text-muted-foreground"/>}
			</div>
		);
	}

	const renderDownloadRow = (download: DownloadItem, isPlaylistChild = false) => {
		const size = formattedSizes[download.id];

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
			>
				<div
					className={cn(
						"flex items-center justify-between p-4 hover:bg-muted/30 cursor-pointer transition-colors",
						isPlaylistChild && "pl-12 bg-muted/5"
					)}
				>
					<div className="flex items-center gap-4">
						<ThumbnailIcon item={download}/>
						<div className="flex flex-col">
							<span className="font-medium text-sm">{download.title}</span>
							<div className="flex gap-2 text-xs text-muted-foreground">
								<span>{download.channel}</span>
								<span>•</span>
								<span>{timeFromNow(download.date)}</span>
								<span>•</span>
								<span className="capitalize">{download.type}</span>
								<span>•</span>
								<span>{size}</span>
							</div>
						</div>
					</div>
					<div className="flex items-center gap-2">
						<QualityBadge quality={download.quality}/>
						{renderStatusBadge(download)}
					</div>
				</div>
			</DownloadContextMenu>
		);
	}

	const DefaultIcon = ({item}: { item: DownloadItem }) => {
		const Icon = item.type === "audio" ? Music : FileVideo;
		return (
			<div
				className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted/50 border border-border/50">
				{<Icon className="size-5 text-muted-foreground"/>}
			</div>
		)
	}

	return (
		<ScrollArea className={maxHeight}>
			<div className="divide-y divide-border/40">
				{items.map((item) => (
					item.type === "playlist" ? (
						<div key={item.id}>
							<div
								className="flex items-center justify-between p-4 hover:bg-blue-500/5 cursor-pointer transition-colors border-l-4 border-blue-500"
								onClick={() => setExpandedPlaylist(expandedPlaylist === item.id ? null : item.id)}
							>
								<div className="flex items-center gap-4 flex-1">
									{item.thumbnail ? (
										<img src={item.thumbnail} alt={item.title}
										     className="size-10 rounded-lg object-cover border border-blue-500/30"/>
									) : (
										<DefaultIcon item={item}/>
									)}
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
									{renderStatusBadge(item)}
									{expandedPlaylist === item.id ? (
										<ChevronUp className="size-4 text-muted-foreground"/>
									) : (
										<ChevronDown className="size-4 text-muted-foreground"/>
									)}
								</div>
							</div>
							{expandedPlaylist === item.id && item.videos && (
								<div className="bg-muted/5 divide-y divide-border/20">
									{item.videos.map((video) => renderDownloadRow(video, true))}
								</div>
							)}
						</div>
					) : (
						renderDownloadRow(item, false)
					)
				))}
			</div>
		</ScrollArea>
	);
}

function QualityBadge({quality}: Readonly<{ quality: string }>) {
	const getQualityColor = (q: string) => {
		if (q.includes("4K") || q.includes("2160")) return "bg-purple-500/10 text-purple-500 border-purple-500/20";
		if (q.includes("1440") || q.includes("2K")) return "bg-blue-500/10 text-blue-500 border-blue-500/20";
		if (q.includes("1080") || q.includes("FHD")) return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
		if (q.includes("720") || q.includes("HD")) return "bg-amber-500/10 text-amber-500 border-amber-500/20";
		if (q.includes("480") || q.includes("SD")) return "bg-rose-500/10 text-rose-500 border-rose-500/20";
		return "bg-gray-500/10 text-gray-500 border-gray-500/20";
	};

	return (
		<div className={`px-2 py-0.5 rounded text-[10px] font-medium border ${getQualityColor(quality)}`}>
			{quality}
		</div>
	);

}