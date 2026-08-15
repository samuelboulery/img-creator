'use client'

import { useReducer, useState } from 'react'
import CanvasHeader from '@/components/atelier/CanvasHeader'
import Composer from '@/components/atelier/Composer'
import Drawer from '@/components/atelier/Drawer'
import ErrorBanner from '@/components/atelier/ErrorBanner'
import Rail from '@/components/atelier/Rail'
import Explore, { type PendingTile } from '@/components/atelier/modes/Explore'
import JsonTab from '@/components/atelier/panel/JsonTab'
import RecipeTab, {
  DEFAULT_RECIPE_STATE,
  type RecipeState,
} from '@/components/atelier/panel/RecipeTab'
import SettingsPanel from '@/components/atelier/panel/SettingsPanel'
import { DEFAULT_PRICING, estimateCost } from '@/lib/atelier/cost'
import { toReferenceImage } from '@/lib/atelier/image-file'
import { DEFAULT_PARAMS } from '@/lib/atelier/params'
import { atelierReducer, initialAtelierState, isPanelVisible } from '@/lib/atelier/reducer'
import type {
  DrawerId,
  GalleryItem,
  GenerateResponse,
  GenerationParams,
  GenerationRequest,
} from '@/lib/types'

const DRAWER_TITLES: Record<DrawerId, string> = {
  history: 'Historique',
  recipes: 'Bibliothèque de recettes',
  enrich: 'Enrichissement du prompt',
  settings: 'Réglages',
}

const KEY_STORAGE: Record<string, string> = {
  'nano-banana-2': 'gemini_api_key',
  'gpt-image-2': 'openai_api_key',
}

export default function Home() {
  const [state, dispatch] = useReducer(atelierReducer, initialAtelierState)
  const [prompt, setPrompt] = useState('')
  const [negative, setNegative] = useState('')
  const [params, setParams] = useState<GenerationParams>(DEFAULT_PARAMS)
  const [recipe, setRecipe] = useState<RecipeState>(DEFAULT_RECIPE_STATE)
  const [items, setItems] = useState<GalleryItem[]>([])
  const [pending, setPending] = useState<PendingTile[]>([])

  const estimatedCost = estimateCost(state.adapterId, params.batch, DEFAULT_PRICING)

  function buildRequest(text: string): GenerationRequest {
    return {
      adapterId: state.adapterId,
      prompt: text,
      negative: negative.trim() || undefined,
      subjectImages: recipe.subjectImages.map(toReferenceImage),
      subjectWeight: recipe.subjectWeight,
      styleImages: recipe.styleImages.map(toReferenceImage),
      styleWeight: recipe.styleWeight,
      identityLock: recipe.identityLock,
      paletteTransfer: recipe.paletteTransfer,
      params,
    }
  }

  async function generate(fromPrompt: string, parentId: string | null = null) {
    const text = fromPrompt.trim()
    if (!text) return

    const tile: PendingTile = { id: crypto.randomUUID(), startedAt: Date.now() }
    setPending((previous) => [...previous, tile])
    dispatch({ type: 'setError', error: null })

    const headers: Record<string, string> = { 'Content-Type': 'application/json' }
    const key = window.localStorage.getItem(KEY_STORAGE[state.adapterId])
    if (key) headers['x-api-key'] = key

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers,
        body: JSON.stringify(buildRequest(text)),
      })

      const json: GenerateResponse = await response.json()
      if (!json.success || !json.data) throw new Error(json.error ?? 'Erreur inconnue')

      const latencyMs = Date.now() - tile.startedAt
      const created: GalleryItem[] = json.data.map((result) => ({
        id: crypto.randomUUID(),
        result,
        adapterId: state.adapterId,
        prompt: text,
        negative: negative.trim(),
        seed: params.seedLock ? params.seed : null,
        params,
        palette: null,
        parentId,
        recipeId: null,
        latencyMs,
        costEur: estimateCost(state.adapterId, 1, DEFAULT_PRICING),
        createdAt: new Date().toISOString(),
      }))

      setItems((previous) => [...created, ...previous])
      if (created[0]) dispatch({ type: 'select', id: created[0].id })
    } catch (error) {
      dispatch({
        type: 'setError',
        error: error instanceof Error ? error.message : 'Erreur inconnue',
      })
    } finally {
      setPending((previous) => previous.filter((entry) => entry.id !== tile.id))
    }
  }

  const counterLabel =
    items.length > 0
      ? `${items.length} variante${items.length > 1 ? 's' : ''} · session locale`
      : 'session locale'

  return (
    <div className="relative h-screen w-screen overflow-hidden">
      <div className="relative flex h-full gap-[10px] p-[10px]">
        <Rail
          mode={state.mode}
          openDrawer={state.openDrawer}
          usagePercent={0}
          usageEur={items.reduce((total, item) => total + item.costEur, 0)}
          onNewGeneration={() => dispatch({ type: 'closeDrawer' })}
          onToggleDrawer={(drawer) => dispatch({ type: 'toggleDrawer', drawer })}
          onCompare={() => dispatch({ type: 'setMode', mode: 'ab' })}
        />

        {state.openDrawer && (
          <Drawer
            title={DRAWER_TITLES[state.openDrawer]}
            onClose={() => dispatch({ type: 'closeDrawer' })}
          >
            <p className="text-[12.5px] text-meta">
              Contenu livré par un ticket dédié (T-0010 à T-0013).
            </p>
          </Drawer>
        )}

        <main className="flex min-w-canvas-min flex-1 flex-col gap-[13px] overflow-hidden rounded-panel border border-line bg-canvas/62 p-[10px] backdrop-blur-[28px]">
          <CanvasHeader
            sessionTitle="Session"
            counterLabel={counterLabel}
            mode={state.mode}
            adapterId={state.adapterId}
            onModeChange={(mode) => dispatch({ type: 'setMode', mode })}
            onToggleAdapter={() => dispatch({ type: 'toggleAdapter' })}
            onOpenCommandPalette={() => dispatch({ type: 'toggleCmd' })}
          />

          <div className="min-h-0 flex-1">
            {state.mode === 'explore' ? (
              <Explore
                items={items}
                pending={pending}
                selectedId={state.selectedId}
                onSelect={(id) => dispatch({ type: 'select', id })}
                onEnlarge={() => dispatch({ type: 'openViewer' })}
                onDecline={(item) => generate(item.prompt, item.id)}
              />
            ) : (
              <div className="flex h-full items-center justify-center rounded-rail border border-dashed border-dash text-[12.5px] text-meta">
                Mode livré par un ticket dédié (T-0013 à T-0015).
              </div>
            )}
          </div>

          {state.error && (
            <ErrorBanner
              message={state.error}
              onRetry={() => generate(prompt)}
              onDismiss={() => dispatch({ type: 'setError', error: null })}
            />
          )}

          <Composer
            prompt={prompt}
            negative={negative}
            onPromptChange={setPrompt}
            onNegativeChange={setNegative}
            presetName={null}
            aspectRatio={params.aspectRatio}
            batch={params.batch}
            estimatedCost={estimatedCost}
            hasEnrichKey={false}
            onEnrich={() => dispatch({ type: 'toggleDrawer', drawer: 'enrich' })}
            onSubmit={() => generate(prompt)}
          />
        </main>

        {isPanelVisible(state) && (
          <SettingsPanel
            tab={state.panelTab}
            onTabChange={(tab) => dispatch({ type: 'setPanelTab', tab })}
            onReset={() => {
              setParams(DEFAULT_PARAMS)
              setRecipe(DEFAULT_RECIPE_STATE)
            }}
            keysSummary="ce navigateur"
          >
            {state.panelTab === 'recipe' ? (
              <RecipeTab
                adapterId={state.adapterId}
                params={params}
                onParamsChange={setParams}
                recipe={recipe}
                onRecipeChange={setRecipe}
                openSections={state.openSections}
                onToggleSection={(section) => dispatch({ type: 'toggleSection', section })}
                activeRecipeName={null}
              />
            ) : (
              <JsonTab request={buildRequest(prompt || '…')} />
            )}
          </SettingsPanel>
        )}
      </div>
    </div>
  )
}
