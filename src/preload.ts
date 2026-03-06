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
  onInstallProgress: (callback: any) => ipcRenderer.on('install-progress', (event, data) => callback(data)),
  offInstallProgress: (callback: any) => ipcRenderer.off('install-progress', callback),
  invoke: (channel: string, ...args: any[]) => ipcRenderer.invoke(channel, ...args)
})
