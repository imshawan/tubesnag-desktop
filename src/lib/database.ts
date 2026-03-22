import {getElectron} from "@/lib/utils/common";

export const createActiveDownload = async (downloadItem: DownloadItem): Promise<{ success: boolean }> => {
    return await getElectron().db.createActiveDownload(downloadItem);
};

export const getActiveDownloads = async (): Promise<DownloadItem[]> => {
    return await getElectron().db.getActiveDownloads();
};

export const getActiveDownloadById = async (id: string): Promise<DownloadItem | null> => {
    return await getElectron().db.getActiveDownloadById(id);
};

export const updateActiveDownload = async (parentId: string, childId: string | null, updates: Partial<DownloadItem>): Promise<{ success: boolean }> => {
    return await getElectron().db.updateActiveDownload(parentId, childId, updates);
};

export const deleteActiveDownload = async (id: string): Promise<{ success: boolean }> => {
    return await getElectron().db.deleteActiveDownload(id);
};

export const deleteAllActiveDownloads = async (): Promise<{ success: boolean }> => {
    return await getElectron().db.deleteAllActiveDownloads();
};

export const getCompletedDownloads = async (): Promise<DownloadItem[]> => {
    return await getElectron().db.getCompletedDownloads();
};

export const getCompletedDownloadById = async (id: string): Promise<DownloadItem | null> => {
    return await getElectron().db.getCompletedDownloadById(id);
};

export const deleteCompletedDownload = async (id: string): Promise<{ success: boolean }> => {
    return await getElectron().db.deleteCompletedDownload(id);
};

export const deleteAllCompletedDownloads = async (): Promise<{ success: boolean }> => {
    return await getElectron().db.deleteAllCompletedDownloads();
};

export const moveActiveToCompleted = async (id: string): Promise<{ success: boolean }> => {
    return await getElectron().db.moveActiveToCompleted(id);
};

export const deleteActiveDownloadsVideoFromPlaylist = async (playlistId: string, videoId: string): Promise<{ success: boolean }> => {
    return await getElectron().db.deleteActiveDownloadsVideoFromPlaylist(playlistId, videoId);
};

export const deleteCompletedDownloadsVideoFromPlaylist = async (playlistId: string, videoId: string): Promise<{ success: boolean }> => {
    return await getElectron().db.deleteCompletedDownloadsVideoFromPlaylist(playlistId, videoId);
};