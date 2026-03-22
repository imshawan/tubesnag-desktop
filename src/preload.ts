import {contextBridge, ipcRenderer} from "electron";
import {IPC_CHANNELS} from "./constants";

window.addEventListener("message", (event) => {
    if (event.data === IPC_CHANNELS.START_ORPC_SERVER) {
        const [serverPort] = event.ports;

        ipcRenderer.postMessage(IPC_CHANNELS.START_ORPC_SERVER, null, [serverPort]);
    }
});

contextBridge.exposeInMainWorld('electron', {
    selectFolder: () => ipcRenderer.invoke('dialog:selectFolder'),
    getDiskUsage: (path: any) => ipcRenderer.invoke('meta:get-disk-usage', path),
    checkDependencies: () => ipcRenderer.invoke('setup:check-dependencies'),
    installDependencies: () => ipcRenderer.invoke('setup:install-dependencies'),
    getPlatform: () => ipcRenderer.invoke('app:get-platform'),
    getAppVersion: () => ipcRenderer.invoke('app:get-version'),
    openYtUrl: (url: string) => ipcRenderer.invoke('app:open-yt-url', url),
    fileToDataUrl: (filePath: string) => ipcRenderer.invoke('file:to-data-url', filePath),
    onInstallProgress: (callback: any) =>
        ipcRenderer.on('install-progress', (event, data) => callback(data)),
    offInstallProgress: (callback: any) => ipcRenderer.off('install-progress', callback),
    invoke: (channel: string, ...args: any[]) => ipcRenderer.invoke(channel, ...args),
    on: (channel: string, callback: any) => {
        ipcRenderer.on(channel, (event, data) => callback(data));
        return () => ipcRenderer.off(channel, callback);
    },
    off: (channel: string, callback: any) => ipcRenderer.off(channel, callback),
    getPlaylistVideos: (url: string, reverse: boolean, playlistId: string) =>
        ipcRenderer.invoke('ytdlp:get-playlist-videos', {
            url,
            reverse,
            playlistId
        }),
    openFile: (item: DownloadItem): Promise<void> => ipcRenderer.invoke('file:open', item),
    openFolder: (item: DownloadItem): Promise<void> => ipcRenderer.invoke('file:open-folder', item),
    deleteFileFromSystem: (item: DownloadItem): Promise<void> => ipcRenderer.invoke('file:delete', item),
    deleteDownloadedPlaylistResources: (item: DownloadItem): Promise<void> =>
        ipcRenderer.invoke('file:delete-playlist', item),
    db: {
        createActiveDownload: (downloadItem: any) =>
            ipcRenderer.invoke('db:create-active-download', downloadItem),
        getActiveDownloads: () =>
            ipcRenderer.invoke('db:get-active-downloads'),
        getActiveDownloadById: (id: string) =>
            ipcRenderer.invoke('db:get-active-download-by-id', id),
        updateActiveDownload: (parentId: string, childId: string | null, updates: any) =>
            ipcRenderer.invoke('db:update-active-download', parentId, childId, updates),
        deleteActiveDownload: (id: string) =>
            ipcRenderer.invoke('db:delete-active-download', id),
        deleteAllActiveDownloads: () =>
            ipcRenderer.invoke('db:delete-all-active-downloads'),

        getCompletedDownloads: () =>
            ipcRenderer.invoke('db:get-completed-downloads'),
        getCompletedDownloadById: (id: string) =>
            ipcRenderer.invoke('db:get-completed-download-by-id', id),
        deleteCompletedDownload: (id: string) =>
            ipcRenderer.invoke('db:delete-completed-download', id),
        deleteAllCompletedDownloads: () =>
            ipcRenderer.invoke('db:delete-all-completed-downloads'),

        moveActiveToCompleted: (id: string) =>
            ipcRenderer.invoke('db:move-active-to-completed', id),

        deleteActiveDownloadsVideoFromPlaylist: (playlistId: string, videoId: string): Promise<{ success: boolean }> =>
            ipcRenderer.invoke('db:delete-active-downloads-video-from-playlist', playlistId, videoId),

        deleteCompletedDownloadsVideoFromPlaylist: (playlistId: string, videoId: string): Promise<{ success: boolean }> =>
            ipcRenderer.invoke('db:delete-completed-downloads-video-from-playlist', playlistId, videoId),

    }
})
