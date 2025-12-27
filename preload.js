const { contextBridge, ipcRenderer } = require("electron");
contextBridge.exposeInMainWorld("api", {
    pickVideo : () => ipcRenderer.invoke("pickVideo"),
    runFFmpeg : (cmd) => ipcRenderer.invoke("runFFmpeg", cmd)

});