'use client'

import { useRef } from 'react'
import { CheckCircle, Sparkle } from '@phosphor-icons/react/dist/ssr'
import { useFocusTrap } from '@/lib/atelier/focus-trap'
import type { KeyKind } from '@/lib/types'

interface KeyFieldProps {
  title: string
  hint: string
  value: string
  onChange: (value: string) => void
}

function KeyField({ title, hint, value, onChange }: KeyFieldProps) {
  const filled = value.trim().length > 0

  return (
    <div
      className={`rounded-button bg-section p-3 ${filled ? 'ring-selected' : ''}`}
    >
      <div className="mb-[6px] flex items-center justify-between">
        <span className="text-[12.5px] text-body-soft">{title}</span>
        {filled && <CheckCircle size={15} weight="fill" className="text-accent-light" />}
      </div>
      <input
        type="password"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="colle ta clé"
        aria-label={title}
        autoComplete="off"
        spellCheck={false}
        className="w-full rounded-chip bg-field px-2 py-[6px] font-mono text-[11px] text-mono placeholder:text-faint focus:outline-none"
      />
      <p className="mt-[6px] font-mono text-[10px] text-meta">{hint}</p>
    </div>
  )
}

interface OnboardingProps {
  keys: Record<KeyKind, string>
  onKeyChange: (kind: KeyKind, value: string) => void
  onEnter: () => void
}

export default function Onboarding({ keys, onKeyChange, onEnter }: OnboardingProps) {
  const dialogRef = useRef<HTMLDivElement>(null)
  useFocusTrap(dialogRef)

  return (
    <div className="absolute inset-0 z-[60] bg-[rgb(6_8_11/0.78)] backdrop-blur-[22px]">
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label="Connecte un modèle"
        className="mx-auto mt-[96px] w-[460px] rounded-panel border border-line bg-panel/72 p-7 backdrop-blur-[28px]"
      >
        <span className="flex h-[36px] w-[36px] items-center justify-center rounded-chip bg-section">
          <Sparkle size={18} weight="fill" className="text-accent-light" />
        </span>

        <h2 className="mt-[14px] text-[20px] font-medium text-title">Connecte un modèle</h2>
        <p className="mt-[8px] text-[13.5px]/[1.5] text-body-soft">
          Une seule fois. La clé reste sur cette machine, l&apos;app n&apos;a ni serveur ni base :
          elle ne part que vers l&apos;API du modèle que tu choisis.
        </p>

        <div className="mt-[16px] space-y-[10px]">
          <KeyField
            title="Google AI Studio"
            hint="nano-banana-2"
            value={keys.gemini}
            onChange={(value) => onKeyChange('gemini', value)}
          />
          <KeyField
            title="OpenAI — optionnel"
            hint="gpt-image-2, pour la comparaison A/B"
            value={keys.openai}
            onChange={(value) => onKeyChange('openai', value)}
          />
        </div>

        <button
          type="button"
          onClick={onEnter}
          className="btn-accent mt-[16px] h-[42px] w-full rounded-button text-[13px] font-medium"
        >
          Entrer dans l&apos;atelier
        </button>

        <p className="mt-[10px] text-center font-mono text-[10px] text-meta">
          ou utiliser la clé du serveur (.env.local)
        </p>
      </div>
    </div>
  )
}
