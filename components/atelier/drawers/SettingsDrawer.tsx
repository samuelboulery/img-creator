'use client'

import { useState } from 'react'
import { Eye, EyeSlash, Key } from '@phosphor-icons/react/dist/ssr'
import Switch from '../panel/Switch'
import type { Prefs } from '@/lib/atelier/storage'
import type { AdapterId } from '@/lib/types'

export type KeyKind = 'gemini' | 'openai' | 'text'

interface KeyCardProps {
  title: string
  hint: string
  value: string
  onChange: (value: string) => void
}

function KeyCard({ title, hint, value, onChange }: KeyCardProps) {
  const [revealed, setRevealed] = useState(false)
  const active = value.trim().length > 0

  return (
    <div className="rounded-button bg-section p-3">
      <div className="mb-[6px] flex items-center justify-between">
        <span className="flex items-center gap-2 text-[12.5px] text-body-soft">
          <Key size={14} weight={active ? 'fill' : 'regular'} className="text-icon" />
          {title}
        </span>
        <span
          className={`font-mono text-[10px] ${active ? 'text-accent-lighter' : 'text-meta'}`}
        >
          {active ? 'active' : 'inactive'}
        </span>
      </div>

      <div className="flex items-center gap-[6px]">
        <input
          type={revealed ? 'text' : 'password'}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder="colle ta clé"
          aria-label={title}
          autoComplete="off"
          spellCheck={false}
          className="flex-1 rounded-chip bg-field px-2 py-[6px] font-mono text-[11px] text-mono placeholder:text-faint focus:outline-none"
        />
        <button
          type="button"
          onClick={() => setRevealed((previous) => !previous)}
          aria-label={revealed ? 'Masquer la clé' : 'Révéler la clé'}
          className="text-icon transition-colors duration-[240ms] hover:text-body-soft"
        >
          {revealed ? <EyeSlash size={15} /> : <Eye size={15} />}
        </button>
      </div>

      <p className="mt-[6px] font-mono text-[10px] text-meta">{hint}</p>
    </div>
  )
}

interface SettingsDrawerProps {
  keys: Record<KeyKind, string>
  onKeyChange: (kind: KeyKind, value: string) => void
  prefs: Prefs
  onPrefsChange: (prefs: Prefs) => void
  onReviewOnboarding: () => void
}

export default function SettingsDrawer({
  keys,
  onKeyChange,
  prefs,
  onPrefsChange,
  onReviewOnboarding,
}: SettingsDrawerProps) {
  const [editingPricing, setEditingPricing] = useState(false)

  function setPrice(adapterId: AdapterId, value: number) {
    onPrefsChange({ ...prefs, pricing: { ...prefs.pricing, [adapterId]: value } })
  }

  return (
    <div className="space-y-[10px]">
      <KeyCard
        title="Google AI Studio"
        hint="nano-banana-2 · reste dans ce navigateur"
        value={keys.gemini}
        onChange={(value) => onKeyChange('gemini', value)}
      />
      <KeyCard
        title="OpenAI"
        hint="gpt-image-2 · reste dans ce navigateur"
        value={keys.openai}
        onChange={(value) => onKeyChange('openai', value)}
      />
      <KeyCard
        title="Modèle de texte"
        hint="enrichissement du prompt · optionnel"
        value={keys.text}
        onChange={(value) => onKeyChange('text', value)}
      />

      <div className="rounded-button bg-section p-3">
        <Switch
          label="Fond réactif"
          checked={prefs.ambientEnabled}
          onChange={(checked) => onPrefsChange({ ...prefs, ambientEnabled: checked })}
        />
      </div>

      <div className="rounded-button bg-section p-3">
        <div className="flex items-center justify-between">
          <span className="text-[12.5px] text-label">Estimation des coûts</span>
          <button
            type="button"
            onClick={() => setEditingPricing((previous) => !previous)}
            className="text-[12px] text-link transition-colors duration-[240ms] hover:text-link-hover"
          >
            {editingPricing ? 'fermer' : 'éditer'}
          </button>
        </div>

        {editingPricing && (
          <div className="mt-[10px] space-y-[8px]">
            {(['nano-banana-2', 'gpt-image-2'] as AdapterId[]).map((adapterId) => (
              <label key={adapterId} className="flex items-center justify-between gap-2">
                <span className="font-mono text-[10.5px] text-meta">{adapterId}</span>
                <input
                  type="number"
                  step="0.001"
                  min="0"
                  value={prefs.pricing[adapterId]}
                  onChange={(event) => setPrice(adapterId, Number(event.target.value))}
                  className="w-[86px] rounded-chip bg-field px-2 py-[5px] text-right font-mono text-[11px] text-mono focus:outline-none"
                />
              </label>
            ))}
            <p className="font-mono text-[10px] text-meta">€ par image, estimation locale</p>
          </div>
        )}
      </div>

      <button
        type="button"
        onClick={onReviewOnboarding}
        className="w-full rounded-button bg-field px-3 py-[9px] text-[12.5px] text-body-soft transition-colors duration-[240ms] hover:bg-field-hover"
      >
        Revoir l&apos;écran d&apos;accueil
      </button>

      <p className="font-mono text-[10px]/[1.6] text-meta">
        Les clés sont enregistrées dans ce navigateur. L&apos;app n&apos;a ni serveur ni base :
        elles ne partent que vers l&apos;API du modèle que tu choisis.
      </p>
    </div>
  )
}
