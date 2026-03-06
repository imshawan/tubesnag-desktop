import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface AppState {
  appVersion: string;
  activeTab: string;
  activeDialog: "single" | "bulk" | "playlist" | null;
  searchOpen: boolean;
  itemsPerPage: number;
  historySearch: string;
  historyFilter: string;
  storage: {
    used: string;
    total: string;
    percentage: number;
  };
}

const initialState: AppState = {
  appVersion: "0.0.0",
  activeTab: "dashboard",
  activeDialog: null,
  searchOpen: false,
  itemsPerPage: 5,
  historySearch: "",
  historyFilter: "all",
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
    setActiveDialog: (state, action: PayloadAction<"single" | "bulk" | "playlist" | null>) => {
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
    setHistorySearch: (state, action: PayloadAction<string>) => {
      state.historySearch = action.payload;
    },
    setHistoryFilter: (state, action: PayloadAction<string>) => {
      state.historyFilter = action.payload;
    },
    setStorage: (state, action: PayloadAction<{ used: string; total: string; percentage: number }>) => {
      state.storage = action.payload;
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
  setHistorySearch,
  setHistoryFilter,
  setStorage,
} = appSlice.actions;

export default appSlice.reducer;
