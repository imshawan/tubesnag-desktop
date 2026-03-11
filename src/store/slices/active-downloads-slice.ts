import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface ActiveDownloadsState {
  items: DownloadItem[];
}

const initialState: ActiveDownloadsState = {
  items: [],
};

const activeDownloadsSlice = createSlice({
  name: "activeDownloads",
  initialState,
  reducers: {
    addActiveDownload: (state, action: PayloadAction<DownloadItem>) => {
      state.items.unshift(action.payload);
    },
    updateActiveDownload: (state, action: PayloadAction<{ id: string; updates: Partial<DownloadItem> }>) => {
      const item = state.items.find((d) => d.id === action.payload.id && d.status != "completed");
      if (item) {
        Object.assign(item, action.payload.updates);
      }
    },
    updateActivePlaylistVideoDownload(state, action: PayloadAction<{ playlistId: string; downloadId: string, updates: Partial<DownloadItem> }>) {
      const item = state.items.find((d) => d.id === action.payload.playlistId);
      if (item && item.videos) {
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
    removeActiveDownload: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter((d) => d.id !== action.payload);
    },
    clearActiveDownloads: (state) => {
      state.items = [];
    },
  },
});

export const { addActiveDownload, updateActiveDownload, removeActiveDownload, clearActiveDownloads, updateActivePlaylistVideoDownload } = activeDownloadsSlice.actions;
export default activeDownloadsSlice.reducer;