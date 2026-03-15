import path from "node:path";
import { fileURLToPath } from "node:url";
import { app, BrowserWindow } from "electron";
import { ipcMain } from "electron/main";
import {
  installExtension,
  REACT_DEVELOPER_TOOLS,
} from "electron-devtools-installer";
import { UpdateSourceType, updateElectronApp } from "update-electron-app";
import { ipcContext } from "@/ipc/context";
import { IPC_CHANNELS } from "./constants";
import IpcMainEvent = Electron.IpcMainEvent;
import {
  checkDependencies, getDiskUsage, installDependencies, selectFolder, getPlatform, getAppVersion, downloadWithYtdlp,
  fileToDataUrl, getPlaylistVideos, openFile, deleteDownloadedResources, deleteDownloadedPlaylistResources, openFolder
} from "@/ipc/app/handlers";
import * as dbHandlers from "@/ipc/database/handlers";
import {initDatabase} from "@/ipc/database";
import {
  deleteActiveDownloadsVideoFromPlaylist,
  deleteCompletedDownloadsVideoFromPlaylist
} from "@/ipc/database/handlers";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const inDevelopment = process.env.NODE_ENV === "development";

function createWindow() {
  const preload = path.join(__dirname, "preload.js");
  const iconPath = inDevelopment
      ? path.join(__dirname, "../../assets/icon.png")
      : path.join(__dirname, "../assets/icon.png");
  const mainWindow = new BrowserWindow({
    width: 1100,
    height: 700,
    icon: iconPath,
    webPreferences: {
      devTools: inDevelopment,
      contextIsolation: true,
      nodeIntegration: true,
      nodeIntegrationInSubFrames: false,
      preload,
    },
    titleBarStyle: process.platform === "darwin" ? "hiddenInset" : "hidden",
    trafficLightPosition:
      process.platform === "darwin" ? { x: 5, y: 5 } : undefined,
  });
  ipcContext.setMainWindow(mainWindow);

  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(
      path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`)
    );
  }
}

async function installExtensions() {
  try {
    const result = await installExtension(REACT_DEVELOPER_TOOLS);
    console.log(`Extensions installed successfully: ${result.name}`);
  } catch {
    console.error("Failed to install extensions");
  }
}

function checkForUpdates() {
  updateElectronApp({
    updateSource: {
      type: UpdateSourceType.ElectronPublicUpdateService,
      repo: "imshawan/tubesnag-desktop",
    },
  });
}

async function setupORPC() {
  const { rpcHandler } = await import("./ipc/handler");

  ipcMain.on(IPC_CHANNELS.START_ORPC_SERVER, (event: IpcMainEvent) => {
    const [serverPort] = event.ports;

    serverPort.start();
    rpcHandler.upgrade(serverPort);
  });
}

function setupIpcHandlers() {
  ipcMain.handle('dialog:selectFolder', selectFolder);

  ipcMain.handle('meta:get-disk-usage', getDiskUsage);
  ipcMain.handle('meta:get-ffmpeg-config', getDiskUsage);
  ipcMain.handle('meta:get-ytdlp-config', getDiskUsage);

  ipcMain.handle('setup:check-dependencies', checkDependencies);
  ipcMain.handle('setup:install-dependencies', installDependencies);
  
  ipcMain.handle('app:get-platform', getPlatform);
  ipcMain.handle('app:get-version', getAppVersion);
  ipcMain.handle('ytdlp:download', downloadWithYtdlp);


  ipcMain.handle('ytdlp:get-playlist-videos', getPlaylistVideos);

  ipcMain.handle('file:to-data-url', fileToDataUrl);
  ipcMain.handle('file:delete', deleteDownloadedResources);
  ipcMain.handle('file:delete-playlist', deleteDownloadedPlaylistResources);
  ipcMain.handle('file:open', openFile);
  ipcMain.handle('file:open-folder', openFolder);

  ipcMain.handle('db:create-active-download', dbHandlers.createActiveDownload);
  ipcMain.handle('db:get-active-downloads', dbHandlers.getActiveDownloads);
  ipcMain.handle('db:get-active-download-by-id', dbHandlers.getActiveDownloadById);
  ipcMain.handle('db:update-active-download', dbHandlers.updateActiveDownload);
  ipcMain.handle('db:delete-active-download', dbHandlers.deleteActiveDownload);
  ipcMain.handle('db:delete-all-active-downloads', dbHandlers.deleteAllActiveDownloads);

  ipcMain.handle('db:get-completed-downloads', dbHandlers.getCompletedDownloads);
  ipcMain.handle('db:get-completed-download-by-id', dbHandlers.getCompletedDownloadById);
  ipcMain.handle('db:delete-completed-download', dbHandlers.deleteCompletedDownload);
  ipcMain.handle('db:delete-all-completed-downloads', dbHandlers.deleteAllCompletedDownloads);

  ipcMain.handle('db:delete-active-downloads-video-from-playlist', dbHandlers.deleteActiveDownloadsVideoFromPlaylist);
  ipcMain.handle('db:delete-completed-downloads-video-from-playlist', dbHandlers.deleteCompletedDownloadsVideoFromPlaylist);

  ipcMain.handle('db:move-active-to-completed', dbHandlers.moveActiveToCompleted);

}

app.whenReady().then(async () => {
  try {
    setupIpcHandlers();
    createWindow();
    await installExtensions();
    checkForUpdates();
    await setupORPC();
    await initDatabase();
  } catch (error) {
    console.error("Error during app initialization:", error);
  }
});

//osX only
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
//osX only ends
