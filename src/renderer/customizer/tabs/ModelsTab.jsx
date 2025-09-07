import React from 'react'

export function ModelsTab() {
  return (
    <div className="space-y-3">
      <h2 className="text-base font-semibold">Models</h2>
      <p className="text-sm text-white/70">Registry for model providers and defaults. (Stub)</p>
      <div className="rounded border border-white/10 p-3 bg-white/5">
        <div className="text-sm">Add your models here. Coming soon:</div>
        <ul className="list-disc list-inside text-sm text-white/70 mt-1">
          <li>Provider, notes (speed/cost), status</li>
          <li>Defaults: temperature, max tokens</li>
          <li>Set overlay default</li>
        </ul>
      </div>
    </div>
  )
}

