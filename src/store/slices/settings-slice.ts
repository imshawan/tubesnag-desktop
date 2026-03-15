import {createSlice, PayloadAction} from "@reduxjs/toolkit";

export interface SettingsState {
	quality: string;
	downloadPath: string;
	autoStart: boolean;
	savePlaylistFolders: boolean;
	itemsPerPage: number;
	recentItemsPerPage: number;
}

const initialState: SettingsState = {
	quality: localStorage.getItem("downloadQuality") || "best",
	downloadPath: localStorage.getItem("downloadPath") || "./",
	autoStart: localStorage.getItem("autoStart") === "true",
	savePlaylistFolders: localStorage.getItem("savePlaylistFolders") === "true",
	itemsPerPage: 5,
	recentItemsPerPage: 5,
};

const settingsSlice = createSlice({
	name: "settings",
	initialState,
	reducers: {
		setQuality: (state, action: PayloadAction<string>) => {
			state.quality = action.payload;
			localStorage.setItem("downloadQuality", action.payload);
		},
		setDownloadPath: (state, action: PayloadAction<string>) => {
			state.downloadPath = action.payload;
			localStorage.setItem("downloadPath", action.payload);
		},
		setAutoStart: (state, action: PayloadAction<boolean>) => {
			state.autoStart = action.payload;
			localStorage.setItem("autoStart", action.payload.toString());
		},
		setSavePlaylistFolders: (state, action: PayloadAction<boolean>) => {
			state.savePlaylistFolders = action.payload;
			localStorage.setItem("savePlaylistFolders", action.payload.toString());
		},
		setItemsPerPage: (state, action: PayloadAction<number>) => {
			state.itemsPerPage = action.payload;
		},
		setRecentItemsPerPage: (state, action: PayloadAction<number>) => {
			state.recentItemsPerPage = action.payload;
		},
	},
});

export const {
	setQuality,
	setDownloadPath,
	setAutoStart,
	setSavePlaylistFolders,
	setRecentItemsPerPage,
	setItemsPerPage
} = settingsSlice.actions;

export default settingsSlice.reducer;

export const selectSetSavePlaylistFolders = (state: { settings: SettingsState }) => state.settings.savePlaylistFolders;
export const selectAutoStart = (state: { settings: SettingsState }) => state.settings.autoStart;
export const selectDownloadPath = (state: { settings: SettingsState }) => state.settings.downloadPath;
export const selectQuality = (state: { settings: SettingsState }) => state.settings.quality;
export const selectItemsPerPage = (state: { settings: SettingsState }) => state.settings.itemsPerPage;
export const selectRecentItemsPerPage = (state: { settings: SettingsState }) => state.settings.recentItemsPerPage;