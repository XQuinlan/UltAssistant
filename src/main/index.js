const { app, BrowserWindow, ipcMain, globalShortcut } = require('electron')
const path = require('path')
const Store = require('electron-store')

const store = new Store({ name: 'settings' })

let mainWindow
let ghostOn = false

function createWindow() {
  const lastBounds = store.get('window.bounds')

  mainWindow = new BrowserWindow({
    width: 820,
    height: 500,
    ...(lastBounds || {}),
    show: false,
    frame: false,
    transparent: true,
    resizable: true,
    hasShadow: false,
    backgroundColor: '#00000000',
    vibrancy: 'sidebar', // macOS visual effect
    visualEffectState: 'active',
    alwaysOnTop: true,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      preload: path.join(__dirname, 'preload.js'),
      spellcheck: false,
    },
  })

  if (process.platform === 'darwin') {
    app.dock.hide()
  }

  const isDev = !app.isPackaged
  if (isDev) {
    mainWindow.loadURL('http://localhost:5173')
    // Uncomment if you want devtools on launch
    // mainWindow.webContents.openDevTools({ mode: 'detach' })
  } else {
    mainWindow.loadFile(path.join(__dirname, '../../dist/renderer/index.html'))
  }

  mainWindow.once('ready-to-show', () => {
    mainWindow.show()
  })

  const saveBounds = () => {
    if (!mainWindow) return
    store.set('window.bounds', mainWindow.getBounds())
  }
  mainWindow.on('resize', saveBounds)
  mainWindow.on('move', saveBounds)
  mainWindow.on('close', saveBounds)
}

function registerGlobalHotkey() {
  const accel = 'CommandOrControl+Shift+Space'
  try {
    const ok = globalShortcut.register(accel, () => {
      if (!mainWindow) return
      if (mainWindow.isVisible()) {
        mainWindow.hide()
      } else {
        mainWindow.showInactive() // show without stealing focus too harshly
        mainWindow.focus()
      }
    })
    if (!ok) console.warn('Global hotkey registration failed:', accel)
  } catch (e) {
    console.error('Global hotkey error:', e)
  }
}

app.whenReady().then(() => {
  createWindow()
  registerGlobalHotkey()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

app.on('will-quit', () => {
  globalShortcut.unregisterAll()
})

// Simple, secure API surface for later features
ipcMain.handle('window:set-ghost', (_e, on) => {
  if (!mainWindow) return
  ghostOn = Boolean(on)
  mainWindow.setIgnoreMouseEvents(ghostOn, { forward: true })
})
