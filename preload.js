const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  runFFmpeg: (payload) => ipcRenderer.invoke('run-ffmpeg', payload),
  onLog: (cb) => ipcRenderer.on('ffmpeg-log', (e, data) => cb(data)),
  selectFile: () => ipcRenderer.invoke('select-file'),
  generateThumbs: (payload) => ipcRenderer.invoke('generate-thumbs', payload),
  grabFrame: (payload) => ipcRenderer.invoke('grab-frame', payload),
  detectEncoders: () => ipcRenderer.invoke('detect-encoders')
});
