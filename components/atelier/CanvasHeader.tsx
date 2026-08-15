'use client'

import type { AdapterId, Mode } from '@/lib/types'

const SEGMENTS: { mode: Mode; label: string }[] = [
  { mode: 'explore', label: 'Explorer' },
  { mode: 'iterate', label: 'Itérer' },
  { mode: 'produce', label: 'Produire' },
]

interface CanvasHeaderProps {
  sessionTitle: string
  /** Sous-ligne mono, ex. « 4 variantes · session locale ». Se tronque en premier. */
  counterLabel: string
  mode: Mode
  adapterId: AdapterId
  onModeChange: (mode: Mode) => void
  onToggleAdapter: () => void
  onOpenCommandPalette: () => void
}

export default function CanvasHeader({
  sessionTitle,
  counterLabel,
  mode,
  adapterId,
  onModeChange,
  onToggleAdapter,
  onOpenCommandPalette,
}: CanvasHeaderProps) {
  return (
    <header className="flex min-h-[56px] flex-wrap items-center justify-between gap-x-4 gap-y-2 px-4">
      {/* Le titre ne se compresse jamais ; c'est le compteur qui cède. */}
      <div className="flex min-w-0 items-baseline gap-3">
        <h1 className="shrink-0 whitespace-nowrap text-[15px] font-medium text-title">
          {sessionTitle}
        </h1>
        <p className="min-w-0 truncate font-mono text-[10.5px] text-meta">{counterLabel}</p>
      </div>

      <div className="flex shrink-0 items-center gap-[10px]">
        <div className="flex items-center gap-[2px] rounded-chip bg-field p-[3px]">
          {SEGMENTS.map((segment) => (
            <button
              key={segment.mode}
              type="button"
              onClick={() => onModeChange(segment.mode)}
              aria-pressed={mode === segment.mode}
              className={`rounded-[8px] px-[10px] py-[5px] text-[12px] transition-colors duration-[240ms] ${
                mode === segment.mode ? 'bg-tab text-title' : 'text-label hover:text-body-soft'
              }`}
            >
              {segment.label}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={onToggleAdapter}
          title="Changer de modèle"
          className="flex items-center gap-2 rounded-chip bg-field px-[10px] py-[6px] font-mono text-[11.5px] text-mono transition-colors duration-[240ms] hover:bg-field-hover"
        >
          <span className="h-[7px] w-[7px] rounded-full bg-accent" />
          {adapterId}
        </button>

        <button
          type="button"
          onClick={onOpenCommandPalette}
          title="Palette de commandes"
          className="rounded-chip bg-field px-[10px] py-[6px] font-mono text-[11.5px] text-meta transition-colors duration-[240ms] hover:bg-field-hover hover:text-mono"
        >
          ⌘K
        </button>
      </div>
    </header>
  )
}
