import os from "os";
import {app, dialog} from "electron";
import fs from "fs/promises";
import * as path from "path";
import {DEPENDENCY_CONFIG} from "@/constants";
import fsSync from "fs";
import {ipcContext} from "@/ipc/context";
import {downloadFile} from "@/utils/downloader";
import IpcMainInvokeEvent = Electron.IpcMainInvokeEvent;
import {sanitizeFilename, sizeToBytes} from "@/utils/download";

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
    const {url, outputPath, quality, format, downloadId} = options;
    const userDataPath = app.getPath('userData');
    const thumbnailPath = path.join(userDataPath, 'Thumbnails');
    const ytdlpPath = path.join(userDataPath, 'ytdlp');
    const ytDlpExe = path.join(ytdlpPath, getYtDlpConfig().filename);
    const mainWindow = ipcContext.mainWindow;
    const tempFile = `.channel_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;

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
        '--convert-thumbnail', 'webp',
        '-o', `thumbnail:${path.join(thumbnailPath, downloadId + '.%(ext)s')}`,
        '-o', path.join(outputPath, '%(title)s.%(ext)s'),
        url
    ];

    return new Promise((resolve, reject) => {
        const {spawn} = require('child_process');
        const child = spawn(ytDlpExe, args, {stdio: ['ignore', 'pipe', 'pipe']});
        let title = '';
        let channel = '';
        let lastProgress = 0;
        const dataSentState = {
            metadata: false,
            thumbnail: false,
            duplicateStatus: false,
            size: false,
            complete: false
        };
        let thumbnail = path.join(thumbnailPath, downloadId + ".webp");

        child.stdout.on('data', (data: Buffer) => {
            const text = data.toString();
            const lines = text.split('\\n');

            if (fsSync.existsSync(tempFile) && !channel.trim().length) {
                channel = fsSync.readFileSync(tempFile, "utf8").trim();
            }

            lines.forEach((line: string) => {
                console.log('[yt-dlp]', line);

                const destMatch = line.match(/\[download\]\s+Destination:\s+(.+?)\s*$/);
                if (destMatch && !dataSentState.metadata) {
                    title = destMatch[1].trim();
                    mainWindow?.webContents.send('ytdlp:progress', {
                        type: 'metadata',
                        data: {
                            title,
                            channel: channel || 'Unknown',
                            quality: quality,
                            size: 0,
                            downloadId
                        }
                    });
                    dataSentState.metadata = true;
                }

                const sizeMatch = line.match(/of\s+([\d.]+\s*[KMGT]iB|[\d.]+\s*[KMGT]B|[\d.]+\s*B)/);
                if (sizeMatch && !dataSentState.size) {
                    const sizeBytes = sizeToBytes(sizeMatch[1]);
                    mainWindow?.webContents.send('ytdlp:progress', {
                        type: 'metadata',
                        data: {
                            title,
                            channel: channel || 'Unknown',
                            quality: quality,
                            size: sizeBytes,
                            downloadId
                        }
                    });
                    dataSentState.size = true;
                }

                if (line.includes('has already been downloaded') && !dataSentState.duplicateStatus) {
                    const dupMatch = line.match(/\[download\]\s+(.+?)\s+has already been downloaded/);
                    let dupFilename;
                    if (dupMatch) {
                        dupFilename = sanitizeFilename(dupMatch[1].trim());
                    }

                    const filename = dupFilename || 'unknown';
                    const files = fsSync.readdirSync(outputPath);
                    const sanitizedFiles = files.map(f => ({original: f, sanitized: sanitizeFilename(f)}));
                    const fileMatch = sanitizedFiles.find(f => f.sanitized.includes(filename.split('.')[0]));
                    const file = fileMatch?.original;

                    let metadata: any = {filename};
                    if (file) {
                        const filePath = path.join(outputPath, file);
                        const stats = fsSync.statSync(filePath);
                        metadata = {
                            filename,
                            title: file,
                            size: stats.size,
                            thumbnail,
                            channel: channel || 'Unknown',
                            downloadId
                        };
                    }

                    mainWindow?.webContents.send('ytdlp:progress', {
                        type: 'duplicate',
                        data: metadata,
                        downloadId
                    });

                    dataSentState.duplicateStatus = true;
                }

                const progressMatch = line.match(/\[\s*download\s*\]\s+(\d+(?:\.\d+)?)%/);
                if (progressMatch) {
                    const progress = Math.min(100, Math.max(0, parseFloat(progressMatch[1])));
                    if (Math.abs(progress - lastProgress) >= 1) {
                        lastProgress = progress;
                        mainWindow?.webContents.send('ytdlp:progress', {
                            type: 'progress',
                            progress: Math.round(progress),
                            downloadId
                        });
                    }
                }
            });

            child.stderr.on('data', (data: Buffer) => {
                console.error('[yt-dlp stderr]', data.toString());
            });

            child.on('close', (code: number) => {
                if (dataSentState.complete) return resolve({success: true});

                console.log('[yt-dlp] Process closed with code:', code);
                if (fsSync.existsSync(tempFile)) {
                    fsSync.unlinkSync(tempFile);
                }
                if (code === 0 || code === 1) {
                    const data: Record<string, any> = {status: 'completed', progress: 100, thumbnail, downloadId};
                    if (title) {
                        data.title = title;
                    }

                    mainWindow?.webContents.send('ytdlp:progress', {
                        type: 'complete',
                        data
                    });
                    dataSentState.complete = true;
                    resolve({success: true});
                } else {
                    reject(new Error(`Download failed with code ${code}`));
                }
            });

            child.on('error', (err: Error) => {
                console.error('yt-dlp spawn error:', err);
                reject(err);
            });
        });
    });
}

export const getPlaylistVideos: (
    event: Electron.IpcMainInvokeEvent, options: any
) => Promise<PlaylistInfo> = async (event: IpcMainInvokeEvent, options: any) => {
    const {url, reverse, playlistId} = options;
    const userDataPath = app.getPath('userData');
    const ytdlpPath = path.join(userDataPath, 'ytdlp');
    const ytDlpExe = path.join(ytdlpPath, getYtDlpConfig().filename);
    const thumbnailPath = path.join(userDataPath, 'Thumbnails');

    return new Promise((resolve, reject) => {
        const {spawn} = require('child_process');
        const outputFile = path.join(userDataPath, `.playlist_${Date.now()}.txt`);
        const metaFile = path.join(userDataPath, `.playlist_meta_${Date.now()}.txt`);
        const args = [
            '--flat-playlist',
            '--print-to-file', '%(webpage_url)s',
            outputFile,
            '--print-to-file', '%(playlist_title)s|%(uploader)s',
            metaFile,
            '--write-thumbnail',
            '--convert-thumbnail', 'webp',
            '-o', `thumbnail:${path.join(thumbnailPath, playlistId + '.%(ext)s')}`,
            url
        ];

        const child = spawn(ytDlpExe, args, {stdio: ['ignore', 'pipe', 'pipe']});

        child.on('close', (code: number) => {
            try {
                if (fsSync.existsSync(outputFile)) {
                    const content = fsSync.readFileSync(outputFile, 'utf8');
                    let videoUrls = content.split('\n').filter((line: string) => line.trim().length > 0);

                    let metadata = {title: 'Playlist', channel: 'Unknown', thumbnail: ''};
                    if (fsSync.existsSync(metaFile)) {
                        const metaContent = fsSync.readFileSync(metaFile, 'utf8').trim();
                        const [title, channel] = metaContent.split('|');
                        metadata.title = title || 'Playlist';
                        metadata.channel = channel || 'Unknown';
                        fsSync.unlinkSync(metaFile);
                    }

                    const thumbnailFile = path.join(thumbnailPath, playlistId + '.webp');
                    if (fsSync.existsSync(thumbnailFile)) {
                        metadata.thumbnail = thumbnailFile;
                    }

                    if (reverse) {
                        videoUrls = videoUrls.reverse();
                    }

                    fsSync.unlinkSync(outputFile);
                    resolve({videoUrls, ...metadata});
                } else {
                    reject(new Error('Failed to extract playlist videos'));
                }
            } catch (error) {
                if (fsSync.existsSync(outputFile)) {
                    fsSync.unlinkSync(outputFile);
                }
                if (fsSync.existsSync(metaFile)) {
                    fsSync.unlinkSync(metaFile);
                }
                reject(error);
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
