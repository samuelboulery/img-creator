'use client'

import { useState } from 'react'
import { Key, Sparkle } from '@phosphor-icons/react/dist/ssr'
import type { EnrichResponse } from '@/app/api/enrich/route'

interface EnrichDrawerProps {
  apiKey: string
  onKeyChange: (value: string) => void
  prePrompt: string
  onPrePromptChange: (value: string) => void
  prompt: string
  onUseEnriched: (prompt: string) => void
}

export default function EnrichDrawer({
  apiKey,
  onKeyChange,
  prePrompt,
  onPrePromptChange,
  prompt,
  onUseEnriched,
}: EnrichDrawerProps) {
  const [enriched, setEnriched] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [running, setRunning] = useState(false)

  const hasKey = apiKey.trim().length > 0

  async function enrich() {
    setRunning(true)
    setError(null)

    try {
      const response = await fetch('/api/enrich', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey },
        body: JSON.stringify({ prompt, prePrompt }),
      })

      const json: EnrichResponse = await response.json()
      if (!json.success || !json.data) throw new Error(json.error ?? 'Erreur inconnue')

      setEnriched(json.data.prompt)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue')
    } finally {
      setRunning(false)
    }
  }

  return (
    <div className="space-y-[10px]">
      <p className="font-mono text-[10px]/[1.6] text-meta">
        L&apos;app fournit le pré-prompt, jamais le modèle : l&apos;enrichissement consomme ta
        propre clé texte, enregistrée dans ce navigateur.
      </p>

      <div className="rounded-button bg-section p-3">
        <div className="mb-[6px] flex items-center justify-between">
          <span className="flex items-center gap-2 text-[12.5px] text-body-soft">
            <Key size={14} weight={hasKey ? 'fill' : 'regular'} className="text-icon" />
            Clé texte
          </span>
          <span className={`font-mono text-[10px] ${hasKey ? 'text-accent-lighter' : 'text-meta'}`}>
            {hasKey ? 'clé présente' : 'aucune clé — fonction inactive'}
          </span>
        </div>
        <input
          type="password"
          value={apiKey}
          onChange={(event) => onKeyChange(event.target.value)}
          placeholder="Enregistrer dans ce navigateur"
          aria-label="Clé du modèle de texte"
          autoComplete="off"
          spellCheck={false}
          className="w-full rounded-chip bg-field px-2 py-[6px] font-mono text-[11px] text-mono placeholder:text-faint focus:outline-none"
        />
      </div>

      <div>
        <p className="mb-[6px] font-mono text-[10px] tracking-[.1em] text-label">
          PRÉ-PROMPT FOURNI
        </p>
        <textarea
          value={prePrompt}
          onChange={(event) => onPrePromptChange(event.target.value)}
          rows={8}
          aria-label="Pré-prompt fourni"
          className="w-full resize-none rounded-section bg-code p-3 font-mono text-[10.5px]/[1.65] text-mono focus:outline-none"
        />
      </div>

      <button
        type="button"
        disabled={!hasKey || !prompt.trim() || running}
        onClick={() => void enrich()}
        className={`flex w-full items-center justify-center gap-[6px] rounded-button py-[9px] text-[12.5px] transition-colors duration-[240ms] ${
          hasKey && prompt.trim()
            ? 'btn-accent font-medium'
            : 'bg-field-hover text-disabled'
        }`}
      >
        <Sparkle size={13} weight={hasKey ? 'fill' : 'regular'} />
        {running ? 'Enrichissement…' : 'Enrichir le prompt actuel'}
      </button>

      {error && (
        <p role="alert" className="text-[12px] text-error-text">
          {error}
        </p>
      )}

      {enriched && (
        <div className="space-y-[6px]">
          <div className="rounded-section bg-section p-3">
            <p className="font-mono text-[10px] tracking-[.1em] text-label">ORIGINAL</p>
            <p className="mt-[6px] text-[12.5px]/[1.5] text-body-soft">{prompt}</p>
          </div>
          <div className="rounded-section bg-section p-3 ring-selected">
            <p className="font-mono text-[10px] tracking-[.1em] text-label">ENRICHI</p>
            <p className="mt-[6px] text-[12.5px]/[1.5] text-body">{enriched}</p>
          </div>
          <button
            type="button"
            onClick={() => onUseEnriched(enriched)}
            className="w-full rounded-button bg-field px-3 py-[8px] text-[12.5px] text-body-soft transition-colors duration-[240ms] hover:bg-field-hover"
          >
            Utiliser l&apos;enrichi
          </button>
        </div>
      )}

      <p className="font-mono text-[10px]/[1.6] text-meta">
        le prompt original reste conservé — l&apos;enrichi s&apos;affiche à côté, tu choisis lequel
        partir
      </p>
    </div>
  )
}
