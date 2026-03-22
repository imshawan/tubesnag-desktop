import {useMemo} from "react";
import {useAppDispatch, useAppSelector} from "@/store/hooks";
import {
    addActiveDownload, removeActiveDownload, selectActiveDownloads,
    selectDownloadSpeed, selectIsDownloading, setActiveDownloads, setDownloadSpeed,
    setIsDownloading,
    updateActiveDownload,
    updateActivePlaylistVideoDownload
} from "@/store/slices/active-downloads-slice";
import {createPlaylistDownloadItemFromUrls} from "@/lib/ytdlp/download";

export function useActiveDownloads() {
    const dispatch = useAppDispatch();
    const activeDownloads = useAppSelector(selectActiveDownloads);
    const currentDownloadId = useAppSelector(selectIsDownloading);
    const downloadSpeed = useAppSelector(selectDownloadSpeed);

    const currentDownloads = useMemo(
        () => activeDownloads.filter((d) => (d.status === "downloading" || d.status === "pending")),
        [activeDownloads]
    );

    const failedDownloads = useMemo(
        () => activeDownloads.filter((d) => d.status === "failed"),
        [activeDownloads]
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

    return {
        currentDownloads,
        currentDownloadId,
        downloadSpeed,
        downloadCount: currentDownloads.length,
        setDownloads,
        setCurrentDownloadId,
        setItemDownloadSpeed,
        getActiveDownloadById,
        addPlaylistDownload,
        addActiveDownloadItem,
        updateActiveDownloadItem,
        updateActivePlaylistVideoDownloadItem,
        removeActiveDownloadItem,
        activeDownloads,
        failedDownloads,
        failedDownloadsCount: failedDownloads.length
    };
}
