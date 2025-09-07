Overlay AI — Electron + React (Vite)

What’s included
- Electron main process with a transparent, always-on-top overlay window
- Vite + React renderer with TailwindCSS
- Secure preload bridge with contextIsolation
- Window size/position persistence via electron-store

Dev
1) Install deps: npm install
2) Run dev: npm run dev
   - Vite serves the renderer, Electron loads http://localhost:5173

Build
- Renderer: npm run build (outputs to dist/renderer)

Notes
- On macOS, the window uses vibrancy with a translucent background and blur.
- The window is frameless; add your own draggable header (the gray bar at top is styled as draggable in CSS).
- Preload exposes a minimal API (window.bridge.setGhost) to prepare for Ghost Mode.

