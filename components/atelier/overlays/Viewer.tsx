'use client'

import { useEffect, useRef } from 'react'
import {
  ArrowLeft,
  ArrowRight,
  DownloadSimple,
  SquaresFour,
} from '@phosphor-icons/react/dist/ssr'
import PreviewBadge from '@/components/atelier/PreviewBadge'
import { formatEur } from '@/lib/atelier/cost'
import { useFocusTrap } from '@/lib/atelier/focus-trap'
import { hasFullImage, imageSrc } from '@/lib/atelier/session-store'
import type { GalleryItem } from '@/lib/types'

interface ViewerProps {
  items: GalleryItem[]
  selectedId: string | null
  recipeName: string | null
  onSelect: (id: string) => void
  onClose: () => void
  onReusePrompt: (item: GalleryItem) => void
  onDecline: (item: GalleryItem) => void
  onDownload: (item: GalleryItem) => void
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-3 py-[5px]">
      <span className="font-mono text-[10px] tracking-[.1em] text-label">{label}</span>
      <span className="truncate font-mono text-[11.5px] text-mono">{value}</span>
    </div>
  )
}

export default function Viewer({
  items,
  selectedId,
  recipeName,
  onSelect,
  onClose,
  onReusePrompt,
  onDecline,
  onDownload,
}: ViewerProps) {
  const closeRef = useRef<HTMLButtonElement>(null)
  const dialogRef = useRef<HTMLDivElement>(null)
  useFocusTrap(dialogRef)
  const index = Math.max(
    0,
    items.findIndex((item) => item.id === selectedId)
  )
  const item = items[index]

  // Le focus part sur « Retour » et revient d'où il venait à la fermeture.
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null
    closeRef.current?.focus()
    return () => previous?.focus()
  }, [])

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose()
      if (event.key === 'ArrowLeft' && index > 0) onSelect(items[index - 1].id)
      if (event.key === 'ArrowRight' && index < items.length - 1) onSelect(items[index + 1].id)
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [index, items, onClose, onSelect])

  if (!item) return null

  return (
    <div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-label="Image en plein écran"
      className="absolute inset-0 z-40 flex flex-col gap-[13px] bg-[rgb(6_8_11/0.72)] p-[18px] backdrop-blur-[30px]"
    >
      <div className="flex items-center justify-between">
        <button
          ref={closeRef}
          type="button"
          onClick={onClose}
          className="flex items-center gap-2 rounded-chip bg-field px-[10px] py-[6px] text-[12.5px] text-body-soft transition-colors duration-[240ms] hover:bg-field-hover"
        >
          <ArrowLeft size={14} />
          Retour
        </button>

        <span className="font-mono text-[11.5px] text-meta">
          {index + 1} / {items.length}
        </span>

        <div className="flex items-center gap-[6px]">
          <button
            type="button"
            aria-label="Image précédente"
            disabled={index === 0}
            onClick={() => onSelect(items[index - 1].id)}
            className="flex h-[30px] w-[30px] items-center justify-center rounded-chip bg-field text-icon transition-colors duration-[240ms] hover:bg-field-hover disabled:opacity-40"
          >
            <ArrowLeft size={14} />
          </button>
          <button
            type="button"
            aria-label="Image suivante"
            disabled={index === items.length - 1}
            onClick={() => onSelect(items[index + 1].id)}
            className="flex h-[30px] w-[30px] items-center justify-center rounded-chip bg-field text-icon transition-colors duration-[240ms] hover:bg-field-hover disabled:opacity-40"
          >
            <ArrowRight size={14} />
          </button>
        </div>
      </div>

      <div className="flex min-h-0 flex-1 gap-[16px]">
        <div className="relative flex min-w-0 flex-1 items-center justify-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imageSrc(item)}
            alt={item.prompt}
            className="max-h-full max-w-full rounded-panel object-contain"
          />
          {!hasFullImage(item) && (
            <span className="absolute left-0 top-0">
              <PreviewBadge />
            </span>
          )}
        </div>

        <aside className="flex w-[380px] shrink-0 flex-col gap-[13px] overflow-y-auto rounded-panel border border-line bg-panel/72 p-4 backdrop-blur-[28px]">
          <section>
            <p className="font-mono text-[10px] tracking-[.1em] text-label">PROMPT</p>
            <p className="mt-[6px] text-[13.5px]/[1.5] text-body">{item.prompt}</p>
          </section>

          {item.negative && (
            <section>
              <p className="font-mono text-[10px] tracking-[.1em] text-label">NÉGATIF</p>
              <p className="mt-[6px] text-[13.5px]/[1.5] text-body-soft">{item.negative}</p>
            </section>
          )}

          <section className="divide-y divide-separator">
            <Row label="MODÈLE" value={item.adapterId} />
            <Row label="GRAINE" value={item.seed !== null ? String(item.seed) : 'aléatoire'} />
            <Row
              label="FORMAT"
              value={`${item.params.aspectRatio} · ${item.params.resolution}`}
            />
            <Row label="PRESET" value={recipeName ?? '—'} />
            <Row
              label="LATENCE"
              value={`${(item.latencyMs / 1000).toLocaleString('fr-FR', {
                maximumFractionDigits: 1,
              })} s`}
            />
            <Row label="COÛT" value={formatEur(item.costEur)} />
          </section>

          {item.palette && (
            <section>
              <p className="font-mono text-[10px] tracking-[.1em] text-label">PALETTE EXTRAITE</p>
              <div className="mt-[8px] flex gap-[6px]">
                {item.palette.map((color, position) => (
                  <span
                    key={`${color}-${position}`}
                    className="h-[26px] w-[26px] rounded-full"
                    style={{ background: color }}
                    title={color}
                  />
                ))}
              </div>
            </section>
          )}

          <div className="mt-auto space-y-[6px]">
            <button
              type="button"
              onClick={() => onReusePrompt(item)}
              className="btn-accent w-full rounded-button py-[10px] text-[13px] font-medium"
            >
              Reprendre ce prompt
            </button>
            <div className="flex gap-[6px]">
              <button
                type="button"
                onClick={() => onDecline(item)}
                className="flex flex-1 items-center justify-center gap-[6px] rounded-button bg-field py-[9px] text-[12.5px] text-body-soft transition-colors duration-[240ms] hover:bg-field-hover"
              >
                <SquaresFour size={13} />
                Décliner ×4
              </button>
              <button
                type="button"
                onClick={() => onDownload(item)}
                disabled={!hasFullImage(item)}
                title={
                  hasFullImage(item)
                    ? undefined
                    : "l'image pleine résolution n'a pas été conservée"
                }
                className="flex flex-1 items-center justify-center gap-[6px] rounded-button bg-field py-[9px] text-[12.5px] text-body-soft transition-colors duration-[240ms] hover:bg-field-hover disabled:opacity-40"
              >
                <DownloadSimple size={13} />
                Télécharger
              </button>
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}
