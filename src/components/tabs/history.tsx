import {Filter, Loader2, Search} from "lucide-react";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import {useTranslation} from "react-i18next";
import {DownloadList} from "@/components/download-list";
import {useDownloads} from "@/hooks/useDownloads";
import {useEffect, useMemo, useState} from "react";
import {useApp} from "@/hooks/useApp";
import {useConfirmation} from "@/context/confirmation-context";
import {ActionProgress} from "@/components/action-progress";
import {deleteFileFromSystem} from "@/lib/ytdlp/ytdlp";

interface HistoryProps {
	onOpenFile: (download: DownloadItem) => void;
	onOpenFolder: (download: DownloadItem) => void;
	onRetry: (download: DownloadItem) => void;
	onDelete: (download: DownloadItem, downloadListType: DownloadListType) => void;
	onShare: (download: DownloadItem) => void;
	onClearCompleted: () => void;
	completedCount: number;
}

export function History({
	                        onOpenFile,
	                        onClearCompleted,
	                        completedCount,
	                        onOpenFolder,
	                        onRetry,
	                        onDelete,
	                        onShare
                        }: Readonly<HistoryProps>) {
	const {t} = useTranslation();
	const {downloads, removeDownload} = useDownloads();
	const [deleting, setDeleting] = useState(0);
	const [totalCount, setTotalCount] = useState(0);

	const { confirm } = useConfirmation();
	const {
		historySearch,
		historyFilter,
		historyTypeFilter,
		setHistorySearch,
		setHistoryTypeFilter,
		setHistoryFilter
	} = useApp();

	useEffect(() => {
		if (downloads.length) {
			setTotalCount(downloads.length);
		}
	}, []);

	const sleep = (ms: any) => new Promise(resolve => setTimeout(resolve, ms));

	const clearAllDownloads = () => {
		confirm({
			title: t("history.clearAllTitle"),
			description: t("history.clearAllDesc"),
			type: "warning",
			confirmText: t("contextMenu.delete"),
			cancelText: t("common.cancel"),
		}).then(async (yes) => {
			if (yes && downloads.length > 0) {
				const sleepDuration = downloads.length > 100 ? 100 : 250;
				let idx = 0;
				for (const download of downloads) {
					setDeleting(idx + 1);
					removeDownload(download.id);

					try {
						await deleteFileFromSystem(download);
					} catch (err) {
						console.log("Error deleting downloadId", download.id, err);
					}

					await sleep(sleepDuration) // to allow UI to update and show progress, especially for large batches
					idx++
				}

				setDeleting(0);
			}
		});
	}

	const filteredDownloads = useMemo(() => {
		return downloads.filter((item) => {
			return historyTypeFilter === "all" ? true : item.type === historyTypeFilter;
		});
	}, [downloads, historyTypeFilter]);

	return (
		<div className="flex flex-col gap-6 animate-in fade-in duration-500">
			<div className="flex items-center justify-between">
				<div className="space-y-1">
					<h2 className="text-2xl font-semibold tracking-tight">{t("history.title")}</h2>
					<p className="text-sm text-muted-foreground">{t("history.subtitle")}</p>
				</div>
				<div className="flex gap-2">
					<Button variant="outline" className="p-4" size="sm" onClick={onClearCompleted} disabled={completedCount === 0}>
						{t("history.clearCompleted")}
					</Button>
					<Button variant="destructive" className="p-4" size="sm" onClick={clearAllDownloads} disabled={downloads.length === 0}>
						{t("history.clearAll")}
					</Button>
				</div>
			</div>

			<div className="rounded-xl relative border border-border/50 bg-card shadow-sm overflow-hidden">
				<ActionProgress message={t("history.deletingProgress", {current: deleting, total: totalCount})} visible={deleting > 0} />
				<div
					className="p-4 border-b border-border/40 bg-muted/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
					<div className="flex items-center gap-2 w-full sm:w-auto flex-wrap">
						<div className="relative w-full sm:w-64">
							<Search className="absolute left-2.5 top-2.5 size-3.5 text-muted-foreground"/>
							<Input
								placeholder={t("history.searchPlaceholder")}
								value={historySearch}
								onChange={(e) => setHistorySearch(e.target.value)}
								className="pl-8 h-8 text-xs bg-background"
							/>
						</div>
						<Select value={historyFilter} onValueChange={(v) => setHistoryFilter(v)}>
							<SelectTrigger className="h-8 w-32.5 text-xs bg-background">
								<div className="flex items-center gap-2">
									<Filter className="size-3 text-muted-foreground"/>
									<SelectValue placeholder={t("history.allStatus")}/>
								</div>
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">{t("history.allStatus")}</SelectItem>
								<SelectItem value="completed">{t("history.completed")}</SelectItem>
								<SelectItem value="downloading">{t("history.downloading")}</SelectItem>
								<SelectItem value="failed">{t("history.failed")}</SelectItem>
							</SelectContent>
						</Select>
						<Select value={historyTypeFilter} onValueChange={(v) => setHistoryTypeFilter(v)}>
							<SelectTrigger className="h-8 w-32.5 text-xs bg-background">
								<div className="flex items-center gap-2">
									<Filter className="size-3 text-muted-foreground"/>
									<SelectValue placeholder="Type"/>
								</div>
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">All Types</SelectItem>
								<SelectItem value="playlist">Playlists</SelectItem>
								<SelectItem value="video">Videos</SelectItem>
								<SelectItem value="audio">Audio</SelectItem>
							</SelectContent>
						</Select>
					</div>
					<span className="text-xs text-muted-foreground whitespace-nowrap">
            {t("history.showing")} {filteredDownloads.length} {t("history.items")}
          </span>
				</div>

				{filteredDownloads.length > 0 ? (
					<DownloadList
						onOpenFolder={onOpenFolder}
						onRetry={onRetry} onDelete={onDelete} onShare={onShare}
						items={filteredDownloads} onOpenFile={onOpenFile} downloadListType="completed"
						maxHeight={"h-[700px]"}
					/>
				) : (
					<div className="py-16 flex flex-col items-center justify-center text-muted-foreground h-175">
						<div className="bg-muted/50 p-4 rounded-full mb-3">
							<Search className="size-6 opacity-50"/>
						</div>
						<p className="text-sm font-medium">{t("history.noResults")}</p>
						<p className="text-xs opacity-70 mt-1">{t("history.tryAdjusting")}</p>
					</div>
				)}
			</div>
		</div>
	);
}
