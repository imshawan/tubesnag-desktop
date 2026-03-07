import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { DownloadItem } from "./downloads-slice";

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
    removeActiveDownload: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter((d) => d.id !== action.payload);
    },
    clearActiveDownloads: (state) => {
      state.items = [];
    },
  },
});

export const { addActiveDownload, updateActiveDownload, removeActiveDownload, clearActiveDownloads } = activeDownloadsSlice.actions;
export default activeDownloadsSlice.reducer;
