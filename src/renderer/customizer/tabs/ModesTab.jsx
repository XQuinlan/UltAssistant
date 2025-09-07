import React from 'react'

export function ModesTab() {
  return (
    <div className="space-y-3">
      <h2 className="text-base font-semibold">Modes</h2>
      <p className="text-sm text-white/70">Create and edit personalities. (Stub)</p>
      <div className="rounded border border-white/10 p-3 bg-white/5">
        <div className="text-sm">Planned:</div>
        <ul className="list-disc list-inside text-sm text-white/70 mt-1">
          <li>Name, emoji, description</li>
          <li>System prompt, default temp/tokens</li>
          <li>Tags and one-level version history</li>
        </ul>
      </div>
    </div>
  )
}

