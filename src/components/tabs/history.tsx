import {Filter, Search} from "lucide-react";
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
import {deleteResourceFromSystem} from "@/lib/ytdlp/ytdlp";
import {DownloadStatus} from "@/lib/utils/enums";
import {DeleteWithFilesOption} from "@/components/delete-with-files-option";

interface HistoryProps {
	onOpenFile: (download: DownloadItem) => void;
	onOpenFolder: (download: DownloadItem) => void;
	onRetry: (download: DownloadItem) => void;
	onDelete: (download: DownloadItem, downloadListType: DownloadListType) => void;
	onShare: (download: DownloadItem) => void;
}

export function History({
	                        onOpenFile,
	                        onOpenFolder,
	                        onRetry,
	                        onDelete,
	                        onShare
                        }: Readonly<HistoryProps>) {
	const {t} = useTranslation();
	const {downloads, removeDownload, completedDownloads} = useDownloads();
	const [deleting, setDeleting] = useState(0);
	const [totalCount, setTotalCount] = useState(0);

	const {confirm} = useConfirmation();
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

	const sleep = (ms: any) =>
		new Promise(resolve => setTimeout(resolve, ms));

	const clearDownloads = async (downloadsToClear: DownloadItem[], deleteFiles: boolean) => {
		const sleepDuration = downloadsToClear.length > 100 ? 100 : 250;
		let idx = 0;
		for (const download of downloadsToClear) {
			setDeleting(idx + 1);
			removeDownload(download.id);

			if (deleteFiles) {
				try {
					await deleteResourceFromSystem(download);
				} catch (err) {
					console.log("Error deleting downloadId", download.id, err);
				}
			}

			await sleep(sleepDuration) // to allow UI to update and show progress, especially for large batches
			idx++
		}

		setDeleting(0);
	}

	const clearCompletedDownloads = async () => {
		let deleteFilesValue = false;

		const yes = await confirm({
			title: t("history.deleteCompleted"),
			description: t("history.deleteCompletedDesc"),
			children: (
				<DeleteWithFilesOption
					initialValue={false}
					onValueChange={(val) => (deleteFilesValue = val)}
				/>
			),
			getResult: () => ({deleteFiles: deleteFilesValue}),
		});

		if (yes && completedDownloads.length) {
			await clearDownloads(completedDownloads, deleteFilesValue);
		}
	}

	const clearAllDownloads = () => {
		let deleteFilesValue = false;
		confirm({
			title: t("history.clearAllTitle"),
			description: t("history.clearAllDesc"),
			type: "warning",
			confirmText: t("contextMenu.delete"),
			cancelText: t("common.cancel"),
			children: (
				<DeleteWithFilesOption
					initialValue={false}
					onValueChange={(val) => (deleteFilesValue = val)}
				/>
			),
			getResult: () => ({deleteFiles: deleteFilesValue}),
		}).then(async (yes) => {
			if (yes && downloads.length > 0) {
				await clearDownloads(downloads, deleteFilesValue);
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
					<Button variant="outline" className="p-4" size="sm" onClick={clearCompletedDownloads}
					        disabled={completedDownloads.length === 0}>
						{t("history.clearCompleted")}
					</Button>
					<Button variant="destructive" className="p-4" size="sm" onClick={clearAllDownloads}
					        disabled={downloads.length === 0}>
						{t("history.clearAll")}
					</Button>
				</div>
			</div>

			<div className="rounded-xl relative border border-border/50 bg-card shadow-sm overflow-hidden">
				<ActionProgress message={t("history.deletingProgress", {current: deleting, total: totalCount})}
				                visible={deleting > 0}/>
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
								<SelectItem value={DownloadStatus.Completed}>{t("history.completed")}</SelectItem>
								<SelectItem value={DownloadStatus.Downloading}>{t("history.downloading")}</SelectItem>
								<SelectItem value={DownloadStatus.Failed}>{t("history.failed")}</SelectItem>
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
								<SelectItem value="all">{t("common.all")}</SelectItem>
								<SelectItem value="playlist">{t("common.playlists")}</SelectItem>
								<SelectItem value="video">{t("common.videos")}</SelectItem>
								<SelectItem value="audio">{t("common.audios")}</SelectItem>
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
						maxHeight={"h-[calc(100vh-308px)]"}
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
