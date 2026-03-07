import https from "https";
import fsSync from "fs";
import path from "node:path";

export const downloadFile = async (url: string, dest: string, onProgress?: (progress: number) => void): Promise<void> => {
    return new Promise((resolve, reject) => {
        const request = https.get(url, (response) => {
            if (response.statusCode === 301 || response.statusCode === 302 || response.statusCode === 303 || response.statusCode === 307 || response.statusCode === 308) {
                // Follow redirect
                const redirectUrl = response.headers.location;
                if (redirectUrl) {
                    downloadFile(redirectUrl, dest, onProgress).then(resolve).catch(reject);
                } else {
                    reject(new Error(`Redirect without location header`));
                }
                return;
            }
            if (response.statusCode !== 200) {
                reject(new Error(`Failed to download: ${response.statusCode}`));
                return;
            }
            const total = response.headers['content-length'] ? parseInt(response.headers['content-length']) : 0;
            let received = 0;
            response.on('data', (chunk) => {
                received += chunk.length;
                if (onProgress) {
                    if (total > 0) {
                        onProgress(Math.round((received / total) * 100));
                    } else {
                        onProgress(50); // indeterminate
                    }
                }
            });
            const file = fsSync.createWriteStream(dest);
            response.pipe(file);
            file.on('finish', () => {
                file.close();
                if (onProgress) onProgress(100);
                resolve();
            });
            file.on('error', (err: any) => {
                fsSync.unlink(dest, () => reject(err));
            });
        });
        request.on('error', (err) => {
            fsSync.unlink(dest, () => reject(err));
        });
    });
}

const downloadThumbnailOnly = (
    ytDlpExe: string, url: string, thumbnailPath: string, tempFile: string
): Promise<{title: string, channel: string}> => {
    return new Promise((resolve, reject) => {
        const { spawn } = require('child_process');
        const args = [
            '--skip-download',
            '--write-thumbnail',
            '--thumbnail-size', '500',
            '-o', `thumbnail:${path.join(thumbnailPath, '%(title)s.%(ext)s')}`,
            '--print-to-file', '%(channel)s', tempFile,
            url
        ];

        const child = spawn(ytDlpExe, args, { stdio: ['ignore', 'pipe', 'pipe'] });
        let title = '';

        child.stdout.on('data', (data: Buffer) => {
            const text = data.toString();
            const destMatch = text.match(/\[download\]\s+Destination:\s+(.+)/);
            if (destMatch) {
                title = destMatch[1].trim();
            }
        });

        child.on('close', (code: number) => {
            if (code === 0) {
                const channel = fsSync.existsSync(tempFile) ? fsSync.readFileSync(tempFile, "utf8").trim() : 'Unknown';
                resolve({ title, channel });
            } else {
                reject(new Error(`Thumbnail download failed with code ${code}`));
            }
        });

        child.on('error', reject);
    });
};
