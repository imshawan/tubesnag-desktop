import {getDatabase} from "@/ipc/database/index";
import IpcMainInvokeEvent = Electron.IpcMainInvokeEvent;
import {Databases, DownloadStatus, DownloadType} from "@/lib/utils/enums";
import {isDownloadCompleteState, isDownloadingState, isFailedState, isPendingState} from "@/lib/utils/common";

type DownloadItemRow = Omit<DownloadItem, 'videos'> & {
	videos?: string | null;
};

export const createActiveDownload = async (event: IpcMainInvokeEvent, downloadItem: DownloadItem): Promise<{
	success: boolean
}> => {
	return await createDownloadItem(Databases.ACTIVE_DOWNLOADS, downloadItem);
};

export const getActiveDownloads = async (event: IpcMainInvokeEvent): Promise<DownloadItem[]> => {
	const db = getDatabase();
	const rows = db.prepare('SELECT * FROM active_downloads ORDER BY date DESC').all() as DownloadItemRow[];
	return rows.map(serialize);
};

export const getActiveDownloadById = async (event: IpcMainInvokeEvent, id: string): Promise<DownloadItem | null> => {
	const db = getDatabase();
	const row = db.prepare('SELECT * FROM active_downloads WHERE id = ?').get(id) as DownloadItemRow | undefined;
	return row ? serialize(row) : null;
};

export const updateActiveDownload = async (event: IpcMainInvokeEvent, parentId: string, childId: string | null, updates: Partial<DownloadItem>): Promise<{
	success: boolean
}> => {
	return await updateDownloadItem(event, Databases.ACTIVE_DOWNLOADS, parentId, childId, updates);
};

export const deleteActiveDownload = async (event: IpcMainInvokeEvent, id: string): Promise<{
	success: boolean,
	error: Error | null
}> => {
	try {
		const db = getDatabase();
		db.prepare('DELETE FROM active_downloads WHERE id = ?').run(id);
		return {success: true, error: null};
	} catch (error: any) {
		console.error(error);
		return {success: false, error: error};
	}
};

export const deleteAllActiveDownloads = async (event: IpcMainInvokeEvent): Promise<{ success: boolean }> => {
	const db = getDatabase();
	db.prepare('DELETE FROM active_downloads').run();
	return {success: true};
};

// ============ COMPLETED DOWNLOADS CRUD ============

export const getCompletedDownloads = async (event: IpcMainInvokeEvent): Promise<DownloadItem[]> => {
	const db = getDatabase();
	const rows = db.prepare('SELECT * FROM completed_downloads ORDER BY date DESC').all() as DownloadItemRow[];
	return rows.map(serialize);
};

export const getCompletedDownloadById = async (event: IpcMainInvokeEvent, id: string): Promise<DownloadItem | null> => {
	const db = getDatabase();
	const row = db.prepare('SELECT * FROM completed_downloads WHERE id = ?').get(id) as DownloadItemRow | undefined;
	return row ? serialize(row) : null;
};

export const deleteCompletedDownload = async (event: IpcMainInvokeEvent, id: string): Promise<{ success: boolean }> => {
	const db = getDatabase();
	db.prepare('DELETE FROM completed_downloads WHERE id = ?').run(id);
	return {success: true};
};

export const deleteAllCompletedDownloads = async (event: IpcMainInvokeEvent): Promise<{ success: boolean }> => {
	const db = getDatabase();
	db.prepare('DELETE FROM completed_downloads').run();
	return {success: true};
};

export const deleteActiveDownloadsVideoFromPlaylist = async (
	event: IpcMainInvokeEvent,
	playlistId: string,
	videoId: string
): Promise<{ success: boolean }> => {
	return await removeVideoFromPlaylist(event, getActiveDownloadById, Databases.ACTIVE_DOWNLOADS, playlistId, videoId);
};

export const deleteCompletedDownloadsVideoFromPlaylist = async (
	event: IpcMainInvokeEvent,
	playlistId: string,
	videoId: string
): Promise<{ success: boolean }> => {
	return await removeVideoFromPlaylist(event, getCompletedDownloadById, Databases.COMPLETED_DOWNLOADS, playlistId, videoId);
};

export const moveActiveToCompleted = async (event: IpcMainInvokeEvent, id: string): Promise<{ success: boolean }> => {
	const activeDownload = await getActiveDownloadById(event, id);
	if (!activeDownload) {
		throw new Error('Active download not found');
	}

	// In better-sqlite3, synchronous calls ensure sequential execution
	await createDownloadItem(Databases.COMPLETED_DOWNLOADS, {...activeDownload, status: 'completed', progress: 100});
	await deleteActiveDownload(event, id);

	return {success: true};
};

// ============ Helper Methods ============

export async function createDownloadItem(dbName: Databases, downloadItem: DownloadItem): Promise<{
	success: boolean, error: Error | null
}> {
	try {
		const db = getDatabase();

		const stmt = db.prepare(`
            INSERT INTO ${dbName}
            (id, url, title, status, audioStatus, progress, error, size, quality, type, date, channel, format,
             thumbnail, videos,
             downloadPath, parentId, parentTitle)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
		`);

		stmt.run(
			downloadItem.id,
			downloadItem.url,
			downloadItem.title,
			downloadItem.status,
			downloadItem.audioStatus,
			downloadItem.progress,
			downloadItem.error || null,
			downloadItem.size,
			downloadItem.quality,
			downloadItem.type,
			downloadItem.date,
			downloadItem.channel,
			downloadItem.format || null,
			downloadItem.thumbnail || null,
			downloadItem.videos ? JSON.stringify(downloadItem.videos) : null,
			downloadItem.downloadPath,
			downloadItem.parentId || null,
			downloadItem.parentTitle || null
		);

		return {success: true, error: null};
	} catch (error: any) {
		console.error(error);
		return {success: false, error};
	}
}

export async function markDownloadAsFailed(event: IpcMainInvokeEvent, downloadItem: DownloadItem): Promise<{
	success: boolean,
	error: Error | null
}> {
	const parentId = downloadItem.parentId || downloadItem.id;
	const activeDownload = await getActiveDownloadById(event, parentId);

	if (!activeDownload) {
		return {error: new Error('Active download not found'), success: false};
	}

	const db = getDatabase();

	try {
		if (activeDownload.type === DownloadType.Playlist) {
			const downloads = activeDownload.videos?.filter(isDownloadCompleteState) || [];
			const incompleteDownloads = activeDownload.videos?.filter(dl =>
                (isDownloadingState(dl) || isPendingState(dl) || isFailedState(dl))) || [];

			incompleteDownloads.forEach(download => {
				download.status = DownloadStatus.Failed;
			});

			const allDownloads = downloads.concat(incompleteDownloads);

			console.log("all downloads", allDownloads, allDownloads.length);
			console.log("incomplete downloads", incompleteDownloads, incompleteDownloads.length);

			db.prepare(`
                UPDATE ${Databases.ACTIVE_DOWNLOADS}
                SET videos = ?
                WHERE id = ?
			`).run(JSON.stringify(downloads.concat(incompleteDownloads)), parentId);

		} else {
			db.prepare(`
                UPDATE ${Databases.ACTIVE_DOWNLOADS}
                SET status = ?
                WHERE id = ?
			`).run(DownloadStatus.Failed, parentId);
		}
	} catch (error: any) {
		console.error(error);
		return {success: false, error};
	}

	return {success: true, error: null};
}

export async function updateDownloadItem(event: IpcMainInvokeEvent, dbName: Databases, parentId: string, childId: string | null, updates: Partial<DownloadItem>): Promise<{
	success: boolean
}> {
	const activeDownload = await getActiveDownloadById(event, parentId);

	if (!activeDownload) {
		throw new Error('Active download not found');
	}

	const db = getDatabase();

	if (!childId && !updates.parentId) {
		const deserialized = deserialize(updates as DownloadItem);
		const fields = Object.keys(deserialized).map(key => `${key} = ?`).join(', ');
		const values = [...Object.values(deserialized), parentId];

		db.prepare(`
            UPDATE ${dbName}
            SET ${fields}
            WHERE id = ?
		`).run(...values);

		return {success: true};

	} else if (parentId && childId) {
		const idx = activeDownload.videos?.findIndex(vid => vid.id === childId);

		if (idx !== undefined && idx > -1) {
			activeDownload.videos![idx] = {
				...activeDownload.videos![idx],
				...updates
			};

			db.prepare(`
                UPDATE ${dbName}
                SET videos = ?
                WHERE id = ?
			`).run(JSON.stringify(activeDownload.videos), parentId);

			return {success: true};

		} else {
			throw new Error('Video not found in playlist');
		}
	} else {
		throw new Error('Invalid update parameters');
	}
};

async function removeVideoFromPlaylist(
	event: IpcMainInvokeEvent,
	getDownloadItem: (event: IpcMainInvokeEvent, id: string) => Promise<DownloadItem | null>,
	dbName: Databases,
	playlistId: string,
	videoId: string
): Promise<{ success: boolean }> {
	const db = getDatabase();

	// Get the playlist from the db based on dbName
	const playlist = await getDownloadItem(event, playlistId);

	if (!playlist) {
		throw new Error('Playlist not found');
	}

	if (!playlist.videos || playlist.videos.length === 0) {
		throw new Error('No videos in playlist');
	}

	const updatedVideos = playlist.videos.filter(video => video.id !== videoId);

	db.prepare(`
        UPDATE ${dbName}
        SET videos = ?
        WHERE id = ?
	`).run(JSON.stringify(updatedVideos), playlistId);

	return {success: true};
}

function serialize(row: DownloadItemRow): DownloadItem {
	const {videos, ...rest} = row;
	const serialized: Partial<DownloadItem> = {...rest};

	if (videos) {
		serialized['videos'] = JSON.parse(videos as any as string) as DownloadItem[];
	}

	return serialized as DownloadItem;
}

function deserialize(row: DownloadItem): DownloadItemRow {
	const {videos, ...rest} = row;
	const deserialized: Partial<DownloadItemRow> = {...rest};

	if (videos) {
		deserialized['videos'] = JSON.stringify(videos);
	}

	return deserialized as DownloadItemRow;
}