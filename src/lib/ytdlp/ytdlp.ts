import {getElectron} from "@/lib/utils/common";
import {FileNotFoundError} from "@/lib/errors/file-not-found-error";
import {DownloadType, ProgressTypes} from "@/lib/utils/enums";

export const downloadWithYtdlp = async (options: YtDlpDownloadOptions): Promise<void> => {
	const {
		url,
		outputPath,
		quality,
		format,
		onProgress,
		onData,
		onComplete,
		onDuplicate,
		onError,
		downloadId,
		saveToPlaylistFolder,
		playlistName,
		audioBitrate,
		type
	} = options;


	const electron = getElectron();

	return new Promise((resolve, reject) => {
		let isCompleted = false;
		let isDuplicated = false;

		const handleProgress = (data: any) => {
			if (isCompleted) {
				electron.off("ytdlp:progress", handleProgress);
				return resolve();
			}

			console.info('[ytdlp utility] received:', data);

			if (data.type === ProgressTypes.Progress) {
				onProgress?.(data, data.speed);
			} else if (data.type === ProgressTypes.Metadata) {
				onData?.(data.data);
			} else if (data.type === ProgressTypes.Duplicate && !isDuplicated) {
				onDuplicate?.(data.data.filename, data.data);
				onData?.({status: ProgressTypes.Duplicate, progress: 100, ...data.data});
				isDuplicated = true;
			} else if (data.type === ProgressTypes.Complete && !isCompleted) {
				onData?.(data.data);
				onComplete?.({...data.data, id: data.data.downloadId});
				electron.off("ytdlp:progress", handleProgress);
				isCompleted = true;
				resolve();
			} else if (data.type === ProgressTypes.Error) {
				electron.off("ytdlp:progress", handleProgress);
				onError?.({...data.data, downloadId});
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
			audioBitrate,
			type
		}).catch((err: Error) => {
			electron.off("ytdlp:progress", handleProgress);
			reject(err);
		});
	});
};

export const fileToDataUrl = async (filePath: string): Promise<string> => {
	return await getElectron().fileToDataUrl(filePath);
};

export const selectFolder = async () => {
	return await getElectron().selectFolder();
};

export const openFile = async (item: DownloadItem): Promise<{
	success: boolean;
	error: FileNotFoundError | null
}> => {
	return await getElectron().openFile(item);
}

export const openFolder = async (item: DownloadItem): Promise<{
	success: boolean;
	error: FileNotFoundError | null
}> => {
	return await getElectron().openFolder(item);
}

export const deleteResourceFromSystem =async (item: DownloadItem): Promise<void> => {
	if (item.type === DownloadType.Playlist) {
		return await deletePlaylistFolder(item);
	} else {
		return await deleteFileFromSystem(item);
	}
}

export const getPlaylistVideos = async (
	url: string, reverse: boolean, playlistId: string
): Promise<PlaylistInfo> => {
	return await getElectron().getPlaylistVideos(url, reverse, playlistId);
};

async function deleteFileFromSystem  (item: DownloadItem): Promise<void> {
	return await getElectron().deleteFileFromSystem(item);
}

async function deletePlaylistFolder (item: DownloadItem): Promise<void>  {
	return await getElectron().deleteDownloadedPlaylistResources(item);
}