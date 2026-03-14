import {
    ContextMenu,
    ContextMenuContent,
    ContextMenuItem,
    ContextMenuSeparator,
    ContextMenuTrigger,
} from "@/components/ui/context-menu"
import {useTranslation} from "react-i18next"
import {Copy, Download, Folder, Link2, Trash2, RotateCcw, Share2} from "lucide-react"

interface DownloadContextMenuProps {
    download: DownloadItem
    children: React.ReactNode
    onOpen: (download: DownloadItem) => void
    onOpenFolder: (download: DownloadItem) => void
    onCopyUrl: (url: string) => void
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
                                        onCopyUrl,
                                        onRetry,
                                        onDelete,
                                        onShare,
                                        downloadListType
                                    }: DownloadContextMenuProps) {
    const {t} = useTranslation()

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
                            <Download className="mr-2 h-4 w-4"/>
                            <span>{t("contextMenu.openFile")}</span>
                        </ContextMenuItem>
                        <ContextMenuItem onClick={() => onOpenFolder(download)}>
                            <Folder className="mr-2 h-4 w-4"/>
                            <span>{t("contextMenu.openFolder")}</span>
                        </ContextMenuItem>
                        <ContextMenuSeparator/>
                    </>
                )}

                {/* Copy URL */}
                <ContextMenuItem onClick={() => onCopyUrl(download.url)}>
                    <Link2 className="mr-2 h-4 w-4"/>
                    <span>{t("contextMenu.copyUrl")}</span>
                </ContextMenuItem>

                {/* Copy title */}
                <ContextMenuItem onClick={() => navigator.clipboard.writeText(download.title)}>
                    <Copy className="mr-2 h-4 w-4"/>
                    <span>{t("contextMenu.copyTitle")}</span>
                </ContextMenuItem>

                <ContextMenuSeparator/>

                {/* Share */}
                <ContextMenuItem onClick={() => onShare(download)}>
                    <Share2 className="mr-2 h-4 w-4"/>
                    <span>{t("contextMenu.share")}</span>
                </ContextMenuItem>

                <ContextMenuSeparator/>

                {/* Retry - only for failed downloads */}
                {download.status === "failed" && (
                    <>
                        <ContextMenuItem onClick={() => onRetry(download)}>
                            <RotateCcw className="mr-2 h-4 w-4"/>
                            <span>{t("contextMenu.retry")}</span>
                        </ContextMenuItem>
                        <ContextMenuSeparator/>
                    </>
                )}

                {/* Delete */}
                <ContextMenuItem
                    onClick={() => onDelete(download, downloadListType)}
                    className="text-destructive focus:text-destructive"
                >
                    <Trash2 className="mr-2 h-4 w-4"/>
                    <span>{t("contextMenu.delete")}</span>
                </ContextMenuItem>
            </ContextMenuContent>
        </ContextMenu>
    )
}
