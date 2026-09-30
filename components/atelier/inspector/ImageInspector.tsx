'use client'

import {
  ArrowClockwiseIcon,
  ArrowLeftIcon,
  CopyIcon,
  DownloadSimpleIcon,
  ImageSquareIcon,
  ShuffleIcon,
  TrashIcon,
} from '@phosphor-icons/react/dist/ssr'
import { useState, type ReactNode } from 'react'
import { Button, IconButton, KeyValue, Kbd, Section } from '@/components/atelier/ui'
import { MODELS } from '@/lib/adapters/capabilities'
import { downloadImage } from '@/lib/atelier/export'
import { toImageState } from '@/lib/atelier/image-file'
import { hasFullImage } from '@/lib/atelier/session-store'
import { variantOf } from '@/lib/atelier/session-view'
import type { Atelier } from '@/lib/atelier/use-atelier'
import { useT } from '@/lib/i18n'
import type { GalleryItem } from '@/lib/types'

/** En-tête commun des fiches : retour aux réglages, position dans la session. */
export function InspectorHeader({ onBack, meta }: { onBack: () => void; meta?: ReactNode }) {
  const t = useT()
  return (
    <div className="flex h-12 shrink-0 items-center justify-between border-b border-hairline pr-4 pl-2">
      <Button icon={ArrowLeftIcon} onClick={onBack}>
        {t.common.back}
      </Button>
      {meta !== undefined && <span className="meta">{meta}</span>}
    </div>
  )
}

export function ActionButton({
  icon,
  keys,
  children,
  ...rest
}: React.ComponentProps<typeof Button> & { keys?: string[] }) {
  return (
    <Button full icon={icon} {...rest}>
      <span className="flex-1 text-left">{children}</span>
      {keys && <Kbd keys={keys} />}
    </Button>
  )
}

export default function ImageInspector({ item, atelier }: { item: GalleryItem; atelier: Atelier }) {
  const t = useT()
  const [copied, setCopied] = useState(false)
  const spec = MODELS[item.adapterId]
  const index = atelier.items.indexOf(item) + 1
  const variant = variantOf(item, atelier.items)
  const full = hasFullImage(item)
  const resolution = spec.resolution.options.find((option) => option.value === item.params.resolution)?.label

  async function copyPrompt() {
    await navigator.clipboard.writeText(item.prompt)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  const origin = item.parentId
    ? t.image.derived
    : variant.count > 1
      ? t.image.variant(variant.index, variant.count)
      : t.image.only

  return (
    <>
      <InspectorHeader
        onBack={() => atelier.dispatch({ type: 'clearSelection' })}
        meta={`${index} / ${atelier.items.length}`}
      />

      <div className="min-h-0 flex-1 overflow-y-auto">
        <Section
          first
          label={t.image.prompt}
          meta={
            <IconButton
              size="sm"
              icon={CopyIcon}
              label={copied ? t.common.copied : t.image.copyPrompt}
              onClick={() => void copyPrompt()}
              className="-my-1"
            />
          }
        >
          <p className="text-12 leading-[18px] whitespace-pre-wrap">{item.prompt}</p>
        </Section>

        {item.negative && (
          <Section label={t.image.avoid}>
            <p className="font-mono text-11 text-ink-soft">{item.negative}</p>
          </Section>
        )}

        <Section label={t.image.parameters}>
          <div>
            <KeyValue label={t.image.model} value={spec.name} />
            <KeyValue label={t.image.format} value={item.params.aspectRatio} />
            {resolution && (
              <KeyValue
                label={spec.resolution.kind === 'quality' ? t.settings.quality.toLowerCase() : t.settings.params.resolution}
                value={resolution}
              />
            )}
            <KeyValue label={t.image.seed} value={item.seed ?? t.common.random} />
            <KeyValue label={t.image.time} value={`${(item.latencyMs / 1000).toFixed(1)} s`} />
            <KeyValue label={t.image.cost} value={t.eur(item.costEur)} />
            <KeyValue
              label={t.image.created}
              value={new Date(item.createdAt).toLocaleTimeString(t.locale, { hour: '2-digit', minute: '2-digit' })}
            />
          </div>
        </Section>

        {item.palette && (
          <Section label={t.image.colours}>
            <ul className="flex gap-1.5">
              {item.palette.map((colour) => (
                <li key={colour} className="flex flex-1 flex-col gap-1">
                  <span className="h-6 rounded-xs border border-hairline" style={{ background: colour }} />
                  <span className="meta">{colour}</span>
                </li>
              ))}
            </ul>
          </Section>
        )}

        <Section label={t.image.origin}>
          <p className="text-12 text-ink-soft">{origin}</p>
          {!full && <p className="meta">{t.image.previewOnly}</p>}
        </Section>

        <section className="flex flex-col gap-0.5 border-t border-hairline p-2">
          <ActionButton icon={ArrowClockwiseIcon} keys={['R']} onClick={() => atelier.reuse(item)}>
            {t.image.reuse}
          </ActionButton>
          <ActionButton icon={ShuffleIcon} keys={['V']} onClick={() => void atelier.vary(item)}>
            {t.image.vary}
          </ActionButton>
          <ActionButton
            icon={ImageSquareIcon}
            disabled={!full}
            onClick={() =>
              atelier.addReferences('subject', [
                toImageState({ base64: item.result.imageBase64, mimeType: item.result.mimeType }),
              ])
            }
          >
            {t.image.asReference}
          </ActionButton>
          <ActionButton icon={DownloadSimpleIcon} keys={['mod', 'E']} disabled={!full} onClick={() => downloadImage(item)}>
            {t.common.download}
          </ActionButton>
          <ActionButton icon={TrashIcon} variant="danger" keys={['⌫']} onClick={() => atelier.removeItems([item.id])}>
            {t.common.delete}
          </ActionButton>
        </section>
      </div>
    </>
  )
}
