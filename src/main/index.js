const { app, BrowserWindow, ipcMain, globalShortcut } = require('electron')
const path = require('path')
const Store = require('electron-store')

const store = new Store({ name: 'settings' })

let mainWindow
let ghostOn = false
let customizerWindow

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

function openCustomizer(opts = {}) {
  const hash = `customizer${opts.tab ? `?tab=${encodeURIComponent(opts.tab)}` : ''}`
  const isDev = !app.isPackaged
  const devURL = `http://localhost:5173/#${hash}`
  const prodFile = path.join(__dirname, '../../dist/renderer/index.html')

  if (customizerWindow && !customizerWindow.isDestroyed()) {
    if (isDev) customizerWindow.loadURL(devURL)
    else customizerWindow.loadFile(prodFile, { hash })
    customizerWindow.show()
    customizerWindow.focus()
    return
  }

  customizerWindow = new BrowserWindow({
    width: 1040,
    height: 720,
    show: false,
    resizable: true,
    frame: true,
    title: 'Customizer',
    backgroundColor: '#121212',
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      preload: path.join(__dirname, 'preload.js'),
    },
  })

  if (isDev) customizerWindow.loadURL(devURL)
  else customizerWindow.loadFile(prodFile, { hash })

  customizerWindow.once('ready-to-show', () => customizerWindow.show())
  customizerWindow.on('closed', () => { customizerWindow = null })
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

ipcMain.handle('window:open-customizer', (_e, opts) => {
  openCustomizer(opts)
})

ipcMain.handle('window:resize-to-content', (_e, height) => {
  if (!mainWindow) return
  const bounds = mainWindow.getBounds()
  const target = Math.max(40, Math.round(Number(height) || 0))
  // Resize only height; keep width as-is
  mainWindow.setContentSize(bounds.width, target)
})

ipcMain.handle('window:reveal', () => {
  if (!mainWindow) return
  if (!mainWindow.isVisible()) mainWindow.showInactive()
  mainWindow.focus()
})
