import fsSync from "fs";
import path from "path";
import {sanitizeFilename} from "@/lib/ytdlp/download";

export function getNormalizedFileListMap(directory: string): Map<string, string> {
    const files = fsSync.readdirSync(directory);

    const filenamesNormalized: Map<string, string> = new Map<string, string>();
    files.forEach(file => {
        filenamesNormalized.set(sanitizeFilename(file), file);
    });

    return filenamesNormalized;
}

export function resolveDownloadedFilePath(item: DownloadItem): string | null {
    const {downloadPath, title} = item;
    const directoryPath = path.join(downloadPath, item.parentTitle ? item.parentTitle : "");

    const targetFileName = getNormalizedFileListMap(directoryPath).get(sanitizeFilename(title));
    if (!targetFileName) {
        console.warn("File not found: ", title);
        return null;
    }

    return path.join(directoryPath, targetFileName);
};

export function readYtVideoInfoJsonFile<T>(path: string): T | null {
    try {
        const data = fsSync.readFileSync(path, 'utf8');
        return JSON.parse(data.replaceAll("NA", "null")) as T;
    } catch (error) {
        console.error('Error reading JSON file:', error);
        return null;
    }
}