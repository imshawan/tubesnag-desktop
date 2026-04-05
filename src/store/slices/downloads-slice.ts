import {createSlice, PayloadAction} from "@reduxjs/toolkit";
import {isDownloadCompleteState, isFailedState} from "@/lib/utils/common";

export interface DownloadsState {
    downloads: DownloadItem[];
    downloadItemPropertyOpen: DownloadItem | null;
    selectedDownloads: Map<string, DownloadItem>
}

const initialState: DownloadsState = {
    downloads: [],
    downloadItemPropertyOpen: null,
    selectedDownloads: new Map()
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
            state.downloads = state.downloads.filter((d) => !isDownloadCompleteState(d) && !isFailedState(d));
        },
        clearAll: (state) => {
            state.downloads = [];
        },
        setDownloadItemPropertyOpen: (state, action: PayloadAction<DownloadItem | null>) => {
            state.downloadItemPropertyOpen = action.payload;
        },
        setAllAsSelectedDownloads: (state) => {
            state.downloads.forEach(dl => state.selectedDownloads.set(dl.id, dl));
        },
        addToSelectedDownloads: (state, action: PayloadAction<DownloadItem>) => {
            state.selectedDownloads.set(action.payload.id,  action.payload);
        },
        removeFromSelctedDownloads: (state, action: PayloadAction<DownloadItem[]>) => {
            action.payload.forEach(dl => state.selectedDownloads.delete(dl.id));
        },
        removeAllFromSelectedDownloads: (state) => {
            state.selectedDownloads = new Map();
        }
    },
});

export const {setDownloads, addDownload, updateDownload, removeDownload, clearCompleted, clearAll, 
    setDownloadItemPropertyOpen, setAllAsSelectedDownloads, addToSelectedDownloads, removeFromSelctedDownloads,
    removeAllFromSelectedDownloads
} = downloadsSlice.actions;
export default downloadsSlice.reducer;

export const selectDownloadItemPropertyOpen = (state: {downloads: DownloadsState}) => state.downloads.downloadItemPropertyOpen;
export const selectCompletedDownloads = (state: {downloads: DownloadsState}) => state.downloads.downloads
    .filter((d) => isDownloadCompleteState(d) && !isFailedState(d));
export const selectAllSelectedDownloads = (state: {downloads: DownloadsState}) => state.downloads.selectedDownloads;