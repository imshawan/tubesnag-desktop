import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface SettingsState {
  quality: string;
  downloadPath: string;
  autoStart: boolean;
}

const initialState: SettingsState = {
  quality: localStorage.getItem("downloadQuality") || "best",
  downloadPath: localStorage.getItem("downloadPath") || "./downloads",
  autoStart: localStorage.getItem("autoStart") === "true",
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
  },
});

export const { setQuality, setDownloadPath, setAutoStart } = settingsSlice.actions;

export default settingsSlice.reducer;
