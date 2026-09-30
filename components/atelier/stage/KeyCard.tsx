'use client'

import { useState } from 'react'
import { ArrowSquareOutIcon, KeyIcon } from '@phosphor-icons/react/dist/ssr'
import { Button, Field } from '@/components/atelier/ui'
import { ADAPTERS, MODELS } from '@/lib/adapters/capabilities'
import { useT } from '@/lib/i18n'
import type { AdapterId } from '@/lib/types'

const KEY_URLS = {
  gemini: 'https://aistudio.google.com/apikey',
  openai: 'https://platform.openai.com/api-keys',
} as const

interface KeyCardProps {
  adapterId: AdapterId
  hasKeyFor: (adapterId: AdapterId) => boolean
  onSave: (value: string) => void
  onUseOther: (adapterId: AdapterId) => void
}

/** Générer sans clé : la scène la demande, le prompt attend. */
export default function KeyCard({ adapterId, hasKeyFor, onSave, onUseOther }: KeyCardProps) {
  const t = useT()
  const [value, setValue] = useState('')
  const spec = MODELS[adapterId]
  const other = ADAPTERS.find((id) => id !== adapterId && hasKeyFor(id))

  return (
    <form
      aria-labelledby="key-card-title"
      onSubmit={(event) => {
        event.preventDefault()
        if (value.trim()) onSave(value)
      }}
      className="flex w-full max-w-[420px] flex-col gap-3 rounded-xs border border-hairline-strong bg-solid p-5"
    >
      <span className="lbl flex items-center gap-1.5">
        <KeyIcon size={14} aria-hidden />
        {t.key.required}
      </span>
      <h2 id="key-card-title" className="text-17 font-semibold">
        {t.key.title(spec.provider)}
      </h2>
      <p className="text-12 text-ink-soft">{t.key.body(spec.name)}</p>

      <label className="flex flex-col gap-1.5">
        <span className="lbl">{t.key.field(spec.provider)}</span>
        <Field
          type="password"
          autoComplete="off"
          spellCheck={false}
          autoFocus
          value={value}
          onChange={(event) => setValue(event.target.value)}
        />
      </label>

      <div className="flex flex-wrap items-center gap-2">
        <Button type="submit" variant="secondary" disabled={!value.trim()}>
          {t.key.save}
        </Button>
        <a
          href={KEY_URLS[spec.keyKind]}
          target="_blank"
          rel="noreferrer"
          className="inline-flex h-8 items-center gap-1.5 rounded-xs px-3 text-12 text-ink-soft hover:bg-sunken hover:text-ink"
        >
          {t.key.get}
          <ArrowSquareOutIcon size={14} aria-hidden />
        </a>
      </div>

      {other && (
        <Button size="sm" className="self-start" onClick={() => onUseOther(other)}>
          {t.key.useOther(MODELS[other].name)}
        </Button>
      )}
      <p className="meta">{t.key.kept}</p>
    </form>
  )
}
