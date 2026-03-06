import { useMemo } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { addDownloads, updateDownload, removeDownload, clearCompleted, clearAll } from "@/store/slices/downloads-slice";
import type { QualityType } from "../types/index";
import type { DownloadItem } from "@/store/slices/downloads-slice";

export type { DownloadItem };

export interface UseDownloadReturn {
  downloads: DownloadItem[];
  isDownloading: boolean;
  totalProgress: number;
  addDownload: (urls: string[], quality: QualityType) => DownloadItem[];
  updateDownload: (id: string, updates: Partial<DownloadItem>) => void;
  removeDownload: (id: string) => void;
  clearCompleted: () => void;
  clearAll: () => void;
  recentItemsPerPage: number;
}

export function useDownloads(): UseDownloadReturn {
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
    dispatch(addDownloads({ urls, quality }));
    const tempId = `${Date.now()}-${Math.random()}`;
    return urls.map((url) => ({
      id: tempId,
      url,
      title: "Fetching video info...",
      channel: "Please wait",
      status: "pending" as const,
      progress: 0,
      size: "Calculating...",
      quality: quality,
      type: "video",
      date: "Just now",
    })) as DownloadItem[];
  };

  return {
    downloads,
    isDownloading,
    totalProgress,
    recentItemsPerPage,
    addDownload,
    updateDownload: (id: string, updates: Partial<DownloadItem>) =>
      dispatch(updateDownload({ id, updates })),
    removeDownload: (id: string) => dispatch(removeDownload(id)),
    clearCompleted: () => dispatch(clearCompleted()),
    clearAll: () => dispatch(clearAll()),
  };
}

