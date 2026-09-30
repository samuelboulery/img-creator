'use client'

import { useState } from 'react'
import Dialog from './Dialog'
import { Field } from '@/components/atelier/ui'
import { MODELS } from '@/lib/adapters/capabilities'
import { diffPrompt } from '@/lib/atelier/diff'
import { thumbSrc } from '@/lib/atelier/session-store'
import { useT } from '@/lib/i18n'
import type { AdapterId, GalleryItem } from '@/lib/types'

interface HistoryDialogProps {
  items: GalleryItem[]
  onSelect: (id: string) => void
  onClose: () => void
}

/** Toute la session en liste : chercher un prompt, filtrer par modèle, voir ce qui a changé. */
export default function HistoryDialog({ items, onSelect, onClose }: HistoryDialogProps) {
  const t = useT()
  const [query, setQuery] = useState('')
  const [model, setModel] = useState<AdapterId | 'all'>('all')

  const byId = new Map(items.map((item) => [item.id, item]))
  const models = [...new Set(items.map((item) => item.adapterId))]
  const needle = query.trim().toLocaleLowerCase()
  const shown = items.filter(
    (item) => (model === 'all' || item.adapterId === model) && item.prompt.toLocaleLowerCase().includes(needle)
  )
  const today = new Date().toDateString()
  const groups = [
    { label: t.history.today, items: shown.filter((item) => new Date(item.createdAt).toDateString() === today) },
    { label: t.history.earlier, items: shown.filter((item) => new Date(item.createdAt).toDateString() !== today) },
  ].filter((group) => group.items.length > 0)

  return (
    <Dialog side width={420} title={t.history.title} onClose={onClose}>
      <div className="flex gap-2 border-b border-hairline p-3">
        <Field
          type="search"
          aria-label={t.history.search}
          placeholder={t.history.search}
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          className="flex-1"
        />
        <select
          aria-label={t.history.filter}
          value={model}
          onChange={(event) => setModel(event.target.value as AdapterId | 'all')}
          className="h-8 max-w-[140px] rounded-xs border border-hairline bg-sunken px-2 font-mono text-11 text-ink"
        >
          <option value="all">{t.history.all}</option>
          {models.map((id) => (
            <option key={id} value={id}>
              {MODELS[id].name}
            </option>
          ))}
        </select>
      </div>

      {items.length === 0 && <p className="meta p-4">{t.history.empty}</p>}
      {items.length > 0 && shown.length === 0 && <p className="meta p-4">{t.history.noMatch}</p>}

      {groups.map((group) => (
        <section key={group.label} className="pb-2">
          <h3 className="lbl px-4 pt-3 pb-1.5">{group.label}</h3>
          <ul>
            {group.items.map((item) => {
              const parent = item.parentId ? byId.get(item.parentId) : undefined
              const edited = parent && parent.prompt !== item.prompt
              return (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => onSelect(item.id)}
                    className="flex w-full gap-3 px-4 py-2 text-left hover:bg-sunken"
                  >
                    <span className="h-10 w-10 shrink-0 overflow-hidden rounded-xs bg-sunken">
                      {thumbSrc(item) && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={thumbSrc(item)} alt="" loading="lazy" className="h-full w-full object-cover" />
                      )}
                    </span>
                    <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                      {edited ? (
                        <span className="line-clamp-2 text-12">
                          {diffPrompt(parent.prompt, item.prompt).map((token, index) => (
                            <span
                              key={index}
                              className={
                                token.kind === 'removed'
                                  ? 'text-dim line-through'
                                  : token.kind === 'added'
                                    ? 'underline underline-offset-2'
                                    : ''
                              }
                            >
                              {token.text}{' '}
                            </span>
                          ))}
                        </span>
                      ) : (
                        <span className="line-clamp-2 text-12">{item.prompt}</span>
                      )}
                      <span className="meta truncate">
                        {MODELS[item.adapterId].name} ·{' '}
                        {new Date(item.createdAt).toLocaleTimeString(t.locale, { hour: '2-digit', minute: '2-digit' })}
                        {edited && ` · ${t.history.edited}`}
                      </span>
                    </span>
                  </button>
                </li>
              )
            })}
          </ul>
        </section>
      ))}
    </Dialog>
  )
}
