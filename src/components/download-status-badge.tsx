import {AlertCircle, ArrowDownToLine, CheckCircle2, FileX, GitMerge, Loader2, Zap} from "lucide-react";

import {useTranslation} from "react-i18next";
import {cn} from "@/lib/utils/tailwind";
import {useEffect, useState} from "react";
import {isDownloadingState, isPendingState} from "@/lib/utils/common";
import {AudioPartDownloadStatus, DownloadStatus, DownloadType} from "@/lib/utils/enums";

interface DownloadStatusBadgeProps {
	data: DownloadItem;
	currentDownloadId?: string | null;
};

export function DownloadStatusBadge({data, currentDownloadId}: Readonly<DownloadStatusBadgeProps>) {
	const {t} = useTranslation();
	const [download, setDownload] = useState<DownloadItem>();
	const isPlaylist = download?.type === DownloadType.Playlist;

	useEffect(() => {
		if (data && Object.keys(data).length) {
			setDownload(data);
		}
	}, [data]);

	const isDownloadErrored =
		(isDownloadingState(data) || isPendingState(data)) &&
		(!currentDownloadId || currentDownloadId !== data.id);

	if (download?.status === DownloadStatus.DownloadingAudioTrack) {
		return (
			<Badge
				className="bg-purple-500/10 text-purple-500 border-purple-500/20"
				icon={<ArrowDownToLine className="size-3"/>}
				label={t("common.downloadingAudio", {progress: data.progress})}
			/>
		);
	}

	if (download?.status === DownloadStatus.MergingFormats) {
		return (
			<Badge
				className="bg-indigo-500/10 text-indigo-500 border-indigo-500/20"
				icon={<GitMerge className="size-3"/>}
				label={t("common.merging")}
				rightIcon={<Loader2 className="size-3 animate-spin ml-0.5"/>}
			/>
		);
	}

	if ((download?.status === DownloadStatus.Completed || data.progress === 100) && data.audioStatus === AudioPartDownloadStatus.Completed) {
		return (
			<Badge
				className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
				icon={<CheckCircle2 className="size-3"/>}
				label={t("history.completed")}
			/>
		);
	}

	if (download?.status === DownloadStatus.Failed) {
		return (
			<Badge
				className="bg-rose-500/10 text-rose-500 border-rose-500/20"
				icon={<AlertCircle className="size-3"/>}
				label={t("history.failed")}
			/>
		);
	}

	if (isDownloadErrored && !isPlaylist) {
		return (
			<Badge
				className="bg-rose-500/10 text-rose-500 border-rose-500/20"
				icon={<FileX className="size-3"/>}
				label={t("common.broken")}
			/>
		);
	}


	if (download?.status === DownloadStatus.Downloading) {
		return (
			<Badge
				className="bg-blue-500/10 text-blue-500 border-blue-500/20"
				icon={<ArrowDownToLine className="size-3"/>}
				label={`${data.progress ?? 0}%`}
			/>
		);
	}

	return (
		<Badge
			className="bg-amber-500/10 text-amber-500 border-amber-500/20"
			icon={<Zap className="size-3"/>}
			label={t("history.pending")}
		/>
	);
}

function Badge({
	               className,
	               icon,
	               label,
	               rightIcon,
               }: Readonly<{
	className: string;
	icon: React.ReactNode;
	label: React.ReactNode;
	rightIcon?: React.ReactNode;
}>) {
	return (
		<div className={cn("inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-medium border", className)}>
			{icon}
			<span className={"whitespace-nowrap"}>{label}</span>
			{rightIcon}
		</div>
	);
}