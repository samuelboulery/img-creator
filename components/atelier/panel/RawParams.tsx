'use client'

import { X } from '@phosphor-icons/react/dist/ssr'
import type { ExtraParam } from '@/lib/types'

const SUGGESTIONS: ExtraParam[] = [
  { key: 'imageSize', value: '2K' },
  { key: 'candidateCount', value: '4' },
  { key: 'safetySettings', value: '[]' },
  { key: 'outputMimeType', value: 'image/png' },
]

interface RawParamsProps {
  params: ExtraParam[]
  onChange: (params: ExtraParam[]) => void
}

/** La soupape : ces paires sont fusionnées telles quelles, en dernier. */
export default function RawParams({ params, onChange }: RawParamsProps) {
  function update(index: number, field: 'key' | 'value', value: string) {
    onChange(params.map((param, i) => (i === index ? { ...param, [field]: value } : param)))
  }

  return (
    <div className="space-y-[10px]">
      <div className="flex flex-wrap gap-[6px]">
        {SUGGESTIONS.map((suggestion) => {
          const active = params.some((param) => param.key === suggestion.key)
          return (
            <button
              key={suggestion.key}
              type="button"
              onClick={() => !active && onChange([...params, suggestion])}
              className={`rounded-switch px-[8px] py-[4px] font-mono text-[10.5px] transition-colors duration-[240ms] ${
                active
                  ? 'bg-selected text-accent-lighter'
                  : 'bg-field text-meta hover:bg-field-hover'
              }`}
            >
              {active ? '✓ ' : '+ '}
              {suggestion.key}
            </button>
          )
        })}
        <button
          type="button"
          onClick={() => onChange([...params, { key: '', value: '' }])}
          className="rounded-switch border border-dashed border-dash px-[8px] py-[4px] font-mono text-[10.5px] text-meta transition-colors duration-[240ms] hover:text-body-soft"
        >
          + personnalisé
        </button>
      </div>

      {params.map((param, index) => (
        <div key={index} className="flex items-center gap-[6px]">
          <input
            value={param.key}
            onChange={(event) => update(index, 'key', event.target.value)}
            placeholder="clé"
            aria-label="Clé du paramètre brut"
            className="w-[104px] rounded-chip bg-field px-2 py-[5px] font-mono text-[10.5px] text-mono placeholder:text-faint focus:outline-none"
          />
          <input
            value={param.value}
            onChange={(event) => update(index, 'value', event.target.value)}
            placeholder="valeur"
            aria-label="Valeur du paramètre brut"
            className="flex-1 rounded-chip bg-field px-2 py-[5px] font-mono text-[10.5px] text-mono placeholder:text-faint focus:outline-none"
          />
          <button
            type="button"
            onClick={() => onChange(params.filter((_, i) => i !== index))}
            aria-label="Supprimer le paramètre"
            className="text-icon transition-colors duration-[240ms] hover:text-error-icon"
          >
            <X size={12} />
          </button>
        </div>
      ))}
    </div>
  )
}
