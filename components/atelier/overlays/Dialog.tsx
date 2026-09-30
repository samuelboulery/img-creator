'use client'

import { useEffect, useId, useRef, type ReactNode } from 'react'
import { XIcon } from '@phosphor-icons/react/dist/ssr'
import { IconButton } from '@/components/atelier/ui'
import { useT } from '@/lib/i18n'

interface DialogProps {
  title: string
  onClose: () => void
  children: ReactNode
  /** Tiroir collé à droite plutôt que boîte centrée. */
  side?: boolean
  width?: number
  /** Titre visible dans l'en-tête ; sinon il ne sert qu'aux lecteurs d'écran. */
  header?: boolean
  footer?: ReactNode
}

/**
 * `<dialog>` natif en modale : piège du focus, couche supérieure et retour du
 * focus viennent du navigateur. Échap est pris ici — il ne doit pas remonter
 * jusqu'au raccourci global, qui viderait aussi la sélection.
 */
export default function Dialog({ title, onClose, children, side, width = 480, header = true, footer }: DialogProps) {
  const t = useT()
  const ref = useRef<HTMLDialogElement>(null)
  const titleId = useId()

  useEffect(() => {
    const dialog = ref.current
    if (dialog && !dialog.open) dialog.showModal()
    return () => dialog?.close()
  }, [])

  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      onCancel={(event) => event.preventDefault()}
      onKeyDown={(event) => {
        if (event.key !== 'Escape') return
        event.preventDefault()
        event.stopPropagation()
        onClose()
      }}
      onClick={(event) => event.target === ref.current && onClose()}
      style={{ width }}
      className={`flex-col overflow-hidden border border-hairline-strong bg-solid p-0 text-ink backdrop:bg-scrim open:flex ${
        side
          ? 'mt-0 mr-0 mb-0 ml-auto h-dvh max-h-dvh max-w-full rounded-none border-y-0 border-r-0'
          : 'm-auto max-h-[min(720px,calc(100dvh-32px))] max-w-[calc(100vw-32px)] rounded-xs'
      }`}
    >
      <div className={`flex h-12 shrink-0 items-center justify-between border-b border-hairline pr-2 pl-4 ${header ? '' : 'sr-only'}`}>
        <h2 id={titleId} className="lbl">
          {title}
        </h2>
        {header && <IconButton icon={XIcon} label={t.common.close} onClick={onClose} />}
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto">{children}</div>
      {footer && <div className="shrink-0 border-t border-hairline px-4 py-2.5">{footer}</div>}
    </dialog>
  )
}
