import { os } from "@orpc/server"
import {
  downloadVideoInputSchema,
  downloadPlaylistInputSchema,
  downloadBulkInputSchema,
} from "./download-schemas"
import { app } from 'electron';
import path from 'node:path';
import { spawn } from 'child_process';

export const downloadVideo = os
  .input(downloadVideoInputSchema)
  .handler(async ({ input }) => {
    const { url, quality } = input;
    const userDataPath = app.getPath('userData');
    const ytdlpPath = path.join(userDataPath, 'ytdlp');
    const ytDlpExe = path.join(ytdlpPath, process.platform === 'win32' ? 'yt-dlp.exe' : 'yt-dlp');
    const outputDir = path.join(require('os').homedir(), 'Downloads');
    const qualityMap: Record<string, string> = {
      best: 'best',
      high: 'best[height<=1080]',
      medium: 'best[height<=720]',
      low: 'best[height<=480]',
    };
    const args = [
      '--format', qualityMap[quality],
      '--output', path.join(outputDir, '%(title)s.%(ext)s'),
      url
    ];
    return new Promise((resolve, reject) => {
      const child = spawn(ytDlpExe, args, { stdio: 'inherit' });
      child.on('close', (code) => {
        if (code === 0) {
          resolve({ success: true, url });
        } else {
          reject(new Error(`Download failed with code ${code}`));
        }
      });
      child.on('error', reject);
    });
  })

export const downloadPlaylist = os
  .input(downloadPlaylistInputSchema)
  .handler(async ({ input }) => {
    const { url, quality, limit } = input;
    const userDataPath = app.getPath('userData');
    const ytdlpPath = path.join(userDataPath, 'ytdlp');
    const ytDlpExe = path.join(ytdlpPath, process.platform === 'win32' ? 'yt-dlp.exe' : 'yt-dlp');
    const outputDir = path.join(require('os').homedir(), 'Downloads');
    const qualityMap: Record<string, string> = {
      best: 'best',
      high: 'best[height<=1080]',
      medium: 'best[height<=720]',
      low: 'best[height<=480]',
    };
    const args = [
      '--yes-playlist',
      '--format', qualityMap[quality],
      '--output', path.join(outputDir, '%(playlist_title)s/%(title)s.%(ext)s'),
    ];
    if (limit) {
      args.push('--playlist-items', `1-${limit}`);
    }
    args.push(url);
    return new Promise((resolve, reject) => {
      const child = spawn(ytDlpExe, args, { stdio: 'inherit' });
      child.on('close', (code) => {
        if (code === 0) {
          resolve({ success: true, url });
        } else {
          reject(new Error(`Download failed with code ${code}`));
        }
      });
      child.on('error', reject);
    });
  })

export const downloadBulk = os
  .input(downloadBulkInputSchema)
  .handler(async ({ input }) => {
    const { urls, quality } = input;
    const userDataPath = app.getPath('userData');
    const ytdlpPath = path.join(userDataPath, 'ytdlp');
    const ytDlpExe = path.join(ytdlpPath, process.platform === 'win32' ? 'yt-dlp.exe' : 'yt-dlp');
    const outputDir = path.join(require('os').homedir(), 'Downloads');
    const qualityMap: Record<string, string> = {
      best: 'best',
      high: 'best[height<=1080]',
      medium: 'best[height<=720]',
      low: 'best[height<=480]',
    };
    const promises = urls.map(url => {
      const args = [
        '--format', qualityMap[quality],
        '--output', path.join(outputDir, '%(title)s.%(ext)s'),
        url
      ];
      return new Promise((resolve, reject) => {
        const child = spawn(ytDlpExe, args, { stdio: 'inherit' });
        child.on('close', (code) => {
          if (code === 0) {
            resolve(true);
          } else {
            reject(new Error(`Download failed for ${url}`));
          }
        });
        child.on('error', reject);
      });
    });
    await Promise.all(promises);
    return { success: true, count: urls.length };
  })
