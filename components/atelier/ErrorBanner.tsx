'use client'

import { WarningCircle, X } from '@phosphor-icons/react/dist/ssr'

interface ErrorBannerProps {
  /** Message exact renvoyé par l'API — il n'est ni reformulé ni tronqué. */
  message: string
  onRetry: () => void
  onDismiss: () => void
}

export default function ErrorBanner({ message, onRetry, onDismiss }: ErrorBannerProps) {
  return (
    <div
      role="alert"
      className="flex items-center gap-3 rounded-chip bg-error-surface px-3 py-[10px]"
      style={{ boxShadow: 'inset 0 0 0 1px var(--color-error-line)' }}
    >
      <WarningCircle size={16} weight="fill" className="shrink-0 text-error-icon" />
      <p className="flex-1 text-[12.5px] text-error-text">{message}</p>
      <button
        type="button"
        onClick={onRetry}
        className="rounded-[8px] bg-error-button px-[10px] py-[5px] text-[12px] text-error-text transition-opacity duration-[240ms] hover:opacity-80"
      >
        Réessayer
      </button>
      <button
        type="button"
        onClick={onDismiss}
        aria-label="Fermer l'erreur"
        className="text-error-icon transition-opacity duration-[240ms] hover:opacity-80"
      >
        <X size={14} />
      </button>
    </div>
  )
}
