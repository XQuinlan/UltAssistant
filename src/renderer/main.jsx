import React from 'react'
import { createRoot } from 'react-dom/client'
import { Ghost as GhostIcon } from 'lucide-react'
import './index.css'

function App() {
  const [ghost, setGhost] = React.useState(false)
  const headerRef = React.useRef(null)

  React.useEffect(() => {
    const updateGhost = (on) => window.bridge?.setGhost?.(on)
    updateGhost(ghost)

    if (!ghost) return

    let lastInside = false
    const onMove = (e) => {
      const header = headerRef.current
      if (!header) return
      const rect = header.getBoundingClientRect()
      const inside = e.clientY >= rect.top && e.clientY <= rect.bottom && e.clientX >= rect.left && e.clientX <= rect.right
      if (inside !== lastInside) {
        lastInside = inside
        // When pointer enters header, re-enable events so header is clickable.
        window.bridge?.setGhost?.(!inside)
      }
    }
    window.addEventListener('mousemove', onMove, { passive: true })
    return () => {
      window.removeEventListener('mousemove', onMove)
      // restore full ghost state on cleanup
      updateGhost(ghost)
    }
  }, [ghost])

  return (
    <div className="h-screen w-screen text-slate-100">
      <div
        ref={headerRef}
        className="fixed top-0 left-0 right-0 h-9 px-3 flex items-center gap-3 text-xs text-white/80 bg-black/10 backdrop-blur-md select-none"
        style={{ WebkitAppRegion: 'drag' }}
      >
        <span>Overlay • MVP</span>
        <button
          type="button"
          onClick={() => setGhost((v) => !v)}
          className={`ml-1 inline-flex items-center justify-center h-6 w-6 rounded hover:bg-white/10 active:scale-[0.98] ${ghost ? 'text-emerald-300/90' : 'text-white/80'}`}
          style={{ WebkitAppRegion: 'no-drag' }}
          aria-label={`Toggle Ghost Mode ${ghost ? 'on' : 'off'}`}
          title={`Ghost Mode ${ghost ? 'on' : 'off'}`}
        >
          <GhostIcon size={16} strokeWidth={2} />
        </button>
      </div>

      <div className="pt-12 px-3">
        <textarea
          className="w-full min-h-[140px] resize-y bg-transparent outline-none text-white/90 placeholder-white/50 border-b border-white/20 focus:border-white/40 pb-2"
          placeholder="Type your message…"
          spellCheck={false}
        />
        <div className="mt-2 text-[11px] text-white/60">Enter = send • Shift+Enter = newline • Toggle Ghost in header</div>
      </div>
    </div>
  )
}

createRoot(document.getElementById('root')).render(<App />)
