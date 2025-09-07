import React from 'react'
import { PanelsTopLeft, Bot, MessageSquareText } from 'lucide-react'
import { ModelsTab } from './tabs/ModelsTab.jsx'
import { ModesTab } from './tabs/ModesTab.jsx'
import { PromptsTab } from './tabs/PromptsTab.jsx'

const TAB_REGISTRY = [
  { key: 'models', label: 'Models', icon: PanelsTopLeft, component: ModelsTab },
  { key: 'modes', label: 'Modes', icon: Bot, component: ModesTab },
  { key: 'prompts', label: 'Prompts', icon: MessageSquareText, component: PromptsTab },
]

function useHashQuery() {
  const [state, setState] = React.useState(() => {
    const hash = window.location.hash || ''
    const [route, query] = hash.replace(/^#/, '').split('?')
    const params = new URLSearchParams(query || '')
    return { route, params }
  })
  React.useEffect(() => {
    const onHash = () => {
      const hash = window.location.hash || ''
      const [route, query] = hash.replace(/^#/, '').split('?')
      const params = new URLSearchParams(query || '')
      setState({ route, params })
    }
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])
  return state
}

export function CustomizerApp() {
  const { params } = useHashQuery()
  const initialTab = params.get('tab') || 'models'
  const [active, setActive] = React.useState(initialTab)

  const ActiveComp = (TAB_REGISTRY.find(t => t.key === active) || TAB_REGISTRY[0]).component

  return (
    <div className="min-h-screen w-screen bg-slate-950 text-slate-100">
      <div className="h-12 px-4 border-b border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-sm opacity-80">Customizer</span>
        </div>
      </div>

      <div className="flex">
        <aside className="w-56 border-r border-white/10 p-2">
          {TAB_REGISTRY.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              className={`w-full flex items-center gap-2 px-3 py-2 rounded text-sm hover:bg-white/5 ${active === key ? 'bg-white/10' : ''}`}
              onClick={() => setActive(key)}
            >
              <Icon size={16} />
              <span>{label}</span>
            </button>
          ))}
        </aside>

        <main className="flex-1 p-4">
          <ActiveComp />
        </main>
      </div>
    </div>
  )
}

