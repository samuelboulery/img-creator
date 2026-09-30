'use client'

import { useEffect, useReducer, useState } from 'react'
import { classifyClientError } from './error-kind'
import { fitParams, modelChanges, MODELS } from '@/lib/adapters/capabilities'
import { drawSeed, resolveSeed } from '@/lib/adapters/shared'
import { estimateCost } from './cost'
import { toImageState, toReferenceImage } from './image-file'
import { extractPalette } from './palette'
import { DEFAULT_PARAMS, DEFAULT_RECIPE_STATE, normalizeParams, type RecipeState } from './params'
import { createRecipe } from './recipes'
import { atelierReducer, initialAtelierState } from './reducer'
import {
  DEFAULT_PREFS,
  readJson,
  readPrefs,
  readString,
  STORAGE_KEYS,
  writeJson,
  writeSession,
  writeString,
  type Prefs,
} from './storage'
import { makeThumbnail } from './thumbnail'
import type {
  AdapterId,
  KeyKind,
  PendingTile,
  GalleryItem,
  GenerateResponse,
  GenerationParams,
  GenerationRequest,
  Recipe,
} from '@/lib/types'

export type ModelNote = ReturnType<typeof modelChanges>

const keyOf = (adapterId: AdapterId): KeyKind => MODELS[adapterId].keyKind

const KEY_STORAGE: Record<KeyKind, string> = {
  gemini: STORAGE_KEYS.geminiKey,
  openai: STORAGE_KEYS.openaiKey,
  text: STORAGE_KEYS.textKey,
}

// ponytail: `items` n'est pas plafonné en mémoire — les listes n'affichent que
// des aperçus, donc le coût reste tenable. Passer à IndexedDB si l'historique
// complet doit survivre au rechargement en pleine résolution.

/** Résultat courant du mode A/B, une colonne par modèle. */
export interface AbState {
  a: GalleryItem | null
  b: GalleryItem | null
  errorA: string | null
  errorB: string | null
  running: boolean
}

export interface GenerateOptions {
  parentId?: string | null
  /** Modèle imposé — utilisé par le mode A/B, qui lance les deux en parallèle. */
  adapterId?: AdapterId
}

/**
 * État de l'atelier : réglages, session, presets, clés, et l'appel de
 * génération. Tout vit dans le navigateur ; le seul aller-retour serveur est
 * `/api/generate`, qui porte la clé de l'utilisateur.
 */
export function useAtelier() {
  const [state, dispatch] = useReducer(atelierReducer, initialAtelierState)
  const [prompt, setPrompt] = useState('')
  const [negative, setNegative] = useState('')
  const [promptSuffix, setPromptSuffix] = useState('')
  const [params, setParams] = useState<GenerationParams>(DEFAULT_PARAMS)
  const [recipe, setRecipe] = useState<RecipeState>(DEFAULT_RECIPE_STATE)
  const [items, setItems] = useState<GalleryItem[]>([])
  const [pending, setPending] = useState<PendingTile[]>([])
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [activeRecipeId, setActiveRecipeId] = useState<string | null>(null)
  const [keys, setKeys] = useState<Record<KeyKind, string>>({
    gemini: '',
    openai: '',
    text: '',
  })
  const [prefs, setPrefs] = useState<Prefs>(DEFAULT_PREFS)
  const [onboarding, setOnboarding] = useState(false)
  const [ab, setAb] = useState<AbState>({
    a: null,
    b: null,
    errorA: null,
    errorB: null,
    running: false,
  })
  /** Ce que le dernier changement de modèle a ajouté ou retiré de l'inspecteur. */
  const [modelNote, setModelNote] = useState<ModelNote | null>(null)
  const [hydrated, setHydrated] = useState(false)
  /**
   * Ce que la dernière écriture a réellement gardé — affiché dans l'en-tête. On
   * ne retient que les compteurs : garder les items doublerait la mémoire.
   */
  const [persisted, setPersisted] = useState({ kept: 0, fullCount: 0 })

  const activeRecipe = recipes.find((entry) => entry.id === activeRecipeId) ?? null

  // Relecture du navigateur au montage : aucun appel serveur.
  useEffect(() => {
    setKeys({
      gemini: readString(STORAGE_KEYS.geminiKey),
      openai: readString(STORAGE_KEYS.openaiKey),
      text: readString(STORAGE_KEYS.textKey),
    })
    setPrefs(readPrefs())
    setParams(normalizeParams(readJson<unknown>(STORAGE_KEYS.params, null)))
    setItems(readJson<GalleryItem[]>(STORAGE_KEYS.session, []))
    setRecipes(readJson<Recipe[]>(STORAGE_KEYS.recipes, []))
    setOnboarding(
      !readJson<boolean>(STORAGE_KEYS.onboarded, false) &&
        !readString(STORAGE_KEYS.geminiKey) &&
        !readString(STORAGE_KEYS.openaiKey)
    )
    setHydrated(true)
  }, [])

  useEffect(() => {
    if (hydrated) writeJson(STORAGE_KEYS.params, params)
  }, [params, hydrated])

  useEffect(() => {
    if (!hydrated) return
    const written = writeSession(items)
    setPersisted({ kept: written.items.length, fullCount: written.fullCount })
  }, [items, hydrated])

  useEffect(() => {
    if (hydrated) writeJson(STORAGE_KEYS.prefs, prefs)
  }, [prefs, hydrated])

  useEffect(() => {
    if (hydrated) writeJson(STORAGE_KEYS.recipes, recipes)
  }, [recipes, hydrated])

  /** Entrer dans l'atelier ferme l'accueil pour de bon. */
  function finishOnboarding() {
    setOnboarding(false)
    writeJson(STORAGE_KEYS.onboarded, true)
  }

  /** « Revoir l'écran d'accueil » depuis les réglages. */
  function reviewOnboarding() {
    writeJson(STORAGE_KEYS.onboarded, false)
    setOnboarding(true)
  }

  function setKey(kind: KeyKind, value: string) {
    setKeys((previous) => ({ ...previous, [kind]: value }))
    writeString(KEY_STORAGE[kind], value)
  }

  function applyRecipe(entry: Recipe) {
    setActiveRecipeId(entry.id)
    setPromptSuffix(entry.promptSuffix)
    setParams(normalizeParams({ ...DEFAULT_PARAMS, ...entry.params }))
    setRecipe({
      subjectImages: entry.subjectImages.map(toImageState),
      subjectWeight: entry.subjectWeight,
      identityLock: entry.identityLock,
      styleImages: entry.styleImages.map(toImageState),
      styleWeight: entry.styleWeight,
      paletteTransfer: entry.paletteTransfer,
    })
  }

  function saveCurrentRecipe(name: string) {
    const saved = createRecipe({
      id: crypto.randomUUID(),
      name,
      subjectImages: recipe.subjectImages.map(toReferenceImage),
      subjectWeight: recipe.subjectWeight,
      styleImages: recipe.styleImages.map(toReferenceImage),
      styleWeight: recipe.styleWeight,
      identityLock: recipe.identityLock,
      paletteTransfer: recipe.paletteTransfer,
      promptSuffix,
      negative: negative.trim(),
      params,
    })

    setRecipes((previous) => [...previous, saved])
    setActiveRecipeId(saved.id)
  }

  function resetParams() {
    setParams(DEFAULT_PARAMS)
    setRecipe(DEFAULT_RECIPE_STATE)
    setPromptSuffix('')
    setActiveRecipeId(null)
  }

  /**
   * Change de modèle et recale les réglages sur ce qu'il accepte — et sur ce
   * qu'accepte le modèle parallèle, qui reçoit les mêmes.
   */
  function selectModel(adapterId: AdapterId) {
    if (adapterId === state.adapterId) return
    const parallel = state.parallelId === adapterId ? null : state.parallelId

    setModelNote(modelChanges(state.adapterId, adapterId))
    dispatch({ type: 'setAdapter', adapterId })
    setParams((previous) => {
      const fitted = fitParams(previous, adapterId)
      return parallel ? fitParams(fitted, parallel) : fitted
    })
  }

  function setParallel(adapterId: AdapterId | null) {
    dispatch({ type: 'setParallel', adapterId })
    if (adapterId && adapterId !== state.adapterId) {
      setParams((previous) => fitParams(previous, adapterId))
    }
  }

  /** Le preset reste enregistré ; les réglages courants cessent d'y être liés. */
  function detachRecipe() {
    setActiveRecipeId(null)
    setPromptSuffix('')
  }

  function hasKeyFor(adapterId: AdapterId): boolean {
    return keys[keyOf(adapterId)].trim().length > 0
  }

  function buildRequest(
    text: string,
    adapterId: AdapterId = state.adapterId,
    drawnSeed: number | null = null
  ): GenerationRequest {
    return {
      adapterId,
      prompt: text,
      drawnSeed,
      negative: negative.trim() || undefined,
      promptSuffix: promptSuffix.trim() || undefined,
      recipeNegative: activeRecipe?.negative,
      subjectImages: recipe.subjectImages.map(toReferenceImage),
      subjectWeight: recipe.subjectWeight,
      styleImages: recipe.styleImages.map(toReferenceImage),
      styleWeight: recipe.styleWeight,
      identityLock: recipe.identityLock,
      paletteTransfer: recipe.paletteTransfer,
      params,
    }
  }

  /**
   * Complète un item déjà affiché avec ce qui se dérive de son image : palette
   * du fond ambiant et aperçu persistable. Les deux calculs partent ensemble et
   * n'écrivent l'état qu'une fois.
   */
  function attachDerived(item: GalleryItem) {
    const dataUrl = `data:${item.result.mimeType};base64,${item.result.imageBase64}`

    void Promise.all([extractPalette(dataUrl), makeThumbnail(dataUrl)]).then(
      ([palette, thumb]) => {
        if (!palette && !thumb) return
        setItems((previous) =>
          previous.map((entry) =>
            entry.id === item.id
              ? { ...entry, palette: palette ?? entry.palette, thumb: thumb ?? entry.thumb }
              : entry
          )
        )
      }
    )
  }

  interface RunResult {
    created: GalleryItem[]
    error: string | null
  }

  /** Un appel de génération, sans décider où va l'erreur : l'appelant s'en charge. */
  async function runGeneration(
    text: string,
    adapterId: AdapterId,
    parentId: string | null
  ): Promise<RunResult> {
    const tile: PendingTile = { id: crypto.randomUUID(), startedAt: Date.now() }
    setPending((previous) => [...previous, tile])

    // Tirée ici, une fois : le corps envoyé et la graine notée sur l'item sont
    // la même valeur, et une image non verrouillée reste reproductible.
    const drawnSeed = drawSeed()
    const effectiveSeed = resolveSeed(params, drawnSeed)

    const headers: Record<string, string> = { 'Content-Type': 'application/json' }
    const key = keys[keyOf(adapterId)]
    if (key) headers['x-api-key'] = key

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers,
        body: JSON.stringify(buildRequest(text, adapterId, drawnSeed)),
      })

      const json: GenerateResponse = await response.json()
      if (!json.success || !json.data) throw new Error(json.error ?? 'Erreur inconnue')

      const latencyMs = Date.now() - tile.startedAt
      const created: GalleryItem[] = json.data.map((result) => ({
        id: crypto.randomUUID(),
        result,
        adapterId,
        prompt: text,
        negative: negative.trim(),
        seed: effectiveSeed,
        params,
        palette: null,
        thumb: null,
        parentId,
        recipeId: activeRecipeId,
        latencyMs,
        costEur: estimateCost(adapterId, 1, prefs.pricing),
        createdAt: new Date().toISOString(),
      }))

      setItems((previous) => [...created, ...previous])

      // La palette arrive après coup : elle ne doit pas retarder l'affichage.
      created.forEach(attachDerived)

      return { created, error: null }
    } catch (error) {
      return {
        created: [],
        error: error instanceof Error ? error.message : 'Erreur inconnue',
      }
    } finally {
      setPending((previous) => previous.filter((entry) => entry.id !== tile.id))
    }
  }

  async function generate(
    fromPrompt: string,
    options: GenerateOptions = {}
  ): Promise<GalleryItem[]> {
    const text = fromPrompt.trim()
    if (!text) return []

    dispatch({ type: 'setError', error: null })
    const { created, error } = await runGeneration(
      text,
      options.adapterId ?? state.adapterId,
      options.parentId ?? null
    )

    if (error) {
      dispatch({ type: 'setError', error, kind: classifyClientError(error) })
    } else if (created[0]) {
      dispatch({ type: 'select', id: created[0].id })
    }

    return created
  }

  /** Mode A/B : les deux modèles partent en parallèle, chacun avec sa clé. */
  async function compare(fromPrompt: string) {
    const text = fromPrompt.trim()
    if (!text) return

    setAb({ a: null, b: null, errorA: null, errorB: null, running: true })

    const [first, second] = await Promise.all([
      hasKeyFor('nano-banana-2')
        ? runGeneration(text, 'nano-banana-2', null)
        : Promise.resolve({ created: [], error: 'Aucune clé Google AI Studio enregistrée' }),
      hasKeyFor('gpt-image-2')
        ? runGeneration(text, 'gpt-image-2', null)
        : Promise.resolve({ created: [], error: 'Aucune clé OpenAI enregistrée' }),
    ])

    setAb({
      a: first.created[0] ?? null,
      b: second.created[0] ?? null,
      errorA: first.error,
      errorB: second.error,
      running: false,
    })
  }

  return {
    state,
    dispatch,
    prompt,
    setPrompt,
    negative,
    setNegative,
    promptSuffix,
    setPromptSuffix,
    params,
    setParams,
    recipe,
    setRecipe,
    items,
    setItems,
    persisted,
    pending,
    recipes,
    setRecipes,
    activeRecipe,
    activeRecipeId,
    applyRecipe,
    saveCurrentRecipe,
    resetParams,
    selectModel,
    setParallel,
    modelNote,
    detachRecipe,
    keys,
    setKey,
    hasKeyFor,
    prefs,
    setPrefs,
    onboarding,
    finishOnboarding,
    reviewOnboarding,
    estimatedCost: estimateCost(state.adapterId, params.batch, prefs.pricing),
    imageKeyCount: [keys.gemini, keys.openai].filter((key) => key.trim()).length,
    buildRequest,
    generate,
    ab,
    compare,
  }
}

export type Atelier = ReturnType<typeof useAtelier>
