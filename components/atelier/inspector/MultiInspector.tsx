'use client'

import { useState } from 'react'
import { DownloadSimpleIcon, TrashIcon } from '@phosphor-icons/react/dist/ssr'
import { ActionButton, InspectorHeader } from './ImageInspector'
import { Section, Segmented, Toggle } from '@/components/atelier/ui'
import { exportImages, type ExportFormat } from '@/lib/atelier/export'
import type { Atelier } from '@/lib/atelier/use-atelier'
import { useT } from '@/lib/i18n'
import type { GalleryItem } from '@/lib/types'

interface MultiInspectorProps {
  items: GalleryItem[]
  /** Images et échecs sélectionnés : tous partent à la suppression. */
  ids: string[]
  atelier: Atelier
}

/** Plusieurs images : les exporter, ou s'en défaire. */
export default function MultiInspector({ items, ids, atelier }: MultiInspectorProps) {
  const t = useT()
  const [format, setFormat] = useState<ExportFormat>('original')
  const [withSettings, setWithSettings] = useState(true)
  const [error, setError] = useState<string | null>(null)

  async function runExport() {
    try {
      setError(null)
      await exportImages(items, format, withSettings)
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : String(caught))
    }
  }

  return (
    <>
      <InspectorHeader onBack={() => atelier.dispatch({ type: 'clearSelection' })} meta={t.multi.title(ids.length)} />
      <div className="min-h-0 flex-1 overflow-y-auto">
        <Section first label={t.multi.export}>
          <Segmented<ExportFormat>
            label={t.multi.fileFormat}
            options={[
              { value: 'original', label: t.multi.original },
              { value: 'png', label: 'png' },
              { value: 'jpeg', label: 'jpeg' },
            ]}
            value={format}
            onChange={setFormat}
          />
          <Toggle label={t.multi.withSettings} checked={withSettings} onChange={setWithSettings} />
          {error && <p className="meta text-danger">{error}</p>}
        </Section>

        {ids.length !== 2 && (
          <Section label={t.multi.compare}>
            <p className="text-12 text-ink-soft">{t.multi.compareHint}</p>
          </Section>
        )}

        <section className="flex flex-col gap-0.5 border-t border-hairline p-2">
          <ActionButton
            icon={DownloadSimpleIcon}
            keys={['mod', 'E']}
            disabled={items.length === 0}
            onClick={() => void runExport()}
          >
            {t.multi.download(items.length)}
          </ActionButton>
          <ActionButton icon={TrashIcon} variant="danger" keys={['⌫']} onClick={() => atelier.removeItems(ids)}>
            {t.multi.delete(ids.length)}
          </ActionButton>
        </section>
      </div>
    </>
  )
}
