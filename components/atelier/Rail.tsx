'use client'

import {
  Books,
  ClockCounterClockwise,
  SlidersHorizontal,
} from '@phosphor-icons/react/dist/ssr'
import type { Icon } from '@phosphor-icons/react'
import type { DrawerId } from '@/lib/types'

interface RailButtonProps {
  icon: Icon
  label: string
  active: boolean
  onClick: () => void
}

/**
 * Le rail n'ouvre que des panneaux : aucun de ses boutons ne change la vue
 * principale — les modes vivent dans le segmented control du CanvasHeader.
 *
 * Règle d'état actif valable dans tout l'atelier : variante `fill` + ambre
 * clair sur fond `rail-active`, sinon `regular` + gris d'icône sur transparent.
 */
function RailButton({ icon: Glyph, label, active, onClick }: RailButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={label}
      aria-label={label}
      aria-pressed={active}
      className={`flex h-[46px] w-[46px] items-center justify-center rounded-rail transition-colors duration-[240ms] ${
        active ? 'bg-rail-active text-accent-light' : 'text-icon hover:bg-field-hover'
      }`}
    >
      <Glyph size={20} weight={active ? 'fill' : 'regular'} />
    </button>
  )
}

interface UsageGaugeProps {
  /** Part consommée, 0–100. */
  percent: number
  amountEur: number
}

function UsageGauge({ percent, amountEur }: UsageGaugeProps) {
  const degrees = Math.round((Math.min(100, Math.max(0, percent)) / 100) * 360)

  return (
    <div className="flex flex-col items-center gap-1">
      <div
        className="flex h-[34px] w-[34px] items-center justify-center rounded-full"
        style={{
          background: `conic-gradient(var(--color-accent) 0deg ${degrees}deg, #211C2C ${degrees}deg 360deg)`,
        }}
        title={`${percent} % du budget estimé`}
      >
        <span className="flex h-[26px] w-[26px] items-center justify-center rounded-full bg-app font-mono text-[9px] text-meta">
          {Math.round(percent)}
        </span>
      </div>
      <span className="font-mono text-[9px] text-meta">
        {amountEur.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €
      </span>
    </div>
  )
}

interface RailProps {
  openDrawer: DrawerId | null
  usagePercent: number
  usageEur: number
  onToggleDrawer: (drawer: DrawerId) => void
}

export default function Rail({
  openDrawer,
  usagePercent,
  usageEur,
  onToggleDrawer,
}: RailProps) {
  return (
    <nav
      aria-label="Panneaux"
      className="flex w-rail shrink-0 flex-col items-center gap-3 py-4"
    >
      {/* Marque */}
      <div
        className="relative flex h-[30px] w-[30px] items-center justify-center rounded-[10px]"
        style={{ background: 'linear-gradient(160deg,#212734,#111620)' }}
      >
        <span
          className="h-[9px] w-[9px] rounded-full bg-accent animate-breathe"
          style={{ boxShadow: '0 0 12px -2px var(--color-accent)' }}
        />
      </div>

      <div className="mt-2 flex flex-col items-center gap-[6px]">
        <RailButton
          icon={ClockCounterClockwise}
          label="Historique"
          active={openDrawer === 'history'}
          onClick={() => onToggleDrawer('history')}
        />
        <RailButton
          icon={Books}
          label="Bibliothèque de recettes"
          active={openDrawer === 'recipes'}
          onClick={() => onToggleDrawer('recipes')}
        />
      </div>

      <div className="flex-1" />

      <UsageGauge percent={usagePercent} amountEur={usageEur} />

      <RailButton
        icon={SlidersHorizontal}
        label="Clés & préférences"
        active={openDrawer === 'settings'}
        onClick={() => onToggleDrawer('settings')}
      />
    </nav>
  )
}
