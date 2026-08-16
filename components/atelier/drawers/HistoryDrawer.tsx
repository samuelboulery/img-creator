'use client'

import { buildLineage, shortId } from '@/lib/atelier/diff'
import { thumbSrc } from '@/lib/atelier/session-store'
import type { GalleryItem } from '@/lib/types'

interface HistoryDrawerProps {
  items: GalleryItem[]
  selectedId: string | null
  onSelect: (id: string) => void
}

function changeLabel(item: GalleryItem, parent: GalleryItem | undefined): string {
  if (!parent) return item.prompt
  if (parent.prompt !== item.prompt) return 'prompt modifié'
  return 'déclinaison'
}

export default function HistoryDrawer({ items, selectedId, onSelect }: HistoryDrawerProps) {
  const nodes = buildLineage(items)
  const byId = new Map(items.map((item) => [item.id, item]))

  return (
    <div className="space-y-[6px]">
      <p className="font-mono text-[10px]/[1.6] text-meta">
        arborescence de la session — stockée dans ce navigateur, aucun serveur
      </p>

      {nodes.length === 0 && (
        <p className="rounded-section border border-dashed border-dash p-3 text-[12.5px] text-meta">
          Aucune génération pour l&apos;instant.
        </p>
      )}

      {nodes.map(({ item, depth }) => {
        const current = item.id === selectedId
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => onSelect(item.id)}
            aria-pressed={current}
            className="flex w-full items-center gap-[8px] rounded-ref p-[6px] text-left transition-colors duration-[240ms] hover:bg-field-hover"
            style={{ paddingLeft: 6 + Math.min(depth, 2) * 12 }}
          >
            <span
              aria-hidden
              className={`h-[34px] w-[2px] shrink-0 rounded-full ${
                current ? 'bg-accent' : 'bg-separator'
              }`}
            />
            {thumbSrc(item) ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={thumbSrc(item)}
                alt=""
                loading="lazy"
                decoding="async"
                className="h-[34px] w-[34px] shrink-0 rounded-switch object-cover"
              />
            ) : (
              <span className="h-[34px] w-[34px] shrink-0 rounded-switch bg-field" />
            )}
            <span className="min-w-0">
              <span className="block font-mono text-[10.5px] text-mono">{shortId(item)}</span>
              <span className="block truncate text-[11.5px] text-meta">
                {changeLabel(item, item.parentId ? byId.get(item.parentId) : undefined)}
              </span>
            </span>
          </button>
        )
      })}
    </div>
  )
}
