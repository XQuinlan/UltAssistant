const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('bridge', {
  setGhost: (on) => ipcRenderer.invoke('window:set-ghost', on),
  openCustomizer: (opts) => ipcRenderer.invoke('window:open-customizer', opts),
  resizeToContent: (height) => ipcRenderer.invoke('window:resize-to-content', height),
  reveal: () => ipcRenderer.invoke('window:reveal'),
})
