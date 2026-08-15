'use client'

import { useState } from 'react'
import { ignoredParams, PARAM_LABELS } from '@/lib/adapters/capabilities'
import { buildPayload, truncateInlineData } from '@/lib/adapters/payload'
import type { GenerationRequest } from '@/lib/types'

interface JsonTabProps {
  request: GenerationRequest
}

export default function JsonTab({ request }: JsonTabProps) {
  const [copied, setCopied] = useState(false)

  const payload = buildPayload(request)
  const shown = JSON.stringify(truncateInlineData(payload), null, 2)
  const ignored = ignoredParams(request.adapterId)

  async function copy() {
    // On copie le corps complet, pas la version tronquée.
    await navigator.clipboard.writeText(JSON.stringify(payload, null, 2))
    setCopied(true)
    setTimeout(() => setCopied(false), 1600)
  }

  return (
    <div className="space-y-[11px]">
      <div className="flex items-center justify-between">
        <span className="font-mono text-[10px] tracking-[.1em] text-label">
          CORPS DE LA REQUÊTE
        </span>
        <button
          type="button"
          onClick={copy}
          className="font-mono text-[10.5px] text-meta transition-colors duration-[240ms] hover:text-body-soft"
        >
          {copied ? 'copié' : 'copier'}
        </button>
      </div>

      <pre className="overflow-x-auto rounded-section bg-code p-3 font-mono text-[10.5px]/[1.65] whitespace-pre-wrap text-mono">
        {shown}
      </pre>

      <div className="rounded-section bg-section p-3">
        <p className="font-mono text-[10px] tracking-[.1em] text-label">IGNORÉ PAR CE MODÈLE</p>
        <p className="mt-[6px] font-mono text-[10.5px]/[1.6] text-meta">
          {ignored.length > 0
            ? ignored.map((param) => PARAM_LABELS[param]).join(' · ')
            : 'aucun — ce modèle accepte tous les réglages du panneau'}
        </p>
      </div>

      <p className="font-mono text-[10px]/[1.6] text-meta">
        Le négatif n&apos;a de champ dédié chez aucun des deux modèles : il est fusionné en fin de
        prompt, après déduplication avec celui du preset.
      </p>
    </div>
  )
}
