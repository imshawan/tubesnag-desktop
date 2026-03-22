import {VIDEO_QUALITIES} from "@/lib/ytdlp/constants";
import {SettingsState} from "@/store/slices/settings-slice";

enum AppSettingsKeys {
	DOWNLOAD_QUALITY = "downloadQuality",
	DOWNLOAD_PATH = "downloadPath",
	AUTO_START = "autoStart",
	SAVE_PLAYLIST_FOLDERS = "savePlaylistFolders",
	ITEMS_PER_PAGE = "itemsPerPage",
	RECENT_ITEMS_PER_PAGE = "recentItemsPerPage"
}

const getInitialDownloadQuality = (): QualityType => {
	const supportedQualities = VIDEO_QUALITIES.map(q => q.id);
	const quality: QualityType = localStorage.getItem(AppSettingsKeys.DOWNLOAD_QUALITY) as QualityType;
	if (!quality || !supportedQualities.includes(quality)) {
		return "best";
	}

	return quality;
}

const getDownloadPath = () => {
	const downloadPath = localStorage.getItem(AppSettingsKeys.DOWNLOAD_PATH);
	if (!downloadPath) {
		return "./";
	}

	return downloadPath;
}

const parseBooleanFromLocalstorage = (key: string): boolean => {
	const value = localStorage.getItem(key);
	if (!value) {
		return true;
	}

	try {
		return JSON.parse(value.toString().toLowerCase().trim());
	} catch {
		return true;
	}
}

const parseNumberFromLocalstorage = (key: string, defaultValue: number): number => {
	const value = localStorage.getItem(key);
	if (!value) {
		return defaultValue;
	}

	try {
		const parsed = Number.parseInt(value, 10);
		return Number.isNaN(parsed) ? defaultValue : parsed;
	} catch {
		return defaultValue;
	}
}

export const resolveAppInitialSettings = (): SettingsState => {
	return {
		quality: getInitialDownloadQuality(),
		downloadPath: getDownloadPath(),
		autoStart: parseBooleanFromLocalstorage(AppSettingsKeys.AUTO_START),
		savePlaylistFolders: parseBooleanFromLocalstorage(AppSettingsKeys.SAVE_PLAYLIST_FOLDERS),
		itemsPerPage: parseNumberFromLocalstorage(AppSettingsKeys.ITEMS_PER_PAGE, 5),
		recentItemsPerPage: parseNumberFromLocalstorage(AppSettingsKeys.RECENT_ITEMS_PER_PAGE, 5)
	}
}

export const saveDownloadQuality = (quality: QualityType): void => {
	localStorage.setItem(AppSettingsKeys.DOWNLOAD_QUALITY, quality);
}

export const saveDownloadPath = (path: string): void => {
	localStorage.setItem(AppSettingsKeys.DOWNLOAD_PATH, path);
}

export const saveAutoStart = (autoStart: boolean): void => {
	localStorage.setItem(AppSettingsKeys.AUTO_START, String(autoStart));
}

export const saveSavePlaylistFolders = (save: boolean): void => {
	localStorage.setItem(AppSettingsKeys.SAVE_PLAYLIST_FOLDERS, String(save));
}

export const saveItemsPerPage = (itemsPerPage: number): void => {
	localStorage.setItem(AppSettingsKeys.ITEMS_PER_PAGE, String(itemsPerPage));
}

export const saveRecentItemsPerPage = (recentItemsPerPage: number): void => {
	localStorage.setItem(AppSettingsKeys.RECENT_ITEMS_PER_PAGE, String(recentItemsPerPage));
}