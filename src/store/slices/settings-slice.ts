import {createSlice, PayloadAction} from "@reduxjs/toolkit";
import {resolveAppInitialSettings} from "@/lib/utils/app";

export interface SettingsState {
	quality: QualityType;
	downloadPath: string;
	autoStart: boolean;
	savePlaylistFolders: boolean;
	itemsPerPage: number;
	recentItemsPerPage: number;
}

const initialState: SettingsState = resolveAppInitialSettings();

const settingsSlice = createSlice({
	name: "settings",
	initialState,
	reducers: {
		setQuality: (state, action: PayloadAction<QualityType>) => {
			state.quality = action.payload;
		},
		setDownloadPath: (state, action: PayloadAction<string>) => {
			state.downloadPath = action.payload;
		},
		setAutoStart: (state, action: PayloadAction<boolean>) => {
			state.autoStart = action.payload;
		},
		setSavePlaylistFolders: (state, action: PayloadAction<boolean>) => {
			state.savePlaylistFolders = action.payload;
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