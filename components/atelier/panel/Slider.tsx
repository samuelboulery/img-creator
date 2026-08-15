'use client'

interface SliderProps {
  label: string
  /** Valeur affichée en ambre à droite du libellé, ex. « proche · 75 ». */
  valueLabel: string
  value: number
  min: number
  max: number
  step: number
  lowBound: string
  highBound: string
  ignored?: boolean
  onChange: (value: number) => void
}

export default function Slider({
  label,
  valueLabel,
  value,
  min,
  max,
  step,
  lowBound,
  highBound,
  ignored = false,
  onChange,
}: SliderProps) {
  return (
    <div>
      <div className="mb-[6px] flex items-center justify-between gap-2">
        <span className="text-[12.5px] text-label">
          {label}
          {ignored && (
            <span className="ml-2 font-mono text-[10px] text-meta">ignoré ici</span>
          )}
        </span>
        <span className="font-mono text-[11.5px] text-accent-lighter">{valueLabel}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        aria-label={label}
        onChange={(event) => onChange(Number(event.target.value))}
        className="h-1 w-full cursor-pointer accent-[oklch(0.72_0.21_72)]"
      />
      <div className="mt-[3px] flex justify-between font-mono text-[9.5px] text-meta">
        <span>{lowBound}</span>
        <span>{highBound}</span>
      </div>
    </div>
  )
}
