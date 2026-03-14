import {createSlice, PayloadAction} from "@reduxjs/toolkit";

export interface DownloadsState {
    downloads: DownloadItem[];
}

const initialState: DownloadsState = {
    downloads: [],
};

const downloadsSlice = createSlice({
    name: "downloads",
    initialState,
    reducers: {
        addDownloads: (state, action: PayloadAction<{
            urls: string[];
            quality: QualityType;
            downloadPath: string;
            format?: string;
            isPlaylist?: boolean
        }>) => {
            if (action.payload.isPlaylist) {
                const videos = action.payload.urls.map((url) => ({
                    id: `${Date.now()}-${Math.random()}`,
                    url,
                    title: "Fetching video info...",
                    channel: "Please wait",
                    status: "pending" as DownloadStatus,
                    progress: 0,
                    size: 0,
                    quality: action.payload.quality,
                    type: "video" as const,
                    date: "Just now",
                    format: action.payload.format,
                    downloadPath: action.payload.downloadPath
                }));
                const playlist: DownloadItem = {
                    downloadPath: action.payload.downloadPath,
                    id: `${Date.now()}-${Math.random()}`,
                    url: "",
                    title: "Playlist - Fetching info...",
                    channel: "Please wait",
                    status: "pending",
                    progress: 0,
                    size: 0,
                    quality: action.payload.quality,
                    type: "playlist",
                    date: "Just now",
                    format: action.payload.format,
                    videos
                };
                state.downloads.push(playlist);
            } else {
                const newDownloads = action.payload.urls.map((url) => ({
                    id: `${Date.now()}-${Math.random()}`,
                    url,
                    title: "Fetching video info...",
                    channel: "Please wait",
                    status: "pending" as DownloadStatus,
                    progress: 0,
                    size: 0,
                    quality: action.payload.quality,
                    type: "video" as const,
                    date: "Just now",
                    format: action.payload.format,
                    downloadPath: action.payload.downloadPath
                }));
                state.downloads.push(...newDownloads);
            }
        },
        updateDownload: (state, action: PayloadAction<{ id: string; updates: Partial<DownloadItem> }>) => {
            const download = state.downloads.find((d) => d.id === action.payload.id);
            if (download) {
                Object.assign(download, action.payload.updates);
            }
        },
        removeDownload: (state, action: PayloadAction<string>) => {
            state.downloads = state.downloads.filter((d) => d.id !== action.payload);
        },
        clearCompleted: (state) => {
            state.downloads = state.downloads.filter((d) => d.status !== "completed" && d.status !== "failed");
        },
        clearAll: (state) => {
            state.downloads = [];
        },
    },
});

export const {addDownloads, updateDownload, removeDownload, clearCompleted, clearAll} = downloadsSlice.actions;
export default downloadsSlice.reducer;
