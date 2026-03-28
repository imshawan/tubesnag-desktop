import i18n from "i18next";
import {DOWNLOAD_FORMAT_TYPES} from "@/lib/ytdlp/constants";
import {isValidPlaylistUrl} from "@/lib/ytdlp/download";

export const downloadingStatuses: DownloadStatus[] = ["downloading", "downloading_audio_track", "merging_formats"];

export function formatBytes(bytes: number) {
	if (bytes === 0) return '0 B';
	const k = 1024;
	const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
	const i = Math.floor(Math.log(bytes) / Math.log(k));
	return Math.round((bytes / Math.pow(k, i)) * 10) / 10 + ' ' + sizes[i];
}

export function generateUUID(): string {
	const timestamp = Math.floor(Date.now() / 1000).toString(16).padStart(8, '0');
	const random = Array.from({length: 16}, () =>
		Math.floor(Math.random() * 16).toString(16)
	).join('');
	return timestamp + random;
}

export const getElectron = () => {
	if (!globalThis.electron) {
		throw new Error(i18n.t("dashboard.electronNotDetected"));
	}
	return globalThis.electron;
};

export const resolveDownloadItemType = (url: string, format: FormatType) => {
	if (isValidPlaylistUrl(url)) {
		return "playlist";
	} else if (format) {
		return  DOWNLOAD_FORMAT_TYPES[format] as DownloadItemType;
	} else {
		return  "unknown";
	}
}

export const isDownloadingState = (item: DownloadItem) => downloadingStatuses.includes(item.status);

export const isPendingState = (item: DownloadItem) => item.status === 'pending';

export const isFailedState = (item: DownloadItem) => item.status === 'failed';

export const isDownloadCompleteState = (item: DownloadItem) => (item.status === 'completed' && item.audioStatus === 'completed');