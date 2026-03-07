import { ipcRenderer, contextBridge } from "electron";
import { IPC_CHANNELS } from "./constants";

window.addEventListener("message", (event) => {
  if (event.data === IPC_CHANNELS.START_ORPC_SERVER) {
    const [serverPort] = event.ports;

    ipcRenderer.postMessage(IPC_CHANNELS.START_ORPC_SERVER, null, [serverPort]);
  }
});

contextBridge.exposeInMainWorld('electron', {
  selectFolder: () => ipcRenderer.invoke('dialog:selectFolder'),
  getDiskUsage: (path: any) => ipcRenderer.invoke('meta:get-disk-usage', path),
  checkDependencies: () => ipcRenderer.invoke('setup:check-dependencies'),
  installDependencies: () => ipcRenderer.invoke('setup:install-dependencies'),
  getPlatform: () => ipcRenderer.invoke('app:get-platform'),
  getAppVersion: () => ipcRenderer.invoke('app:get-version'),
  fileToDataUrl: (filePath: string) => ipcRenderer.invoke('file:to-data-url', filePath),
  onInstallProgress: (callback: any) => ipcRenderer.on('install-progress', (event, data) => callback(data)),
  offInstallProgress: (callback: any) => ipcRenderer.off('install-progress', callback),
  invoke: (channel: string, ...args: any[]) => ipcRenderer.invoke(channel, ...args),
  on: (channel: string, callback: any) => {
    ipcRenderer.on(channel, (event, data) => callback(data));
    return () => ipcRenderer.off(channel, callback);
  },
  off: (channel: string, callback: any) => ipcRenderer.off(channel, callback),
})
