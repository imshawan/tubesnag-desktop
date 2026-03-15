import sqlite3, {Database} from 'sqlite3';
import path from 'path';
import { app } from 'electron';

let db: sqlite3.Database | null = null;
const indexes = ['title', 'parentId', 'parentTitle', 'status'];

export enum Databases {
    COMPLETED_DOWNLOADS = 'completed_downloads',
    ACTIVE_DOWNLOADS = 'active_downloads'
}

export const initDatabase = (): Promise<sqlite3.Database> => {
    return new Promise((resolve, reject) => {
        const userDataPath = app.getPath('userData');
        const dbPath = path.join(userDataPath, 'db', 'tubesnag.db');

        db = new sqlite3.Database(dbPath, (err) => {
            if (err) {
                reject(err);
                return;
            }

            // Create completed_downloads table
            db!.run(`
                CREATE TABLE IF NOT EXISTS completed_downloads (
                    id TEXT PRIMARY KEY,
                    url TEXT NOT NULL,
                    title TEXT NOT NULL,
                    status TEXT NOT NULL,
                    progress INTEGER DEFAULT 100,
                    error TEXT,
                    size INTEGER DEFAULT 0,
                    quality TEXT,
                    type TEXT NOT NULL,
                    date TEXT NOT NULL,
                    channel TEXT,
                    format TEXT,
                    thumbnail TEXT,
                    videos TEXT,
                    downloadPath TEXT,
                    parentId TEXT,
                    parentTitle TEXT
                )
            `, (err) => {
                if (err) {
                    reject(err);
                    return;
                }

                // Create active_downloads table
                db!.run(`
                    CREATE TABLE IF NOT EXISTS active_downloads (
                        id TEXT PRIMARY KEY,
                        url TEXT NOT NULL,
                        title TEXT NOT NULL,
                        status TEXT NOT NULL,
                        progress INTEGER DEFAULT 0,
                        error TEXT,
                        size INTEGER DEFAULT 0,
                        quality TEXT,
                        type TEXT NOT NULL,
                        date TEXT NOT NULL,
                        channel TEXT,
                        format TEXT,
                        thumbnail TEXT,
                        videos TEXT,
                        downloadPath TEXT,
                        parentId TEXT,
                        parentTitle TEXT
                    )
                `, (err) => {
                    if (err) reject(err);
                    else {
                        createIndexes(db!);
                        resolve(db!);
                    }
                });
            });
        });
    });
};

export const getDatabase = () => {
    if (!db) {
        throw new Error('Database not initialized');
    }
    return db;
};

export const closeDatabase = () => {
    return new Promise<void>((resolve) => {
        if (db) {
            db.close(() => {
                db = null;
                resolve();
            });
        } else {
            resolve();
        }
    });
};

function createIndexes(db: Database) {
    [Databases.ACTIVE_DOWNLOADS, Databases.COMPLETED_DOWNLOADS].forEach(database => {
        indexes.forEach(index => {
            db!.run(`CREATE INDEX IF NOT EXISTS idx_${database}_${index} ON ${database}(${index})`, (err) => {
                if (err) console.error('Failed to create index on ${database}.${index}:', err);
            });
        })
    })
}