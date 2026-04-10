import {createSlice, PayloadAction} from "@reduxjs/toolkit";
import pkg from "../../../package.json";
import { set } from "zod";

export interface AppState {
	appVersion: string;
	activeTab: string;
	activeDialog: DownloadType;
	searchOpen: boolean;
	historySearch: string;
	historyFilter: DownloadStatusFilter;
	historyTypeFilter: DownloadItemTypeFilter;
	setupComplete: boolean;
	stateSaving: boolean;
	stateSavingProgress: number;
	enableSelection: boolean;
	storage: {
		used: string;
		total: string;
		percentage: number;
	};
}

const initialState: AppState = {
	appVersion: pkg.version,
	activeTab: "dashboard",
	activeDialog: null,
	searchOpen: false,
	historySearch: "",
	historyFilter: "all",
	historyTypeFilter: "all",
	setupComplete: false,
	stateSaving: false,
	stateSavingProgress: 0,
	enableSelection: false,
	storage: {
		used: "0",
		total: "0",
		percentage: 0,
	},
};

const appSlice = createSlice({
	name: "app",
	initialState,
	reducers: {
		setAppVersion: (state, action: PayloadAction<string>) => {
			state.appVersion = action.payload;
		},
		setActiveTab: (state, action: PayloadAction<string>) => {
			state.activeTab = action.payload;
		},
		setActiveDialog: (state, action: PayloadAction<DownloadType>) => {
			state.activeDialog = action.payload;
		},
		setSearchOpen: (state, action: PayloadAction<boolean>) => {
			state.searchOpen = action.payload;
		},
		toggleSearchOpen: (state) => {
			state.searchOpen = !state.searchOpen;
		},
		setHistorySearch: (state, action: PayloadAction<string>) => {
			state.historySearch = action.payload;
		},
		setHistoryFilter: (state, action: PayloadAction<DownloadStatusFilter>) => {
			state.historyFilter = action.payload;
		},
		setHistoryTypeFilter: (state, action: PayloadAction<DownloadItemTypeFilter>) => {
			state.historyTypeFilter = action.payload;
		},
		setStorage: (state, action: PayloadAction<{ used: string; total: string; percentage: number }>) => {
			state.storage = action.payload;
		},
		setSetupComplete: (state, action: PayloadAction<boolean>) => {
			state.setupComplete = action.payload;
		},
		setStateSaving: (state, action: PayloadAction<boolean>) => {
			state.stateSaving = action.payload;
		},
		setStateSavingProgress: (state, action: PayloadAction<number>) => {
			if (action.payload > state.stateSavingProgress) {
				state.stateSavingProgress = action.payload;
			}
		},
		setEnableSelection: (state, action: PayloadAction<boolean>) => {
			state.enableSelection = action.payload;
		},
	},
});

export const {
	setAppVersion,
	setActiveTab,
	setActiveDialog,
	setSearchOpen,
	setEnableSelection,
	toggleSearchOpen,
	setHistorySearch,
	setHistoryFilter,
	setHistoryTypeFilter,
	setStorage,
	setStateSaving,
	setStateSavingProgress,
	setSetupComplete,
} = appSlice.actions;

export default appSlice.reducer;

export const selectActiveTab = (state: { app: AppState }) => state.app.activeTab;
export const selectActiveDialog = (state: { app: AppState }) => state.app.activeDialog;
export const selectSearchOpen = (state: { app: AppState }) => state.app.searchOpen;
export const selectHistorySearch = (state: { app: AppState }) => state.app.historySearch;
export const selectHistoryFilter = (state: { app: AppState }) => state.app.historyFilter;
export const selectHistoryTypeFilter = (state: { app: AppState }) => state.app.historyTypeFilter;
export const selectStorage = (state: { app: AppState }) => state.app.storage;
export const selectSetupComplete = (state: { app: AppState }) => state.app.setupComplete;
export const selectAppVersion = (state: { app: AppState }) => state.app.appVersion;
export const selectStateSaving = (state: { app: AppState }) => state.app.stateSaving;
export const selectStateSavingProgress = (state: { app: AppState }) => state.app.stateSavingProgress;
export const selectEnableSelection = (state: { app: AppState }) => state.app.enableSelection;