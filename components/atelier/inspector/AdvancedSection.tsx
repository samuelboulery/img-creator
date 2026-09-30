'use client'

import { useState } from 'react'
import {
  CaretDownIcon,
  CopyIcon,
  LockIcon,
  LockOpenIcon,
  PlusIcon,
  ShuffleIcon,
  XIcon,
} from '@phosphor-icons/react/dist/ssr'
import { Button, Field, IconButton, Segmented } from '@/components/atelier/ui'
import { supports } from '@/lib/adapters/capabilities'
import { buildPayload, truncateInlineData } from '@/lib/adapters/payload'
import { randomSeed, setParam } from '@/lib/atelier/params'
import { useT } from '@/lib/i18n'
import type { AdapterId, GenerationParams, GenerationRequest, Language, Moderation, PersonGeneration } from '@/lib/types'

interface AdvancedSectionProps {
  /** Les modèles qui recevront ces réglages : le principal, et le parallèle s'il y en a un. */
  adapterIds: AdapterId[]
  params: GenerationParams
  onChange: (params: GenerationParams) => void
  /** Requête courante : l'encart Requête montre le corps réel qui partira. */
  request: GenerationRequest
}

function Group({ label, meta, children }: { label: string; meta?: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex min-h-4 items-center justify-between gap-2">
        <span className="lbl">{label}</span>
        {meta && <span className="meta">{meta}</span>}
      </div>
      {children}
    </div>
  )
}

export default function AdvancedSection({ adapterIds, params, onChange, request }: AdvancedSectionProps) {
  const t = useT()
  const [copied, setCopied] = useState(false)
  const reads = (param: Parameters<typeof supports>[1]) => adapterIds.some((id) => supports(id, param))
  const set = <K extends keyof GenerationParams>(key: K, value: GenerationParams[K]) =>
    onChange(setParam(params, key, value))

  const payload = buildPayload(request)

  async function copy() {
    try {
      await navigator.clipboard.writeText(JSON.stringify(payload, null, 2))
      setCopied(true)
      setTimeout(() => setCopied(false), 1600)
    } catch {
      // Presse-papiers refusé (contexte non sécurisé) : le corps reste lisible juste en dessous.
      setCopied(false)
    }
  }

  const summary = [
    reads('seed') && (params.seedLock && params.seed !== null ? t.advanced.seedLocked(params.seed) : t.advanced.summarySeed),
    reads('moderation') && t.advanced.summaryModeration(params.moderation),
  ]
    .filter(Boolean)
    .join(' · ')

  return (
    <section className="border-t border-hairline px-4 pt-3.5 pb-4">
      <details className="group">
        <summary className="flex cursor-pointer list-none items-center justify-between gap-2 [&::-webkit-details-marker]:hidden">
          <span className="lbl">{t.advanced.title}</span>
          <span className="meta flex items-center gap-1.5 truncate">
            {summary}
            <CaretDownIcon size={12} aria-hidden className="shrink-0 transition-transform group-open:rotate-180" />
          </span>
        </summary>

        <div className="flex flex-col gap-4 pt-3.5">
          {reads('seed') && (
            <Group
              label={t.advanced.seed}
              meta={params.seedLock && params.seed !== null ? t.advanced.seedLocked(params.seed) : t.advanced.seedRandom}
            >
              <div className="flex items-center gap-1">
                <Field
                  aria-label={t.advanced.seed}
                  inputMode="numeric"
                  placeholder={t.common.random}
                  value={params.seed ?? ''}
                  onChange={(event) => {
                    const raw = event.target.value.trim()
                    const value = Number.parseInt(raw, 10)
                    set('seed', raw === '' || Number.isNaN(value) ? null : value)
                  }}
                  className="flex-1"
                />
                <IconButton
                  icon={params.seedLock ? LockIcon : LockOpenIcon}
                  label={params.seedLock ? t.advanced.unlockSeed : t.advanced.lockSeed}
                  active={params.seedLock}
                  aria-pressed={params.seedLock}
                  disabled={params.seed === null && !params.seedLock}
                  onClick={() => set('seedLock', !params.seedLock)}
                />
                <IconButton
                  icon={ShuffleIcon}
                  label={t.advanced.newSeed}
                  onClick={() => onChange({ ...params, seed: randomSeed(), seedLock: true })}
                />
              </div>
            </Group>
          )}

          {reads('personGeneration') && (
            <Group label={t.advanced.people}>
              <Segmented<PersonGeneration>
                label={t.advanced.people}
                mono={false}
                value={params.personGeneration}
                onChange={(value) => set('personGeneration', value)}
                options={[
                  { value: 'allow_adult', label: t.advanced.peopleAdults },
                  { value: 'allow_all', label: t.advanced.peopleAll },
                  { value: 'dont_allow', label: t.advanced.peopleNone },
                ]}
              />
            </Group>
          )}

          {reads('moderation') && (
            <Group label={t.advanced.moderation}>
              <Segmented<Moderation>
                label={t.advanced.moderation}
                value={params.moderation}
                onChange={(value) => set('moderation', value)}
                options={[
                  { value: 'auto', label: 'auto' },
                  { value: 'low', label: 'low' },
                ]}
              />
            </Group>
          )}

          <Group label={t.advanced.language}>
            <Segmented<Language>
              label={t.advanced.language}
              value={params.language}
              onChange={(value) => set('language', value)}
              options={[
                { value: 'auto', label: 'auto' },
                { value: 'fr', label: 'fr' },
                { value: 'en', label: 'en' },
              ]}
            />
          </Group>

          <Group label={t.advanced.raw}>
            {params.extraParams.map((entry, index) => (
              <div key={index} className="flex items-center gap-1">
                <Field
                  aria-label={t.advanced.rawKeyLabel}
                  placeholder={t.advanced.rawKey}
                  value={entry.key}
                  onChange={(event) =>
                    set(
                      'extraParams',
                      params.extraParams.map((p, i) => (i === index ? { ...p, key: event.target.value } : p))
                    )
                  }
                  className="w-24"
                />
                <Field
                  aria-label={t.advanced.rawValueLabel}
                  placeholder={t.advanced.rawValue}
                  value={entry.value}
                  onChange={(event) =>
                    set(
                      'extraParams',
                      params.extraParams.map((p, i) => (i === index ? { ...p, value: event.target.value } : p))
                    )
                  }
                  className="flex-1"
                />
                <IconButton
                  size="sm"
                  icon={XIcon}
                  label={t.advanced.removeRaw}
                  onClick={() => set('extraParams', params.extraParams.filter((_, i) => i !== index))}
                />
              </div>
            ))}
            <Button
              size="sm"
              icon={PlusIcon}
              className="self-start"
              onClick={() => set('extraParams', [...params.extraParams, { key: '', value: '' }])}
            >
              {t.advanced.addRaw}
            </Button>
          </Group>

          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between gap-2">
              <span className="lbl">{t.advanced.request}</span>
              <Button size="sm" icon={CopyIcon} onClick={() => void copy()} aria-live="polite">
                {copied ? t.common.copied : t.common.copy}
              </Button>
            </div>
            <pre className="font-mono text-[10.5px] leading-[1.6] break-all whitespace-pre-wrap text-ink-soft">
              {JSON.stringify(truncateInlineData(payload), null, 2)}
            </pre>
          </div>
        </div>
      </details>
    </section>
  )
}
