import {useMemo} from "react";
import {useAppDispatch, useAppSelector} from "@/store/hooks";
import {addDownloads, clearAll, clearCompleted, removeDownload, updateDownload} from "@/store/slices/downloads-slice";
import {generateUUID} from "@/utils/common";

export function useDownloads() {
    const dispatch = useAppDispatch();
    const downloads = useAppSelector((state) => state.downloads.downloads);
    const recentItemsPerPage = useAppSelector((state) => state.app.recentItemsPerPage);

    const isDownloading = useMemo(
        () => downloads.some((d) => d.status === "downloading"),
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

    const addDownload = (urls: string[], quality: QualityType) => {
        dispatch(addDownloads({urls, quality}));
        return urls.map((url) => {
            const tempId = generateUUID();
            return {
                id: tempId,
                url,
                title: "Fetching video info...",
                channel: "Please wait",
                status: "pending" as const,
                progress: 0,
                size: 0,
                quality: quality,
                type: "video",
                date: "Just now",
            }
        }) as DownloadItem[];
    };

    return {
        downloads,
        isDownloading,
        totalProgress,
        recentItemsPerPage,
        addDownload,
        updateDownload: (id: string, updates: Partial<DownloadItem>) =>
            dispatch(updateDownload({id, updates})),
        removeDownload: (id: string) => dispatch(removeDownload(id)),
        clearCompleted: () => dispatch(clearCompleted()),
        clearAll: () => dispatch(clearAll())
    };
}
