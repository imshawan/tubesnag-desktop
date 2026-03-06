import { configureStore } from "@reduxjs/toolkit";
import appReducer from "./slices/app-slice";
import settingsReducer from "./slices/settings-slice";
import downloadsReducer from "./slices/downloads-slice";

export const store = configureStore({
  reducer: {
    app: appReducer,
    settings: settingsReducer,
    downloads: downloadsReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
