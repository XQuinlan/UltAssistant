import React from 'react'

export function PromptsTab() {
  return (
    <div className="space-y-3">
      <h2 className="text-base font-semibold">Prompts</h2>
      <p className="text-sm text-white/70">Prompt library with tags/search. (Stub)</p>
      <div className="rounded border border-white/10 p-3 bg-white/5">
        <div className="text-sm">Planned:</div>
        <ul className="list-disc list-inside text-sm text-white/70 mt-1">
          <li>CRUD, duplicate, pin, recently used</li>
          <li>Variables with {{placeholders}}</li>
          <li>Insert into Overlay</li>
        </ul>
      </div>
    </div>
  )
}

