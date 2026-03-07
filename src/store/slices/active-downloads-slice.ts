import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { DownloadItem } from "./downloads-slice";

export interface ActiveDownloadsState {
  items: DownloadItem[];
}

const MOCK_ACTIVE_DOWNLOADS: DownloadItem[] = [
  {
    id: "active-1",
    title: "Next.js 14 Full Course 2024",
    channel: "Javascript Mastery",
    url: "https://youtu.be/wm5gMKuwSYk",
    progress: 45,
    status: "downloading",
    size: 1288490189,
    quality: "1080p",
    type: "video",
    date: "Just now",
    thumbnail: "https://i.ytimg.com/vi/wm5gMKuwSYk/maxresdefault.jpg",
  },
  {
    id: "active-3",
    title: "lofi hip hop radio - beats to relax/study to",
    channel: "Lofi Girl",
    url: "https://youtu.be/jfKfPfyJRdk",
    progress: 20,
    status: "downloading",
    size: 0,
    quality: "Audio",
    type: "audio",
    date: "Just now",
    thumbnail: "https://i.ytimg.com/vi/jfKfPfyJRdk/maxresdefault.jpg",
  },
];

const initialState: ActiveDownloadsState = {
  items: MOCK_ACTIVE_DOWNLOADS,
};

const activeDownloadsSlice = createSlice({
  name: "activeDownloads",
  initialState,
  reducers: {
    addActiveDownload: (state, action: PayloadAction<DownloadItem>) => {
      state.items.push(action.payload);
    },
    updateActiveDownload: (state, action: PayloadAction<{ id: string; updates: Partial<DownloadItem> }>) => {
      const item = state.items.find((d) => d.id === action.payload.id);
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
