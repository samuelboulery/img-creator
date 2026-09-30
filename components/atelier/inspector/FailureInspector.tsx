'use client'

import { ArrowClockwiseIcon, TrashIcon } from '@phosphor-icons/react/dist/ssr'
import { ActionButton, InspectorHeader } from './ImageInspector'
import { KeyValue, Section } from '@/components/atelier/ui'
import { MODELS } from '@/lib/adapters/capabilities'
import type { Atelier } from '@/lib/atelier/use-atelier'
import { useT } from '@/lib/i18n'
import type { FailedRun } from '@/lib/types'

/** Fiche d'un échec : ce qui a été demandé, la cause telle que renvoyée, le remède. */
export default function FailureInspector({ failure, atelier }: { failure: FailedRun; atelier: Atelier }) {
  const t = useT()
  return (
    <>
      <InspectorHeader onBack={() => atelier.dispatch({ type: 'clearSelection' })} />
      <div className="min-h-0 flex-1 overflow-y-auto">
        <Section first label={t.image.prompt}>
          <p className="text-12 leading-[18px] whitespace-pre-wrap">{failure.prompt}</p>
        </Section>
        <Section label={t.failure.result}>
          <div>
            <KeyValue label={t.image.model} value={MODELS[failure.adapterId].name} />
            <KeyValue label={t.failure.state} value={t.failure.refused} />
          </div>
          <p className="font-mono text-11 break-words text-ink-soft">
            <span className="text-dim">{t.failure.cause} </span>
            {failure.message}
          </p>
        </Section>
        <section className="flex flex-col gap-0.5 border-t border-hairline p-2">
          <ActionButton icon={ArrowClockwiseIcon} onClick={() => void atelier.retry(failure)}>
            {t.failure.retry}
          </ActionButton>
          <ActionButton icon={TrashIcon} variant="danger" onClick={() => atelier.removeItems([failure.id])}>
            {t.failure.removeFromSession}
          </ActionButton>
        </section>
      </div>
    </>
  )
}
