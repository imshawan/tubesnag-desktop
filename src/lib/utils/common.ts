export function formatBytes(bytes: number) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 10) / 10 + ' ' + sizes[i];
}

export function generateUUID(): string {
    const timestamp = Math.floor(Date.now() / 1000).toString(16).padStart(8, '0');
    const random = Array.from({ length: 16 }, () =>
        Math.floor(Math.random() * 16).toString(16)
    ).join('');
    return timestamp + random;
}