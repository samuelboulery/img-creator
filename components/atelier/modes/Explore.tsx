'use client'

import { useEffect, useState } from 'react'
import { ArrowsOut, Sparkle, SquaresFour } from '@phosphor-icons/react/dist/ssr'
import type { GalleryItem } from '@/lib/types'

/** Une génération en vol : la tuile affiche son compteur de secondes. */
export interface PendingTile {
  id: string
  startedAt: number
}

function dataUrl(item: GalleryItem): string {
  return `data:${item.result.mimeType};base64,${item.result.imageBase64}`
}

function Seconds({ startedAt }: { startedAt: number }) {
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(timer)
  }, [])

  return <>{Math.max(0, Math.round((now - startedAt) / 1000))}</>
}

function PendingCell({ tile }: { tile: PendingTile }) {
  return (
    <div className="relative overflow-hidden rounded-rail bg-tile">
      <div
        className="absolute inset-0 animate-shimmer"
        style={{
          background:
            'linear-gradient(100deg, transparent 20%, oklch(0.72 0.21 72 / .18) 50%, transparent 80%)',
          backgroundSize: '200% 100%',
        }}
      />
      <span className="absolute bottom-3 left-3 font-mono text-[10.5px] text-meta">
        génération · <Seconds startedAt={tile.startedAt} /> s
      </span>
    </div>
  )
}

function PaletteDots({ palette }: { palette: [string, string, string] }) {
  return (
    <span
      title="palette dominante extraite — elle colore le fond de l'application"
      className="flex items-center gap-[3px] rounded-pill bg-app/60 px-2 py-[5px] backdrop-blur-[10px]"
    >
      {palette.map((color, index) => (
        <span
          key={`${color}-${index}`}
          className="h-[9px] w-[9px] rounded-full"
          style={{ background: color }}
        />
      ))}
    </span>
  )
}

function ImageButton({
  item,
  selected,
  onSelect,
}: {
  item: GalleryItem
  selected: boolean
  onSelect: () => void
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={`group relative overflow-hidden rounded-rail ${selected ? 'ring-visual' : ''}`}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={dataUrl(item)} alt={item.prompt} className="h-full w-full object-cover" />
      <span className="hatch pointer-events-none absolute inset-0" />
    </button>
  )
}

function EmptyState() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-3 rounded-rail border border-dashed border-dash px-8 text-center">
      <Sparkle size={26} className="text-icon" />
      <p className="max-w-[380px] text-[13.5px] text-body-soft">
        Écris un prompt en bas, choisis un nombre de variantes, et les résultats s&apos;empilent
        ici.
      </p>
      <p className="font-mono text-[10.5px] text-meta">
        rien n&apos;est envoyé sans ta clé — tout reste dans ce navigateur
      </p>
    </div>
  )
}

interface ExploreProps {
  items: GalleryItem[]
  pending: PendingTile[]
  selectedId: string | null
  onSelect: (id: string) => void
  onEnlarge: () => void
  onDecline: (item: GalleryItem) => void
}

export default function Explore({
  items,
  pending,
  selectedId,
  onSelect,
  onEnlarge,
  onDecline,
}: ExploreProps) {
  if (items.length === 0 && pending.length === 0) return <EmptyState />

  const hero = items.find((item) => item.id === selectedId) ?? items[0]
  const others = items.filter((item) => item.id !== hero?.id)
  const thumbs = others.slice(0, Math.max(0, 4 - pending.length))

  return (
    <div className="grid h-full grid-cols-[1.62fr_1fr_1fr] grid-rows-2 gap-[13px]">
      {hero && (
        <div className="relative col-start-1 row-span-2 overflow-hidden rounded-rail ring-visual">
          <button
            type="button"
            onClick={onEnlarge}
            className="block h-full w-full"
            aria-label="Agrandir l'image sélectionnée"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={dataUrl(hero)} alt={hero.prompt} className="h-full w-full object-cover" />
            <span className="hatch pointer-events-none absolute inset-0" />
          </button>

          <div className="pointer-events-none absolute left-[14px] right-[14px] top-[14px] flex flex-wrap items-center gap-2">
            {hero.seed !== null && (
              <span className="rounded-pill bg-app/60 px-2 py-[5px] font-mono text-[10.5px] text-mono backdrop-blur-[10px]">
                seed {hero.seed}
              </span>
            )}
            {hero.palette && <PaletteDots palette={hero.palette} />}
          </div>

          <div className="absolute bottom-[13px] left-[14px] right-[14px] flex flex-wrap items-center justify-end gap-2">
            <button
              type="button"
              onClick={onEnlarge}
              className="flex h-[30px] items-center gap-[6px] rounded-pill bg-app/60 px-3 text-[12px] text-body-soft backdrop-blur-[10px] transition-colors duration-[240ms] hover:text-title"
            >
              <ArrowsOut size={14} />
              Agrandir
            </button>
            <button
              type="button"
              onClick={() => onDecline(hero)}
              className="flex h-[30px] items-center gap-[6px] rounded-pill bg-app/60 px-3 text-[12px] text-body-soft backdrop-blur-[10px] transition-colors duration-[240ms] hover:text-title"
            >
              <SquaresFour size={14} />
              Décliner ×4
            </button>
          </div>
        </div>
      )}

      {thumbs.map((item) => (
        <ImageButton
          key={item.id}
          item={item}
          selected={item.id === selectedId}
          onSelect={() => onSelect(item.id)}
        />
      ))}

      {pending.map((tile) => (
        <PendingCell key={tile.id} tile={tile} />
      ))}
    </div>
  )
}
