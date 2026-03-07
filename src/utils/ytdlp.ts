import type {DownloadItem} from "@/store/slices/downloads-slice";

interface DownloadOptions {
  url: string;
  outputPath: string;
  quality: string;
  format?: string;
  onProgress?: (progress: number) => void;
  onData?: (data: Partial<DownloadItem>) => void;
  onDuplicate?: (filename: string, metadata: any) => void;
}

export const downloadWithYtdlp = async (options: DownloadOptions): Promise<void> => {
  const { url, outputPath, quality, format, onProgress, onData, onDuplicate } = options;

  if (!globalThis.electron) {
    throw new Error("Electron not available");
  }

  const electron = globalThis.electron as any;

  return new Promise((resolve, reject) => {
    const handleProgress = (data: any) => {
      console.log('[ytdlp utility] received:', data);
      if (data.type === "progress") {
        onProgress?.(data.progress);
      } else if (data.type === "metadata") {
        onData?.(data.data);
      } else if (data.type === "duplicate") {
        onDuplicate?.(data.data.filename, data.data);
        onData?.({ status: "duplicate", progress: 100, ...data.data });
      } else if (data.type === "complete") {
        onData?.(data.data);
        electron.off("ytdlp:progress", handleProgress);
        resolve();
      } else if (data.type === "error") {
        electron.off("ytdlp:progress", handleProgress);
        reject(new Error(data.error));
      }
    };

    electron.on("ytdlp:progress", handleProgress);

    electron.invoke("ytdlp:download", {
      url,
      outputPath,
      quality,
      format,
    }).catch((err: Error) => {
      electron.off("ytdlp:progress", handleProgress);
      reject(err);
    });
  });
};

export const fileToDataUrl = async (filePath: string): Promise<string> => {
  if (!globalThis.electron) {
    throw new Error("Electron not available");
  }
  return await globalThis.electron.fileToDataUrl(filePath);
};
