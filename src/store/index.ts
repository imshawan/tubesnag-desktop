import {configureStore} from "@reduxjs/toolkit";
import appReducer from "./slices/app-slice";
import settingsReducer from "./slices/settings-slice";
import downloadsReducer from "./slices/downloads-slice";
import activeDownloadsReducer from "./slices/active-downloads-slice";
import {databaseSyncMiddleware} from "@/store/middleware/database-sync-middleware";

export const store = configureStore({
    reducer: {
        app: appReducer,
        settings: settingsReducer,
        downloads: downloadsReducer,
        activeDownloads: activeDownloadsReducer,
    },
    middleware: getDefaultMiddleware =>
        getDefaultMiddleware({
            serializableCheck: false,
        }).concat(databaseSyncMiddleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
