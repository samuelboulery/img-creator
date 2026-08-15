'use client'

import { useReducer, useState } from 'react'
import CanvasHeader from '@/components/atelier/CanvasHeader'
import Composer from '@/components/atelier/Composer'
import Drawer from '@/components/atelier/Drawer'
import ErrorBanner from '@/components/atelier/ErrorBanner'
import Rail from '@/components/atelier/Rail'
import Explore, { type PendingTile } from '@/components/atelier/modes/Explore'
import SettingsPanel from '@/components/atelier/panel/SettingsPanel'
import { DEFAULT_PRICING, estimateCost } from '@/lib/atelier/cost'
import {
  atelierReducer,
  initialAtelierState,
  isPanelVisible,
} from '@/lib/atelier/reducer'
import type { DrawerId, GalleryItem, GenerateResponse, PromptParams } from '@/lib/types'

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
  const [aspectRatio, setAspectRatio] =
    useState<NonNullable<PromptParams['aspectRatio']>>('1:1')
  const [batch] = useState(1)
  const [items, setItems] = useState<GalleryItem[]>([])
  const [pending, setPending] = useState<PendingTile[]>([])

  const estimatedCost = estimateCost(state.adapterId, batch, DEFAULT_PRICING)

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
        body: JSON.stringify({
          positiveText: text,
          negativeText: negative.trim() || undefined,
          aspectRatio,
          adapterId: state.adapterId,
        } satisfies PromptParams),
      })

      const json: GenerateResponse = await response.json()
      if (!json.success || !json.data) throw new Error(json.error ?? 'Erreur inconnue')

      const item: GalleryItem = {
        id: crypto.randomUUID(),
        result: json.data,
        adapterId: state.adapterId,
        prompt: text,
        negative: negative.trim(),
        seed: null,
        aspectRatio,
        palette: null,
        parentId,
        recipeId: null,
        latencyMs: Date.now() - tile.startedAt,
        costEur: estimateCost(state.adapterId, 1, DEFAULT_PRICING),
        createdAt: new Date().toISOString(),
      }

      setItems((previous) => [item, ...previous])
      dispatch({ type: 'select', id: item.id })
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
            aspectRatio={aspectRatio}
            batch={batch}
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
            onReset={() => setAspectRatio('1:1')}
            keysSummary="ce navigateur"
          >
            <p className="text-[12.5px] text-meta">
              Réglages livrés par les tickets T-0007 et T-0009.
            </p>
          </SettingsPanel>
        )}
      </div>
    </div>
  )
}
