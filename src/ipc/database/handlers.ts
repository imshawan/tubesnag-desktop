import {Databases, getDatabase} from "@/ipc/database/index";
import IpcMainInvokeEvent = Electron.IpcMainInvokeEvent;

type DownloadItemRow = Omit<DownloadItem, 'videos'> & {
    videos?: string | null;
};

export const createActiveDownload = async (event: IpcMainInvokeEvent, downloadItem: DownloadItem): Promise<{
    success: boolean
}> => {
    return await createDownloadItem(Databases.ACTIVE_DOWNLOADS, downloadItem);
};

export const getActiveDownloads = async (event: IpcMainInvokeEvent): Promise<DownloadItem[]> => {
    return new Promise((resolve, reject) => {
        const db = getDatabase();
        db.all('SELECT * FROM active_downloads ORDER BY date DESC', (err, rows: DownloadItemRow[]) => {
            if (err) reject(err);
            else {
                resolve(rows.map(serialize));
            }
        });
    });
};

export const getActiveDownloadById = async (event: IpcMainInvokeEvent, id: string): Promise<DownloadItem | null> => {
    return new Promise((resolve, reject) => {
        const db = getDatabase();
        db.get('SELECT * FROM active_downloads WHERE id = ?', [id], (err, row: DownloadItemRow) => {
            if (err) reject(err);
            else resolve(serialize(row));
        });
    });
};

export const updateActiveDownload = async (event: IpcMainInvokeEvent, parentId: string, childId: string | null, updates: Partial<DownloadItem>): Promise<{
    success: boolean
}> => {
    return await updateDownloadItem(event, Databases.ACTIVE_DOWNLOADS, parentId, childId, updates);
};

export const deleteActiveDownload = async (event: IpcMainInvokeEvent, id: string): Promise<{ success: boolean }> => {
    return new Promise((resolve, reject) => {
        const db = getDatabase();
        db.run('DELETE FROM active_downloads WHERE id = ?', [id], (err) => {
            if (err) reject(err);
            else resolve({success: true});
        });
    });
};

export const deleteAllActiveDownloads = async (event: IpcMainInvokeEvent): Promise<{ success: boolean }> => {
    return new Promise((resolve, reject) => {
        const db = getDatabase();
        db.run('DELETE FROM active_downloads', (err) => {
            if (err) reject(err);
            else resolve({success: true});
        });
    });
};

// ============ COMPLETED DOWNLOADS CRUD ============

export const getCompletedDownloads = async (event: IpcMainInvokeEvent): Promise<DownloadItem[]> => {
    return new Promise((resolve, reject) => {
        const db = getDatabase();
        db.all('SELECT * FROM completed_downloads ORDER BY date DESC', (err, rows: DownloadItemRow[]) => {
            if (err) reject(err);
            else {
                resolve(rows.map(serialize));
            }
        });
    });
};

export const getCompletedDownloadById = async (event: IpcMainInvokeEvent, id: string): Promise<DownloadItem | null> => {
    return new Promise((resolve, reject) => {
        const db = getDatabase();
        db.get('SELECT * FROM completed_downloads WHERE id = ?', [id], (err, row: DownloadItemRow) => {
            if (err) reject(err);
            else {
                resolve(serialize(row));
            }
        });
    });
};

export const deleteCompletedDownload = async (event: IpcMainInvokeEvent, id: string): Promise<{ success: boolean }> => {
    return new Promise((resolve, reject) => {
        const db = getDatabase();
        db.run('DELETE FROM completed_downloads WHERE id = ?', [id], (err) => {
            if (err) reject(err);
            else resolve({success: true});
        });
    });
};

export const deleteAllCompletedDownloads = async (event: IpcMainInvokeEvent): Promise<{ success: boolean }> => {
    return new Promise((resolve, reject) => {
        const db = getDatabase();
        db.run('DELETE FROM completed_downloads', (err) => {
            if (err) reject(err);
            else resolve({success: true});
        });
    });
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
    return new Promise(async (resolve, reject) => {
        try {
            const activeDownload = await getActiveDownloadById(event, id);
            if (!activeDownload) {
                reject(new Error('Active download not found'));
                return;
            }

            await createDownloadItem(Databases.COMPLETED_DOWNLOADS, {...activeDownload, status: 'completed', progress: 100});
            await deleteActiveDownload(event, id);

            resolve({success: true});
        } catch (err) {
            reject(err);
        }
    });
};

// ============ Helper Methods ============

export async function createDownloadItem (dbName: Databases, downloadItem: DownloadItem): Promise<{
    success: boolean
}> {
    return new Promise((resolve, reject) => {
        const db = getDatabase();

        const stmt = db.prepare(`
            INSERT INTO ${dbName}
            (id, url, title, status, progress, error, size, quality, type, date, channel, format, thumbnail, videos,
             downloadPath, parentId, parentTitle)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);

        stmt.run(
            downloadItem.id,
            downloadItem.url,
            downloadItem.title,
            downloadItem.status,
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
            downloadItem.parentTitle || null,
            (err: any) => {
                if (err) reject(err);
                else resolve({success: true});
            }
        );

        stmt.finalize();
    });
};

export async function updateDownloadItem(event: IpcMainInvokeEvent, dbName: Databases, parentId: string, childId: string | null, updates: Partial<DownloadItem>): Promise<{
    success: boolean
}> {
    const activeDownload = await getActiveDownloadById(event, parentId);

    return new Promise((resolve, reject) => {
        if (!activeDownload) {
            reject(new Error('Active download not found'));
            return;
        }

        const db = getDatabase();

        if (!childId && !updates.parentId) {
            const deserialized = deserialize(updates as DownloadItem);
            const fields = Object.keys(deserialized).map(key => `${key} = ?`).join(', ');
            const values = [...Object.values(deserialized), parentId];

            db.run(
                `UPDATE ${dbName}
                 SET ${fields}
                 WHERE id = ?`,
                values,
                (err) => {
                    if (err) reject(err);
                    else resolve({success: true});
                }
            );
        } else if (parentId && childId) {
            const idx = activeDownload.videos?.findIndex(vid => vid.id === childId);
            if (idx !== undefined && idx > -1) {
                activeDownload.videos![idx] = {
                    ...activeDownload.videos![idx],
                    ...updates
                };

                db.run(
                    `UPDATE ${dbName}
                     SET videos = ?
                     WHERE id = ?`,
                    [JSON.stringify(activeDownload.videos), parentId],
                    (err) => {
                        if (err) reject(err);
                        else resolve({success: true});
                    }
                );

            } else {
                reject(new Error('Video not found in playlist'));
            }
        } else {
            reject(new Error('Invalid update parameters'));
        }
    });
};

async function removeVideoFromPlaylist(
    event: IpcMainInvokeEvent,
    getDownloadItem: (event: IpcMainInvokeEvent, id: string) => Promise<DownloadItem | null>,
    dbName: Databases,
    playlistId: string,
    videoId: string
): Promise<{ success: boolean }> {
    return new Promise(async (resolve, reject) => {
        try {
            const db = getDatabase();

            // Get the playlist from the db based on dbName
            const playlist = await getDownloadItem(event, playlistId);

            if (!playlist) {
                reject(new Error('Playlist not found'));
                return;
            }

            if (!playlist.videos || playlist.videos.length === 0) {
                reject(new Error('No videos in playlist'));
                return;
            }

            const updatedVideos = playlist.videos.filter(video => video.id !== videoId);

            const stmt = db.prepare(`
                UPDATE ${dbName}
                SET videos = ?
                WHERE id = ?
            `);

            stmt.run(
                JSON.stringify(updatedVideos),
                playlistId,
                (err: any) => {
                    if (err) reject(err);
                    else resolve({success: true});
                }
            );

            stmt.finalize();
        } catch (error) {
            reject(error);
        }
    });
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
