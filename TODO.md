High-level TODOs (from GEMINI.md)

A) Overlay Window (MVP)
- Global hotkey: register ⌘/Ctrl+Shift+Space to show/hide
- Ghost Mode: toggle click-through with header still interactive
- Header controls: drag region, close/minimize, resize handles
- Stream UI: show typing indicator + Stop
- Copy/export: per-message copy; export session as Markdown/JSON

B) Customizer Window
- Second window with sidebar (Models, Modes, Prompts)
- Local JSON persistence with schema + versioning
- Deep link from Overlay to selected model/mode
- Dry-run panel and “Insert into Overlay”

C) Models/APIs
- Provider adapters: OpenAI (default), Anthropic optional
- Key storage via keytar (never expose to renderer)
- Add store=false option for extra privacy on calls

D) Privacy & Accessibility
- No-log toggle for sessions; Clear on Quit option
- Keyboard-first navigation and hotkeys (Send/Stop)
- High contrast theme option; meet WCAG 2.1 AA baseline

Near-term tasks to reach acceptance criteria
1. Add global hotkey to toggle window visibility
2. Implement Ghost Mode UI toggle (calls window.bridge.setGhost)
3. Persist selected model/mode in electron-store via preload APIs
4. Add “Customize…” button that opens Customizer window
5. Tune default colors to meet 4.5:1 contrast over translucency

