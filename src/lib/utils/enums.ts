
export enum AppSettingsKeys {
	DOWNLOAD_QUALITY = "downloadQuality",
	DOWNLOAD_PATH = "downloadPath",
	AUTO_START = "autoStart",
	SAVE_PLAYLIST_FOLDERS = "savePlaylistFolders",
	ITEMS_PER_PAGE = "itemsPerPage",
	RECENT_ITEMS_PER_PAGE = "recentItemsPerPage"
}

export enum Databases {
	COMPLETED_DOWNLOADS = 'completed_downloads',
	ACTIVE_DOWNLOADS = 'active_downloads'
}

export enum DownloadStatus {
	Pending = "pending",
	Downloading = "downloading",
	Completed = "completed",
	Failed = "failed",
	Duplicate = "duplicate",
	DownloadingAudioTrack = "downloading_audio_track",
	MergingFormats = "merging_formats",
}

export enum AudioPartDownloadStatus {
	Pending = "pending",
	Downloading = "downloading",
	Completed = "completed",
	Failed = "failed",
	Unknown = "unknown",
}

export enum QualityType {
	Best = "best",
	K8 = "8k",
	K4 = "4k",
	P1440 = "1440p",
	P1080 = "1080p",
	P720 = "720p",
	P480 = "480p",
	P360 = "360p",
	P240 = "240p",
	P144 = "144p",
	Audio = "audio",
	Unknown = "unknown",
}