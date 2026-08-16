'use client'

import { SquaresFour } from '@phosphor-icons/react/dist/ssr'
import { formatEur } from '@/lib/atelier/cost'
import type { AbState } from '@/lib/atelier/use-atelier'
import type { AdapterId, GalleryItem } from '@/lib/types'

interface ColumnProps {
  adapterId: AdapterId
  item: GalleryItem | null
  error: string | null
  running: boolean
  accent: boolean
  keepLabel: string
  onKeep: () => void
  onDecline: () => void
}

function Column({
  adapterId,
  item,
  error,
  running,
  accent,
  keepLabel,
  onKeep,
  onDecline,
}: ColumnProps) {
  return (
    <div
      className={`flex min-w-0 flex-1 flex-col gap-[10px] rounded-rail p-[10px] ${
        accent ? 'ring-visual' : ''
      }`}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="flex items-center gap-2 font-mono text-[11.5px] text-mono">
          <span className="h-[7px] w-[7px] rounded-full bg-accent" />
          {adapterId}
        </span>
        {item && (
          <span className="font-mono text-[10.5px] text-meta">
            {(item.latencyMs / 1000).toLocaleString('fr-FR', { maximumFractionDigits: 1 })} s ·{' '}
            {formatEur(item.costEur)}
          </span>
        )}
      </div>

      <div className="relative min-h-0 flex-1 overflow-hidden rounded-rail bg-tile">
        {item && (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`data:${item.result.mimeType};base64,${item.result.imageBase64}`}
              alt={item.prompt}
              className="h-full w-full object-cover"
            />
            <span className="hatch pointer-events-none absolute inset-0" />
          </>
        )}

        {!item && running && (
          <div className="absolute inset-0 animate-shimmer"
            style={{
              background:
                'linear-gradient(100deg, transparent 20%, oklch(0.72 0.21 72 / .18) 50%, transparent 80%)',
              backgroundSize: '200% 100%',
            }}
          />
        )}

        {!item && error && (
          <p
            role="alert"
            className="absolute inset-0 flex items-center justify-center px-6 text-center text-[12.5px] text-error-text"
          >
            {error}
          </p>
        )}
      </div>

      <div className="flex items-center gap-[6px]">
        <button
          type="button"
          onClick={onKeep}
          disabled={!item}
          className="flex-1 rounded-chip bg-field px-[10px] py-[6px] text-[12px] text-body-soft transition-colors duration-[240ms] hover:bg-field-hover disabled:opacity-40"
        >
          {keepLabel}
        </button>
        <button
          type="button"
          onClick={onDecline}
          disabled={!item}
          className="flex items-center gap-[6px] rounded-chip bg-field px-[10px] py-[6px] text-[12px] text-body-soft transition-colors duration-[240ms] hover:bg-field-hover disabled:opacity-40"
        >
          <SquaresFour size={13} />
          Décliner
        </button>
      </div>
    </div>
  )
}

interface CompareProps {
  ab: AbState
  onKeep: (item: GalleryItem) => void
  onDecline: (item: GalleryItem) => void
  onRerun: () => void
  onExit: () => void
}

export default function Compare({ ab, onKeep, onDecline, onRerun, onExit }: CompareProps) {
  const total = (ab.a?.costEur ?? 0) + (ab.b?.costEur ?? 0)

  return (
    <div className="flex h-full flex-col gap-[10px]">
      <div className="flex items-center justify-between gap-2">
        <span className="font-mono text-[10.5px] text-meta">total {formatEur(total)}</span>
        <div className="flex shrink-0 items-center gap-[6px]">
          <button
            type="button"
            onClick={onExit}
            className="whitespace-nowrap rounded-chip bg-field px-[10px] py-[6px] text-[12px] text-body-soft transition-colors duration-[240ms] hover:bg-field-hover"
          >
            Quitter la comparaison
          </button>
          <button
            type="button"
            onClick={onRerun}
            className="whitespace-nowrap rounded-chip bg-field px-[10px] py-[6px] text-[12px] text-body-soft transition-colors duration-[240ms] hover:bg-field-hover"
          >
            Relancer les deux
          </button>
        </div>
      </div>

      <div className="flex min-h-0 flex-1 gap-[13px]">
        <Column
          adapterId="nano-banana-2"
          item={ab.a}
          error={ab.errorA}
          running={ab.running}
          accent
          keepLabel="Garder A"
          onKeep={() => ab.a && onKeep(ab.a)}
          onDecline={() => ab.a && onDecline(ab.a)}
        />
        <Column
          adapterId="gpt-image-2"
          item={ab.b}
          error={ab.errorB}
          running={ab.running}
          accent={false}
          keepLabel="Garder B"
          onKeep={() => ab.b && onKeep(ab.b)}
          onDecline={() => ab.b && onDecline(ab.b)}
        />
      </div>
    </div>
  )
}
