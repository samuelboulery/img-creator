'use client'

import { diffParams, diffPrompt, shortId } from '@/lib/atelier/diff'
import type { GalleryItem } from '@/lib/types'

function dataUrl(item: GalleryItem): string {
  return `data:${item.result.mimeType};base64,${item.result.imageBase64}`
}

function LineageCard({
  item,
  role,
  current,
  onSelect,
}: {
  item: GalleryItem
  role: string
  current: boolean
  onSelect: () => void
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={current}
      className={`flex w-full items-center gap-[8px] rounded-ref p-[6px] text-left transition-colors duration-[240ms] ${
        current ? 'bg-field-hover ring-selected' : 'hover:bg-field-hover'
      }`}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={dataUrl(item)}
        alt=""
        className="h-[34px] w-[34px] shrink-0 rounded-switch object-cover"
      />
      <span className="min-w-0">
        <span className="block font-mono text-[10.5px] text-mono">{shortId(item)}</span>
        <span className="block truncate text-[11px] text-meta">{role}</span>
      </span>
    </button>
  )
}

interface IterateProps {
  items: GalleryItem[]
  selectedId: string | null
  onSelect: (id: string) => void
}

export default function Iterate({ items, selectedId, onSelect }: IterateProps) {
  const current = items.find((item) => item.id === selectedId) ?? items[0]

  if (!current) {
    return (
      <div className="flex h-full items-center justify-center rounded-rail border border-dashed border-dash text-[12.5px] text-meta">
        Génère une première image pour commencer à itérer.
      </div>
    )
  }

  const parent = items.find((item) => item.id === current.parentId) ?? null
  const child = items.find((item) => item.parentId === current.id) ?? null
  const promptTokens = parent ? diffPrompt(parent.prompt, current.prompt) : null
  const deltas = parent ? diffParams(parent.params, current.params) : []

  return (
    <div className="flex h-full gap-[13px]">
      <div className="relative min-w-0 flex-1 overflow-hidden rounded-rail ring-visual">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={dataUrl(current)}
          alt={current.prompt}
          className="h-full w-full object-cover"
        />
        <span className="hatch pointer-events-none absolute inset-0" />
      </div>

      <div className="w-[244px] shrink-0 space-y-[13px] overflow-y-auto">
        <section>
          <p className="mb-[6px] font-mono text-[10px] tracking-[.1em] text-label">LIGNÉE</p>
          <div className="space-y-[6px]">
            {parent && (
              <LineageCard
                item={parent}
                role="parent"
                current={false}
                onSelect={() => onSelect(parent.id)}
              />
            )}
            <LineageCard item={current} role="actuelle" current onSelect={() => undefined} />
            {child && (
              <LineageCard
                item={child}
                role="enfant"
                current={false}
                onSelect={() => onSelect(child.id)}
              />
            )}
          </div>
        </section>

        <section>
          <p className="mb-[6px] font-mono text-[10px] tracking-[.1em] text-label">
            ÉCART DE PROMPT
          </p>
          <div className="rounded-section bg-section p-3 font-mono text-[11.5px]/[1.6]">
            {promptTokens ? (
              promptTokens.map((token, index) => {
                if (token.kind === 'removed') {
                  return (
                    <s key={index} className="text-meta">
                      {token.text}{' '}
                    </s>
                  )
                }
                if (token.kind === 'added') {
                  return (
                    <span key={index} className="text-accent-lighter">
                      {token.text}{' '}
                    </span>
                  )
                }
                return (
                  <span key={index} className="text-label">
                    {token.text}{' '}
                  </span>
                )
              })
            ) : (
              <span className="text-label">{current.prompt}</span>
            )}
          </div>
        </section>

        <section className="space-y-[4px]">
          {deltas.map((delta) => (
            <p key={delta.label} className="font-mono text-[10.5px] text-meta">
              {delta.label} {delta.from} →{' '}
              <span className="text-accent-lighter">{delta.to}</span>
            </p>
          ))}
          {parent && deltas.length === 0 && (
            <p className="font-mono text-[10.5px] text-meta">réglages inchangés</p>
          )}
          {current.seed !== null && (
            <p className="font-mono text-[10.5px] text-meta">graine {current.seed}</p>
          )}
        </section>
      </div>
    </div>
  )
}
