'use client'

import { X } from '@phosphor-icons/react/dist/ssr'

interface DrawerProps {
  title: string
  onClose: () => void
  children: React.ReactNode
}

/**
 * Colonne de 268 px, jamais une superposition : le panneau de paramètres se
 * replie tant qu'un tiroir est ouvert (voir `isPanelVisible`).
 */
export default function Drawer({ title, onClose, children }: DrawerProps) {
  return (
    <aside
      aria-label={title}
      className="flex w-drawer shrink-0 flex-col overflow-hidden rounded-panel border border-line bg-panel/72 backdrop-blur-[28px]"
    >
      <header className="flex h-[56px] shrink-0 items-center justify-between border-b border-separator px-4">
        <h2 className="text-[13.5px] font-medium text-title">{title}</h2>
        <button
          type="button"
          onClick={onClose}
          aria-label="Fermer le tiroir"
          className="flex h-7 w-7 items-center justify-center rounded-[8px] text-icon transition-colors duration-[240ms] hover:bg-field-hover hover:text-body"
        >
          <X size={15} />
        </button>
      </header>

      <div className="flex-1 overflow-y-auto p-4">{children}</div>
    </aside>
  )
}
