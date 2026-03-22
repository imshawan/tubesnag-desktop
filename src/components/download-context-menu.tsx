import {
	ContextMenu,
	ContextMenuContent,
	ContextMenuItem,
	ContextMenuSeparator,
	ContextMenuTrigger,
} from "@/components/ui/context-menu"
import {useTranslation} from "react-i18next"
import {Copy, ExternalLink, Folder, InfoIcon, PlayIcon, RotateCcw, Share2, Trash2} from "lucide-react"
import {useToast} from "@/context/toast-context";
import {useDownloads} from "@/hooks/useDownloads";
import {useActiveDownloads} from "@/hooks/useActiveDownloads";
import {openYouTubeUrl} from "@/lib/ytdlp/ytdlp";

interface DownloadContextMenuProps {
	download: DownloadItem
	children: React.ReactNode
	onOpen: (download: DownloadItem) => void
	onOpenFolder: (download: DownloadItem) => void
	onRetry: (download: DownloadItem) => void
	onDelete: (download: DownloadItem, downloadListType: DownloadListType) => void
	onShare: (download: DownloadItem) => void
	downloadListType: DownloadListType
}

export function DownloadContextMenu({
	                                    download,
	                                    children,
	                                    onOpen,
	                                    onOpenFolder,
	                                    onRetry,
	                                    onDelete,
	                                    onShare,
	                                    downloadListType
                                    }: Readonly<DownloadContextMenuProps>) {
	const {t} = useTranslation()
	const {addToast} = useToast();
	const {setDownloadItemPropertyOpen} = useDownloads();
	const {currentDownloadId} = useActiveDownloads();

	const isDownloadFailed = download.status === "failed" || ((download.status === "downloading" || download.status === "pending")
		&& currentDownloadId !== download.id);
	const itemIsDownloading = (download.status === "downloading" || download.status === "pending")
		&& currentDownloadId === download.id;

	const copyToClipboard = (content: string) => {
		navigator.clipboard.writeText(content)
			.then(() => addToast(t("contextMenu.messages.copiedToClipboard"), "success"))
			.catch(() => addToast(t("contextMenu.messages.failedCopyToClipboard"), "error"))
	}

	const handleOpenUrl = async (url: string) => {
		addToast(t("contextMenu.messages.openingYtUrl"), "info");

		openYouTubeUrl(url).catch((e) => {
			console.error("Failed to open URL in browser:", e);
			addToast(t("contextMenu.messages.failedOpenYtUrl"), "error");
		});
	};

	return (
		<ContextMenu>
			<ContextMenuTrigger asChild>
				{children}
			</ContextMenuTrigger>
			<ContextMenuContent className="w-56">
				{/* Open file - only for completed downloads */}
				{download.status === "completed" && (
					<>
						<ContextMenuItem onClick={() => onOpen(download)}>
							<PlayIcon className="mr-2 h-4 w-4"/>
							<span>{t("contextMenu.openFile")}</span>
						</ContextMenuItem>
						<ContextMenuItem onClick={() => onOpenFolder(download)}>
							<Folder className="mr-2 h-4 w-4"/>
							<span>{t("contextMenu.openFolder")}</span>
						</ContextMenuItem>
					</>
				)}

				{/* Open URL */}
				<ContextMenuItem onClick={() => handleOpenUrl(download.url)}>
					<ExternalLink className="mr-2 h-4 w-4"/>
					<span>{t("contextMenu.openInYt")}</span>
				</ContextMenuItem>

				<ContextMenuSeparator/>

				{/* Copy title */}
				<ContextMenuItem onClick={() => copyToClipboard(download.title)}>
					<Copy className="mr-2 h-4 w-4"/>
					<span>{t("contextMenu.copyTitle")}</span>
				</ContextMenuItem>

				<ContextMenuSeparator/>

				{/* Share */}
				<ContextMenuItem onClick={() => onShare(download)}>
					<Share2 className="mr-2 h-4 w-4"/>
					<span>{t("contextMenu.share")}</span>
				</ContextMenuItem>

				<ContextMenuItem onClick={() => setDownloadItemPropertyOpen(download)}>
					<InfoIcon className="mr-2 h-4 w-4"/>
					<span className="capitalize">{t("contextMenu.properties", {type: download.type})}</span>
				</ContextMenuItem>

				<ContextMenuSeparator/>

				{/* Retry - only for failed downloads */}
				{isDownloadFailed ? (
					<>
						<ContextMenuItem onClick={() => onRetry(download)}>
							<RotateCcw className="mr-2 h-4 w-4"/>
							<span>{t("contextMenu.retry")}</span>
						</ContextMenuItem>
						<ContextMenuSeparator/>
					</>
				) : null}

				{/* Delete */}
				<ContextMenuItem
					onClick={() => onDelete(download, downloadListType)}
					className="text-destructive focus:text-destructive"
					disabled={itemIsDownloading}
				>
					<Trash2 className="mr-2 h-4 w-4"/>
					<span>{t("contextMenu.delete")}</span>
				</ContextMenuItem>
			</ContextMenuContent>
		</ContextMenu>
	)
}
