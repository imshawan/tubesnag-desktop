import {
  Film,
  Check,
  Link,
  Sparkles,
  Monitor,
  Smartphone,
  Music,
  Tv,
} from "lucide-react";

export const LOCAL_STORAGE_KEYS = {
  LANGUAGE: "lang",
  THEME: "theme",
};

export const IPC_CHANNELS = {
  START_ORPC_SERVER: "start-orpc-server",
};

export const VIDEO_QUALITIES = [
  {
    id: "best",
    label: "Best Available",
    sub: "Max Resolution",
    icon: Sparkles
  },
  { id: "4k", label: "4K Ultra HD", sub: "2160p HDR", icon: Tv },
  {
    id: "high",
    label: "High Def",
    sub: "1080p @ 60fps",
    icon: Monitor
  },
  {
    id: "medium",
    label: "Standard",
    sub: "720p / Data Saver",
    icon: Smartphone
  },
  {
    id: "audio",
    label: "Audio Only",
    sub: "MP3 / M4A",
    icon: Music
  },
];

export const DOWNLOAD_FORMATS = [
  { value: "mp4", label: "MP4 (Video)" },
  { value: "webm", label: "WebM (Video)" },
  { value: "mkv", label: "MKV (Video)" },
  { value: "mp3", label: "MP3 (Audio)" },
  { value: "m4a", label: "M4A (Audio)" },
  { value: "wav", label: "WAV (Audio)" },
] as const;

export const faqs = [
    {
      question: "What video formats are supported?",
      answer:
        "TubeSnag supports MP4, WebM, and audio formats. You can download in your preferred quality from 480p to 4K.",
    },
    {
      question: "Can I download playlists?",
      answer:
        "Yes! You can download entire YouTube playlists at once. Just paste the playlist URL and select the playlist option.",
    },
    {
      question: "How do I bulk download?",
      answer:
        "Simply paste multiple YouTube URLs separated by commas. TubeSnag will process them all automatically.",
    },
  ] as const;