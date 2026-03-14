import os from "os";
import {app, dialog, shell} from "electron";
import fs from "fs/promises";
import * as path from "path";
import {audioFormats, DEPENDENCY_CONFIG, downloadQualityMap} from "@/constants";
import fsSync from "fs";
import * as child_process from "node:child_process";
import {ipcContext} from "@/ipc/context";
import {downloadFile} from "@/utils/downloader";
import {isYtdlpError, parseYtdlpError, readYtVideoInfoJsonFile, sanitizeFilename, sizeToBytes} from "@/utils/download";
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

export const downloadWithYtdlp = async (event: IpcMainInvokeEvent, options: YtDlpDownloadOptions) => {
    const {
        url,
        outputPath,
        quality,
        format,
        downloadId,
        saveToPlaylistFolder,
        playlistName,
        audioBitrate = "192"
    } = options;
    const userDataPath = app.getPath('userData');
    const tempDir = path.join(userDataPath, 'Temp');
    const thumbnailPath = path.join(userDataPath, 'Thumbnails');
    const ytdlpPath = path.join(userDataPath, 'ytdlp');
    const ytDlpExe = path.join(ytdlpPath, getYtDlpConfig().filename);
    const mainWindow = ipcContext.mainWindow;
    const jsonInfoFile = path.join(tempDir, `${downloadId}.json`);

    const jsonInfoStructure = `{
        "title":"%(title)s.%(ext)s",
        "channel":"%(channel)s",
        "ext":"%(ext)s",
        "filesize":%(filesize)j,
        "filesize_approx":%(filesize_approx)j,
        "format_id":"%(format_id)s",
        "format":"%(format)s",
        "quality":"%(height)sp"
    }`;

    const isAudioFormat = format != null && audioFormats.includes(format);

    // Build format string with both quality and format
    let selectedFormat: string;

    if (isAudioFormat) {
        selectedFormat = downloadQualityMap.audio[0];
    } else if (format) {
        // For video formats, use the pre-built format strings
        selectedFormat = downloadQualityMap[quality][0];
    } else {
        // No format specified, use quality only
        const qualityFormats = downloadQualityMap[quality];
        selectedFormat = qualityFormats.join('/');
    }

    const args = [
        '-f', selectedFormat,
        '--print-to-file', jsonInfoStructure, jsonInfoFile,
        '--write-thumbnail',
        '--convert-thumbnail', 'webp',
        '-o', `thumbnail:${path.join(thumbnailPath, downloadId + '.%(ext)s')}`,
        '-o', path.join(
            outputPath,
            saveToPlaylistFolder && playlistName ? playlistName : '',
            '%(title)s.%(ext)s'
        ),
        url
    ];

    if (isAudioFormat && format) {
        args.push(
            '--extract-audio',
            '--audio-format', format,  // mp3, m4a, wav
        );
        if (audioBitrate) {
            args.push('--audio-quality', audioBitrate);
        }
    }

    return new Promise((resolve, reject) => {
        const {spawn} = child_process;
        const child = spawn(ytDlpExe, args, {stdio: ['ignore', 'pipe', 'pipe']});
        let lastProgress = 0;
        const videoInfoData: YtDlpMeta = {
            quality: "",
            filesize: 0,
            title: '',
            channel: '',
            ext: '',
            filesize_approx: 0,
            format: '',
            format_id: ''
        }
        const dataSentState = {
            metadata: false,
            thumbnail: false,
            duplicateStatus: false,
            size: false,
            complete: false
        };
        let thumbnail = path.join(thumbnailPath, downloadId + ".webp");
        let title = "";

        child.stdout.on('data', (data: Buffer) => {
            const text = data.toString();
            const lines = text.split('\\n');

            if (fsSync.existsSync(jsonInfoFile)) {
                const videoInfo = readYtVideoInfoJsonFile<YtDlpMeta>(jsonInfoFile);
                if (videoInfo && !dataSentState.metadata) {
                    videoInfo.filesize = videoInfo.filesize ?? videoInfo.filesize_approx ?? 0;
                    let quality = isAudioFormat ? `${audioBitrate} kbps` : videoInfo.quality;

                    mainWindow?.webContents.send('ytdlp:progress', {
                        type: 'metadata',
                        data: {
                            title: videoInfo.title,
                            channel: videoInfo.channel || 'Unknown',
                            quality,
                            size: videoInfo.filesize,
                            outputPath: path.join(outputPath, videoInfo.title),
                            type: isAudioFormat ? 'audio' : 'video',
                            downloadId
                        }
                    });
                    dataSentState.metadata = true;
                    title = videoInfo.title;

                    Object.assign(videoInfoData, videoInfo);

                    if (videoInfo.filesize) {
                        dataSentState.size = true;
                    }
                }
            }

            lines.forEach((line: string) => {
                console.log('[yt-dlp]', line);

                // Used for audio converting, because initially yt-dlp downloads webm and the  converts it to specified format.
                const finalMatch = line.startsWith("[ExtractAudio] Destination:")
                if (finalMatch) {
                    let oldExt = videoInfoData.title.split(".").pop();
                    let newExt = line.trim().split(".").pop();

                    if (oldExt && newExt && oldExt !== newExt) {
                        videoInfoData.title = videoInfoData.title.replace(oldExt, newExt);

                        mainWindow?.webContents.send('ytdlp:progress', {
                            type: 'metadata',
                            data: {
                                title: videoInfoData.title,
                                outputPath: path.join(outputPath, videoInfoData.title),
                                downloadId
                            }
                        });

                        title = videoInfoData.title;
                    }
                }

                const sizeMatch = line.match(/of\s+([\d.]+\s*[KMGT]iB|[\d.]+\s*[KMGT]B|[\d.]+\s*B)/);
                if (sizeMatch && !dataSentState.size) {
                    const sizeBytes = sizeToBytes(sizeMatch[1]);
                    mainWindow?.webContents.send('ytdlp:progress', {
                        type: 'metadata',
                        data: {
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

                    // If in case file size not found in the YT video, handle it
                    if (!videoInfoData.filesize || !videoInfoData.title) {
                        const filename = dupFilename || 'unknown';
                        const files = fsSync.readdirSync(outputPath);
                        const sanitizedFiles = files.map(f => ({original: f, sanitized: sanitizeFilename(f)}));
                        const fileMatch = sanitizedFiles.find(f => f.sanitized.includes(filename.split('.')[0]));
                        const file = fileMatch?.original;
                        if (file) {
                            const filePath = path.join(outputPath, file);
                            const stats = fsSync.statSync(filePath);
                            videoInfoData.filesize = stats.size;
                            videoInfoData.title = file
                        }

                    }

                    const out = (saveToPlaylistFolder && playlistName) ?
                        path.join(outputPath, playlistName, videoInfoData.title) :
                        path.join(outputPath, videoInfoData.title);

                    const metadata = {
                        filename: videoInfoData.title,
                        title: videoInfoData.title,
                        size: videoInfoData.filesize,
                        thumbnail,
                        channel: videoInfoData.channel || 'Unknown',
                        outputPath: out,
                        downloadId
                    };

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
                const line = data.toString();
                console.error('[yt-dlp stderr]', line);

                if (isYtdlpError(line)) {
                    const ytdlpError = parseYtdlpError(line);
                    mainWindow?.webContents.send('ytdlp:progress', {
                        type: 'error',
                        data: {
                            error: ytdlpError
                        },
                        downloadId
                    });
                }
            });

            child.on('close', (code: number) => {
                if (dataSentState.complete) return resolve({success: true});

                console.log('[yt-dlp] Process closed with code:', code);
                if (fsSync.existsSync(jsonInfoFile)) {
                    fsSync.unlinkSync(jsonInfoFile);
                }
                if (code === 0 || code === 1) {
                    const data: Record<string, any> = {status: 'completed', progress: 100, thumbnail, downloadId, title};

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
        const {spawn} = child_process;
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

export const openFile = async (event: IpcMainInvokeEvent, filePath: string) => {
    try {
        await shell.openPath(filePath);
        return {success: true};
    } catch (error) {
        console.error('Failed to open file:', error);
        throw error;
    }
}
