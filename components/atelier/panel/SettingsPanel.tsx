'use client'

import type { PanelTab } from '@/lib/types'

const TABS: { tab: PanelTab; label: string }[] = [
  { tab: 'recipe', label: 'Recette' },
  { tab: 'json', label: 'JSON' },
]

interface SettingsPanelProps {
  tab: PanelTab
  onTabChange: (tab: PanelTab) => void
  onReset: () => void
  /** Rangée de pied : « image ×2 · texte ×1 · ce navigateur ». */
  keysSummary: string
  children: React.ReactNode
}

export default function SettingsPanel({
  tab,
  onTabChange,
  onReset,
  keysSummary,
  children,
}: SettingsPanelProps) {
  return (
    <aside
      aria-label="Paramètres"
      className="flex w-panel shrink-0 flex-col overflow-hidden rounded-panel border border-line bg-panel/72 backdrop-blur-[28px]"
    >
      <header className="flex h-[52px] shrink-0 items-center justify-between border-b border-separator px-3">
        <div className="flex items-center gap-[2px] rounded-chip bg-field p-[3px]">
          {TABS.map((entry) => (
            <button
              key={entry.tab}
              type="button"
              onClick={() => onTabChange(entry.tab)}
              aria-pressed={tab === entry.tab}
              className={`rounded-[8px] px-[10px] py-[5px] text-[12px] transition-colors duration-[240ms] ${
                tab === entry.tab ? 'bg-tab text-title' : 'text-label hover:text-body-soft'
              }`}
            >
              {entry.label}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={onReset}
          className="text-[12.5px] text-meta transition-colors duration-[240ms] hover:text-body-soft"
        >
          réinitialiser
        </button>
      </header>

      <div className="flex-1 overflow-y-auto px-3 py-3">{children}</div>

      <footer className="shrink-0 border-t border-separator px-3 py-[11px]">
        <p className="font-mono text-[10.5px] text-meta">Clés API — {keysSummary}</p>
      </footer>
    </aside>
  )
}
