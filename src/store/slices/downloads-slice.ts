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
        setDownloads: (state, action: PayloadAction<DownloadItem[]>) => {
            state.downloads = action.payload;
        },
        addDownload: (state, action: PayloadAction<DownloadItem>) => {
            state.downloads.unshift(action.payload);
        },
        updateDownload: (state, action: PayloadAction<{ id: string; updates: Partial<DownloadItem> }>) => {
            const download = state.downloads.find((d) => d.id === action.payload.id);
            if (download) {
                Object.assign(download, action.payload.updates);
            }
        },
        removeDownload: (state, action: PayloadAction<{parent: string, child?: string}>) => {
            state.downloads = state.downloads.filter((d) => d.id !== action.payload.parent);
        },
        clearCompleted: (state) => {
            state.downloads = state.downloads.filter((d) => d.status !== "completed" && d.status !== "failed");
        },
        clearAll: (state) => {
            state.downloads = [];
        },
    },
});

export const {setDownloads, addDownload, updateDownload, removeDownload, clearCompleted, clearAll} = downloadsSlice.actions;
export default downloadsSlice.reducer;
