import React from 'react'
import { createRoot } from 'react-dom/client'
import {
  Ghost as GhostIcon,
  Settings as SettingsIcon,
  MessageSquareText as ChatIcon,
  X as StopIcon,
  Copy as CopyIcon,
  Send as SendIcon,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import './index.css'

// Measure an element's scrollHeight; caller decides what to do with it.
function useScrollHeight(ref, deps = []) {
  const [h, setH] = React.useState(0)
  React.useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    const measure = () => setH(el.scrollHeight)
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    requestAnimationFrame(measure)
    return () => ro.disconnect()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ref, ...deps])
  return h
}

function ToolbarButton({ onClick, label, title, active, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center justify-center h-6 w-6 rounded hover:bg-white/10 active:scale-[0.98] transition ${
        active ? 'text-emerald-300/90' : 'text-white/80'
      }`}
      style={{ WebkitAppRegion: 'no-drag' }}
      aria-label={label}
      title={title || label}
    >
      {children}
    </button>
  )
}

function MessageBubble({ role, text, onCopy, ghost, opaque }) {
  const isUser = role === 'user'
  // When chat is active (opaque), make bubbles fully opaque for readability.
  const userBg = opaque ? 'bg-slate-700 text-slate-50' : (ghost ? 'bg-white/10 text-white/90' : 'bg-slate-700/40 text-white/90')
  const asstBg = opaque ? 'bg-slate-800 text-slate-100' : (ghost ? 'bg-white/8 text-white/85' : 'bg-slate-800/35 text-white/85')
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} w-full`}>
      <div className={`relative max-w-[80%] rounded-xl px-3 py-2 text-[13px] leading-relaxed shadow-sm ${
        isUser ? `${userBg}` : `${asstBg}`
      }`}>
        <div className="whitespace-pre-wrap">{text}</div>
        {!isUser && (
          <button
            className="absolute -right-8 top-0.5 p-1 rounded text-white/50 hover:text-white/80"
            onClick={onCopy}
            title="Copy"
          >
            <CopyIcon size={14} />
          </button>
        )}
      </div>
    </div>
  )
}

function AutoGrowTextarea({ value, onChange, onKeyDown, placeholder }) {
  const ref = React.useRef(null)
  React.useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    el.style.height = '0px'
    const max = 160 // ~6 lines
    const next = Math.min(el.scrollHeight, max)
    el.style.height = next + 'px'
  }, [value])
  return (
    <textarea
      ref={ref}
      value={value}
      onChange={onChange}
      onKeyDown={onKeyDown}
      rows={1}
      placeholder={placeholder}
      className="w-full resize-none bg-transparent outline-none text-[13px] text-white/90 placeholder-white/55 leading-5"
      spellCheck={false}
    />
  )
}

function OverlayApp() {
  const [ghost, setGhost] = React.useState(false)
  const [openChat, setOpenChat] = React.useState(false)
  const [streaming, setStreaming] = React.useState(false)
  const [input, setInput] = React.useState('')
  const [messages, setMessages] = React.useState([])
  const headerRef = React.useRef(null)
  const contentRef = React.useRef(null)
  const contentHeight = useScrollHeight(contentRef, [messages.length, input, openChat])

  // Resize the entire Electron window content height so no empty space shows.
  React.useEffect(() => {
    const headerH = Math.round(headerRef.current?.getBoundingClientRect()?.height || 36)
    const desired = openChat ? headerH + (contentHeight || 0) : headerH
    window.bridge?.resizeToContent?.(desired)
  }, [openChat, contentHeight])

  // No internal scroller when unconstrained; window grows instead.

  // Maintain Ghost Mode behavior with interactive header
  React.useEffect(() => {
    const updateGhost = (on) => window.bridge?.setGhost?.(on)
    updateGhost(ghost)

    if (!ghost) return

    let lastInside = false
    const onMove = (e) => {
      const header = headerRef.current
      if (!header) return
      const rect = header.getBoundingClientRect()
      const inside =
        e.clientY >= rect.top &&
        e.clientY <= rect.bottom &&
        e.clientX >= rect.left &&
        e.clientX <= rect.right
      if (inside !== lastInside) {
        lastInside = inside
        window.bridge?.setGhost?.(!inside)
      }
    }
    window.addEventListener('mousemove', onMove, { passive: true })
    return () => {
      window.removeEventListener('mousemove', onMove)
      updateGhost(ghost)
    }
  }, [ghost])

  // Simulate an assistant reply to demo the expansion animation
  const simulateAssistant = async (seedText = 'Here’s a concise response with a few points…') => {
    setStreaming(true)
    const chunks = [
      'Here’s a concise response',
      ' with a few points',
      ' and a closing line.'
    ]
    let acc = ''
    setMessages((m) => [...m, { role: 'assistant', text: '' }])
    setOpenChat(true) // auto open when assistant talks
    window.bridge?.reveal?.()
    for (const part of chunks) {
      await new Promise((r) => setTimeout(r, 450))
      acc += part
      setMessages((m) => {
        const clone = m.slice()
        const last = clone[clone.length - 1]
        if (last && last.role === 'assistant') last.text = acc
        return clone
      })
    }
    setStreaming(false)
  }

  const onSend = async () => {
    const text = input.trim()
    if (!text || streaming) return
    setMessages((m) => [...m, { role: 'user', text }])
    setInput('')
    // demo assistant reply
    simulateAssistant()
  }

  const onKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      onSend()
    }
  }

  return (
    <div className="h-screen w-screen text-slate-100">
      {/* Toolbar */}
      <div
        ref={headerRef}
        className={`fixed top-0 left-0 right-0 h-9 px-3 flex items-center gap-2 text-xs text-white/80 select-none backdrop-blur-lg border-b ${
          // Make toolbar less transparent while keeping rest of window clear
          ghost ? 'bg-slate-900/30 border-white/10' : 'bg-slate-900/60 border-white/15'
        }`}
        style={{ WebkitAppRegion: 'drag' }}
      >
        <span>Overlay • MVP</span>
        <div className="flex-1" />
        <ToolbarButton
          onClick={() => setOpenChat((v) => !v)}
          label="Toggle chat"
          title="Chat"
          active={openChat}
        >
          <ChatIcon size={16} strokeWidth={2} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => setGhost((v) => !v)}
          label={`Ghost Mode ${ghost ? 'on' : 'off'}`}
          title={`Ghost Mode ${ghost ? 'on' : 'off'}`}
          active={ghost}
        >
          <GhostIcon size={16} strokeWidth={2} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => window.bridge?.openCustomizer?.({ tab: 'models' })}
          label="Customize…"
        >
          <SettingsIcon size={16} strokeWidth={2} />
        </ToolbarButton>
      </div>

      {/* Animated chat dropdown panel */}
      <div className="pointer-events-auto" style={{ WebkitAppRegion: 'no-drag' }}>
        <AnimatePresence initial={false}>
          {openChat && (
            <motion.div
              key="chat-panel"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 260, damping: 30 }}
              className={`fixed left-0 right-0 top-9 rounded-none overflow-hidden backdrop-blur-xl border-y ${
                // Make chat sheet less transparent by default; nearly opaque when open
                ghost ? 'border-white/10 bg-slate-900/65' : 'border-white/15 bg-slate-900/80'
              }`}
            >
              <div ref={contentRef} className="p-3 flex flex-col gap-3">
                {/* Messages */}
                <div className="space-y-2 pr-1">
                  <AnimatePresence initial={false}>
                    {messages.map((m, i) => (
                      <motion.div
                        key={i}
                        initial={{ y: 6, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: -6, opacity: 0 }}
                        transition={{ duration: 0.18 }}
                      >
                        <MessageBubble
                          role={m.role}
                          text={m.text}
                          ghost={ghost}
                          opaque={true}
                          onCopy={() => navigator.clipboard?.writeText(m.text)}
                        />
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>

                {/* Composer */}
                <div className="pt-1">
                  <div className="flex items-end gap-2">
                    <div className={`flex-1 rounded-lg transition p-2 pr-10 relative ring-1 backdrop-blur-sm ${
                      // Opaque input when chat open for maximum legibility
                      ghost ? 'bg-slate-800 ring-white/10 focus-within:ring-white/30' : 'bg-slate-800 ring-white/10 focus-within:ring-white/30'
                    }`}>
                      <AutoGrowTextarea
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={onKeyDown}
                        placeholder="Type a message…"
                      />
                      {streaming ? (
                        <button
                          onClick={() => setStreaming(false)}
                          className="absolute right-1.5 bottom-1.5 h-7 w-8 grid place-items-center rounded-md bg-white/10 hover:bg-white/15"
                          title="Stop"
                        >
                          <StopIcon size={14} />
                        </button>
                      ) : (
                        <button
                          onClick={onSend}
                          className="absolute right-1.5 bottom-1.5 h-7 w-8 grid place-items-center rounded-md bg-white/15 hover:bg-white/20"
                          title="Send"
                        >
                          <SendIcon size={14} />
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="mt-1 text-[11px] text-white/55">Enter = send • Shift+Enter = newline</div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
// --- Customizer App (modular) ---
import { CustomizerApp } from './customizer/CustomizerApp.jsx'

function RootRouter() {
  const [hash, setHash] = React.useState(window.location.hash)
  React.useEffect(() => {
    const onHash = () => setHash(window.location.hash)
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

  if (hash.startsWith('#customizer')) {
    return <CustomizerApp />
  }
  return <OverlayApp />
}

createRoot(document.getElementById('root')).render(<RootRouter />)
