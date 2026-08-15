'use client'

import { useEffect, useRef } from 'react'
import { Sparkle } from '@phosphor-icons/react/dist/ssr'
import { formatEur } from '@/lib/atelier/cost'

function Chip({ children, dot }: { children: React.ReactNode; dot?: boolean }) {
  return (
    <span className="flex items-center gap-[6px] rounded-chip bg-field px-[9px] py-[5px] font-mono text-[10.5px] text-meta">
      {dot && <span className="h-[6px] w-[6px] rounded-full bg-accent" />}
      {children}
    </span>
  )
}

interface ComposerProps {
  prompt: string
  negative: string
  onPromptChange: (value: string) => void
  onNegativeChange: (value: string) => void
  /** Nom du preset actif, ou null. */
  presetName: string | null
  aspectRatio: string
  batch: number
  estimatedCost: number
  /** Une clé texte est enregistrée : sinon `Enrichir` ouvre le tiroir. */
  hasEnrichKey: boolean
  onEnrich: () => void
  onSubmit: () => void
}

export default function Composer({
  prompt,
  negative,
  onPromptChange,
  onNegativeChange,
  presetName,
  aspectRatio,
  batch,
  estimatedCost,
  hasEnrichKey,
  onEnrich,
  onSubmit,
}: ComposerProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Auto-grow : la hauteur suit le contenu, jamais de barre de défilement.
  useEffect(() => {
    const node = textareaRef.current
    if (!node) return
    node.style.height = 'auto'
    node.style.height = `${node.scrollHeight}px`
  }, [prompt])

  function handleKeyDown(event: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      if (prompt.trim()) onSubmit()
    }
  }

  const negativeExcerpt = negative.trim().slice(0, 24)

  return (
    <div
      className="rounded-composer bg-field/90 backdrop-blur-[20px]"
      style={{
        boxShadow:
          'inset 0 1px 0 var(--color-dash), 0 -10px 26px -22px oklch(0.72 0.21 72 / .3)',
      }}
    >
      {/* Prompt */}
      <div className="flex items-start gap-[10px] px-[14px] py-[12px]">
        <span className="mt-[8px] h-[7px] w-[7px] shrink-0 rounded-full bg-accent animate-breathe" />
        <textarea
          ref={textareaRef}
          value={prompt}
          onChange={(event) => onPromptChange(event.target.value)}
          onKeyDown={handleKeyDown}
          rows={1}
          placeholder="Décris l'image que tu veux générer…"
          aria-label="Prompt"
          className="w-full resize-none overflow-hidden bg-transparent text-[15px]/[1.5] text-body placeholder:text-faint focus:outline-none"
        />
      </div>

      {/* Négatif */}
      <div className="flex items-center gap-[10px] border-t border-[#1A1F2A] px-[14px] py-[9px]">
        <span className="font-mono text-[10px] tracking-[.1em] text-label">NÉGATIF</span>
        <input
          value={negative}
          onChange={(event) => onNegativeChange(event.target.value)}
          placeholder="ce qu'il faut éviter…"
          aria-label="Prompt négatif"
          className="flex-1 bg-transparent text-[12.5px] text-body-soft placeholder:text-faint focus:outline-none"
        />
        <span className="shrink-0 font-mono text-[10px] text-faint">fusionné au prompt</span>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap items-center gap-[8px] border-t border-[#1A1F2A] px-[14px] py-[10px]">
        {presetName && <Chip dot>{presetName}</Chip>}
        <Chip>{aspectRatio}</Chip>
        <Chip>×{batch}</Chip>
        {negativeExcerpt && <Chip>− {negativeExcerpt}</Chip>}

        <button
          type="button"
          onClick={onEnrich}
          className="flex items-center gap-[6px] rounded-chip bg-field px-[9px] py-[5px] text-[12px] text-body-soft transition-colors duration-[240ms] hover:bg-field-hover"
        >
          <Sparkle size={13} weight={hasEnrichKey ? 'fill' : 'regular'} className="text-accent-light" />
          Enrichir
          <span
            className={`h-[6px] w-[6px] rounded-full ${hasEnrichKey ? 'bg-accent' : 'bg-faint'}`}
            title={hasEnrichKey ? 'clé texte présente' : 'aucune clé texte'}
          />
        </button>

        <div className="flex-1" />

        <span className="font-mono text-[11.5px] text-meta">≈ {formatEur(estimatedCost)}</span>

        <button
          type="button"
          onClick={onSubmit}
          disabled={!prompt.trim()}
          className="btn-accent flex h-[38px] items-center gap-2 rounded-button px-4 text-[13px] font-medium disabled:cursor-not-allowed disabled:opacity-50"
        >
          Générer
          <span className="opacity-70">⏎</span>
        </button>
      </div>
    </div>
  )
}
