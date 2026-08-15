'use client'

import { Check, FileArrowDown, Plus, SelectionAll } from '@phosphor-icons/react/dist/ssr'
import type { GalleryItem } from '@/lib/types'

interface ProduceProps {
  items: GalleryItem[]
  selection: string[]
  onToggle: (id: string) => void
  onSelectAll: () => void
  onExport: () => void
}

export default function Produce({
  items,
  selection,
  onToggle,
  onSelectAll,
  onExport,
}: ProduceProps) {
  const sheet = items.slice(0, 8)

  if (sheet.length === 0) {
    return (
      <div className="flex h-full items-center justify-center rounded-rail border border-dashed border-dash text-[12.5px] text-meta">
        Rien à mettre sur la planche pour l&apos;instant.
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col gap-[10px]">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="font-mono text-[10px] tracking-[.1em] text-label">
          PLANCHE — {selection.length} SÉLECTIONNÉE{selection.length > 1 ? 'S' : ''} SUR{' '}
          {sheet.length}
        </p>
        <div className="flex items-center gap-[6px]">
          <button
            type="button"
            onClick={onSelectAll}
            className="flex items-center gap-[6px] rounded-chip bg-field px-[10px] py-[6px] text-[12px] text-body-soft transition-colors duration-[240ms] hover:bg-field-hover"
          >
            <SelectionAll size={14} />
            Tout sélectionner
          </button>
          <button
            type="button"
            onClick={onExport}
            disabled={selection.length === 0}
            className="flex items-center gap-[6px] rounded-chip bg-field px-[10px] py-[6px] text-[12px] text-body-soft transition-colors duration-[240ms] hover:bg-field-hover disabled:opacity-40"
          >
            <FileArrowDown size={14} />
            Exporter planche + recettes
          </button>
        </div>
      </div>

      <div className="grid min-h-0 flex-1 grid-cols-4 grid-rows-2 gap-[10px]">
        {sheet.map((item, index) => {
          const checked = selection.includes(item.id)
          return (
            <div
              key={item.id}
              className={`relative overflow-hidden rounded-button ${checked ? 'ring-selected' : ''}`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`data:${item.result.mimeType};base64,${item.result.imageBase64}`}
                alt={item.prompt}
                className="h-full w-full object-cover"
              />
              <span className="hatch pointer-events-none absolute inset-0" />

              <button
                type="button"
                role="checkbox"
                aria-checked={checked}
                aria-label={`Sélectionner la variante v${index + 1}`}
                onClick={() => onToggle(item.id)}
                className={`absolute right-2 top-2 flex h-[18px] w-[18px] items-center justify-center rounded-[5px] ${
                  checked ? 'bg-accent text-accent-ink' : 'bg-app/55 text-white/70'
                }`}
                style={
                  checked ? undefined : { boxShadow: 'inset 0 0 0 1px rgb(255 255 255 / .18)' }
                }
              >
                {checked ? <Check size={11} weight="fill" /> : <Plus size={11} />}
              </button>

              <span className="absolute bottom-2 left-2 rounded-pill bg-app/60 px-[6px] py-[3px] font-mono text-[10px] text-mono backdrop-blur-[10px]">
                v{index + 1}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
