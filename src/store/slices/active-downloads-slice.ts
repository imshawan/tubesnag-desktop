import {createSlice, PayloadAction} from "@reduxjs/toolkit";

export interface ActiveDownloadsState {
    items: DownloadItem[];
    isDownloading: string;
    downloadSpeed: string;
}

const initialState: ActiveDownloadsState = {
    items: [],
    isDownloading: "",
    downloadSpeed: "",
};

const activeDownloadsSlice = createSlice({
    name: "activeDownloads",
    initialState,
    reducers: {
        setActiveDownloads: (state, action: PayloadAction<DownloadItem[]>) => {
            state.items = action.payload;
        },
        addActiveDownload: (state, action: PayloadAction<DownloadItem>) => {
            state.items.unshift(action.payload);
        },
        updateActiveDownload: (state, action: PayloadAction<{ id: string; updates: Partial<DownloadItem> }>) => {
            const item = state.items.find((d) => d.id === action.payload.id && d.status != "completed");
            if (item) {
                if (action.payload.updates?.progress && action.payload.updates.progress <= item.progress) {
                    const {progress, ...updates} = action.payload.updates;
                    Object.assign(item, updates);
                } else {
                    Object.assign(item, action.payload.updates);
                }
            }
        },
        updateActivePlaylistVideoDownload(state, action: PayloadAction<{
            playlistId: string;
            downloadId: string,
            updates: Partial<DownloadItem>
        }>) {
            const item = state.items.find((d) => d.id === action.payload.playlistId);
            if (item?.videos) {
                const idx = item.videos.findIndex(v => v.id === action.payload.downloadId);
                if (idx !== -1) {
                    let isCompleted = item.videos.filter(e => e.status === "completed").length;
                    if (action.payload.updates.status === "completed") isCompleted++;
                    if (isCompleted == item.videos.length) {
                        item.status = "completed";
                    } else {
                        item.status = "downloading";
                    }
                    Object.assign(item.videos[idx], action.payload.updates);
                }
            }
        },
        removeActiveDownload: (state, action: PayloadAction<{ parent: string; child?: string }>) => {
            let idx = state.items.findIndex((d) => d.id === action.payload.parent);
            if (idx != -1) {
                if (action.payload.child) {
                    state.items[idx].videos = state.items[idx].videos?.filter(d => d.id !== action.payload.child);
                } else {
                    state.items = state.items.filter((d) => d.id !== action.payload.parent);
                }
            }
        },
        clearActiveDownloads: (state) => {
            state.items = [];
        },
        setIsDownloading: (state, action: PayloadAction<string>) => {
            state.isDownloading = action.payload;
        },
        setDownloadSpeed: (state, action: PayloadAction<string>) => {
            state.downloadSpeed = action.payload;
        }
    },
});

export const {
    setActiveDownloads,
    addActiveDownload,
    updateActiveDownload,
    removeActiveDownload,
    clearActiveDownloads,
    updateActivePlaylistVideoDownload,
    setIsDownloading,
    setDownloadSpeed,
} = activeDownloadsSlice.actions;
export default activeDownloadsSlice.reducer;

export const selectActiveDownloads = (state: {activeDownloads: ActiveDownloadsState}) => state.activeDownloads.items;
export const selectIsDownloading = (state: {activeDownloads: ActiveDownloadsState}) => state.activeDownloads.isDownloading;
export const selectDownloadSpeed = (state: {activeDownloads: ActiveDownloadsState}) => state.activeDownloads.downloadSpeed;