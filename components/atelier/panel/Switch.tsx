'use client'

interface SwitchProps {
  label: string
  checked: boolean
  ignored?: boolean
  onChange: (checked: boolean) => void
}

export default function Switch({ label, checked, ignored = false, onChange }: SwitchProps) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-[12.5px] text-label">
        {label}
        {ignored && <span className="ml-2 font-mono text-[10px] text-meta">ignoré ici</span>}
      </span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        onClick={() => onChange(!checked)}
        className={`relative h-[17px] w-[30px] shrink-0 rounded-switch transition-colors duration-[240ms] ${
          checked ? '' : 'bg-track'
        }`}
        style={
          checked
            ? {
                background: 'linear-gradient(160deg, oklch(0.76 0.2 85), oklch(0.66 0.22 58))',
                boxShadow: '0 0 16px -4px var(--color-accent)',
              }
            : undefined
        }
      >
        <span
          className="absolute top-[2.5px] h-[12px] w-[12px] rounded-full bg-white transition-[left] duration-[240ms]"
          style={{ left: checked ? '15.5px' : '2.5px' }}
        />
      </button>
    </div>
  )
}
