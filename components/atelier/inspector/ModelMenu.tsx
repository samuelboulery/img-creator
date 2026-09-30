'use client'

import { useEffect, useRef, useState, type RefObject } from 'react'
import { CheckIcon, KeyIcon } from '@phosphor-icons/react/dist/ssr'
import { ADAPTERS, MODELS } from '@/lib/adapters/capabilities'
import { useT } from '@/lib/i18n'
import type { Pricing } from '@/lib/atelier/cost'
import type { AdapterId } from '@/lib/types'

interface ModelMenuProps {
  adapterId: AdapterId
  parallelId: AdapterId | null
  pricing: Pricing
  hasKey: (adapterId: AdapterId) => boolean
  onSelect: (adapterId: AdapterId) => void
  onParallel: (adapterId: AdapterId | null) => void
  onManageKeys: () => void
  onClose: () => void
  /** Bouton déclencheur : le menu s'y aligne en position fixe, pour sortir de l'inspecteur qui défile. */
  trigger: RefObject<HTMLButtonElement | null>
}

const ITEMS = '[role^="menuitem"]:not([disabled])'

/**
 * Menu Modèle, ouvert depuis l'inspecteur. Chaque ligne porte deux entrées :
 * choisir le modèle, ou le lancer en parallèle du modèle courant.
 */
export default function ModelMenu({
  adapterId,
  parallelId,
  pricing,
  hasKey,
  onSelect,
  onParallel,
  onManageKeys,
  onClose,
  trigger,
}: ModelMenuProps) {
  const t = useT()
  const ref = useRef<HTMLDivElement>(null)
  const [anchor] = useState(() => trigger.current?.getBoundingClientRect() ?? null)

  useEffect(() => {
    ref.current?.querySelector<HTMLElement>('[aria-checked="true"]')?.focus()

    function onPointer(event: PointerEvent) {
      const target = event.target as Node
      // Le déclencheur referme lui-même le menu : l'ignorer évite de le rouvrir aussitôt.
      if (!ref.current?.contains(target) && !trigger.current?.contains(target)) onClose()
    }
    document.addEventListener('pointerdown', onPointer)
    return () => document.removeEventListener('pointerdown', onPointer)
  }, [onClose, trigger])

  function onKeyDown(event: React.KeyboardEvent) {
    if (event.key === 'Escape') {
      event.preventDefault()
      event.stopPropagation()
      onClose()
      return
    }
    if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return
    event.preventDefault()
    const items = [...(ref.current?.querySelectorAll<HTMLElement>(ITEMS) ?? [])]
    const index = items.indexOf(document.activeElement as HTMLElement)
    const step = event.key === 'ArrowDown' ? 1 : -1
    items[(index + step + items.length) % items.length]?.focus()
  }

  return (
    <div
      ref={ref}
      role="menu"
      aria-label={t.modelMenu.title}
      onKeyDown={onKeyDown}
      style={anchor ? { top: anchor.bottom + 4, right: window.innerWidth - anchor.right } : undefined}
      className="fixed z-40 w-[380px] max-w-[calc(100vw-32px)] rounded-xs border border-hairline-strong bg-solid p-1"
    >
      <p className="lbl px-2.5 pt-1.5 pb-1">{t.modelMenu.title}</p>
      {ADAPTERS.map((id) => {
        const spec = MODELS[id]
        const current = id === adapterId
        const parallel = id === parallelId
        return (
          <div key={id} className="flex items-stretch">
            <button
              type="button"
              role="menuitemradio"
              aria-checked={current}
              onClick={() => {
                onSelect(id)
                onClose()
              }}
              className={`flex min-h-12 flex-1 items-center gap-2.5 rounded-[1px] px-2.5 py-1.5 text-left hover:bg-sunken focus-visible:outline-offset-[-2px] ${
                current ? 'bg-raised' : ''
              }`}
            >
              <span className="flex min-w-0 flex-1 flex-col">
                <span className="font-semibold">{spec.name}</span>
                <span className="meta">
                  {spec.provider} · {t.eur(pricing[id])} ·{' '}
                  {hasKey(id) ? t.settings.keySaved : t.settings.noKey}
                </span>
              </span>
              {current && <CheckIcon size={16} aria-hidden />}
            </button>
            <button
              type="button"
              role="menuitemcheckbox"
              aria-checked={parallel}
              disabled={current}
              onClick={() => onParallel(parallel ? null : id)}
              className="meta flex shrink-0 items-center gap-1.5 rounded-[1px] px-2.5 hover:bg-sunken hover:text-ink disabled:opacity-40 focus-visible:outline-offset-[-2px]"
            >
              <span
                aria-hidden
                className={`flex h-3.5 w-3.5 items-center justify-center rounded-[1px] border ${
                  parallel ? 'border-ink bg-ink text-stage' : 'border-hairline-strong'
                }`}
              >
                {parallel && <CheckIcon size={10} weight="bold" />}
              </span>
              {t.settings.parallel}
            </button>
          </div>
        )
      })}
      <div className="-mx-1 my-1 h-px bg-hairline" />
      <p className="px-2.5 py-1.5 font-mono text-11 leading-[18px] text-ink-soft">{t.modelMenu.note}</p>
      <button
        type="button"
        role="menuitem"
        onClick={() => {
          onClose()
          onManageKeys()
        }}
        className="flex min-h-9 w-full items-center gap-2.5 rounded-[1px] px-2.5 text-left hover:bg-sunken focus-visible:outline-offset-[-2px]"
      >
        <KeyIcon size={16} aria-hidden />
        {t.modelMenu.manageKeys}
      </button>
    </div>
  )
}
