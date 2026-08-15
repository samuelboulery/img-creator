'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { MagnifyingGlass, type Icon } from '@phosphor-icons/react'

export interface Command {
  id: string
  label: string
  shortcut?: string
  icon: Icon
  run: () => void
}

interface CommandPaletteProps {
  commands: Command[]
  onClose: () => void
}

export default function CommandPalette({ commands, onClose }: CommandPaletteProps) {
  const [query, setQuery] = useState('')
  const [cursor, setCursor] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)

  const filtered = useMemo(() => {
    const needle = query.trim().toLocaleLowerCase()
    if (!needle) return commands
    return commands.filter((command) => command.label.toLocaleLowerCase().includes(needle))
  }, [commands, query])

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  function onKeyDown(event: React.KeyboardEvent) {
    if (event.key === 'ArrowDown') {
      event.preventDefault()
      setCursor((previous) => Math.min(previous + 1, filtered.length - 1))
    }
    if (event.key === 'ArrowUp') {
      event.preventDefault()
      setCursor((previous) => Math.max(previous - 1, 0))
    }
    if (event.key === 'Enter') {
      event.preventDefault()
      const command = filtered[cursor]
      if (command) {
        command.run()
        onClose()
      }
    }
  }

  return (
    <div
      className="absolute inset-0 z-50 bg-[rgb(6_8_11/0.6)] backdrop-blur-[14px]"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Palette de commandes"
        onClick={(event) => event.stopPropagation()}
        onKeyDown={onKeyDown}
        className="mx-auto mt-[96px] w-[460px] overflow-hidden rounded-panel border border-line bg-panel/72 backdrop-blur-[28px]"
      >
        <div className="flex items-center gap-[10px] border-b border-separator px-4 py-[12px]">
          <MagnifyingGlass size={15} className="text-icon" />
          <input
            ref={inputRef}
            value={query}
            onChange={(event) => {
              setQuery(event.target.value)
              setCursor(0)
            }}
            placeholder="Chercher une commande…"
            aria-label="Chercher une commande"
            className="flex-1 bg-transparent text-[13px] text-body placeholder:text-faint focus:outline-none"
          />
          <span className="font-mono text-[10px] text-meta">esc</span>
        </div>

        <ul className="max-h-[320px] overflow-y-auto p-[6px]">
          {filtered.map((command, index) => {
            const Glyph = command.icon
            return (
              <li key={command.id}>
                <button
                  type="button"
                  onMouseEnter={() => setCursor(index)}
                  onClick={() => {
                    command.run()
                    onClose()
                  }}
                  className={`flex w-full items-center gap-[10px] rounded-chip px-3 py-[8px] text-left transition-colors duration-[240ms] ${
                    index === cursor ? 'bg-field-hover' : ''
                  }`}
                >
                  <Glyph size={16} className="shrink-0 text-icon" />
                  <span className="flex-1 truncate text-[13px] text-body">{command.label}</span>
                  {command.shortcut && (
                    <span className="font-mono text-[10.5px] text-meta">{command.shortcut}</span>
                  )}
                </button>
              </li>
            )
          })}

          {filtered.length === 0 && (
            <li className="px-3 py-[10px] text-[12.5px] text-meta">Aucune commande</li>
          )}
        </ul>
      </div>
    </div>
  )
}
