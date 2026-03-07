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

const sizeToBytes = (sizeStr: string): number => {
    const match = sizeStr.match(/([\\d.]+)\\s*([KMGT]i?B|B)/);
    if (!match) return 0;
    
    const value = parseFloat(match[1]);
    const unit = match[2];
    
    const multipliers: Record<string, number> = {
        'B': 1,
        'KiB': 1024,
        'KB': 1000,
        'MiB': 1024 ** 2,
        'MB': 1000 ** 2,
        'GiB': 1024 ** 3,
        'GB': 1000 ** 3,
        'TiB': 1024 ** 4,
        'TB': 1000 ** 4,
    };
    
    return Math.round(value * (multipliers[unit] || 1));
};

export const checkDependencies = async () => {
    const userDataPath = app.getPath('userData');
    const dbPath = path.join(userDataPath, 'db');
    const ytdlpPath = path.join(userDataPath, 'ytdlp');
    const ffmpegPath = path.join(userDataPath, 'ytdlp');

    const ytDlpConfig = getYtDlpConfig();
    const ffmpegConfig = getFfmpegConfig();
    return {
        db: fsSync.existsSync(dbPath),
        ytdlp: fsSync.existsSync(path.join(ytdlpPath, ytDlpConfig.filename)),
        ffmpeg: fsSync.existsSync(path.join(ffmpegPath, ffmpegConfig.filename))
    };
}

export const installDependencies = async () => {
    const userDataPath = app.getPath('userData');
    const dbPath = path.join(userDataPath, 'db');
    const ytdlpPath = path.join(userDataPath, 'ytdlp');
    const ffmpegPath = path.join(userDataPath, 'ytdlp');

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
        sendProgress('ytdlp', -1);
    }

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

export const downloadWithYtdlp = async (event: IpcMainInvokeEvent, options: any) => {
    const { url, outputPath, quality, format } = options;
    const userDataPath = app.getPath('userData');
    const thumbnailPath = path.join(userDataPath, 'Thumbnails');
    const ytdlpPath = path.join(userDataPath, 'ytdlp');
    const ytDlpExe = path.join(ytdlpPath, getYtDlpConfig().filename);
    const mainWindow = ipcContext.mainWindow;
    const tempFile = `.channel_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    console.log("Options: ", options)

    const qualityMap: Record<string, string> = {
        best: 'best',
        high: 'best[height<=1080]',
        medium: 'best[height<=720]',
        low: 'best[height<=480]',
    };

    const formatMap: Record<string, string> = {
        mp4: 'best[ext=mp4]',
        mkv: 'best[ext=mkv]',
        webm: 'best[ext=webm]',
        mp3: 'bestaudio[ext=m4a]/bestaudio',
        wav: 'bestaudio[ext=wav]/bestaudio',
    };

    const selectedFormat = format && formatMap[format] ? formatMap[format] : qualityMap[quality];
    const args = [
        '-f', selectedFormat,
        '--print-to-file', '%(channel)s', tempFile,
        '--write-thumbnail',
        '-o', `thumbnail:${path.join(thumbnailPath, '%(title)s.%(ext)s')}`,
        '-o', path.join(outputPath, '%(title)s.%(ext)s'),
        url
    ];

    return new Promise((resolve, reject) => {
        const { spawn } = require('child_process');
        const child = spawn(ytDlpExe, args, { stdio: ['ignore', 'pipe', 'pipe'] });
        let title = '';
        let channel = '';
        let lastProgress = 0;
        let metadataSent = false;
        let thumbnail = '';

        child.stdout.on('data', (data: Buffer) => {
            const text = data.toString();
            const lines = text.split('\\n');

            if (fsSync.existsSync(tempFile) && !channel.trim().length) {
                channel = fsSync.readFileSync(tempFile, "utf8").trim();
            }

            lines.forEach((line: string) => {
                console.log('[yt-dlp]', line);

                const thumbMatch = line.match(/Writing video thumbnail \\d+ to: (.+)/);
                if (thumbMatch) {
                    thumbnail = path.join(thumbnailPath, thumbMatch[1].trim());
                }

                const destMatch = line.match(/\\[download\\]\\s+Destination:\\s+(.+)/);
                if (destMatch && !metadataSent) {
                    title = destMatch[1].trim();
                    metadataSent = true;
                    mainWindow?.webContents.send('ytdlp:progress', {
                        type: 'metadata',
                        data: {
                            title,
                            channel: channel || 'Unknown',
                            quality: quality,
                            size: 0
                        }
                    });
                }

                const sizeMatch = line.match(/of\\s+([\\d.]+\\s*[KMGT]i?B|[\\d.]+\\s*B)/);
                if (sizeMatch && metadataSent) {
                    const sizeBytes = sizeToBytes(sizeMatch[1]);
                    mainWindow?.webContents.send('ytdlp:progress', {
                        type: 'metadata',
                        data: {
                            title,
                            channel: channel || 'Unknown',
                            quality: quality,
                            size: sizeBytes
                        }
                    });
                }

                if (line.includes('has already been downloaded')) {
                    const dupMatch = line.match(/\[download\]\s+(.+?)\s+has already been downloaded/);
                    let dupFilename;
                    if (dupMatch) {
                        dupFilename = dupMatch[1].trim();
                    }

                    const filename = dupFilename || 'unknown';
                    const files = fsSync.readdirSync(outputPath);
                    const file = files.find(f => f.includes(filename.split('.')[0]));

                    let metadata: any = { filename };
                    if (file) {
                        const filePath = path.join(outputPath, file);
                        const stats = fsSync.statSync(filePath);
                        thumbnail = path.join(thumbnailPath, `${filename.split('.')[0]}.jpg`);
                        metadata = {
                            filename,
                            title: file,
                            size: stats.size,
                            thumbnail,
                            channel: channel || 'Unknown',
                        };
                    }
                    
                    mainWindow?.webContents.send('ytdlp:progress', {
                        type: 'duplicate',
                        data: metadata
                    });
                }

                const progressMatch = line.match(/\\[\\s*download\\s*\\]\\s+(\\d+(?:\\.\\d+)?)%/);
                if (progressMatch) {
                    const progress = Math.min(100, Math.max(0, parseFloat(progressMatch[1])));
                    if (Math.abs(progress - lastProgress) >= 1) {
                        lastProgress = progress;
                        mainWindow?.webContents.send('ytdlp:progress', {
                            type: 'progress',
                            progress: Math.round(progress)
                        });
                    }
                }
            });
        });

        child.stderr.on('data', (data: Buffer) => {
            console.error('[yt-dlp stderr]', data.toString());
        });

        child.on('close', (code: number) => {
            console.log('[yt-dlp] Process closed with code:', code);
            if (fsSync.existsSync(tempFile)) {
                fsSync.unlinkSync(tempFile);
            }
            if (code === 0 || code === 1) {
                mainWindow?.webContents.send('ytdlp:progress', {
                    type: 'complete',
                    data: { status: 'completed', progress: 100, thumbnail }
                });
                resolve({ success: true });
            } else {
                reject(new Error(`Download failed with code ${code}`));
            }
        });

        child.on('error', (err: Error) => {
            console.error('yt-dlp spawn error:', err);
            reject(err);
        });
    });
}

export const fileToDataUrl = async (event: IpcMainInvokeEvent, filePath: string) => {
    try {
        const fileBuffer = fsSync.readFileSync(filePath);
        const base64 = fileBuffer.toString('base64');
        const ext = filePath.split('.').pop()?.toLowerCase() || 'webp';
        return `data:image/${ext};base64,${base64}`;
    } catch (e) {
        console.error(e);
        return "";
    }
};
