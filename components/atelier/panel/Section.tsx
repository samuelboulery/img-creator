'use client'

interface SectionProps {
  title: string
  /** Meta mono affichée à droite du titre, ex. « 3 réf · 65 % ». */
  meta?: string
  open: boolean
  onToggle: () => void
  children: React.ReactNode
}

export default function Section({ title, meta, open, onToggle, children }: SectionProps) {
  return (
    <section className="mb-[10px] overflow-hidden rounded-section bg-section">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className="flex w-full items-center justify-between px-3 py-[11px] text-left"
      >
        <span className="text-[12.5px] text-body-soft">{title}</span>
        <span className="flex items-center gap-2">
          {meta && <span className="font-mono text-[10.5px] text-meta">{meta}</span>}
          <span className="text-[10px] text-faint">{open ? '▲' : '▼'}</span>
        </span>
      </button>
      {open && <div className="space-y-[11px] px-3 pb-3">{children}</div>}
    </section>
  )
}
