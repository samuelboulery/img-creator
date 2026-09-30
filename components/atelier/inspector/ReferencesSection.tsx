'use client'

import { XIcon } from '@phosphor-icons/react/dist/ssr'
import { IconButton, Section, Toggle } from '@/components/atelier/ui'
import { MAX_REFERENCE_IMAGES } from '@/lib/adapters/validate'
import { useT } from '@/lib/i18n'
import type { ImageState } from '@/lib/atelier/image-file'
import type { RecipeState } from '@/lib/atelier/params'

interface ReferencesSectionProps {
  recipe: RecipeState
  onChange: (recipe: RecipeState) => void
  /** Nano Banana 2 lit un poids par référence ; GPT Image les lit sans poids. */
  weights: boolean
}

function clampPercent(raw: string, fallback: number): number {
  const value = Number.parseInt(raw, 10)
  if (Number.isNaN(value)) return fallback
  return Math.min(100, Math.max(0, value))
}

/** Rendu seulement quand des références sont jointes. */
export default function ReferencesSection({ recipe, onChange, weights }: ReferencesSectionProps) {
  const t = useT()
  const count = recipe.subjectImages.length + recipe.styleImages.length
  if (count === 0) return null

  const patch = (partial: Partial<RecipeState>) => onChange({ ...recipe, ...partial })

  function group(
    kind: 'subject' | 'style',
    images: ImageState[],
    weight: number,
    setImages: (next: ImageState[]) => void,
    setWeight: (value: number) => void
  ) {
    const name = kind === 'subject' ? t.refs.subject : t.refs.style
    return images.map((image) => (
      <div key={image.id} className="flex items-center gap-2.5">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={image.preview} alt="" className="h-10 w-10 shrink-0 rounded-xs object-cover" />
        <span className="flex min-w-0 flex-1 flex-col">
          <span className="text-12 font-semibold">{name}</span>
          <span className="meta">{weights ? t.refs.fidelity : t.refs.noWeight}</span>
        </span>
        {weights && (
          <label className="flex h-8 w-16 shrink-0 items-center rounded-xs border border-hairline bg-sunken px-2 font-mono text-11">
            <span className="sr-only">{t.refs.weightOf(name)}</span>
            <input
              inputMode="numeric"
              value={weight}
              onChange={(event) => setWeight(clampPercent(event.target.value, weight))}
              className="w-full min-w-0 bg-transparent text-right outline-none"
            />
            <span aria-hidden className="pl-0.5 text-dim">%</span>
          </label>
        )}
        <IconButton
          size="sm"
          icon={XIcon}
          label={t.composer.removeReference}
          onClick={() => setImages(images.filter((entry) => entry.id !== image.id))}
        />
      </div>
    ))
  }

  return (
    <Section label={t.refs.title} meta={`${count} / ${MAX_REFERENCE_IMAGES * 2}`}>
      {group(
        'subject',
        recipe.subjectImages,
        recipe.subjectWeight,
        (subjectImages) => patch({ subjectImages }),
        (subjectWeight) => patch({ subjectWeight })
      )}
      {recipe.subjectImages.length > 0 && (
        <Toggle
          label={t.refs.keepIdentity}
          checked={recipe.identityLock}
          onChange={(identityLock) => patch({ identityLock })}
        />
      )}
      {recipe.subjectImages.length > 0 && recipe.styleImages.length > 0 && (
        <div className="my-0.5 h-px bg-hairline" />
      )}
      {group(
        'style',
        recipe.styleImages,
        recipe.styleWeight,
        (styleImages) => patch({ styleImages }),
        (styleWeight) => patch({ styleWeight })
      )}
      {recipe.styleImages.length > 0 && (
        <Toggle
          label={t.refs.reusePalette}
          checked={recipe.paletteTransfer}
          onChange={(paletteTransfer) => patch({ paletteTransfer })}
        />
      )}
      {!weights && <p className="font-mono text-11 leading-[18px] text-ink-soft">{t.refs.gptNote}</p>}
    </Section>
  )
}
