This is a personal project so it doesn't need to scale.

Electron (Node + Chromium shell)
	•	Easy transparent, always-on-top windows with macOS vibrancy/blur.
	•	Mature ecosystem for hotkeys and window management.
Frontend
	•	React + Vite → fast dev, hot reload.
	•	Tailwind CSS → quick, consistent styling for translucent overlay and dark mode.
	•	lucide-react icons → clean, lightweight icon set.
	•	Framer Motion (optional) → subtle animations for opening/closing windows.

State & Data
	•	Zustand → lightweight state manager for chat sessions, modes, and settings.
	•	electron-store → JSON storage in ~/Library/Application Support/<AppName> for:
	•	Window position/size
	•	Session history (if logging enabled)
	•	Saved modes & prompts
	•	macOS Keychain (keytar) → store API keys securely instead of plaintext.


Models / API Layer
	•	Default provider: OpenAI API
	•	Use GPT-4o mini as your cheap daily driver.
	•	Burst to GPT-4o (or bigger) only when needed.
	•	Send store=false on Responses API calls when you want extra assurance about retention.
	•	Optional second provider: Anthropic Haiku for long context tasks.
	•	Adapters → define a ChatProvider interface so you can switch between APIs later.

Privacy & Security
	•	Context isolation ON → renderer can’t touch Node APIs directly.
	•	Preload bridge → expose only whitelisted IPC calls (chat.send, store.get/set, window.toggleGhost).
	•	FileVault → use built-in Mac full-disk encryption to secure data at rest.
	•	No-log sessions toggle → skips saving messages to disk.
	•	Clear on Quit option → wipes session files automatically when you exit.

A1. Window & Chrome
	1.	Transparent, always-on-top window with soft blur (where supported). Must remember last position/size on restart.  ￼
	2.	Global hotkey to show/hide (default: ⌘/Ctrl+Shift+Space). Hotkey must work even when the app is not focused.  ￼ ￼
	3.	Click-through toggle (“Ghost Mode”): when on, the content area ignores mouse events (with forward: true so scroll/hover passes through), while the header remains interactive to turn it off.  ￼ ￼
	4.	Resizing & dragging: drag by header; resize via edges/corners; persisted between runs.  ￼

A2. Chat Basics
	5.	Message stream: display user/assistant bubbles with timestamps; show live streaming indicator and Stop control.
	6.	Composer: multiline input; Enter = send, Shift+Enter = newline; character counter (optional).
	7.	Copy/export: copy single message; export session as Markdown/JSON from the overflow menu.

A3. Quick Controls
	8.	Model picker (compact): dropdown with label & hint (e.g., “fast”, “reasoning”). Selection persists per session.
	9.	Mode chip: shows active Personality; clicking opens a small selector (no editing here).
	10.	Quick tools (two buttons max):

	•	“Summarize this” (inserts a short prompt)
	•	“Next steps” (inserts a short prompt)
(Both simply prefill the composer.)

A4. Safety, Privacy & Accessibility
	11.	No-log toggle: when on, session content is not persisted locally and the UI indicates ephemeral mode.
	12.	Keyboard-first: all actions accessible via keyboard (Tab navigation, hotkeys for Send/Stop).
	13.	Contrast: default theme must meet WCAG 2.1 AA 4.5:1 contrast for text; offer a High-Contrast toggle given the translucent background.  ￼

A5. Navigation to Customizer
	14.	“Customize…” button opens Window 2 (brings it to front or launches if not running) and passes the current session’s model/mode so the editor lands on the right item.

⸻

B) Customization Studio (Window 2 — “Customizer”)

Purpose: full control over models, personalities (modes), and prompt library—without cluttering the mini overlay.

B1. Window & Layout
	1.	Standard window (not always-on-top). Left sidebar: Models, Modes, Prompts. Main pane: list + editor.
	2.	Opens from the Overlay; deep-links to the selected item.

B2. Models (Registry)
	3.	Model list with: name, provider, notes (speed/cost), status.
	4.	Defaults per model: temperature, max tokens (read/write).
	5.	Set overlay default: checkbox to mark the mini overlay’s default model.
	6.	Persisted using a local store (JSON in app data directory).  ￼ ￼

B3. Modes (Personalities)
	7.	CRUD for Modes: create, duplicate, rename, delete (with confirm).
	8.	Mode fields: name, emoji, description, system prompt, default temperature/tokens, tags.
	9.	Version note (lightweight): store last-modified timestamp; allow “Revert to previous” (one step back) in MVP.

B4. Prompt Library
	10.	CRUD for Prompts: create, duplicate, edit text, delete.
	11.	Organization: tags, search, “Pinned”, and “Recently used”.
	12.	Variables: allow {{placeholders}} with a simple fill-in sheet on insert (MVP supports plain text fields).

B5. Preview & Test
	13.	Dry-run panel: select a Model + Mode, type a sample input, and Preview (no session save).
	14.	Send to Overlay: “Insert into Overlay” button preloads the composed prompt into the mini window’s composer.

B6. Persistence, Security & IPC
	15.	Local persistence: all Models/Modes/Prompts stored locally (JSON, atomic saves, schema versioning).  ￼ ￼
	16.	Secure IPC: renderer calls are exposed via a preload bridge with contextIsolation enabled; no direct Node APIs in the UI.  ￼ ￼

⸻

C) Cross-Cutting Non-Functional Requirements
	1.	Performance: Overlay toggles in <200ms; initial paint <300ms; stream begins within perceived 250ms of provider start.
	2.	Stability: if a provider call fails, show an error toast and allow quick retry/switch model.
	3.	Persistence: window states, last session, and user settings are restored on launch (except when No-log is enabled).  ￼
	4.	Accessibility: keyboard-navigable controls; live region for streaming updates; AA contrast baseline.  ￼
	5.	Security: API keys never exposed to renderer; use IPC + preload only; contextIsolation: true.  ￼

⸻

D) Minimal Acceptance Criteria (MVP)
	•	Pressing the global hotkey shows/hides the Overlay regardless of focus.  ￼
	•	Toggling Ghost Mode lets clicks pass through the overlay while the header remains clickable to turn it off.  ￼ ￼
	•	Customize… opens the Customizer window focused on the selected mode/model and changes persist via local storage.  ￼
	•	Default theme meets 4.5:1 contrast for text over translucent backgrounds.  ￼