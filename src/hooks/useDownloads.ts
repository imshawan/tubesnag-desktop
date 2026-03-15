import {useMemo} from "react";
import {useAppDispatch, useAppSelector} from "@/store/hooks";
import {
    addDownload,
    clearAll,
    clearCompleted,
    removeDownload,
    setDownloads,
    updateDownload
} from "@/store/slices/downloads-slice";

export function useDownloads() {
    const dispatch = useAppDispatch();
    const downloads = useAppSelector((state) => state.downloads.downloads);
    const recentItemsPerPage = useAppSelector((state) => state.app.recentItemsPerPage);

    const isDownloading = useMemo(
        () => downloads.some((d) => d.status === "downloading"),
        [downloads]
    );

    const completedDownloads = useMemo(
        () => downloads.filter((d) => d.status === "completed"),
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
        recentItemsPerPage,
        totalSize,
        addDownload: (download: DownloadItem) => dispatch(addDownload(download)),
        setDownloads: (downloads: DownloadItem[]) => dispatch(setDownloads(downloads)),
        updateDownload: (id: string, updates: Partial<DownloadItem>) =>
            dispatch(updateDownload({id, updates})),
        removeDownload: (parent: string, child?: string) => dispatch(removeDownload({
            parent, child
        })),
        clearCompleted: () => dispatch(clearCompleted()),
        clearAll: () => dispatch(clearAll())
    };
}
