import {Middleware} from '@reduxjs/toolkit';
import * as db from '@/lib/database';
import {
    addActiveDownload,
    updateActiveDownload,
    removeActiveDownload,
    updateActivePlaylistVideoDownload,
    clearActiveDownloads
} from '../slices/active-downloads-slice';
import {addDownload, clearAll, removeDownload} from "@/store/slices/downloads-slice";

const DB_FIELDS: (keyof DownloadItem)[] = [
    'id',
    'url',
    'title',
    'status',
    'progress',
    'error',
    'size',
    'quality',
    'type',
    'date',
    'channel',
    'format',
    'thumbnail',
    'videos',
    'downloadPath',
    'parentId',
    'parentTitle'
];

/**
 * Custom Middleware to sync state changes to the database. This listens to actions and synchronizes the state changes to the database.
 *
 * @author Shawan Mandal
 */
export const databaseSyncMiddleware: Middleware = (store) => (next) => async (action) => {
    const result = next(action);

    if (addActiveDownload.match(action)) {
        try {
            console.log('Adding active download:', action.payload);
            await db.createActiveDownload(pickDbFields(action.payload));
        } catch (error) {
            console.error('Failed to save active download to DB:', error);
        }
    }

    if (updateActiveDownload.match(action)) {
        try {
            const {id, updates} = action.payload;
            console.log('Updating active download:', {id, updates});
            await db.updateActiveDownload(id, null, pickDbFields(updates));

            // If status is completed, move to completed_downloads
            if (updates.status === 'completed') {
                console.log('Moving to completed downloads');

                const item: DownloadItem = store.getState().activeDownloads.items.find((item: any) => item.id === id);

                await db.moveActiveToCompleted(id);

                store.dispatch(addDownload(item));
                store.dispatch(removeActiveDownload({parent: id}));
            }
        } catch (error) {
            console.error('Failed to update active download in DB:', error);
        }
    }

    if (updateActivePlaylistVideoDownload.match(action)) {
        try {
            const {playlistId, downloadId, updates} = action.payload;

            // Get the updated state to check if all videos are completed
            const state = store.getState();
            const playlist = state.activeDownloads.items.find((item: any) => item.id === playlistId);

            if (playlist?.status === 'completed') {
                console.log('Moving playlist to completed downloads');

                await db.moveActiveToCompleted(playlistId);

                store.dispatch(addDownload(playlist));
                store.dispatch(removeActiveDownload({parent: playlistId}));
            } else {
                console.log('Updating playlist video download:', {playlistId, updates});
                await db.updateActiveDownload(playlistId, downloadId, pickDbFields(updates));
            }
        } catch (error) {
            console.error('Failed to update playlist in DB:', error);
        }
    }

    if (removeActiveDownload.match(action)) {
        try {
            const {parent, child} = action.payload;
            console.log('Removing active download:', parent);
            if (child) {
                return await db.deleteActiveDownloadsVideoFromPlaylist(parent, child);
            }
            await db.deleteActiveDownload(parent);
        } catch (error) {
            console.error('Failed to delete active download from DB:', error);
        }
    }

    if (clearActiveDownloads.match(action)) {
        try {
            console.log('Clearing all active downloads');
            await db.deleteAllActiveDownloads();
        } catch (error) {
            console.error('Failed to clear active downloads from DB:', error);
        }
    }

    if (removeDownload.match(action)) {
        try {
            const {parent, child} = action.payload;
            if (child) {
                return await db.deleteCompletedDownloadsVideoFromPlaylist(parent, child);
            }
            await db.deleteCompletedDownload(parent);
        } catch (error) {
            console.error('Failed to delete download from DB:', error);
        }
    }

    return result;
};

/**
 * Helper to pick only DB fields from DownloadItem
 * @param item
 */
function pickDbFields(item: Partial<DownloadItem>): DownloadItem {
    const dbItem: Partial<DownloadItem> = {};

    for (const field of DB_FIELDS) {
        if (field in item) {
            (dbItem as any)[field] = item[field];
        }
    }

    return dbItem as DownloadItem;
}