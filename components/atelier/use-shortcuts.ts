'use client'

import { useEffect, useRef } from 'react'
import { downloadImage, exportImages } from '@/lib/atelier/export'
import { hasFullImage } from '@/lib/atelier/session-store'
import { resolveSelection, stripEntries } from '@/lib/atelier/session-view'
import type { Atelier } from '@/lib/atelier/use-atelier'

function isTextField(target: EventTarget | null): boolean {
  return (
    target instanceof HTMLElement &&
    (target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName))
  )
}

/** Les touches seules n'agissent que si la bande ou la scène a le focus. */
function inWorkspace(target: EventTarget | null): boolean {
  return target instanceof HTMLElement && target.closest('[data-strip],[data-stage]') !== null
}

/**
 * Raccourcis d'Obskura. Un seul écouteur ; il lit l'atelier du dernier rendu
 * par une ref, pour ne pas se réabonner à chaque frappe.
 */
export function useShortcuts(atelier: Atelier, promptRef: React.RefObject<HTMLTextAreaElement | null>) {
  const latest = useRef(atelier)
  useEffect(() => {
    latest.current = atelier
  })

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      const a = latest.current
      const { state, dispatch } = a
      const mod = event.metaKey || event.ctrlKey
      const key = event.key.toLowerCase()
      const typing = isTextField(event.target)
      const selected = resolveSelection(state.selectedIds, a.items, a.failures)
      const single = selected.length === 1 && selected[0].kind === 'item' ? selected[0].item : null

      const act = (run: () => void) => {
        event.preventDefault()
        run()
      }

      if (mod && key === 'k') return act(() => dispatch({ type: 'toggleOverlay', overlay: 'palette' }))
      if (mod && key === 'enter') return act(() => void a.generate())
      if (mod && key === '.') return act(a.stop)
      if (mod && key === 'e' && single && hasFullImage(single)) return act(() => downloadImage(single))
      if (mod && key === 'e' && selected.length > 1) {
        const images = selected.flatMap((entry) => (entry.kind === 'item' ? [entry.item] : []))
        return act(() => void exportImages(images, 'original', false))
      }
      if (mod && key === 'z' && !typing && a.notice && 'undo' in a.notice) return act(a.undo)
      if (event.key === 'Escape') return dispatch({ type: 'escape' })
      if (mod || event.altKey || typing) return

      if (event.key === '?') return act(() => dispatch({ type: 'toggleOverlay', overlay: 'shortcuts' }))
      if (event.key === '/') return act(() => promptRef.current?.focus())
      if (!inWorkspace(event.target)) return

      if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
        const order = stripEntries(a.items, a.failures).filter((entry) => entry.kind !== 'separator')
        const current = state.selectedIds[0] ?? state.focusId
        const index = order.findIndex((entry) => entry.id === current)
        const next = order[Math.max(0, Math.min(order.length - 1, index + (event.key === 'ArrowDown' ? 1 : -1)))]
        if (!next) return
        return act(() => {
          dispatch({ type: 'select', id: next.id })
          document.querySelector<HTMLElement>(`[data-strip-item="${next.id}"]`)?.focus()
        })
      }
      if (key === 'r' && single) return act(() => a.reuse(single))
      if (key === 'v' && single) return act(() => void a.vary(single))
      if ((event.key === 'Delete' || event.key === 'Backspace') && selected.length > 0) {
        return act(() => a.removeItems(selected.map((entry) => entry.id)))
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [promptRef])
}
