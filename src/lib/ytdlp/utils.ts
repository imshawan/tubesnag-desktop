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
}

export function readYtVideoInfoJsonFile<T>(path: string): T | null {
	try {
		const data = fsSync.readFileSync(path, 'utf8');
		return JSON.parse(data
			.replaceAll(/\bNA\b/g, "null")   // Replaces all unquoted NA
			.replaceAll('"NA"', "null")      // Replaces all quoted "NA"
		) as T;
	} catch (error) {
		console.error('Error reading JSON file:', error);
		return null;
	}
}

export function resolveQualityByResolution(w: number, h: number): QualityType | null {
	if (!w || !h) return null;

	const mainDim = Math.max(w, h);

	if (mainDim >= 7680) return "8k";
	if (mainDim >= 3840) return "4k";
	if (mainDim >= 2560) return "1440p";
	if (mainDim >= 1920) return "1080p";
	if (mainDim >= 1280) return "720p";
	if (mainDim >= 854) return "480p";
	if (mainDim >= 640) return "360p";
	if (mainDim >= 426) return "240p";
	if (mainDim >= 256) return "144p";

	return null;
}