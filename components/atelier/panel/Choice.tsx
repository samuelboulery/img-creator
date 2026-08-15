'use client'

interface ChoiceProps<T extends string | number> {
  label: string
  options: readonly { value: T; label: string }[]
  value: T
  ignored?: boolean
  onChange: (value: T) => void
}

/** Rangée de chips exclusives — format, résolution, fichier, variantes… */
export default function Choice<T extends string | number>({
  label,
  options,
  value,
  ignored = false,
  onChange,
}: ChoiceProps<T>) {
  return (
    <div>
      <div className="mb-[6px] text-[12.5px] text-label">
        {label}
        {ignored && <span className="ml-2 font-mono text-[10px] text-meta">ignoré ici</span>}
      </div>
      <div className="flex flex-wrap gap-[6px]">
        {options.map((option) => (
          <button
            key={String(option.value)}
            type="button"
            aria-pressed={value === option.value}
            onClick={() => onChange(option.value)}
            className={`rounded-chip px-[10px] py-[5px] font-mono text-[11.5px] transition-colors duration-[240ms] ${
              value === option.value
                ? 'bg-selected text-title ring-selected'
                : 'bg-field text-meta hover:bg-field-hover'
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  )
}
