'use client'

import { useId, useState } from 'react'
import { MagnifyingGlassIcon } from '@phosphor-icons/react/dist/ssr'
import Dialog from './Dialog'
import { Kbd } from '@/components/atelier/ui'
import { useT } from '@/lib/i18n'

export interface Command {
  id: string
  group: string
  label: string
  /** Ce qui s'affiche à droite : « actuel », un raccourci… */
  hint?: string
  keys?: string[]
  run: () => void
}

interface CommandPaletteProps {
  commands: Command[]
  onClose: () => void
}

/** ⌘K : toutes les actions, filtrées au clavier. Combobox + listbox ARIA. */
export default function CommandPalette({ commands, onClose }: CommandPaletteProps) {
  const t = useT()
  const listId = useId()
  const [query, setQuery] = useState('')
  const [cursor, setCursor] = useState(0)

  const needle = query.trim().toLocaleLowerCase()
  const filtered = commands.filter(
    (command) => !needle || `${command.group} ${command.label}`.toLocaleLowerCase().includes(needle)
  )
  const active = Math.min(cursor, filtered.length - 1)
  const groups = [...new Set(filtered.map((command) => command.group))]

  function run(command: Command | undefined) {
    if (!command) return
    onClose()
    command.run()
  }

  function onKeyDown(event: React.KeyboardEvent) {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault()
      const step = event.key === 'ArrowDown' ? 1 : -1
      setCursor((active + step + filtered.length) % Math.max(1, filtered.length))
    }
    if (event.key === 'Enter') {
      event.preventDefault()
      run(filtered[active])
    }
  }

  return (
    <Dialog
      title={t.palette.label}
      header={false}
      width={560}
      onClose={onClose}
      footer={
        <p className="meta flex gap-4">
          <span className="flex items-center gap-1.5">
            <Kbd keys={['↑', '↓']} /> {t.palette.move}
          </span>
          <span className="flex items-center gap-1.5">
            <Kbd keys={['↵']} /> {t.palette.choose}
          </span>
          <span className="flex items-center gap-1.5">
            <Kbd keys={['Esc']} /> {t.palette.close}
          </span>
        </p>
      }
    >
      <div className="flex items-center gap-2 border-b border-hairline px-4">
        <MagnifyingGlassIcon size={16} aria-hidden className="text-ink-soft" />
        <input
          autoFocus
          role="combobox"
          aria-expanded
          aria-controls={listId}
          aria-activedescendant={filtered[active] ? `${listId}-${filtered[active].id}` : undefined}
          aria-label={t.palette.placeholder}
          placeholder={t.palette.placeholder}
          value={query}
          onChange={(event) => {
            setQuery(event.target.value)
            setCursor(0)
          }}
          onKeyDown={onKeyDown}
          className="h-12 flex-1 bg-transparent text-14 outline-none placeholder:text-dim focus-visible:outline-none"
        />
      </div>

      <div id={listId} role="listbox" aria-label={t.palette.label} className="max-h-[380px] overflow-y-auto p-1">
        {filtered.length === 0 && <p className="meta p-3">{t.palette.none}</p>}
        {groups.map((group) => (
          <div key={group} role="group" aria-label={group}>
            <p className="lbl px-3 pt-2.5 pb-1">{group}</p>
            {filtered
              .filter((command) => command.group === group)
              .map((command) => {
                const index = filtered.indexOf(command)
                return (
                  <div
                    key={command.id}
                    id={`${listId}-${command.id}`}
                    role="option"
                    aria-selected={index === active}
                    onPointerMove={() => setCursor(index)}
                    onClick={() => run(command)}
                    className={`flex h-9 cursor-pointer items-center justify-between gap-3 rounded-xs px-3 text-13 ${
                      index === active ? 'bg-raised text-ink' : 'text-ink-soft'
                    }`}
                  >
                    {command.label}
                    {command.keys ? <Kbd keys={command.keys} /> : command.hint && <span className="meta">{command.hint}</span>}
                  </div>
                )
              })}
          </div>
        ))}
      </div>
    </Dialog>
  )
}
