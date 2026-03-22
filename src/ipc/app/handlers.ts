import os from "node:os";
import {app, dialog, shell, ipcMain, BrowserWindow, session} from "electron";
import fs from "node:fs/promises";
import * as path from "node:path";
import {
	audioFormats,
	DEPENDENCY_CONFIG,
	downloadItemJsonInfoStructure,
	downloadQualityMap
} from "@/lib/ytdlp/constants";
import fsSync from "node:fs";
import * as child_process from "node:child_process";
import {ipcContext} from "@/ipc/context";
import {downloadFile} from "@/lib/utils/downloader";
import {isValidYouTubeUrl, isYtdlpError, parseYtDlpError, sanitizeFilename, sizeToBytes} from "@/lib/ytdlp/download";
import {readYtVideoInfoJsonFile, resolveDownloadedFilePath, resolveQualityByResolution} from "@/lib/ytdlp/utils";
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

    const MIN_YTDLP_SIZE = 17 * 1024 * 1024; // 17MB
    const MIN_FFMPEG_SIZE = 78 * 1024 * 1024; // 78MB

    const ytDlpConfig = getYtDlpConfig();
    const ffmpegConfig = getFfmpegConfig();

    const checkFileSize = (filePath: string, minSize: number): boolean => {
        try {
            if (!fsSync.existsSync(filePath)) return false;
            const stats = fsSync.statSync(filePath);
            const isNotPartial = stats.size >= minSize;

            if (!isNotPartial) {
                console.warn(`File ${filePath} is downloaded partially with size: ${stats.size} bytes. Deleting it.`);
                fsSync.unlinkSync(filePath);
            }

            return isNotPartial;
        } catch {
            return false;
        }
    };

    return {
        db: fsSync.existsSync(dbPath),
        ytdlp: checkFileSize(path.join(ytdlpPath, ytDlpConfig.filename), MIN_YTDLP_SIZE),
        ffmpeg: checkFileSize(path.join(ffmpegPath, ffmpegConfig.filename), MIN_FFMPEG_SIZE)
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
        '--print-to-file', downloadItemJsonInfoStructure, jsonInfoFile,
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

    // Clean up existing JSON info file if it's a retry download
    if (fsSync.existsSync(jsonInfoFile)) {
        fsSync.unlinkSync(jsonInfoFile);
    }

    return new Promise((resolve, reject) => {
        const {spawn} = child_process;
        const child = spawn(ytDlpExe, args, {stdio: ['ignore', 'pipe', 'pipe']});
        let lastProgress = 0;
        const videoInfoData: YtDlpMeta = {
            audio_bitrate: 0, audio_codec: "", audio_ext: null, audio_sample_rate: 0,
            quality: "",
            filesize: 0,
            title: '',
            channel: '',
            ext: '',
            filesize_approx: 0,
            format: '',
            format_id: '',
            height: 0,
            width: 0
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

                    if (!Object.keys(downloadQualityMap).includes(quality)) {
                        quality = resolveQualityByResolution(videoInfo.width, videoInfo.height) || "unknown";
                        videoInfo.quality = quality;
                    }

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
                const speedMatch = new RegExp(/at\s+([\d.]+[KMG]iB\/s)/).exec(line);
                if (progressMatch) {
                    const progress = Math.min(100, Math.max(0, Number.parseFloat(progressMatch[1])));
                    if (Math.abs(progress - lastProgress) >= 1) {
                        lastProgress = progress;
                        mainWindow?.webContents.send('ytdlp:progress', {
                            type: 'progress',
                            progress: Math.round(progress),
                            speed: speedMatch?.length ? speedMatch[1] : undefined,
                            downloadId
                        });
                    }
                }
            });

            child.stderr.on('data', (data: Buffer) => {
                const line = data.toString();
                console.error('[yt-dlp stderr]', line);

                if (isYtdlpError(line)) {
                    const ytdlpError = parseYtDlpError(line);
                    mainWindow?.webContents.send('ytdlp:progress', {
                        type: 'error',
                        data: ytdlpError,
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
                    const data: Record<string, any> = {
                        status: 'completed',
                        progress: 100,
                        thumbnail,
                        downloadId,
                        title
                    };

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
    const tempDir = path.join(userDataPath, 'Temp');

    return new Promise((resolve, reject) => {
        const {spawn} = child_process;
        const videoUrlsFile = path.join(tempDir, `.playlist_${playlistId}.txt`);
        const metaFile = path.join(tempDir, `.playlist_meta_${playlistId}.txt`);

        const args = [
            '--flat-playlist',
            '--print-to-file', '%(webpage_url)s', videoUrlsFile,
            '--print-to-file', '%(playlist_title)s|%(playlist_uploader,playlist_channel,uploader,channel)s', metaFile,
            url
        ];

        const child = spawn(ytDlpExe, args, {stdio: ['ignore', 'pipe', 'pipe']});

        child.on('close', (code: number) => {
            try {
                if (fsSync.existsSync(videoUrlsFile)) {
                    const content = fsSync.readFileSync(videoUrlsFile, 'utf8');
                    let videoUrls = content.split('\n').filter((line: string) => line.trim().length > 0);

                    let metadata = {title: 'Playlist', channel: 'Unknown', thumbnail: ''};
                    if (fsSync.existsSync(metaFile)) {
                        const metaContent = fsSync.readFileSync(metaFile, 'utf8').trim();
                        const [title, channel] = metaContent.split('|');
                        metadata.title = title || 'Playlist';
                        metadata.channel = channel || 'Unknown';
                        fsSync.unlinkSync(metaFile);
                    }

                    if (reverse) {
                        videoUrls = videoUrls.reverse();
                    }

                    fsSync.unlinkSync(videoUrlsFile);
                    resolve({videoUrls, ...metadata});
                } else {
                    reject(new Error('Failed to extract playlist videos'));
                }
            } catch (error) {
                if (fsSync.existsSync(videoUrlsFile)) {
                    fsSync.unlinkSync(videoUrlsFile);
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


export const downloadYtContentThumbnail: (ytDlpExe: string, url: string, thumbnailPath: string, tempFile: string) => Promise<{
    title: string;
    channel: string
}> = (
    ytDlpExe: string, url: string, thumbnailPath: string, tempFile: string
): Promise<{ title: string, channel: string }> => {
    return new Promise((resolve, reject) => {
        const args = [
            '--skip-download',
            '--write-thumbnail',
            '--thumbnail-size', '500',
            '-o', `thumbnail:${path.join(thumbnailPath, '%(title)s.%(ext)s')}`,
            '--print-to-file', '%(channel)s', tempFile,
            url
        ];

        const child = child_process.spawn(ytDlpExe, args, {stdio: ['ignore', 'pipe', 'pipe']});
        let title = '';

        child.stdout.on('data', (data: Buffer) => {
            const text = data.toString();
            const destMatch = text.match(/\[download\]\s+Destination:\s+(.+)/);
            if (destMatch) {
                title = destMatch[1].trim();
            }
        });

        child.on('close', (code: number) => {
            if (code === 0) {
                const channel = fsSync.existsSync(tempFile) ? fsSync.readFileSync(tempFile, "utf8").trim() : 'Unknown';
                resolve({title, channel});
            } else {
                reject(new Error(`Thumbnail download failed with code ${code}`));
            }
        });

        child.on('error', reject);
    });
};

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

export const openFile = async (event: IpcMainInvokeEvent, item: DownloadItem) => {
    const filePath = resolveDownloadedFilePath(item);
    if (!filePath) return {success: false};

    try {
        await shell.openPath(filePath);
        return {success: true};
    } catch (error) {
        console.error('Failed to open file:', error);
        throw error;
    }
}

export const openFolder = async (event: IpcMainInvokeEvent, item: DownloadItem) => {
    const folderPath = item.parentTitle ? path.join(item.downloadPath, item.parentTitle) : item.downloadPath;

    if (!fsSync.existsSync(folderPath)) return {success: false};

    try {
        await shell.openPath(folderPath);
        return {success: true};
    } catch (error) {
        console.error('Failed to open folder:', error);
        throw error;
    }
}

export const deleteDownloadedResources = (event: IpcMainInvokeEvent, item: DownloadItem) => {
    const {thumbnail} = item;

    const filePath = resolveDownloadedFilePath(item);

    if (filePath && fsSync.existsSync(filePath)) {
        fsSync.unlinkSync(filePath);
    }

    // Delete thumbnail if it exists
    if (thumbnail && fsSync.existsSync(thumbnail)) {
        fsSync.unlinkSync(thumbnail);

    }
}

export const deleteDownloadedPlaylistResources = (event: IpcMainInvokeEvent, item: DownloadItem) => {
    const {downloadPath, title, videos} = item;
    const playlistDir = path.join(downloadPath, title);

    if (fsSync.existsSync(playlistDir)) {
        fsSync.rmSync(playlistDir, {recursive: true});
    }

    if (videos?.length) {
        videos.forEach(video => {
            if (video.thumbnail && fsSync.existsSync(video.thumbnail)) {
                fsSync.unlinkSync(video.thumbnail);
            }
        });
    }
}

async function openVerificationWindow (url: string) {
	const win = new BrowserWindow({ width: 800, height: 600, show: true });
	await win.loadURL(url);

	return new Promise((resolve) => {
		win.on('close', async () => {
			const cookies = await session.defaultSession.cookies.get({ domain: '.youtube.com' });
			let cookieContent = "# Netscape HTTP Cookie File\n";
			cookies.forEach(c => {
				const expiry = Math.floor(c.expirationDate || (Date.now() / 1000) + 3600);
				cookieContent += `${c.domain}\tTRUE\t${c.path}\t${c.secure ? 'TRUE' : 'FALSE'}\t${expiry}\t${c.name}\t${c.value}\n`;
			});

			const cookiePath = path.join(app.getPath('userData'), 'temp_cookies.txt');
			fsSync.writeFileSync(cookiePath, cookieContent);
			resolve(cookiePath);
		});
	});
}