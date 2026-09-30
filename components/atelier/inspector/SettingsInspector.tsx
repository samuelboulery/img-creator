'use client'

import { useCallback, useRef, useState } from 'react'
import { ArrowCounterClockwiseIcon, CaretDownIcon, XIcon } from '@phosphor-icons/react/dist/ssr'
import AdvancedSection from './AdvancedSection'
import ModelMenu from './ModelMenu'
import RatioTiles from './RatioTiles'
import ReferencesSection from './ReferencesSection'
import { Button, IconButton, Section, Segmented, Toggle } from '@/components/atelier/ui'
import { MODELS, supports, type PayloadParam } from '@/lib/adapters/capabilities'
import { estimateCost } from '@/lib/atelier/cost'
import { setParam } from '@/lib/atelier/params'
import type { Atelier } from '@/lib/atelier/use-atelier'
import { useT } from '@/lib/i18n'
import type { Batch, FileFormat, GenerationParams, Resolution } from '@/lib/types'

interface SettingsInspectorProps {
  atelier: Atelier
  onOpenKeys: () => void
}

const BATCHES: Batch[] = [1, 2, 4, 8]

/**
 * Inspecteur quand rien n'est sélectionné : le modèle en tête — la cause
 * au-dessus de ce qu'elle change — puis les seuls réglages qu'il lit.
 */
export default function SettingsInspector({ atelier, onOpenKeys }: SettingsInspectorProps) {
  const t = useT()
  const { state, params, setParams, prefs } = atelier
  const [menuOpen, setMenuOpen] = useState(false)
  const triggerRef = useRef<HTMLButtonElement>(null)

  const primary = MODELS[state.adapterId]
  const parallel = state.parallelId ? MODELS[state.parallelId] : null
  const models = parallel ? [primary, parallel] : [primary]
  const reads = (param: PayloadParam) => models.some((spec) => supports(spec.id, param))
  const set = <K extends keyof GenerationParams>(key: K, value: GenerationParams[K]) =>
    setParams(setParam(params, key, value))

  // En parallèle, un seul réglage part vers les deux modèles : seuls les crans
  // que les deux acceptent sont proposés.
  const resolutionOptions = primary.resolution.options.filter(
    (option) => !parallel || parallel.resolution.options.some((o) => o.value === option.value)
  )
  const parallelLabel = parallel?.resolution.options.find((o) => o.value === params.resolution)?.label

  const cost = models.reduce(
    (total, spec) => total + estimateCost(spec.id, params.batch, prefs.pricing),
    0
  )

  const closeMenu = useCallback(() => {
    setMenuOpen(false)
    triggerRef.current?.focus()
  }, [])

  const note = atelier.modelNote
  const noteList = (list: PayloadParam[]) => list.map((param) => t.settings.params[param]).join(', ')

  return (
    <>
      <div className="flex h-12 shrink-0 items-center justify-between border-b border-hairline pr-2 pl-4">
        <h2 className="lbl">{t.settings.title}</h2>
        <IconButton icon={ArrowCounterClockwiseIcon} label={t.settings.reset} onClick={atelier.resetParams} />
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        {atelier.activeRecipe && (
          <section className="flex flex-col gap-2.5 px-4 pt-3.5 pb-4">
            <div className="flex items-center justify-between gap-2">
              <h3 className="lbl">{t.presets.applied}</h3>
              <Button size="sm" className="-my-1.5 -mr-2" onClick={atelier.detachRecipe}>
                {t.presets.detach}
              </Button>
            </div>
            <p className="truncate text-12 font-semibold">{atelier.activeRecipe.name}</p>
          </section>
        )}

        <Section
          first={!atelier.activeRecipe}
          label={parallel ? t.settings.models : t.settings.model}
          meta={atelier.hasKeyFor(primary.id) ? t.settings.keySaved : t.settings.noKey}
        >
          <div>
            <button
              ref={triggerRef}
              type="button"
              aria-haspopup="menu"
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((open) => !open)}
              className="flex h-12 w-full items-center gap-2 rounded-xs border border-hairline-strong bg-sunken pr-2.5 pl-3 text-left transition-colors duration-140 hover:bg-raised"
            >
              <span className="flex min-w-0 flex-1 flex-col">
                <span className="truncate font-semibold">{primary.name}</span>
                <span className="meta truncate">
                  {t.settings.perImage(primary.provider, t.eur(prefs.pricing[primary.id]))}
                </span>
              </span>
              <CaretDownIcon size={16} aria-hidden />
            </button>
            {menuOpen && (
              <ModelMenu
                trigger={triggerRef}
                adapterId={state.adapterId}
                parallelId={state.parallelId}
                pricing={prefs.pricing}
                hasKey={atelier.hasKeyFor}
                onSelect={atelier.selectModel}
                onParallel={atelier.setParallel}
                onManageKeys={onOpenKeys}
                onClose={closeMenu}
              />
            )}
          </div>

          {parallel && (
            <div className="flex h-10 items-center rounded-xs border border-hairline pr-1 pl-3">
              <span className="flex min-w-0 flex-1 flex-col">
                <span className="truncate text-12 font-semibold">{parallel.name}</span>
                <span className="meta truncate">
                  {t.settings.parallel} · {t.eur(prefs.pricing[parallel.id])} / image
                </span>
              </span>
              <IconButton
                size="sm"
                icon={XIcon}
                label={t.settings.removeParallel}
                onClick={() => atelier.setParallel(null)}
              />
            </div>
          )}

          {note && (note.added.length > 0 || note.removed.length > 0) && (
            <div role="status" className="font-mono text-11 leading-[18px] text-ink-soft">
              {note.added.length > 0 && <p>{t.settings.added(noteList(note.added))}</p>}
              {note.removed.length > 0 && <p className="text-dim">{t.settings.removed(noteList(note.removed))}</p>}
            </div>
          )}
        </Section>

        <Section
          label={parallel ? `${t.settings.shared} · ${t.settings.format}` : t.settings.format}
          meta={primary.sizes?.[params.aspectRatio].replace('x', ' × ')}
        >
          <RatioTiles label={t.settings.format} value={params.aspectRatio} onChange={(value) => set('aspectRatio', value)} />
        </Section>

        <Section
          label={primary.resolution.kind === 'quality' ? t.settings.quality : t.settings.resolution}
          meta={parallel && parallelLabel ? `${parallel.name} : ${parallelLabel}` : undefined}
        >
          <Segmented<Resolution>
            label={primary.resolution.kind === 'quality' ? t.settings.quality : t.settings.resolution}
            options={resolutionOptions}
            value={params.resolution}
            onChange={(value) => set('resolution', value)}
          />
        </Section>

        <Section
          label={parallel ? `${t.settings.shared} · ${t.settings.variants}` : t.settings.variants}
          meta={t.eur(cost)}
        >
          <Segmented<Batch>
            label={t.settings.variants}
            options={BATCHES.map((value) => ({ value, label: String(value) }))}
            value={params.batch}
            onChange={(value) => set('batch', value)}
          />
        </Section>

        {reads('fileFormat') && (
          <Section label={t.settings.file}>
            <Segmented<FileFormat>
              label={t.settings.file}
              options={[
                { value: 'png', label: 'png' },
                { value: 'jpeg', label: 'jpeg' },
                { value: 'webp', label: 'webp' },
              ]}
              value={params.fileFormat}
              onChange={(value) => set('fileFormat', value)}
            />
            {params.fileFormat !== 'png' && reads('compression') && (
              <label className="flex items-center justify-between gap-3 text-12">
                {t.settings.compression}
                <input
                  type="range"
                  min={20}
                  max={100}
                  value={params.compression}
                  onChange={(event) => set('compression', Number(event.target.value))}
                  className="flex-1 accent-[var(--ink)]"
                />
                <span className="meta w-8 text-right">{params.compression}</span>
              </label>
            )}
            {reads('transparent') && (
              <Toggle
                label={t.settings.transparent}
                checked={params.transparent}
                onChange={(value) => set('transparent', value)}
              />
            )}
          </Section>
        )}

        <ReferencesSection
          recipe={atelier.recipe}
          onChange={atelier.setRecipe}
          weights={models.some((spec) => spec.referenceWeights)}
        />

        <AdvancedSection
          adapterIds={models.map((spec) => spec.id)}
          params={params}
          onChange={setParams}
          request={atelier.buildRequest(atelier.prompt || '…')}
        />
      </div>
    </>
  )
}
