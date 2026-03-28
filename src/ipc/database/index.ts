import Database, { Database as BetterSqlite3Database } from 'better-sqlite3';
import path from 'node:path';
import { app } from 'electron';
import fsSync from 'node:fs';
import {Databases} from "@/lib/utils/enums";

let db: BetterSqlite3Database | null = null;
const indexes = ['title', 'parentId', 'parentTitle', 'status'];
const dbName = 'tubesnag.db';

export const initDatabase = async (): Promise<BetterSqlite3Database> => {
    const userDataPath = app.getPath('userData');
    const dbPath = path.join(userDataPath, 'db');

    if (!fsSync.existsSync(dbPath)) {
        fsSync.mkdirSync(dbPath, { recursive: true });
    }

    try {
        // Initialize the database synchronously
        db = new Database(path.join(dbPath, dbName));

        // Enable WAL mode for significantly better performance with better-sqlite3
        db.pragma('journal_mode = WAL');

        // Create completed_downloads table
        db.exec(`
            CREATE TABLE IF NOT EXISTS completed_downloads (
                id TEXT PRIMARY KEY,
                url TEXT NOT NULL,
                title TEXT NOT NULL,
                status TEXT NOT NULL DEFAULT 'pending',
                audioStatus TEXT NOT NULL DEFAULT 'pending',                
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
        `);

        // Create active_downloads table
        db.exec(`
            CREATE TABLE IF NOT EXISTS active_downloads (
                id TEXT PRIMARY KEY,
                url TEXT NOT NULL,
                title TEXT NOT NULL,
                status TEXT NOT NULL DEFAULT 'pending',
                audioStatus TEXT NOT NULL DEFAULT 'pending',
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
        `);

        createIndexes(db);
        return db;

    } catch (err) {
        console.error('Failed to initialize database:', err);
        throw err; // Throws as a rejected promise because the function is async
    }
};

export const getDatabase = (): BetterSqlite3Database => {
    if (!db) {
        throw new Error('Database not initialized');
    }
    return db;
};

export const closeDatabase = async (): Promise<void> => {
    if (db) {
        db.close();
        db = null;
    }
};

function createIndexes(dbInstance: BetterSqlite3Database) {
    [Databases.ACTIVE_DOWNLOADS, Databases.COMPLETED_DOWNLOADS].forEach(database => {
        indexes.forEach(index => {
            try {
                dbInstance.exec(`CREATE INDEX IF NOT EXISTS idx_${database}_${index} ON ${database}(${index})`);
            } catch (err) {
                // Fixed the string interpolation here (changed ' to `)
                console.error(`Failed to create index on ${database}.${index}:`, err);
            }
        });
    });
}