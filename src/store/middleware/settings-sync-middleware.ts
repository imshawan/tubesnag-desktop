import {Middleware} from "@reduxjs/toolkit";
import {
	setAutoStart,
	setDownloadPath,
	setItemsPerPage,
	setQuality,
	setRecentItemsPerPage,
	setSavePlaylistFolders
} from "@/store/slices/settings-slice";
import {
	saveAutoStart,
	saveDownloadPath,
	saveDownloadQuality,
	saveItemsPerPage,
	saveRecentItemsPerPage,
	saveSavePlaylistFolders
} from "@/lib/utils/app";

export const settingsSyncMiddleware: Middleware = (store) => (next) => async (action) => {
	const result = next(action);

	if (setQuality.match(action)) {
		try {
			const quality = action.payload;
			saveDownloadQuality(quality);
		} catch (error) {
			console.error('Failed to save download quality to localStorage:', error);
		}
	}

	if (setDownloadPath.match(action)) {
		try {
			const downloadPath = action.payload;
			saveDownloadPath(downloadPath);
		} catch (error) {
			console.error('Failed to save download path to localStorage:', error);
		}
	}

	if (setAutoStart.match(action)) {
		try {
			const autoStart = action.payload;
			saveAutoStart(autoStart);
		} catch (error) {
			console.error('Failed to save auto start setting to localStorage:', error);
		}
	}

	if (setSavePlaylistFolders.match(action)) {
		try {
			const save = action.payload;
			saveSavePlaylistFolders(save);
		} catch (error) {
			console.error('Failed to save save playlist folders setting to localStorage:', error);
		}
	}

	if (setItemsPerPage.match(action)) {
		try {
			const itemsPerPage = action.payload;
			saveItemsPerPage(itemsPerPage);
		} catch (error) {
			console.error('Failed to save items per page setting to localStorage:', error);
		}
	}

	if (setRecentItemsPerPage.match(action)) {
		try {
			const recentItemsPerPage = action.payload;
			saveRecentItemsPerPage(recentItemsPerPage);
		} catch (error) {
			console.error('Failed to save recent items per page setting to localStorage:', error);
		}
	}

	return result;
}