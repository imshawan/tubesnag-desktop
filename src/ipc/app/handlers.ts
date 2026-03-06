import os from "os";
import {app, dialog} from "electron";
import fs from "fs/promises";
import * as path from "path";
import {DEPENDENCY_CONFIG} from "@/constants";
import fsSync from "fs";
import {ipcContext} from "@/ipc/context";
import {downloadFile} from "@/utils/downloader";
import IpcMainInvokeEvent = Electron.IpcMainInvokeEvent;

export const getYtDlpConfig = () => {
    const platform = process.platform;
    return DEPENDENCY_CONFIG.ytDlp[platform === 'win32' ? 'win32' : 'unix'];
}

export const getFfmpegConfig = () => {
    const platform = process.platform;
    return DEPENDENCY_CONFIG.ffmpeg[platform as 'win32' | 'linux' | 'darwin'];
}

export const checkDependencies = async () => {
    const userDataPath = app.getPath('userData');
    const dbPath = path.join(userDataPath, 'db');
    const ytdlpPath = path.join(userDataPath, 'ytdlp');
    const ffmpegPath = path.join(userDataPath, 'ffmpeg');

    const ytDlpConfig = getYtDlpConfig();
    const ffmpegConfig = getFfmpegConfig();
    return {
        db: fsSync.existsSync(dbPath),
        ytdlp: fsSync.existsSync(path.join(ytdlpPath, ytDlpConfig.filename)),
        // ytdlp: false,
        ffmpeg: fsSync.existsSync(path.join(ffmpegPath, ffmpegConfig.filename))
    };
}

export const installDependencies = async () => {
    const userDataPath = app.getPath('userData');
    const dbPath = path.join(userDataPath, 'db');
    const ytdlpPath = path.join(userDataPath, 'ytdlp');
    const ffmpegPath = path.join(userDataPath, 'ffmpeg');

    const platform = process.platform;
    const mainWindow = ipcContext.mainWindow;
    const sendProgress = (dependency: string, progress: number) => {
        mainWindow?.webContents.send('install-progress', {dependency, progress});
    };

    if (!fsSync.existsSync(dbPath)) {
        fsSync.mkdirSync(dbPath, {recursive: true});
    }
    sendProgress('db', 100);

    if (!fsSync.existsSync(ytdlpPath)) {
        fsSync.mkdirSync(ytdlpPath, {recursive: true});
    }
    if (!fsSync.existsSync(ffmpegPath)) {
        fsSync.mkdirSync(ffmpegPath, {recursive: true});
    }

    // Download yt-dlp
    try {
        const ytDlpConfig = getYtDlpConfig();
        sendProgress('ytdlp', 0);
        await downloadFile(ytDlpConfig.url, path.join(ytdlpPath, ytDlpConfig.filename), (p) => sendProgress('ytdlp', p));
        if (platform !== 'win32') {
            fsSync.chmodSync(path.join(ytdlpPath, ytDlpConfig.filename), '755');
        }
        sendProgress('ytdlp', 100);
    } catch (error) {
        console.error('Failed to download yt-dlp:', error);
        sendProgress('ytdlp', -1); // error
    }

    // Copy ffmpeg-static binary
    try {
        sendProgress('ffmpeg', 0);
        const ffmpegBinary = require('ffmpeg-static');
        const ffmpegConfig = getFfmpegConfig();
        fsSync.copyFileSync(ffmpegBinary, path.join(ffmpegPath, ffmpegConfig.filename));
        if (process.platform !== 'win32') {
            fsSync.chmodSync(path.join(ffmpegPath, ffmpegConfig.filename), '755');
        }
        sendProgress('ffmpeg', 100);
    } catch (error) {
        console.error('Failed to setup ffmpeg:', error);
        sendProgress('ffmpeg', -1);
    }

    const ytDlpConfig = getYtDlpConfig();
    const ffmpegConfig = getFfmpegConfig();
    return {
        db: fsSync.existsSync(dbPath),
        ytdlp: fsSync.existsSync(path.join(ytdlpPath, ytDlpConfig.filename)),
        ffmpeg: fsSync.existsSync(path.join(ffmpegPath, ffmpegConfig.filename))
    };
}

export const getDiskUsage = async (event: IpcMainInvokeEvent, downloadPath: any) => {
    try {
        const statsPath = downloadPath || os.homedir();
        const stats = await fs.statfs(statsPath);

        const total = stats.bsize * stats.blocks;
        const free = stats.bsize * stats.bfree;
        const used = total - free;

        return {
            total: (total / (1024 ** 3)).toFixed(1),
            used: (used / (1024 ** 3)).toFixed(1),
            percentage: Math.round((used / total) * 100)
        };
    } catch (error) {
        console.error("Failed to get disk usage:", error);
        return null;
    }
}

export const selectFolder = async () => {
    const {canceled, filePaths} = await dialog.showOpenDialog({
        properties: ['openDirectory']
    })
    if (canceled) {
        return null
    } else {
        return filePaths[0]
    }
}

export const getPlatform = () => {
    return process.platform;
}

export const getAppVersion = () => {
    return app.getVersion();
}