'use client'

import { WarningCircleIcon } from '@phosphor-icons/react/dist/ssr'
import KeyCard from './KeyCard'
import { Button, Kbd, Shot } from '@/components/atelier/ui'
import { MODELS, supports } from '@/lib/adapters/capabilities'
import { imageSrc, thumbSrc } from '@/lib/atelier/session-store'
import { resolveSelection, usualSeconds, type Resolved } from '@/lib/atelier/session-view'
import { elapsedSeconds, useNow } from '@/lib/atelier/use-now'
import type { Atelier } from '@/lib/atelier/use-atelier'
import { useT } from '@/lib/i18n'
import type { AspectRatio, FailedRun, GalleryItem, PendingTile } from '@/lib/types'

/**
 * Largeur d'un cadre au format donné, inscrit dans la scène. La scène est un
 * conteneur de taille : 100cqw × 100cqh est l'espace disponible.
 */
function frameStyle(ratio: AspectRatio, share = 1): React.CSSProperties {
  const [w, h] = ratio.split(':').map(Number)
  return { aspectRatio: `${w} / ${h}`, width: `min(${100 / share}cqw, calc(100cqh * ${w} / ${h}))` }
}

export default function Stage({ atelier }: { atelier: Atelier }) {
  const t = useT()
  const { state, dispatch, items, failures, pending } = atelier
  const selected = resolveSelection(state.selectedIds, items, failures)
  const focused = state.focusId ? resolveSelection([state.focusId], items, failures)[0] : undefined

  let content: React.ReactNode
  if (state.keyPrompt) {
    const adapterId = state.keyPrompt
    content = (
      <KeyCard
        adapterId={adapterId}
        hasKeyFor={atelier.hasKeyFor}
        onSave={(value) => atelier.saveKeyAndGenerate(adapterId, value)}
        onUseOther={(other) => {
          atelier.selectModel(other)
          dispatch({ type: 'askKey', adapterId: null })
        }}
      />
    )
  } else if (selected.length >= 3) {
    content = <Grid entries={selected} onSelect={(id) => dispatch({ type: 'select', id })} />
  } else if (selected.length === 2) {
    content = <Pair entries={selected} />
  } else if (selected.length === 1) {
    content = <Single entry={selected[0]} atelier={atelier} />
  } else if (pending.length > 0) {
    content = <Pending tiles={pending} items={items} ratio={atelier.params.aspectRatio} />
  } else if (focused) {
    content = <Single entry={focused} atelier={atelier} />
  } else {
    content = <Hello />
  }

  return (
    <section
      aria-label={t.stage.label}
      tabIndex={0}
      data-stage
      className="stage-dots flex min-h-0 min-w-0 flex-1 items-center justify-center overflow-hidden rounded-xs border border-hairline p-6 [container-type:size]"
    >
      {content}
    </section>
  )
}

function Hello() {
  const t = useT()
  return (
    <div className="flex max-w-[440px] flex-col items-center gap-4 text-center">
      <h2 className="font-display text-22 leading-tight">{t.hello.title}</h2>
      <p className="text-13 text-ink-soft">{t.hello.body}</p>
      <p className="meta flex items-center gap-4">
        <span className="flex items-center gap-1.5">
          <Kbd keys={['mod', '↵']} /> {t.hello.generate}
        </span>
        <span className="flex items-center gap-1.5">
          <Kbd keys={['mod', 'K']} /> {t.hello.everything}
        </span>
      </p>
    </div>
  )
}

function Single({ entry, atelier }: { entry: Resolved; atelier: Atelier }) {
  if (entry.kind === 'failure') return <Failure failure={entry.failure} atelier={atelier} />
  const { item } = entry
  return (
    <Shot
      src={imageSrc(item)}
      alt={item.prompt}
      ratio={item.params.aspectRatio}
      className="max-h-full max-w-full object-contain"
    />
  )
}

function Pair({ entries }: { entries: Resolved[] }) {
  return (
    <div className="grid h-full w-full grid-cols-2 gap-4">
      {entries.map((entry) => (
        <figure key={entry.id} className="flex min-h-0 min-w-0 flex-col items-center justify-center gap-2">
          {entry.kind === 'item' ? (
            <>
              <Shot
                src={imageSrc(entry.item)}
                alt={entry.item.prompt}
                ratio={entry.item.params.aspectRatio}
                className="min-h-0 max-w-full flex-1 object-contain"
              />
              <figcaption className="meta">{MODELS[entry.item.adapterId].name}</figcaption>
            </>
          ) : (
            <WarningCircleIcon size={24} aria-hidden className="text-ink-soft" />
          )}
        </figure>
      ))}
    </div>
  )
}

function Grid({ entries, onSelect }: { entries: Resolved[]; onSelect: (id: string) => void }) {
  const items = entries.flatMap((entry) => (entry.kind === 'item' ? [entry.item] : []))
  const columns = Math.ceil(Math.sqrt(items.length))
  return (
    <ul
      className="grid h-full w-full gap-3"
      style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
    >
      {items.map((item) => (
        <li key={item.id} className="flex min-h-0 items-center justify-center">
          <button type="button" onClick={() => onSelect(item.id)} className="flex h-full w-full items-center justify-center">
            <Shot
              src={thumbSrc(item)}
              alt={item.prompt}
              ratio={item.params.aspectRatio}
              className="max-h-full max-w-full object-contain"
            />
          </button>
        </li>
      ))}
    </ul>
  )
}

function Pending({ tiles, items, ratio }: { tiles: PendingTile[]; items: GalleryItem[]; ratio: AspectRatio }) {
  const t = useT()
  const now = useNow(true)
  return (
    <div className="flex h-full w-full items-center justify-center gap-4">
      {tiles.map((tile) => {
        const seconds = elapsedSeconds(now, tile.startedAt)
        const usual = usualSeconds(items, tile.adapterId)
        const progress = usual ? Math.min(95, Math.round((seconds / usual) * 100)) : null
        return (
          <div
            key={tile.id}
            style={frameStyle(ratio, tiles.length)}
            className="hatch flex max-h-full flex-col items-center justify-center gap-3 rounded-xs border border-hairline"
          >
            <p className="font-mono text-12 text-ink">
              {MODELS[tile.adapterId].name} · {t.status.running(tile.count, seconds)}
            </p>
            {usual !== null && (
              <p className="meta">{seconds > usual * 1.5 ? t.pending.longer : t.pending.usually(usual)}</p>
            )}
            {progress !== null && (
              <div
                role="progressbar"
                aria-label={t.pending.progress}
                aria-valuenow={progress}
                aria-valuemin={0}
                aria-valuemax={100}
                className="h-0.5 w-40 bg-raised"
              >
                <div className="h-full bg-ink transition-[width] duration-1000 ease-linear" style={{ width: `${progress}%` }} />
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

function Failure({ failure, atelier }: { failure: FailedRun; atelier: Atelier }) {
  const t = useT()
  const model = MODELS[failure.adapterId].name
  const copy = {
    'missing-key': [t.key.required, t.key.body(model)],
    quota: [t.failure.quota, t.failure.quotaBody],
    safety: [t.failure.moderation, t.failure.moderationBody(model)],
    'no-image': [t.failure.noImage, t.failure.noImageBody],
    generic: [t.failure.generic, failure.message],
  }[failure.kind]

  return (
    <div
      style={frameStyle(atelier.params.aspectRatio)}
      className="flex max-h-full max-w-[560px] flex-col items-start justify-center gap-3 rounded-xs border border-hairline bg-sunken p-6"
    >
      <WarningCircleIcon size={24} aria-hidden className="text-ink-soft" />
      <h2 className="text-17 font-semibold">{copy[0]}</h2>
      <p className="text-12 text-ink-soft">{copy[1]}</p>
      <div className="flex flex-wrap gap-2">
        {failure.kind === 'missing-key' ? (
          <Button variant="secondary" onClick={() => atelier.dispatch({ type: 'askKey', adapterId: failure.adapterId })}>
            {t.key.title(MODELS[failure.adapterId].provider)}
          </Button>
        ) : (
          <Button variant="secondary" onClick={() => void atelier.retry(failure)}>
            {t.failure.retry}
          </Button>
        )}
        {failure.kind === 'safety' && supports(failure.adapterId, 'moderation') && (
          <Button onClick={() => void atelier.retry(failure, { moderation: 'low' })}>{t.failure.lowerModeration}</Button>
        )}
      </div>
    </div>
  )
}
