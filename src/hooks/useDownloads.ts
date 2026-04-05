import {useMemo} from "react";
import {useAppDispatch, useAppSelector} from "@/store/hooks";
import {
    addDownload,
    addToSelectedDownloads,
    clearAll,
    clearCompleted,
    removeAllFromSelectedDownloads,
    removeDownload, removeFromSelctedDownloads, selectAllSelectedDownloads, selectCompletedDownloads, selectDownloadItemPropertyOpen, setAllAsSelectedDownloads, setDownloadItemPropertyOpen,
    setDownloads,
    updateDownload
} from "@/store/slices/downloads-slice";
import {isDownloadCompleteState, isDownloadingState} from "@/lib/utils/common";

export function useDownloads() {
    const dispatch = useAppDispatch();

    const downloads = useAppSelector((state) => state.downloads.downloads);
    const downloadItemPropertyOpen = useAppSelector(selectDownloadItemPropertyOpen);
    const completedDownloads = useAppSelector(selectCompletedDownloads);
    const selectedDownloads = useAppSelector(selectAllSelectedDownloads);

    const isDownloading = useMemo(
        () => downloads.some(isDownloadingState),
        [downloads]
    );

    const totalProgress = useMemo(
        () =>
            downloads.length > 0
                ? Math.round(
                    downloads.reduce((sum, d) => sum + d.progress, 0) / downloads.length
                )
                : 0,
        [downloads]
    );

   const sizeCounter = (downloads: DownloadItem[]): number => {
       return downloads.reduce((sum, d) => {
           const currentSize = d.size || 0;
           const videosSize = d.videos ? sizeCounter(d.videos) : 0;
           return sum + currentSize + videosSize;
       }, 0);
   }

    const totalSize = useMemo(() => sizeCounter(downloads), [downloads]);

    return {
        downloads,
        isDownloading,
        completedDownloads,
        totalProgress,
        totalSize,
        downloadItemPropertyOpen,
        selectedDownloads,
        addDownload: (download: DownloadItem) => dispatch(addDownload(download)),
        setDownloads: (downloads: DownloadItem[]) => dispatch(setDownloads(downloads)),
        updateDownload: (id: string, updates: Partial<DownloadItem>) =>
            dispatch(updateDownload({id, updates})),
        removeDownload: (parent: string, child?: string) => dispatch(removeDownload({
            parent, child
        })),
        clearCompleted: () => dispatch(clearCompleted()),
        clearAll: () => dispatch(clearAll()),
        setDownloadItemPropertyOpen: (property: DownloadItem | null) => dispatch(setDownloadItemPropertyOpen(property)),
        addToSelectedDownloads: (item: DownloadItem) => dispatch(addToSelectedDownloads(item)),
        setAllAsSelectedDownloads: () => dispatch(setAllAsSelectedDownloads()),
        removeFromSelctedDownloads: (items: DownloadItem[]) => dispatch(removeFromSelctedDownloads(items)),
        clearAllSelection: () => dispatch(removeAllFromSelectedDownloads())
    };
}
