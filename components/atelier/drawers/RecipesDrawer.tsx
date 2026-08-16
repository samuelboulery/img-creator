'use client'

import { Trash } from '@phosphor-icons/react/dist/ssr'
import { useRef, useState } from 'react'
import { mergeRecipes, parseRecipesFile, serializeRecipes } from '@/lib/atelier/recipes'
import type { Recipe } from '@/lib/types'

function RecipeCard({
  recipe,
  active,
  onApply,
  onDelete,
}: {
  recipe: Recipe
  active: boolean
  onApply: () => void
  onDelete: () => void
}) {
  const [confirming, setConfirming] = useState(false)
  const thumbs = [...recipe.subjectImages, ...recipe.styleImages].slice(0, 3)
  const referenceCount = recipe.subjectImages.length + recipe.styleImages.length

  return (
    <div
      className={`relative rounded-section transition-colors duration-[240ms] ${
        active ? 'bg-field-hover ring-selected' : 'bg-section hover:bg-field-hover'
      }`}
    >
      <button
        type="button"
        onClick={onApply}
        aria-pressed={active}
        className="w-full rounded-section p-3 text-left"
      >
        <div className="flex items-center justify-between gap-2">
          <span className="truncate text-[13px] text-body">{recipe.name}</span>
          {/* Place réservée au bouton supprimer, posé en absolu au-dessus. */}
          <span className="shrink-0 pr-[26px] font-mono text-[10px] text-meta">
            {referenceCount} réf · {recipe.styleWeight} %
          </span>
        </div>

        {thumbs.length > 0 && (
          <div className="mt-[8px] flex gap-[6px]">
            {thumbs.map((image, index) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={index}
                src={`data:${image.mimeType};base64,${image.base64}`}
                alt=""
                className="h-[34px] w-[34px] rounded-switch object-cover"
              />
            ))}
          </div>
        )}

        {recipe.promptSuffix && (
          <p className="mt-[8px] truncate font-mono text-[10px] text-meta">
            + {recipe.promptSuffix}
          </p>
        )}
        {recipe.negative && (
          <p className="truncate font-mono text-[10px] text-meta">− {recipe.negative}</p>
        )}
      </button>

      <button
        type="button"
        onClick={() => (confirming ? onDelete() : setConfirming(true))}
        onBlur={() => setConfirming(false)}
        aria-label={
          confirming ? `Confirmer la suppression de ${recipe.name}` : `Supprimer ${recipe.name}`
        }
        className={`absolute right-[8px] top-[8px] flex items-center gap-[5px] whitespace-nowrap rounded-chip px-[6px] py-[4px] text-[10.5px] transition-colors duration-[240ms] ${
          confirming
            ? 'bg-field text-error-text'
            : 'text-meta hover:bg-field hover:text-body-soft'
        }`}
      >
        <Trash size={13} weight={confirming ? 'fill' : 'regular'} />
        {/* Le libellé n'apparaît qu'au moment de confirmer : le tiroir est étroit. */}
        {confirming && 'Supprimer ?'}
      </button>
    </div>
  )
}

interface RecipesDrawerProps {
  recipes: Recipe[]
  activeRecipeId: string | null
  onApply: (recipe: Recipe) => void
  onSaveCurrent: (name: string) => void
  onImport: (recipes: Recipe[]) => void
  onDelete: (id: string) => void
}

export default function RecipesDrawer({
  recipes,
  activeRecipeId,
  onApply,
  onSaveCurrent,
  onImport,
  onDelete,
}: RecipesDrawerProps) {
  const [name, setName] = useState('')
  const [importError, setImportError] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  function exportRecipes() {
    const blob = new Blob([serializeRecipes(recipes)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'img-creator-recettes.json'
    link.click()
    URL.revokeObjectURL(url)
  }

  async function importRecipes(file: File | undefined) {
    if (!file) return
    const result = parseRecipesFile(await file.text())

    if (!result.ok) {
      setImportError(result.error)
      return
    }

    setImportError(null)
    onImport(mergeRecipes(recipes, result.recipes))
  }

  return (
    <div className="space-y-[10px]">
      <p className="font-mono text-[10px]/[1.6] text-meta">
        Une recette groupe les références, leurs poids, le suffixe de prompt, le négatif et les
        réglages — de quoi retrouver un rendu à l&apos;identique.
      </p>

      {recipes.length === 0 && (
        <p className="rounded-section border border-dashed border-dash p-3 text-[12.5px] text-meta">
          Aucune recette enregistrée pour l&apos;instant.
        </p>
      )}

      {recipes.map((recipe) => (
        <RecipeCard
          key={recipe.id}
          recipe={recipe}
          active={recipe.id === activeRecipeId}
          onApply={() => onApply(recipe)}
          onDelete={() => onDelete(recipe.id)}
        />
      ))}

      <div className="flex items-center gap-[6px] pt-1">
        <input
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="nom de la recette"
          aria-label="Nom de la recette"
          className="min-w-0 flex-1 rounded-chip bg-field px-2 py-[6px] text-[12px] text-body placeholder:text-faint focus:outline-none"
        />
        <button
          type="button"
          disabled={!name.trim()}
          onClick={() => {
            onSaveCurrent(name.trim())
            setName('')
          }}
          className="shrink-0 whitespace-nowrap rounded-chip bg-field px-[10px] py-[6px] text-[12px] text-body-soft transition-colors duration-[240ms] hover:bg-field-hover disabled:opacity-40"
        >
          Enregistrer
        </button>
      </div>

      <div className="flex gap-[6px]">
        <button
          type="button"
          onClick={exportRecipes}
          disabled={recipes.length === 0}
          className="flex-1 rounded-chip bg-field px-[10px] py-[6px] text-[12px] text-body-soft transition-colors duration-[240ms] hover:bg-field-hover disabled:opacity-40"
        >
          Exporter .json
        </button>
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="flex-1 rounded-chip bg-field px-[10px] py-[6px] text-[12px] text-body-soft transition-colors duration-[240ms] hover:bg-field-hover"
        >
          Importer
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="application/json"
          className="hidden"
          onChange={(event) => void importRecipes(event.target.files?.[0])}
        />
      </div>

      {importError && (
        <p role="alert" className="text-[12px] text-error-text">
          {importError}
        </p>
      )}

      <p className="font-mono text-[10px] text-meta">presets gardés en localStorage</p>
    </div>
  )
}
