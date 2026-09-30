'use client'

import { useEffect, useRef, useState } from 'react'
import { CheckIcon, DownloadSimpleIcon, TrashIcon, UploadSimpleIcon } from '@phosphor-icons/react/dist/ssr'
import { Button, Field, IconButton } from '@/components/atelier/ui'
import { downloadJson } from '@/lib/atelier/export'
import { mergeRecipes, parseRecipesFile, serializeRecipes } from '@/lib/atelier/recipes'
import { useT } from '@/lib/i18n'
import type { Recipe } from '@/lib/types'

interface PresetsMenuProps {
  recipes: Recipe[]
  activeId: string | null
  onApply: (recipe: Recipe) => void
  onSave: (name: string) => void
  onDelete: (id: string) => void
  onImport: (recipes: Recipe[]) => void
  onClose: () => void
}

export default function PresetsMenu({ recipes, activeId, onApply, onSave, onDelete, onImport, onClose }: PresetsMenuProps) {
  const t = useT()
  const ref = useRef<HTMLDivElement>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const [name, setName] = useState('')
  const [confirming, setConfirming] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    function onPointer(event: PointerEvent) {
      // Le parent contient aussi le bouton déclencheur : le recliquer referme
      // par son propre geste, pas par un « clic dehors » qui rouvrirait aussitôt.
      if (!ref.current?.parentElement?.contains(event.target as Node)) onClose()
    }
    document.addEventListener('pointerdown', onPointer)
    return () => document.removeEventListener('pointerdown', onPointer)
  }, [onClose])

  async function importFile(file: File | undefined) {
    if (!file) return
    let raw: string
    try {
      raw = await file.text()
    } catch (caught) {
      return setError(caught instanceof Error ? caught.message : String(caught))
    }
    const result = parseRecipesFile(raw)
    if (!result.ok) return setError(result.error)
    setError(null)
    onImport(mergeRecipes(recipes, result.recipes))
  }

  return (
    <div
      ref={ref}
      role="dialog"
      aria-label={t.presets.title}
      onKeyDown={(event) => {
        if (event.key !== 'Escape') return
        event.stopPropagation()
        onClose()
      }}
      className="absolute top-full right-0 z-40 mt-2 flex w-[340px] flex-col rounded-xs border border-hairline-strong bg-solid max-sm:fixed max-sm:inset-x-2 max-sm:top-[62px] max-sm:mt-0 max-sm:w-auto"
    >
      {recipes.length === 0 ? (
        <p className="meta p-4">{t.presets.empty}</p>
      ) : (
        <ul className="max-h-[320px] overflow-y-auto p-1">
          {recipes.map((recipe) => {
            const refs = recipe.subjectImages.length + recipe.styleImages.length
            const terms = recipe.negative ? recipe.negative.split(',').filter((term) => term.trim()).length : 0
            const summary = [
              recipe.params.aspectRatio,
              recipe.params.resolution,
              refs > 0 && t.presets.refs(refs),
              terms > 0 && t.presets.terms(terms),
              recipe.promptSuffix && t.presets.suffix,
            ].filter(Boolean)
            return (
              <li key={recipe.id} className="flex items-center gap-1">
                <button
                  type="button"
                  aria-current={recipe.id === activeId}
                  onClick={() => {
                    onApply(recipe)
                    onClose()
                  }}
                  className="flex min-w-0 flex-1 items-center gap-2 rounded-xs px-2 py-1.5 text-left hover:bg-sunken"
                >
                  <span className="flex min-w-0 flex-1 flex-col">
                    <span className="truncate text-12 font-semibold">{recipe.name}</span>
                    <span className="meta truncate">{summary.join(' · ')}</span>
                  </span>
                  {recipe.id === activeId && <CheckIcon size={14} aria-hidden />}
                </button>
                {confirming === recipe.id ? (
                  <Button size="sm" variant="danger" autoFocus onClick={() => onDelete(recipe.id)} onBlur={() => setConfirming(null)}>
                    {t.presets.confirmDelete(recipe.name)}
                  </Button>
                ) : (
                  <IconButton size="sm" icon={TrashIcon} label={t.presets.deleteOne(recipe.name)} onClick={() => setConfirming(recipe.id)} />
                )}
              </li>
            )
          })}
        </ul>
      )}

      <form
        onSubmit={(event) => {
          event.preventDefault()
          if (!name.trim()) return
          onSave(name.trim())
          setName('')
        }}
        className="flex flex-col gap-1.5 border-t border-hairline p-3"
      >
        <div className="flex gap-1.5">
          <Field
            aria-label={t.presets.name}
            placeholder={t.presets.namePlaceholder}
            value={name}
            onChange={(event) => setName(event.target.value)}
            className="flex-1 font-sans text-12"
          />
          <Button type="submit" variant="secondary" disabled={!name.trim()}>
            {t.common.save}
          </Button>
        </div>
        <p className="meta">{t.presets.note}</p>
      </form>

      <div className="flex gap-1 border-t border-hairline p-1">
        <Button size="sm" icon={UploadSimpleIcon} onClick={() => fileRef.current?.click()}>
          {t.presets.import}
        </Button>
        <Button
          size="sm"
          icon={DownloadSimpleIcon}
          disabled={recipes.length === 0}
          onClick={() => downloadJson(serializeRecipes(recipes), 'obskura-presets.json')}
        >
          {t.presets.export}
        </Button>
        <input
          ref={fileRef}
          type="file"
          accept="application/json"
          hidden
          onChange={(event) => {
            void importFile(event.target.files?.[0])
            event.target.value = ''
          }}
        />
      </div>
      {error && (
        <p role="alert" className="meta px-3 pb-2 text-danger">
          {error}
        </p>
      )}
    </div>
  )
}
