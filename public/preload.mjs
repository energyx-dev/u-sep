import { contextBridge, ipcRenderer } from "electron";

export const FILE_PRELOAD_CHANNEL = "fileApi";

contextBridge.exposeInMainWorld(FILE_PRELOAD_CHANNEL, {
  openFile: () => ipcRenderer.invoke("file:open"),
  saveFile: ({ defaultPath, data, fileName }) =>
    ipcRenderer.invoke("file:save", { defaultPath, data, fileName }),
  printToPDF: () => ipcRenderer.invoke("print:toPDF"),
  downloadManual: () => ipcRenderer.invoke("manual:save"),
  getGuideVideoPath: () => ipcRenderer.invoke("guide-video:path"),
});
