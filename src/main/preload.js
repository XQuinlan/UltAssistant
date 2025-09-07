const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('bridge', {
  setGhost: (on) => ipcRenderer.invoke('window:set-ghost', on),
})
