'use client'

import { CheckIcon, DownloadSimpleIcon, TrashIcon } from '@phosphor-icons/react/dist/ssr'
import { ActionButton, InspectorHeader } from './ImageInspector'
import { Section } from '@/components/atelier/ui'
import { MODELS } from '@/lib/adapters/capabilities'
import { pairDifferences, type PairKey } from '@/lib/atelier/diff'
import { exportImages } from '@/lib/atelier/export'
import type { Atelier } from '@/lib/atelier/use-atelier'
import { useT } from '@/lib/i18n'
import type { AdapterId, GalleryItem } from '@/lib/types'

/** Deux images côte à côte : ce qui les sépare, et laquelle garder. */
export default function PairInspector({ pair, atelier }: { pair: [GalleryItem, GalleryItem]; atelier: Atelier }) {
  const t = useT()
  const [left, right] = pair
  const { deltas, same } = pairDifferences(left, right)

  const label = (key: PairKey) =>
    key === 'model' ? t.image.model : key === 'prompt' ? t.pair.prompt : t.settings.params[key]
  const shown = (key: PairKey, value: string) => (key === 'model' ? MODELS[value as AdapterId].name : value)

  return (
    <>
      <InspectorHeader onBack={() => atelier.dispatch({ type: 'clearSelection' })} meta={t.pair.title} />
      <div className="min-h-0 flex-1 overflow-y-auto">
        <Section first label={t.pair.differences} meta={t.pair.identical(same)}>
          {deltas.length === 0 ? (
            <p className="text-12 text-ink-soft">{t.pair.none}</p>
          ) : (
            <dl className="flex flex-col gap-2.5">
              {deltas.map((delta) => (
                <div key={delta.key} className="flex flex-col gap-1">
                  <dt className="lbl">{label(delta.key)}</dt>
                  <dd className="grid grid-cols-[auto_1fr] gap-x-2 gap-y-0.5 font-mono text-11">
                    <span className="text-dim">{t.pair.left}</span>
                    <span className="break-words">{shown(delta.key, delta.left)}</span>
                    <span className="text-dim">{t.pair.right}</span>
                    <span className="break-words">{shown(delta.key, delta.right)}</span>
                  </dd>
                </div>
              ))}
            </dl>
          )}
        </Section>

        <section className="flex flex-col gap-0.5 border-t border-hairline p-2">
          <ActionButton icon={CheckIcon} onClick={() => atelier.keepOnly(left, right)}>
            {t.pair.keepLeft}
          </ActionButton>
          <ActionButton icon={CheckIcon} onClick={() => atelier.keepOnly(right, left)}>
            {t.pair.keepRight}
          </ActionButton>
          <p className="meta px-3 pb-1">{t.pair.keepNote}</p>
          <ActionButton icon={DownloadSimpleIcon} keys={['mod', 'E']} onClick={() => void exportImages(pair, 'original', false)}>
            {t.pair.downloadBoth}
          </ActionButton>
          <ActionButton icon={TrashIcon} variant="danger" keys={['⌫']} onClick={() => atelier.removeItems([left.id, right.id])}>
            {t.multi.delete(2)}
          </ActionButton>
        </section>
      </div>
    </>
  )
}
