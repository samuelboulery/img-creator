'use client'

import { forwardRef, useId, useSyncExternalStore, type ButtonHTMLAttributes, type InputHTMLAttributes, type ReactNode } from 'react'
import type { Icon } from '@phosphor-icons/react'
import type { ValueOption } from '@/lib/adapters/capabilities'

/* Primitives d'Obskura. Mesures des maquettes : boutons et champs 32 px,
   cases de sélecteur 26 px, pastilles 28 px, rayons 2 px, filets 1 px. */

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger'

const VARIANTS: Record<Variant, string> = {
  primary: 'bg-ink text-stage font-semibold hover:opacity-90',
  secondary: 'border border-hairline-strong text-ink hover:bg-sunken',
  ghost: 'text-ink-soft hover:bg-sunken hover:text-ink',
  danger: 'text-danger hover:bg-sunken',
}

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: 'md' | 'sm'
  icon?: Icon
  active?: boolean
  full?: boolean
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'ghost', size = 'md', icon: Glyph, active, full, className = '', children, type = 'button', ...rest },
  ref
) {
  return (
    <button
      ref={ref}
      type={type}
      className={`inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-xs text-12 leading-none transition-colors duration-140 ease-standard disabled:cursor-default disabled:opacity-40 ${
        size === 'sm' ? 'h-7 px-2' : 'h-8 px-3'
      } ${full ? 'w-full justify-start' : 'justify-center'} ${VARIANTS[variant]} ${
        active ? 'bg-raised text-ink' : ''
      } ${className}`}
      {...rest}
    >
      {Glyph && <Glyph size={16} aria-hidden className="shrink-0" />}
      {children}
    </button>
  )
})

export interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  label: string
  icon: Icon
  size?: 'md' | 'sm'
  active?: boolean
}

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(function IconButton(
  { label, icon: Glyph, size = 'md', active, className = '', type = 'button', ...rest },
  ref
) {
  return (
    <button
      ref={ref}
      type={type}
      aria-label={label}
      title={label}
      className={`inline-flex shrink-0 items-center justify-center rounded-xs transition-colors duration-140 ease-standard hover:bg-sunken hover:text-ink disabled:cursor-default disabled:opacity-40 ${
        size === 'sm' ? 'h-6 w-6' : 'h-8 w-8'
      } ${active ? 'bg-raised text-ink' : 'text-ink-soft'} ${className}`}
      {...rest}
    >
      <Glyph size={size === 'sm' ? 14 : 16} aria-hidden />
    </button>
  )
})

const subscribeNever = () => () => {}

/** ⌘ sur Mac, Ctrl ailleurs. Le serveur rend ⌘, le client corrige. */
export function useModKey(): string {
  return useSyncExternalStore(
    subscribeNever,
    () => (/Mac|iPhone|iPad/.test(navigator.userAgent) ? '⌘' : 'Ctrl'),
    () => '⌘'
  )
}

/** Raccourci écrit en capsules — jamais un glyphe dur dans un libellé. `mod` vaut ⌘ ou Ctrl. */
export function Kbd({ keys, onInk }: { keys: string[]; onInk?: boolean }) {
  const mod = useModKey()
  return (
    <span className="inline-flex gap-0.5" aria-hidden>
      {keys.map((key) => (
        <kbd
          key={key}
          className={`inline-flex h-[18px] min-w-[18px] items-center justify-center rounded-xs border px-1 font-mono text-10 leading-none ${
            onInk ? 'border-stage/40 text-stage' : 'border-hairline-strong text-ink-soft'
          }`}
        >
          {key === 'mod' ? mod : key}
        </kbd>
      ))}
    </span>
  )
}

export interface SegmentedProps<T extends string | number> {
  label: string
  options: ValueOption<T>[]
  value: T
  onChange: (value: T) => void
  mono?: boolean
}

/** Sélecteur exclusif. Radios natives : les flèches et le nom du groupe viennent du navigateur. */
export function Segmented<T extends string | number>({ label, options, value, onChange, mono = true }: SegmentedProps<T>) {
  const name = useId()
  return (
    <div role="radiogroup" aria-label={label} className="flex gap-0.5 rounded-xs border border-hairline bg-sunken p-0.5">
      {options.map((option) => (
        <label key={String(option.value)} className="relative flex min-w-0 flex-1">
          <input
            type="radio"
            name={name}
            className="peer sr-only"
            checked={option.value === value}
            onChange={() => onChange(option.value)}
          />
          <span
            className={`flex h-[26px] w-full cursor-pointer items-center justify-center truncate rounded-[1px] px-1 text-ink-soft transition-colors duration-140 hover:text-ink peer-checked:bg-raised peer-checked:text-ink peer-focus-visible:outline-2 peer-focus-visible:outline-offset-1 peer-focus-visible:outline-ink ${
              mono ? 'font-mono text-11' : 'text-12'
            }`}
          >
            {option.label}
          </span>
        </label>
      ))}
    </div>
  )
}

export interface ToggleProps {
  label: string
  checked: boolean
  onChange: (checked: boolean) => void
  disabled?: boolean
}

export function Toggle({ label, checked, onChange, disabled }: ToggleProps) {
  return (
    <div className="flex min-h-6 items-center justify-between gap-3">
      <span className={`text-12 ${disabled ? 'text-dim' : ''}`}>{label}</span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={`relative h-5 w-[34px] shrink-0 rounded-full border transition-colors duration-140 disabled:opacity-40 ${
          checked ? 'border-ink bg-ink' : 'border-hairline-strong bg-raised'
        }`}
      >
        <span
          className={`absolute top-[2px] h-3.5 w-3.5 rounded-full transition-[left] duration-140 ease-standard ${
            checked ? 'left-4 bg-stage' : 'left-[2px] bg-ink-soft'
          }`}
        />
      </button>
    </div>
  )
}

export interface SectionProps {
  label: string
  meta?: ReactNode
  children: ReactNode
  first?: boolean
}

export function Section({ label, meta, children, first }: SectionProps) {
  return (
    <section className={`flex flex-col gap-2.5 px-4 pt-3.5 pb-4 ${first ? '' : 'border-t border-hairline'}`}>
      <div className="flex min-h-4 items-center justify-between gap-2">
        <h3 className="lbl">{label}</h3>
        {meta !== undefined && <span className="meta">{meta}</span>}
      </div>
      {children}
    </section>
  )
}

export const Field = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(function Field(
  { className = '', ...rest },
  ref
) {
  return (
    <input
      ref={ref}
      className={`h-8 min-w-0 rounded-xs border border-hairline bg-sunken px-2.5 font-mono text-11 text-ink placeholder:text-dim ${className}`}
      {...rest}
    />
  )
})

/** Paire clé/valeur mono des inspecteurs. */
export function KeyValue({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3 font-mono text-11 leading-[22px]">
      <span className="text-dim">{label}</span>
      <span className="truncate text-right">{value}</span>
    </div>
  )
}
