export const downloadWithYtdlp = async (options: YtDlpDownloadOptions): Promise<void> => {
    const {
        url,
        outputPath,
        quality,
        format,
        onProgress,
        onData,
        onDuplicate,
        onError,
        downloadId,
        saveToPlaylistFolder,
        playlistName,
        audioBitrate
    } = options;

    if (!globalThis.electron) {
        throw new Error("Electron not available");
    }

    const electron = globalThis.electron;

    return new Promise((resolve, reject) => {
        let isCompleted = false;
        let isDuplicated = false;

        const handleProgress = (data: any) => {
            if (isCompleted) {
                electron.off("ytdlp:progress", handleProgress);
                return resolve();
            }

            console.log('[ytdlp utility] received:', data);

            if (data.type === "progress") {
                onProgress?.(data.progress);
            } else if (data.type === "metadata") {
                onData?.(data.data);
            } else if (data.type === "duplicate" && !isDuplicated) {
                onDuplicate?.(data.data.filename, data.data);
                onData?.({status: "duplicate", progress: 100, ...data.data});
                isDuplicated = true;
            } else if (data.type === "complete" && !isCompleted) {
                onData?.(data.data);
                electron.off("ytdlp:progress", handleProgress);
                isCompleted = true;
                resolve();
            } else if (data.type === "error") {
                electron.off("ytdlp:progress", handleProgress);
                onError?.({error: data.error, downloadId});
                isCompleted = true;
                resolve();
            }
        };

        electron.on("ytdlp:progress", handleProgress);

        electron.invoke("ytdlp:download", {
            url,
            outputPath,
            quality,
            format,
            downloadId,
            saveToPlaylistFolder,
            playlistName,
            audioBitrate
        }).catch((err: Error) => {
            electron.off("ytdlp:progress", handleProgress);
            reject(err);
        });
    });
};

export const fileToDataUrl = async (filePath: string): Promise<string> => {
    if (!globalThis.electron) {
        throw new Error("Electron not available");
    }
    return await globalThis.electron.fileToDataUrl(filePath);
};

export const getPlaylistVideos = async (
    url: string, reverse: boolean = false, playlistId: string
): Promise<PlaylistInfo> => {
    if (!globalThis.electron) {
        throw new Error("Electron not available");
    }
    return await globalThis.electron.getPlaylistVideos(url, reverse, playlistId);
};