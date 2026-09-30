'use client'

import { BroomIcon, CheckIcon, WarningCircleIcon } from '@phosphor-icons/react/dist/ssr'
import { IconButton } from './ui'
import { hasFullImage, thumbSrc } from '@/lib/atelier/session-store'
import { stripEntries } from '@/lib/atelier/session-view'
import { elapsedSeconds, useNow } from '@/lib/atelier/use-now'
import { useT } from '@/lib/i18n'
import type { FailedRun, GalleryItem, PendingTile } from '@/lib/types'

interface StripProps {
  items: GalleryItem[]
  failures: FailedRun[]
  pending: PendingTile[]
  selectedIds: string[]
  onSelect: (id: string, additive: boolean) => void
  onNewSession: () => void
}

const TILE = 'relative block h-16 w-16 shrink-0 overflow-hidden rounded-xs'

/**
 * Bande de session : la plus récente en haut, un filet entre deux
 * générations. Clic = sélection unique ; ⇧ ou ⌘-clic = ajout.
 */
export default function Strip({ items, failures, pending, selectedIds, onSelect, onNewSession }: StripProps) {
  const t = useT()
  const now = useNow(pending.length > 0)
  const entries = stripEntries(items, failures)
  const total = items.length
  const selected = new Set(selectedIds)

  return (
    <nav
      data-strip
      aria-label={t.strip.label}
      className="flex min-h-0 flex-col items-center gap-2 rounded-xs border border-hairline bg-panel pt-3 pb-2 backdrop-blur-md max-sm:flex-row max-sm:py-1.5 max-sm:pr-1 max-sm:pl-2"
    >
      <span className="lbl max-sm:sr-only">{t.strip.label}</span>

      <ul className="flex min-h-0 w-full flex-1 flex-col items-center gap-2 overflow-y-auto px-1 pt-1.5 pb-1 [scrollbar-width:none] max-sm:min-w-0 max-sm:flex-row max-sm:overflow-x-auto max-sm:overflow-y-hidden max-sm:py-1">
        {pending.flatMap((tile) =>
          Array.from({ length: tile.count }, (_, index) => {
            const seconds = elapsedSeconds(now, tile.startedAt)
            return (
              <li key={`${tile.id}-${index}`}>
                <div role="img" aria-label={t.strip.pending(seconds)} className={`${TILE} hatch flex items-center justify-center`}>
                  <span className="meta text-ink">{seconds} s</span>
                </div>
              </li>
            )
          })
        )}
        {pending.length > 0 && entries.length > 0 && <Separator />}

        {entries.length === 0 && pending.length === 0 && (
          <li className="meta px-1.5 py-2 text-center">{t.strip.empty}</li>
        )}

        {entries.map((entry) => {
          if (entry.kind === 'separator') return <Separator key={entry.id} />
          const isSelected = selected.has(entry.id)
          const ring = isSelected ? 'ring-image' : ''
          const pick = (event: React.MouseEvent) =>
            onSelect(entry.id, event.shiftKey || event.metaKey || event.ctrlKey)

          if (entry.kind === 'failure') {
            return (
              <li key={entry.id}>
                <button
                  type="button"
                  data-strip-item={entry.id}
                  aria-pressed={isSelected}
                  aria-label={t.strip.failed}
                  onClick={pick}
                  className={`${TILE} ${ring} flex flex-col items-center justify-center gap-0.5 bg-sunken text-ink-soft`}
                >
                  <WarningCircleIcon size={20} aria-hidden />
                  <span className="meta">{t.strip.failedShort}</span>
                </button>
              </li>
            )
          }

          const index = items.indexOf(entry.item) + 1
          const multi = isSelected && selectedIds.length > 1
          return (
            <li key={entry.id}>
              <button
                type="button"
                data-strip-item={entry.id}
                aria-pressed={isSelected}
                aria-label={t.strip.thumb(index, total, entry.item.prompt)}
                onClick={pick}
                className={`${TILE} ${ring} bg-sunken ${
                  hasFullImage(entry.item) ? '' : 'outline-1 -outline-offset-1 outline-hairline-strong outline-dashed'
                }`}
              >
                {thumbSrc(entry.item) && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={thumbSrc(entry.item)} alt="" className="h-full w-full object-cover" />
                )}
                {multi && (
                  <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-[1px] bg-ink text-stage">
                    <CheckIcon size={12} weight="bold" aria-hidden />
                  </span>
                )}
              </button>
            </li>
          )
        })}
      </ul>

      <span className="meta max-sm:hidden">{t.common.images(total)}</span>
      <IconButton icon={BroomIcon} label={t.strip.newSession} onClick={onNewSession} disabled={total === 0 && failures.length === 0} />
    </nav>
  )
}

function Separator() {
  return <li aria-hidden className="my-1 h-px w-8 shrink-0 bg-hairline max-sm:mx-1 max-sm:my-0 max-sm:h-8 max-sm:w-px" />
}
