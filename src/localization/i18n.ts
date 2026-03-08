import i18n from "i18next";
import { initReactI18next } from "react-i18next";

i18n.use(initReactI18next).init({
  fallbackLng: "en",
  resources: {
    en: {
      translation: {
        appName: "TubeSnag",
        titleHomePage: "Home Page",
        titleSecondPage: "Second Page",
        documentation: "Documentation",
        madeBy: "Made by imshawan",
        help: {
          title: "Help & Documentation",
          subtitle: "Learn how to use TubeSnag and get answers to common questions.",
          keyFeatures: "Key Features",
          faq: "Frequently Asked Questions",
          features: {
            multipleModes: {
              title: "Multiple Modes",
              description: "Download single videos, bulk URLs, or playlists."
            },
            lightningFast: {
              title: "Lightning Fast",
              description: "High-speed concurrent downloads."
            },
            private: {
              title: "100% Private",
              description: "No tracking, no data collection."
            }
          },
          needMoreHelp: "Need more help? Check out the",
          githubRepo: "GitHub repository",
          additionalResources: "for additional resources."
        },
        history: {
          title: "History",
          subtitle: "View and manage your download history.",
          clearCompleted: "Clear Completed",
          clearAll: "Clear All",
          searchPlaceholder: "Search history...",
          allStatus: "All Status",
          completed: "Completed",
          downloading: "Downloading",
          failed: "Failed",
          showing: "Showing",
          pending: "Pending",
          items: "items",
          noResults: "No results found",
          tryAdjusting: "Try adjusting your filters or search query."
        },
        settings: {
          title: "Settings",
          subtitle: "Customize your download preferences.",
          downloadQuality: "Download Quality",
          bestQuality: "Best Quality",
          bestQualityDesc: "Highest available resolution and bitrate (4K/8K)",
          highQuality: "High Quality",
          highQualityDesc: "1080p or best available",
          mediumQuality: "Medium Quality",
          mediumQualityDesc: "720p or best available",
          lowQuality: "Low Quality",
          lowQualityDesc: "480p (Data saver)",
          storageLocation: "Storage Location",
          saveDownloadsTo: "Save downloads to",
          browse: "Browse",
          autoSaved: "Changes are auto-saved to config.json",
          general: "General",
          autoStartDownloads: "Auto-start downloads",
          autoStartDesc: "Begin downloading immediately when added"
        },
        videoQualities: {
          best: { label: "Best Available", sub: "Max Resolution" },
          "4k": { label: "4K Ultra HD", sub: "2160p HDR" },
          high: { label: "High Def", sub: "1080p @ 60fps" },
          medium: { label: "Standard", sub: "720p / Data Saver" },
          audio: { label: "Audio Only", sub: "MP3 / M4A" }
        },
        downloadFormats: {
          mp4: "MP4 (Video)",
          webm: "WebM (Video)",
          mkv: "MKV (Video)",
          mp3: "MP3 (Audio)",
          m4a: "M4A (Audio)",
          wav: "WAV (Audio)"
        },
        faqs: [
          {
            question: "What video formats are supported?",
            answer: "TubeSnag supports MP4, WebM, and audio formats. You can download in your preferred quality from 480p to 4K."
          },
          {
            question: "Can I download playlists?",
            answer: "Yes! You can download entire YouTube playlists at once. Just paste the playlist URL and select the playlist option."
          },
          {
            question: "How do I bulk download?",
            answer: "Simply paste multiple YouTube URLs separated by commas. TubeSnag will process them all automatically."
          }
        ],
        dashboard: {
          overview: "Overview",
          manageDownloads: "Manage your downloads and active queues.",
          activeTasks: "Active Tasks",
          processing: "Processing...",
          idle: "Idle",
          completed: "Completed",
          allTime: "All time",
          totalSize: "Total Size",
          savedLocally: "Saved locally",
          failed: "Failed",
          requiresAttention: "Requires attention",
          startNewDownload: "Start New Download",
          singleVideo: "Single Video",
          downloadMp4Mp3: "Download MP4/MP3",
          playlist: "Playlist",
          batchDownloadSeries: "Batch download series",
          bulkImport: "Bulk Download",
          pasteMultipleLinks: "Paste multiple links",
          searchDownloads: "Search downloads...",
          processingVideo: "Processing Video...",
          openingFile: "Opening file from:",
          downloadFailed: "This download failed. Retry?",
          electronNotDetected: "Electron IPC not detected. Using mock path.",
          mockPathSet: "Mock path set! To fix, add 'selectFolder' to your preload.js.",
          failedSelectFolder: "Failed to select folder:"
        },
        downloads: {
          quality: "Quality",
          format: "Format",
          title: "Active Downloads",
          subtitle: "Track active downloads and their progress.",
          noActive: "No active downloads",
          startNewDownload: "Start a new download to see progress here."
        },
        bulkDownload: {
          title: "Bulk Download",
          description: "Queue multiple videos at once. One link per line.",
          videoLinks: "Video Links",
          detected: "detected",
          errorEmpty: "Please paste at least one link.",
          appliesToAll: "Applies to all videos in this batch",
          downloadFormat: "Download Format",
          appliesToAllFormat: "Applies to all video/audio in this batch",
          cancel: "Cancel",
          queueing: "Queueing...",
          download: "Download",
          downloadVideos: "Download {{count}} Videos"
        },
        playlistDownload: {
          title: "Download Playlist",
          description: "Enter a YouTube playlist URL to queue all videos.",
          playlistLink: "Playlist Link",
          placeholder: "https://www.youtube.com/playlist?list=...",
          reverseOrder: "Reverse Order",
          downloadOldestFirst: "Download oldest videos first",
          errorUrlRequired: "URL is required.",
          errorInvalidPlaylist: "Invalid playlist URL (missing 'list=').",
          cancel: "Cancel",
          processing: "Processing...",
          processPlaylist: "Process Playlist",
          addedToQueue: "Playlist being added to downloads queue. Please wait while we load the video list.",
        },
        singleDownload: {
          title: "Download Video",
          description: "Enter a YouTube URL and select your preferred quality.",
          videoLink: "Video Link",
          placeholder: "https://youtu.be/...",
          errorEmpty: "Please paste a link first.",
          cancel: "Cancel",
          starting: "Starting...",
          download: "Download"
        },
        storageIndicator: {
          storage: "Storage",
          usedOf: "used of"
        },
        recentActivity: {
          title: "Recent Activity",
          viewAll: "View All",
          unknownVideo: "Unknown Video",
          noRecentDownloads: "No recent downloads."
        },
        globalSearch: {
          placeholder: "Type to search downloads...",
          esc: "ESC",
          toClose: "to close",
          noResults: "No results found.",
          results: "Results"
        },
        setup: {
          title: "TubeSnag Setup",
          welcome: "Welcome to TubeSnag",
          description: "Setting up your environment for the first time. This may take a moment.",
          checking: "Checking dependencies...",
          installing: "Installing dependencies...",
          complete: "Setup complete!"
        },
        sidebar: {
          dashboard: "Dashboard",
          downloads: "Downloads",
          history: "History",
          settings: "Settings",
          help: "Help"
        },
      },
    }
  },
});
