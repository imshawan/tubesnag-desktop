import {useMemo} from "react";
import {useAppDispatch, useAppSelector} from "@/store/hooks";
import {
    addActiveDownload,
    updateActiveDownload,
    updateActivePlaylistVideoDownload
} from "@/store/slices/active-downloads-slice";
import {createDownloadItemFromUrls} from "@/utils/download";

export function useActiveDownloads() {
    const dispatch = useAppDispatch();
    const activeDownloads = useAppSelector((state) => state.activeDownloads.items);

    const currentDownloads = useMemo(
        () => activeDownloads.filter((d) => d.status === "downloading"),
        [activeDownloads]
    );

    const addPlaylistDownload = (
        playlistId: string,
        playlistUrl: string,
        playlistInfo: PlaylistInfo, quality: QualityType, format: FormatType
    ) => {
        const {videoUrls, ...playlistData} = playlistInfo;
        const videoDownloads = createDownloadItemFromUrls(videoUrls, quality, format);

        const playlistItem: DownloadItem = {
            id: playlistId,
            url: playlistUrl,
            title: playlistData.title,
            status: "downloading",
            progress: 0,
            size: 0,
            quality: quality,
            type: "playlist",
            date: new Date().toLocaleDateString(),
            channel: playlistData.channel,
            thumbnail: playlistData.thumbnail,
            videos: videoDownloads,
        };

        dispatch(addActiveDownload(playlistItem));

        return playlistItem;
    };

    const addActiveDownloadItem = (download: DownloadItem) =>
        dispatch(addActiveDownload(download));
    const updateActiveDownloadItem = (id: string, updates: Partial<DownloadItem>) =>
        dispatch(updateActiveDownload({id, updates}));

    const updateActivePlaylistVideoDownloadItem = (playlistId: string, downloadId: string, updates: Partial<DownloadItem>) =>
        dispatch(updateActivePlaylistVideoDownload({playlistId, updates, downloadId}));

    const failedDownloads = useMemo(
        () => activeDownloads.filter((d) => d.status === "failed"),
        [activeDownloads]
    );

    return {
        currentDownloads,
        isDownloading: currentDownloads.length > 0,
        downloadCount: currentDownloads.length,
        addPlaylistDownload,
        addActiveDownloadItem,
        updateActiveDownloadItem,
        updateActivePlaylistVideoDownloadItem,
        activeDownloads,
        failedDownloads,
        failedDownloadsCount: failedDownloads.length
    };
}
