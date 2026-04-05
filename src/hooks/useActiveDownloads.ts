import {useMemo} from "react";
import {useAppDispatch, useAppSelector} from "@/store/hooks";
import {
	addActiveDownload,
	addActiveDownloads,
	removeActiveDownload,
	selectActiveDownloads, selectDownloadCount,
	selectDownloadSpeed,
	selectIsDownloading,
	setActiveDownloads, setDownloadCount,
	setDownloadSpeed,
	setIsDownloading,
	updateActiveDownload,
	updateActivePlaylistVideoDownload
} from "@/store/slices/active-downloads-slice";
import {createPlaylistDownloadItemFromUrls} from "@/lib/ytdlp/download";
import {isDownloadInErroredState, isDownloadingState, isFailedState, isPendingState} from "@/lib/utils/common";
import {AudioPartDownloadStatus} from "@/lib/utils/enums";

export function useActiveDownloads() {
	const dispatch = useAppDispatch();
	const activeDownloads = useAppSelector(selectActiveDownloads);
	const currentDownloadId = useAppSelector(selectIsDownloading);
	const downloadSpeed = useAppSelector(selectDownloadSpeed);
	const downloadCount = useAppSelector(selectDownloadCount);

	const downloading = useMemo(() => activeDownloads.filter(isDownloadingState), [activeDownloads]);

	const currentDownloads = useMemo(
		() => activeDownloads.filter((d) => isDownloadingState(d) || isPendingState(d) || isFailedState(d)),
		[activeDownloads]
	);

	const failedDownloads = useMemo(
		() => activeDownloads.filter(e => isDownloadInErroredState(e, currentDownloadId)),
		[activeDownloads, currentDownloadId]
	);

	const addPlaylistDownload = (
		playlistId: string,
		playlistUrl: string,
		playlistInfo: PlaylistInfo, quality: QualityType, format: FormatType,
		downloadPath: string
	) => {
		const {videoUrls, ...playlistData} = playlistInfo;
		const videoDownloads = createPlaylistDownloadItemFromUrls(videoUrls, quality, format, downloadPath, playlistId, playlistInfo.title);

		const playlistItem: DownloadItem = {
			id: playlistId,
			url: playlistUrl,
			title: playlistData.title,
			status: "downloading",
			audioStatus: AudioPartDownloadStatus.Completed, // as this is a playlist item
			progress: 0,
			size: 0,
			quality: quality,
			type: "playlist",
			date: new Date().toISOString(),
			channel: playlistData.channel,
			thumbnail: playlistData.thumbnail,
			videos: videoDownloads,
			downloadPath
		};

		dispatch(addActiveDownload(playlistItem));

		return playlistItem;
	};

	const addActiveDownloadItem = (download: DownloadItem) =>
		dispatch(addActiveDownload(download));
	const addActiveDownloadItems = (downloads: DownloadItem[]) =>
		dispatch(addActiveDownloads(downloads));
	const updateActiveDownloadItem = (id: string, updates: Partial<DownloadItem>) =>
		dispatch(updateActiveDownload({id, updates}));

	const updateActivePlaylistVideoDownloadItem = (playlistId: string, downloadId: string, updates: Partial<DownloadItem>) =>
		dispatch(updateActivePlaylistVideoDownload({playlistId, updates, downloadId}));
	const removeActiveDownloadItem = (parent: string, child?: string) =>
		dispatch(removeActiveDownload({parent, child}));

	const setDownloads = (downloads: DownloadItem[]) => dispatch(setActiveDownloads(downloads));

	const getActiveDownloadById = (id: string) => activeDownloads.find((d) => d.id === id);

	const setCurrentDownloadId = (downloadId: string) => dispatch(setIsDownloading(downloadId));

	const setItemDownloadSpeed = (downloadId: string) => dispatch(setDownloadSpeed(downloadId));

	const setCurrentDownloadCount = (downloadCount: number) => dispatch(setDownloadCount(downloadCount));

	const clearCurrentDownloadCount = () => dispatch(setDownloadCount(0));

	return {
		currentDownloads,
		currentDownloadId,
		downloadSpeed,
		downloadCount: downloading.length,
		setDownloads,
		setCurrentDownloadId,
		setItemDownloadSpeed,
		setCurrentDownloadCount,
		getActiveDownloadById,
		addPlaylistDownload,
		addActiveDownloadItem,
		addActiveDownloadItems,
		updateActiveDownloadItem,
		updateActivePlaylistVideoDownloadItem,
		removeActiveDownloadItem,
		clearCurrentDownloadCount,
		activeDownloads,
		currentDownloadCount: Math.max(currentDownloads.length, downloadCount),
		failedDownloads,
		failedDownloadsCount: failedDownloads.length,
	};
}
