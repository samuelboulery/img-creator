'use client'

import { useEffect, useState } from 'react'

interface Props {
  label: string
  storageKey: string
  placeholder?: string
  onChange: (key: string) => void
}

export default function ApiKeyInput({ label, storageKey, placeholder = '…', onChange }: Props) {
  const [value, setValue] = useState('')
  const [visible, setVisible] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem(storageKey) ?? ''
    setValue(stored)
    onChange(stored)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storageKey])

  function handleSave() {
    localStorage.setItem(storageKey, value)
    onChange(value)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') handleSave()
  }

  return (
    <div className="border border-gray-700 rounded-lg px-3 py-2.5 space-y-1.5">
      <label className="block text-xs font-medium text-gray-400">{label}</label>
      <div className="flex gap-2">
        <input
          type={visible ? 'text' : 'password'}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="flex-1 min-w-0 rounded bg-gray-800 border border-gray-600 text-gray-100 placeholder-gray-600 px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-violet-500 font-mono"
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          className="text-gray-500 hover:text-gray-300 transition-colors text-xs px-1"
          title={visible ? 'Masquer' : 'Afficher'}
        >
          {visible ? '🙈' : '👁'}
        </button>
        <button
          type="button"
          onClick={handleSave}
          className="px-2.5 py-1 rounded bg-violet-700 hover:bg-violet-600 text-white text-xs font-medium transition-colors"
        >
          {saved ? '✓' : 'OK'}
        </button>
      </div>
      {!value && (
        <p className="text-[10px] text-gray-600">
          Utilisée si aucune clé n&apos;est définie dans <code>.env.local</code>
        </p>
      )}
    </div>
  )
}
