import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import pkg from "../../../package.json";

export interface AppState {
  appVersion: string;
  activeTab: string;
  activeDialog: DownloadType;
  searchOpen: boolean;
  itemsPerPage: number;
  recentItemsPerPage: number;
  historySearch: string;
  historyFilter: string;
  historyTypeFilter: string;
  setupComplete: boolean;
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
  itemsPerPage: 5,
  recentItemsPerPage: 5,
  historySearch: "",
  historyFilter: "all",
  historyTypeFilter: "all",
  setupComplete: false,
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
    setItemsPerPage: (state, action: PayloadAction<number>) => {
      state.itemsPerPage = action.payload;
    },
    setRecentItemsPerPage: (state, action: PayloadAction<number>) => {
      state.recentItemsPerPage = action.payload;
    },
    setHistorySearch: (state, action: PayloadAction<string>) => {
      state.historySearch = action.payload;
    },
    setHistoryFilter: (state, action: PayloadAction<string>) => {
      state.historyFilter = action.payload;
    },
    setHistoryTypeFilter: (state, action: PayloadAction<string>) => {
      state.historyTypeFilter = action.payload;
    },
    setStorage: (state, action: PayloadAction<{ used: string; total: string; percentage: number }>) => {
      state.storage = action.payload;
    },
    setSetupComplete: (state, action: PayloadAction<boolean>) => {
      state.setupComplete = action.payload;
    },
  },
});

export const {
  setAppVersion,
  setActiveTab,
  setActiveDialog,
  setSearchOpen,
  toggleSearchOpen,
  setItemsPerPage,
  setRecentItemsPerPage,
  setHistorySearch,
  setHistoryFilter,
  setHistoryTypeFilter,
  setStorage,
  setSetupComplete,
} = appSlice.actions;

export default appSlice.reducer;

export const selectActiveTab = (state: { app: AppState }) => state.app.activeTab;
export const selectActiveDialog = (state: { app: AppState }) => state.app.activeDialog;
export const selectSearchOpen = (state: { app: AppState }) => state.app.searchOpen;
export const selectItemsPerPage = (state: { app: AppState }) => state.app.itemsPerPage;
export const selectHistorySearch = (state: { app: AppState }) => state.app.historySearch;
export const selectHistoryFilter = (state: { app: AppState }) => state.app.historyFilter;
export const selectHistoryTypeFilter = (state: { app: AppState }) => state.app.historyTypeFilter;
export const selectStorage = (state: { app: AppState }) => state.app.storage;
export const selectSetupComplete = (state: { app: AppState }) => state.app.setupComplete;
export const selectDownloadPath = (state: { settings: { downloadPath: string } }) => state.settings.downloadPath;
