/**
 * Download Utilities
 * Helper functions for download operations
 */
import {generateUUID} from "@/lib/utils/common";
import {DOWNLOAD_FORMAT_TYPES, ytdlpErrorMap} from "@/lib/ytdlp/constants";

export function isValidYouTubeUrl(url: string): boolean {
    const youtubeUrlPattern = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+/
    return youtubeUrlPattern.test(url.trim())
}

export function isValidPlaylistUrl(url: string): boolean {
    const playlistUrlPattern = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/playlist\?list=.+/
    return playlistUrlPattern.test(url.trim())
}

export function createDownloadItemFromUrls(urls: string[], quality: QualityType, format: FormatType, downloadPath: string) {
    return urls.map((url) => {
        const tempId = generateUUID();
        return {
            id: tempId,
            url,
            title: "Fetching video info...",
            channel: "Please wait",
            status: "pending" as const,
            progress: 0,
            size: 0,
            quality: quality,
            type: "video",
            date: new Date().toISOString(),
            format,
            downloadPath
        }
    }) as DownloadItem[];
}

export function createPlaylistDownloadItemFromUrls(urls: string[], quality: QualityType, format: FormatType, downloadPath: string, playlistId: string, playlistName: string): DownloadItem[] {
    return urls.map((url) => {
        const type = isValidPlaylistUrl(url) ? "playlist" : (format ? DOWNLOAD_FORMAT_TYPES[format] : "")
        const tempId = generateUUID();
        return {
            id: tempId,
            url,
            title: "Fetching video info...",
            channel: "Please wait",
            status: "pending" as const,
            progress: 0,
            size: 0,
            quality: quality,
            type,
            date: new Date().toISOString(),
            format,
            downloadPath,
            parentId: playlistId,
            parentTitle: playlistName
        }
    }) as DownloadItem[];
}

export function extractVideoId(url: string): string | null {
    const patterns = [
        /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/,
        /^([a-zA-Z0-9_-]{11})$/,
    ]

    for (const pattern of patterns) {
        const match = url.match(pattern);
        if (match) return match[1];
    }

    return null;
}

export function parseUrlList(input: string): string[] {
    return input
        .split(/[,\n]+/)
        .map((url) => url.trim())
        .filter((url) => url.length > 0 && isValidYouTubeUrl(url))
        .map(normalizeSingleVideoUrl);
}

export function formatDuration(seconds: number): string {
    if (seconds === 0) return "0s"

    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60

    const parts = []
    if (hours > 0) parts.push(`${hours}h`)
    if (minutes > 0) parts.push(`${minutes}m`)
    if (secs > 0 || parts.length === 0) parts.push(`${secs}s`)

    return parts.join(" ")
}

/**
 * Validate a list of URLs
 */
export function validateUrlList(urls: string[]): { valid: boolean; errors: string[] } {
    const errors: string[] = []

    if (urls.length === 0) {
        errors.push("No URLs provided")
    }

    urls.forEach((url, index) => {
        if (!isValidYouTubeUrl(url)) {
            errors.push(`URL ${index + 1} is not a valid YouTube URL`)
        }
    })

    return {
        valid: errors.length === 0,
        errors,
    }
}

/**
 * Get download filename from video title
 */
export function sanitizeFilename(filename: string, maxSize:
number = 255): string {
    return filename
        .replace(/[^\w\s.-]/gu, '')
        .replace(/\s+/g, ' ')
        .trim()
        .slice(0, maxSize);
}

export function sizeToBytes(sizeStr: string): number {
    const match = sizeStr.match(/([\d.]+)\s*([KMGT]iB|[KMGT]B|B)/);
    if (!match) return 0;

    const value = parseFloat(match[1]);
    const unit = match[2];

    const multipliers: Record<string, number> = {
        'B': 1,
        'KiB': 1024,
        'KB': 1000,
        'MiB': 1024 ** 2,
        'MB': 1000 ** 2,
        'GiB': 1024 ** 3,
        'GB': 1000 ** 3,
        'TiB': 1024 ** 4,
        'TB': 1000 ** 4,
    };

    return Math.round(value * (multipliers[unit] || 1));
}

export function normalizeSingleVideoUrl(url: string): string {
    const videoId = extractVideoId(url)
    if (!videoId) return url
    return `https://www.youtube.com/watch?v=${videoId}`
}

export function parseYtdlpError(errorLine: string): string {
    const errorMatch = errorLine.match(/ERROR:\s+(.+?)$/);
    if (!errorMatch) return 'Unknown error occurred';

    const errorMsg = errorMatch[1].trim();

    for (const [key, value] of Object.entries(ytdlpErrorMap)) {
        if (errorMsg.includes(key)) {
            return value;
        }
    }

    return errorMsg;
};

export function isYtdlpError(line: string): boolean {
    return line.includes('ERROR:');
};