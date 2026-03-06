import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { QualityType } from "@/types/index";

export type Status = "pending" | "downloading" | "completed" | "failed";

export interface DownloadItem {
  id: string;
  url: string;
  title: string;
  status: Status;
  progress: number;
  error?: string;
  size: string;
  quality: string;
  type: "video" | "audio" | "playlist";
  date: string;
  channel: string;
  format?: string;
  videos?: DownloadItem[];
}

export interface DownloadsState {
  downloads: DownloadItem[];
}

export const getGroupedDownloads = (downloads: DownloadItem[]) => {
  const playlists = downloads.filter((d) => d.type === "playlist");
  const singles = downloads.filter((d) => d.type !== "playlist");
  
  return { playlists, singles };
};

const MOCK_DATA: DownloadItem[] = [
  {
    id: "pl-1",
    title: "Web Development Masterclass 2024",
    channel: "Traversy Media",
    url: "",
    progress: 100,
    status: "completed",
    size: "8.5 GB",
    quality: "1080p",
    type: "playlist",
    date: "3 days ago",
    videos: [
      { id: "v-1", title: "HTML & CSS Fundamentals", channel: "Traversy Media", url: "https://youtu.be/abc123", progress: 100, status: "completed", size: "1.2 GB", quality: "1080p", type: "video", date: "3 days ago" },
      { id: "v-2", title: "JavaScript Essentials", channel: "Traversy Media", url: "https://youtu.be/def456", progress: 100, status: "completed", size: "1.8 GB", quality: "1080p", type: "video", date: "3 days ago" },
      { id: "v-3", title: "React Deep Dive", channel: "Traversy Media", url: "https://youtu.be/ghi789", progress: 100, status: "completed", size: "2.1 GB", quality: "1080p", type: "video", date: "2 days ago" },
      { id: "v-4", title: "Node.js & Express", channel: "Traversy Media", url: "https://youtu.be/jkl012", progress: 100, status: "completed", size: "1.9 GB", quality: "1080p", type: "video", date: "2 days ago" },
      { id: "v-5", title: "Database Design & SQL", channel: "Traversy Media", url: "https://youtu.be/mno345", progress: 100, status: "completed", size: "1.5 GB", quality: "1080p", type: "video", date: "1 day ago" },
    ],
  },
  {
    id: "pl-2",
    title: "Python for Data Science",
    channel: "Corey Schafer",
    url: "",
    progress: 65,
    status: "downloading",
    size: "5.2 GB",
    quality: "1080p",
    type: "playlist",
    date: "Just now",
    videos: [
      { id: "v-6", title: "Python Basics & Setup", channel: "Corey Schafer", url: "https://youtu.be/pqr678", progress: 100, status: "completed", size: "850 MB", quality: "1080p", type: "video", date: "Just now" },
      { id: "v-7", title: "NumPy Tutorial", channel: "Corey Schafer", url: "https://youtu.be/stu901", progress: 100, status: "completed", size: "920 MB", quality: "1080p", type: "video", date: "Just now" },
      { id: "v-8", title: "Pandas for Data Analysis", channel: "Corey Schafer", url: "https://youtu.be/vwx234", progress: 75, status: "downloading", size: "1.1 GB", quality: "1080p", type: "video", date: "Just now" },
      { id: "v-9", title: "Data Visualization with Matplotlib", channel: "Corey Schafer", url: "https://youtu.be/yza567", progress: 45, status: "downloading", size: "980 MB", quality: "1080p", type: "video", date: "Just now" },
      { id: "v-10", title: "Machine Learning Basics", channel: "Corey Schafer", url: "https://youtu.be/bcd890", progress: 0, status: "pending", size: "1.3 GB", quality: "1080p", type: "video", date: "Just now" },
    ],
  },
  { id: "1", title: "Next.js 14 Full Course 2024 | Build and Deploy a Full Stack App", channel: "Javascript Mastery", url: "https://youtu.be/wm5gMKuwSYk", progress: 100, status: "completed", size: "1.2 GB", quality: "1080p", type: "video", date: "2 mins ago" },
  { id: "2", title: "lofi hip hop radio - beats to relax/study to", channel: "Lofi Girl", url: "https://youtu.be/jfKfPfyJRdk", progress: 45, status: "downloading", size: "Unknown", quality: "Audio", type: "audio", date: "Just now" },
  { id: "3", title: "Rust for Beginners - Full Tutorial", channel: "FreeCodeCamp", url: "https://youtu.be/MsocPEZqCJ4", progress: 100, status: "completed", size: "850 MB", quality: "1080p", type: "video", date: "1 hour ago" },
  { id: "4", title: "Elden Ring: Shadow of the Erdtree - Official Trailer", channel: "Bandai Namco", url: "https://youtu.be/qLZenOn7WUo", progress: 100, status: "completed", size: "240 MB", quality: "4K", type: "video", date: "3 hours ago" },
  { id: "5", title: "Top 10 Linux Terminal Commands You Must Know", channel: "NetworkChuck", url: "https://youtu.be/lZAoFs75_cs", progress: 12, status: "downloading", size: "120 MB", quality: "1080p", type: "video", date: "Just now" },
  { id: "6", title: "System Design Interview - Rate Limiter", channel: "ByteByteGo", url: "https://youtu.be/FU4WlwfS3G0", progress: 100, status: "completed", size: "180 MB", quality: "1080p", type: "video", date: "Yesterday" },
  { id: "7", title: "Deep Learning for Coders with fastai & PyTorch", channel: "Jeremy Howard", url: "https://youtu.be/8SF_h3xF3cE", progress: 0, status: "failed", size: "0 B", quality: "1080p", type: "video", date: "Yesterday" },
  { id: "8", title: "React vs Vue - Which is better in 2024?", channel: "Fireship", url: "https://youtu.be/lkIFF4maKMU", progress: 100, status: "completed", size: "45 MB", quality: "1080p", type: "video", date: "2 days ago" },
  { id: "9", title: "Kubernetes Explained in 100 Seconds", channel: "Fireship", url: "https://youtu.be/PVLmVZ33JH8", progress: 100, status: "completed", size: "25 MB", quality: "1080p", type: "video", date: "2 days ago" },
  { id: "10", title: "Harvard CS50 - Lecture 1 - C", channel: "CS50", url: "https://youtu.be/zYD7nN17G3E", progress: 100, status: "completed", size: "2.1 GB", quality: "1080p", type: "video", date: "Last week" },
  { id: "11", title: "Chillstep Mix 2024", channel: "Music Lab", url: "https://youtu.be/xyz123", progress: 100, status: "completed", size: "150 MB", quality: "Audio", type: "audio", date: "Last week" },
  { id: "12", title: "How to Center a Div", channel: "Kevin Powell", url: "https://youtu.be/abc987", progress: 100, status: "completed", size: "30 MB", quality: "1080p", type: "video", date: "Last month" },
];

const initialState: DownloadsState = {
  downloads: MOCK_DATA,
};

const downloadsSlice = createSlice({
  name: "downloads",
  initialState,
  reducers: {
    addDownloads: (state, action: PayloadAction<{ urls: string[]; quality: QualityType; format?: string; isPlaylist?: boolean }>) => {
      if (action.payload.isPlaylist) {
        const videos = action.payload.urls.map((url) => ({
          id: `${Date.now()}-${Math.random()}`,
          url,
          title: "Fetching video info...",
          channel: "Please wait",
          status: "pending" as Status,
          progress: 0,
          size: "Calculating...",
          quality: action.payload.quality,
          type: "video" as const,
          date: "Just now",
          format: action.payload.format,
        }));
        const playlist: DownloadItem = {
          id: `${Date.now()}-${Math.random()}`,
          url: "",
          title: "Playlist - Fetching info...",
          channel: "Please wait",
          status: "pending",
          progress: 0,
          size: "Calculating...",
          quality: action.payload.quality,
          type: "playlist",
          date: "Just now",
          format: action.payload.format,
          videos,
        };
        state.downloads.push(playlist);
      } else {
        const newDownloads = action.payload.urls.map((url) => ({
          id: `${Date.now()}-${Math.random()}`,
          url,
          title: "Fetching video info...",
          channel: "Please wait",
          status: "pending" as Status,
          progress: 0,
          size: "Calculating...",
          quality: action.payload.quality,
          type: "video" as const,
          date: "Just now",
          format: action.payload.format,
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

export const { addDownloads, updateDownload, removeDownload, clearCompleted, clearAll } = downloadsSlice.actions;
export default downloadsSlice.reducer;
