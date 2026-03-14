import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface SettingsState {
  quality: string;
  downloadPath: string;
  autoStart: boolean;
  savePlaylistFolders: boolean;
}

const initialState: SettingsState = {
  quality: localStorage.getItem("downloadQuality") || "best",
  downloadPath: localStorage.getItem("downloadPath") || "./downloads",
  autoStart: localStorage.getItem("autoStart") === "true",
  savePlaylistFolders: localStorage.getItem("savePlaylistFolders") === "true",
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
  },
});

export const { setQuality, setDownloadPath, setAutoStart, setSavePlaylistFolders } = settingsSlice.actions;

export default settingsSlice.reducer;

export const selectSetSavePlaylistFolders = (state: { settings: SettingsState }) => state.settings.savePlaylistFolders;
export const selectAutoStart = (state: { settings: SettingsState }) => state.settings.autoStart;
export const selectDownloadPath = (state: { settings: SettingsState }) => state.settings.downloadPath;
export const selectQuality = (state: { settings: SettingsState }) => state.settings.quality;