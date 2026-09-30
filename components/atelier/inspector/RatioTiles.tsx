'use client'

import { useId } from 'react'
import type { AspectRatio } from '@/lib/types'

const RATIOS: { value: AspectRatio; w: number; h: number }[] = [
  { value: '1:1', w: 16, h: 16 },
  { value: '16:9', w: 24, h: 14 },
  { value: '9:16', w: 12, h: 21 },
  { value: '4:3', w: 22, h: 16 },
]

interface RatioTilesProps {
  label: string
  value: AspectRatio
  onChange: (value: AspectRatio) => void
}

/** Formats en tuiles à glyphe. Radios natives, comme `Segmented`. */
export default function RatioTiles({ label, value, onChange }: RatioTilesProps) {
  const name = useId()
  return (
    <div role="radiogroup" aria-label={label} className="grid grid-cols-4 gap-1">
      {RATIOS.map((ratio) => (
        <label key={ratio.value} className="relative flex">
          <input
            type="radio"
            name={name}
            className="peer sr-only"
            checked={ratio.value === value}
            onChange={() => onChange(ratio.value)}
          />
          <span className="flex h-14 w-full cursor-pointer flex-col items-center justify-center gap-[7px] rounded-xs font-mono text-11 text-ink-soft transition-colors duration-140 hover:text-ink peer-checked:bg-raised peer-checked:text-ink peer-focus-visible:outline-2 peer-focus-visible:outline-offset-1 peer-focus-visible:outline-ink">
            <span
              aria-hidden
              className="rounded-[1px] border-[1.5px] border-current"
              style={{ width: ratio.w, height: ratio.h }}
            />
            {ratio.value}
          </span>
        </label>
      ))}
    </div>
  )
}
