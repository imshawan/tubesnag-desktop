import { useMemo } from "react";
import { useAppSelector } from "@/store/hooks";

export interface UseActiveDownloadsReturn {
    currentDownloads: DownloadItem[];
    isDownloading: boolean;
    downloadCount: number;
}

export function useActiveDownloads(): UseActiveDownloadsReturn {
    const activeDownloads = useAppSelector((state) => state.activeDownloads.items);

    const currentDownloads = useMemo(
        () => activeDownloads.filter((d) => d.status === "downloading"),
        [activeDownloads]
    );

    const isDownloading = currentDownloads.length > 0;
    const downloadCount = currentDownloads.length;

    return {
        currentDownloads,
        isDownloading,
        downloadCount,
    };
}
