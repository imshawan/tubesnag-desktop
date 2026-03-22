import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import hi from "./resources/hi.json";

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
          deletingProgress: "Deleting {{current}}/{{total}}",
          items: "items",
          noResults: "No results found",
          tryAdjusting: "Try adjusting your filters or search query.",
          clearAllTitle: "Clear All Download History?",
          clearAllDesc: "Are you sure you want to clear your entire download history? This will also permanently delete all associated files from your device. This action cannot be undone."
        },
        settings: {
          title: "Settings",
          subtitle: "Customize your download preferences.",
          downloadQuality: "Download Quality",
          storageLocation: "Storage Location",
          saveDownloadsTo: "Save downloads to",
          browse: "Browse",
          autoSaved: "Changes are auto-saved",
          general: "General",
          autoStartDownloads: "Auto-start downloads",
          autoStartDesc: "Begin downloading immediately when added",
          savePlaylistFolders: "Save videos in playlist named folders",
          savePlaylistFoldersDesc: "Organize playlist downloads into separate folders by playlist name",
          displayPreferences: "Display Preferences",
          itemsPerPage: "Downloads per page",
          itemsPerPageDesc: "Choose how many items are displayed at once in the main downloads and history lists.",
          recentItems: "Dashboard recent activity",
          recentItemsDesc: "The number of recent downloads to show on your home dashboard overview."
        },
        videoQualities: {
          best: { label: "Best Available", sub: "Max Resolution" },
          "8k": { label: "8K Ultra HD", sub: "4320p Extreme" },
          "4k": { label: "4K Ultra HD", sub: "2160p HDR" },
          "1440p": { label: "1440p QHD", sub: "2K Resolution" },
          "1080p": { label: "High Def", sub: "1080p @ 60fps" },
          "720p": { label: "Standard", sub: "720p / Data Saver" },
          "480p": { label: "Medium", sub: "480p / Medium quality" },
          "360p": { label: "Low", sub: "360p / Low quality" },
          "240p": { label: "Very Low", sub: "240p / Small size" },
          "144p": { label: "Tiny", sub: "144p / Minimum data" },
          audio: { label: "Audio Only", sub: "MP3 / M4A" }
        },
        downloadFormats: {
          mp4: "MP4 (Video)",
          mp4Sub: "H.264 codec, widely compatible",
          webm: "WebM (Video)",
          webmSub: "VP9 codec, smaller file size",
          mkv: "MKV (Video)",
          mkvSub: "Matroska container, high quality",
          mp3: "MP3 (Audio)",
          mp3Sub: "MPEG-3 audio, universal support",
          m4a: "M4A (Audio)",
          m4aSub: "AAC codec, better quality",
          wav: "WAV (Audio)",
          wavSub: "Uncompressed, lossless quality",
        },
        audioBitrates: {
          "128": {
            label: "128 kbps",
            description: "Low quality, smaller file size"
          },
          "192": {
            label: "192 kbps",
            description: "Standard quality"
          },
          "256": {
            label: "256 kbps",
            description: "High quality"
          },
          "320": {
            label: "320 kbps",
            description: "Maximum quality, larger file size"
          }
        },
        faqs: [
          {
            question: "What video formats are supported?",
            answer: "TubeSnag supports MP4, MKV, WebM for videos, and MP3, M4A, WAV for audio. You can download in your preferred quality from 360p to 4K."
          },
          {
            question: "Can I download playlists?",
            answer: "Yes! You can download entire YouTube playlists at once. Just paste the playlist URL and select the playlist option. You can also reverse the order to download oldest videos first."
          },
          {
            question: "How do I bulk download?",
            answer: "Simply paste multiple YouTube URLs (one per line) in the Bulk Download dialog. TubeSnag will process them all automatically with your selected quality and format settings."
          },
          {
            question: "Where are my downloads saved?",
            answer: "Downloads are saved to your configured storage location (shown in Settings). You can change this path anytime in Settings > Storage Location. Playlist videos can optionally be organized into separate folders."
          },
          {
            question: "Can I change the download quality?",
            answer: "Yes! You can select from Best, 4K, 1440p, 1080p, 720p, 480p, 360p, or Audio Only. The quality setting can be changed for each download or set as default in Settings."
          },
          {
            question: "What audio bitrates are available?",
            answer: "For audio downloads, you can choose between 128 kbps (low quality), 192 kbps (standard), 256 kbps (high quality), or 320 kbps (maximum quality). Higher bitrates mean better audio quality but larger file sizes."
          },
          {
            question: "How do I track my downloads?",
            answer: "Active downloads appear in the Downloads tab with real-time progress. Completed downloads are stored in History where you can search, filter by status, and manage your download library."
          },
          {
            question: "Is my data private?",
            answer: "Absolutely! TubeSnag runs 100% locally on your computer. There's no tracking, no data collection, and no internet connection required except for downloading videos. All your downloads and history are stored locally in a SQLite database."
          },
          {
            question: "What if a download fails?",
            answer: "Failed downloads are marked in your history. You can retry any failed download by right-clicking and selecting 'Retry Download'. The app will attempt to download it again with the same settings."
          },
          {
            question: "Can I delete downloads from the app?",
            answer: "Yes! Right-click any download and select 'Delete' to remove both the file from your system and the entry from your history. For playlists, you can delete individual videos or the entire playlist folder."
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
          searchDownloads: "Search previous downloads...",
          processingVideo: "Processing Video...",
          openingFile: "Opening file from:",
          downloadFailed: "Download Failed",
          electronNotDetected: "Electron IPC not detected. Using mock path.",
          mockPathSet: "Mock path set! To fix, add 'selectFolder' to your preload.js.",
          failedSelectFolder: "Failed to select folder: {{reason}}",
          openFileConfirm: "Do you want to open this file?",
          fileOpened: "Opening file...",
          failedToOpenFile: "Failed to open file",
          retryingDownload: "Retrying \"{{title}}\"",
          deleteConfirm: "Are you sure you want to delete",
          downloadDeleted: "Download deleted",
          urlCopied: "URL copied to clipboard",
          failedCopyUrl: "URL copy failed",
          failedLoadHistory: "Failed to load download history",
          failedLoadActiveDownloads: "Failed to load active downloads"
        },
        common: {
          openFile: "Open file?",
          proceed: "Proceed",
          cancel: "Cancel",
          errored: "Errored",
          broken: "Broken",
          unableRetry: "Unable to retry download",
          duplicate: "Duplicate file \"{{title}}\"",
          botVerificationComplete: "Bot Verification Complete, please proceed to retry download",
          ok: "OK",
        },
        downloads: {
          quality: "Quality",
          format: "Format",
          audioBitrate: "Audio Bitrate",
          title: "Active Downloads",
          subtitle: "Track active downloads and their progress.",
          noActive: "No active downloads",
          startNewDownload: "Start a new download to see progress here.",
          completedDownloading: "Completed downloading \"{{title}}\"",
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
          queueing: "Queueing...",
          download: "Download",
          downloadVideos: "Download {{count}} Videos",
          addedToQueue: "Downloads added to queue",
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
          starting: "Starting...",
          download: "Download",
          addedToQueue: "Video added to download queue",
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
          results: "Results",
          videos: "videos"
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
          downloads: "Downloading",
          history: "History",
          settings: "Settings",
          help: "Help"
        },
        contextMenu: {
          openFile: "Preview",
          openFolder: "Open in Folder",
          copyUrl: "Copy URL",
          openInYt: "Open in YouTube",
          copyTitle: "Copy Title",
          share: "Share",
          retry: "Retry Download",
          delete: "Delete",
          properties: "{{type}} properties",
          messages: {
            fileOpened: "File opened successfully",
            failedOpenFile: "Failed to open file",
            fileDeleted: "File deleted successfully",
            failedDeleteFile: "Failed to delete file",
            copiedToClipboard: "Copied to clipboard",
            failedCopyToClipboard: "Failed to copy to clipboard",
            failedOpenYtUrl: "Failed to open link in browser",
            openingYtUrl: "Opening link in browser...",
          }
        },
        database: {
          deleteFailed: "Failed to clear download(s) from database",
        },
        itemProperties: {
          title: "Item Properties",
          operationFailed: "Operation Failed",
          locations: "Locations",
          sourceURL: "Source URL",
          localDestination: "Local Destination",
          technicalSpecs: "Technical Specs",
          internalID: "Internal ID",
          dateAdded: "Date Added",
          totalSize: "Total Size",
          mediaFormat: "Media Format",
          requestedQuality: "Requested Quality",
          contentType: "Content Type",
          calculating: "Calculating...",
          auto: "Auto",
          playlistAssociation: "Playlist Association",
          extractedFromPlaylist: "Extracted from Playlist",
          playlistItems: "Playlist Items",
          copyID: "Copy ID",
          openDirectory: "Open Directory",
          unknownChannel: "Unknown Channel"
        },
        ytDlpErrors: {
          botVerification: "Verification Required: Open this video in your browser for a few seconds to solve the security check, then try again.",
          formatUnavailable: "Format not available. Try a different quality or format.",
          videoUnavailable: "Video is unavailable or has been removed.",
          privateVideo: "This video is private.",
          ageRestricted: "This video is age-restricted.",
          directoryMissing: "Output directory does not exist.",
          geoBlocked: "Access denied. Video may be geo-blocked.",
          notFound: "Video not found.",
          networkFailed: "Network connection failed.",
          playlistEmpty: "The playlist contains no videos."
        }
      }
    },
    hi
  },
});
