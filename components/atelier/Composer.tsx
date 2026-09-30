'use client'

import { useRef, useState } from 'react'
import { MagicWandIcon, PlusIcon, ProhibitIcon, XIcon } from '@phosphor-icons/react/dist/ssr'
import { Button, IconButton, Kbd } from './ui'
import { MAX_REFERENCE_IMAGES } from '@/lib/adapters/validate'
import { estimateCost } from '@/lib/atelier/cost'
import { readImageFile, type ImageState } from '@/lib/atelier/image-file'
import { elapsedSeconds, useNow } from '@/lib/atelier/use-now'
import type { Atelier, Notice } from '@/lib/atelier/use-atelier'
import { useT } from '@/lib/i18n'
import type { Dict } from '@/lib/i18n/fr'

type RefKind = 'subject' | 'style'

interface ComposerProps {
  atelier: Atelier
  promptRef: React.RefObject<HTMLTextAreaElement | null>
}

function noticeText(t: Dict, notice: Notice): string {
  switch (notice.kind) {
    case 'deleted':
      return t.status.deleted(notice.count)
    case 'kept':
      return t.status.kept
    case 'enriched':
      return t.status.enriched
    case 'arrived':
      return t.status.arrived(notice.got, notice.asked)
    case 'stopped':
      return t.status.stopped
    case 'error':
      return notice.message
  }
}

/**
 * Composeur sous la scène : le prompt, ses références, ce qu'il faut éviter,
 * et la seule action en encre pleine de l'écran — Générer.
 */
export default function Composer({ atelier, promptRef }: ComposerProps) {
  const t = useT()
  const { prompt, setPrompt, negative, setNegative, recipe, setRecipe, state, prefs, pending } = atelier
  const [avoidOpen, setAvoidOpen] = useState(negative.length > 0)
  const [refMenu, setRefMenu] = useState(false)
  const [refError, setRefError] = useState<string | null>(null)
  const inputs = { subject: useRef<HTMLInputElement>(null), style: useRef<HTMLInputElement>(null) }
  const now = useNow(pending.length > 0)

  // Un preset ou « Reprendre les réglages » peut remplir le négatif : la ligne s'ouvre.
  const showAvoid = avoidOpen || negative.length > 0

  const models = state.parallelId ? [state.adapterId, state.parallelId] : [state.adapterId]
  const count = atelier.params.batch * models.length
  const total = models.reduce((sum, id) => sum + estimateCost(id, atelier.params.batch, prefs.pricing), 0)

  async function addFiles(kind: RefKind, files: FileList | null) {
    if (!files || files.length === 0) return
    const current = kind === 'subject' ? recipe.subjectImages : recipe.styleImages
    const room = MAX_REFERENCE_IMAGES - current.length
    try {
      const images = await Promise.all(Array.from(files).slice(0, room).map(readImageFile))
      atelier.addReferences(kind, images)
      setRefError(null)
    } catch (error) {
      setRefError(error instanceof Error ? error.message : String(error))
    }
  }

  function removeRef(kind: RefKind, image: ImageState) {
    setRecipe(
      kind === 'subject'
        ? { ...recipe, subjectImages: recipe.subjectImages.filter((entry) => entry.id !== image.id) }
        : { ...recipe, styleImages: recipe.styleImages.filter((entry) => entry.id !== image.id) }
    )
  }

  const chips: { kind: RefKind; image: ImageState }[] = [
    ...recipe.subjectImages.map((image) => ({ kind: 'subject' as const, image })),
    ...recipe.styleImages.map((image) => ({ kind: 'style' as const, image })),
  ]

  const oldest = pending.reduce((min, tile) => Math.min(min, tile.startedAt), Infinity)
  const running = pending.reduce((sum, tile) => sum + tile.count, 0)

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault()
        void atelier.generate()
      }}
      className="mx-auto flex w-full max-w-[800px] flex-col gap-2 rounded-xs border border-hairline bg-solid p-3"
    >
      <label className="sr-only" htmlFor="prompt">
        {t.composer.prompt}
      </label>
      <textarea
        id="prompt"
        ref={promptRef}
        rows={2}
        value={prompt}
        onChange={(event) => setPrompt(event.target.value)}
        placeholder={t.composer.placeholder}
        className="max-h-[calc(6lh+8px)] min-h-[calc(2lh+8px)] w-full resize-none bg-transparent px-1 py-1 text-14 leading-[20px] text-ink outline-none [field-sizing:content] placeholder:text-dim"
      />

      {showAvoid && (
        <div className="flex items-center gap-2 border-t border-hairline pt-2">
          <label htmlFor="negative" className="lbl shrink-0">
            {t.composer.avoid}
          </label>
          <input
            id="negative"
            value={negative}
            onChange={(event) => setNegative(event.target.value)}
            placeholder={t.composer.avoidPlaceholder}
            className="h-7 min-w-0 flex-1 bg-transparent font-mono text-11 text-ink outline-none placeholder:text-dim"
          />
          <IconButton
            size="sm"
            icon={XIcon}
            label={t.composer.removeAvoid}
            onClick={() => {
              setNegative('')
              setAvoidOpen(false)
            }}
          />
        </div>
      )}

      <div className="flex min-w-0 items-center gap-1.5">
        {chips.map(({ kind, image }) => (
          <span
            key={image.id}
            className="flex h-7 shrink-0 items-center gap-1 rounded-xs border border-hairline pr-0.5 pl-0.5"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={image.preview} alt="" className="h-6 w-6 rounded-[1px] object-cover" />
            <span className="font-mono text-10 text-ink-soft">
              {kind === 'subject' ? t.composer.subject : t.composer.style}
            </span>
            <IconButton size="sm" icon={XIcon} label={t.composer.removeReference} onClick={() => removeRef(kind, image)} />
          </span>
        ))}

        <div className="relative">
          <Button
            size="sm"
            icon={PlusIcon}
            aria-haspopup="menu"
            aria-expanded={refMenu}
            onClick={() => setRefMenu((open) => !open)}
          >
            {t.composer.reference}
          </Button>
          {refMenu && (
            <div
              role="menu"
              aria-label={t.composer.reference}
              onKeyDown={(event) => event.key === 'Escape' && (event.stopPropagation(), setRefMenu(false))}
              className="absolute bottom-full left-0 z-20 mb-1 flex w-56 flex-col rounded-xs border border-hairline-strong bg-solid p-1"
            >
              {(['subject', 'style'] as const).map((kind, index) => (
                <button
                  key={kind}
                  type="button"
                  role="menuitem"
                  autoFocus={index === 0}
                  onClick={() => {
                    setRefMenu(false)
                    inputs[kind].current?.click()
                  }}
                  className="flex h-9 flex-col items-start justify-center rounded-xs px-2 text-left hover:bg-sunken focus-visible:bg-sunken"
                >
                  <span className="text-12">{kind === 'subject' ? t.refs.subject : t.refs.style}</span>
                  <span className="meta">{kind === 'subject' ? t.refs.dropSubject : t.refs.dropStyle}</span>
                </button>
              ))}
            </div>
          )}
          {(['subject', 'style'] as const).map((kind) => (
            <input
              key={kind}
              ref={inputs[kind]}
              type="file"
              accept="image/*"
              multiple
              hidden
              onChange={(event) => {
                void addFiles(kind, event.target.files)
                event.target.value = ''
              }}
            />
          ))}
        </div>

        {!showAvoid && (
          <Button size="sm" icon={ProhibitIcon} onClick={() => setAvoidOpen(true)}>
            {t.composer.avoid}
          </Button>
        )}
        <Button
          size="sm"
          icon={MagicWandIcon}
          disabled={!prompt.trim() || atelier.enriching}
          onClick={() => void atelier.enrich()}
        >
          {atelier.enriching ? t.composer.enriching : t.composer.enrich}
        </Button>

        <StatusLine
          running={running}
          seconds={running > 0 ? elapsedSeconds(now, oldest) : 0}
          notice={refError ? { kind: 'error', message: refError } : atelier.notice}
          waitingKey={state.keyPrompt !== null}
          cost={models.length === 1 ? t.status.cost(count, prefs.pricing[state.adapterId], total) : `≈ ${t.eur(total)}`}
          onStop={atelier.stop}
          onUndo={atelier.undo}
        />

        <Button type="submit" variant="primary" disabled={!prompt.trim()} className="gap-2">
          {t.composer.generate}
          <Kbd keys={['mod', '↵']} onInk />
        </Button>
      </div>
    </form>
  )
}

interface StatusLineProps {
  running: number
  seconds: number
  notice: Notice | null
  waitingKey: boolean
  cost: string
  onStop: () => void
  onUndo: () => void
}

/** Une seule ligne, dans l'ordre : ce qui tourne, ce qui vient d'arriver, la clé attendue, le coût. */
function StatusLine({ running, seconds, notice, waitingKey, cost, onStop, onUndo }: StatusLineProps) {
  const t = useT()

  let content: React.ReactNode = cost
  if (running > 0) {
    content = (
      <>
        {t.status.running(running, seconds)}
        <InlineAction label={t.status.stop} keys={['mod', '.']} onClick={onStop} />
      </>
    )
  } else if (notice) {
    content = (
      <>
        <span className={notice.kind === 'error' ? 'text-danger' : ''}>{noticeText(t, notice)}</span>
        {'undo' in notice && <InlineAction label={t.common.undo} keys={['mod', 'Z']} onClick={onUndo} />}
      </>
    )
  } else if (waitingKey) {
    content = t.status.waitingKey
  }

  return (
    <p
      role="status"
      className="meta flex min-w-0 flex-1 items-center justify-end gap-2 truncate text-right"
    >
      {content}
    </p>
  )
}

function InlineAction({ label, keys, onClick }: { label: string; keys: string[]; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex h-6 items-center gap-1.5 rounded-xs px-1.5 text-ink underline-offset-2 hover:bg-sunken hover:underline"
    >
      {label}
      <Kbd keys={keys} />
    </button>
  )
}
