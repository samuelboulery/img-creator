'use client'

import AmbientBackground from '@/components/atelier/AmbientBackground'
import CanvasHeader from '@/components/atelier/CanvasHeader'
import Composer from '@/components/atelier/Composer'
import Drawer from '@/components/atelier/Drawer'
import ErrorBanner from '@/components/atelier/ErrorBanner'
import Rail from '@/components/atelier/Rail'
import RecipesDrawer from '@/components/atelier/drawers/RecipesDrawer'
import HistoryDrawer from '@/components/atelier/drawers/HistoryDrawer'
import SettingsDrawer from '@/components/atelier/drawers/SettingsDrawer'
import Compare from '@/components/atelier/modes/Compare'
import Explore from '@/components/atelier/modes/Explore'
import Iterate from '@/components/atelier/modes/Iterate'
import Produce from '@/components/atelier/modes/Produce'
import JsonTab from '@/components/atelier/panel/JsonTab'
import RecipeTab from '@/components/atelier/panel/RecipeTab'
import SettingsPanel from '@/components/atelier/panel/SettingsPanel'
import { exportSheet } from '@/lib/atelier/export'
import { isPanelVisible } from '@/lib/atelier/reducer'
import { STORAGE_KEYS, writeJson } from '@/lib/atelier/storage'
import { useAtelier } from '@/lib/atelier/use-atelier'
import type { DrawerId } from '@/lib/types'

const DRAWER_TITLES: Record<DrawerId, string> = {
  history: 'Historique',
  recipes: 'Bibliothèque de recettes',
  enrich: 'Enrichissement du prompt',
  settings: 'Réglages',
}

export default function Home() {
  const atelier = useAtelier()
  const { state, dispatch, items, prefs } = atelier

  const counterLabel =
    items.length > 0
      ? `${items.length} variante${items.length > 1 ? 's' : ''} · session locale`
      : 'session locale'

  return (
    <div className="relative h-screen w-screen overflow-hidden">
      <AmbientBackground
        layers={items
          .filter((item) => item.palette)
          .map((item) => ({ id: item.id, palette: item.palette! }))}
        selectedId={state.selectedId}
        enabled={prefs.ambientEnabled}
      />

      <div className="relative flex h-full gap-[10px] p-[10px]">
        <Rail
          mode={state.mode}
          openDrawer={state.openDrawer}
          usagePercent={0}
          usageEur={items.reduce((total, item) => total + item.costEur, 0)}
          onNewGeneration={() => dispatch({ type: 'closeDrawer' })}
          onToggleDrawer={(drawer) => dispatch({ type: 'toggleDrawer', drawer })}
          onCompare={() => {
            dispatch({ type: 'setMode', mode: 'ab' })
            dispatch({ type: 'closeDrawer' })
          }}
        />

        {state.openDrawer && (
          <Drawer
            title={DRAWER_TITLES[state.openDrawer]}
            onClose={() => dispatch({ type: 'closeDrawer' })}
          >
            {state.openDrawer === 'settings' ? (
              <SettingsDrawer
                keys={atelier.keys}
                onKeyChange={atelier.setKey}
                prefs={prefs}
                onPrefsChange={atelier.setPrefs}
                onReviewOnboarding={() => writeJson(STORAGE_KEYS.onboarded, false)}
              />
            ) : state.openDrawer === 'recipes' ? (
              <RecipesDrawer
                recipes={atelier.recipes}
                activeRecipeId={atelier.activeRecipeId}
                onApply={atelier.applyRecipe}
                onSaveCurrent={atelier.saveCurrentRecipe}
                onImport={atelier.setRecipes}
              />
            ) : state.openDrawer === 'history' ? (
              <HistoryDrawer
                items={items}
                selectedId={state.selectedId}
                onSelect={(id) => dispatch({ type: 'select', id })}
              />
            ) : (
              <p className="text-[12.5px] text-meta">
                Contenu livré par le ticket T-0018.
              </p>
            )}
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
                pending={atelier.pending}
                selectedId={state.selectedId}
                onSelect={(id) => dispatch({ type: 'select', id })}
                onEnlarge={() => dispatch({ type: 'openViewer' })}
                onDecline={(item) =>
                  void atelier.generate(item.prompt, { parentId: item.id })
                }
              />
            ) : state.mode === 'iterate' ? (
              <Iterate
                items={items}
                selectedId={state.selectedId}
                onSelect={(id) => dispatch({ type: 'select', id })}
              />
            ) : state.mode === 'produce' ? (
              <Produce
                items={items}
                selection={state.sheetSelection}
                onToggle={(id) => dispatch({ type: 'toggleSheet', id })}
                onSelectAll={() =>
                  dispatch({
                    type: 'selectSheet',
                    ids: items.slice(0, 8).map((item) => item.id),
                  })
                }
                onExport={() =>
                  exportSheet(items.filter((item) => state.sheetSelection.includes(item.id)))
                }
              />
            ) : (
              <Compare
                ab={atelier.ab}
                onKeep={(item) => {
                  dispatch({ type: 'setAdapter', adapterId: item.adapterId })
                  dispatch({ type: 'select', id: item.id })
                  dispatch({ type: 'setMode', mode: 'explore' })
                }}
                onDecline={(item) =>
                  void atelier.generate(item.prompt, {
                    parentId: item.id,
                    adapterId: item.adapterId,
                  })
                }
                onRerun={() => void atelier.compare(atelier.prompt)}
              />
            )}
          </div>

          {state.error && (
            <ErrorBanner
              message={state.error}
              onRetry={() => void atelier.generate(atelier.prompt)}
              onDismiss={() => dispatch({ type: 'setError', error: null })}
            />
          )}

          <Composer
            prompt={atelier.prompt}
            negative={atelier.negative}
            onPromptChange={atelier.setPrompt}
            onNegativeChange={atelier.setNegative}
            presetName={atelier.activeRecipe?.name ?? null}
            aspectRatio={atelier.params.aspectRatio}
            batch={atelier.params.batch}
            estimatedCost={atelier.estimatedCost}
            hasEnrichKey={atelier.keys.text.trim().length > 0}
            onEnrich={() => dispatch({ type: 'toggleDrawer', drawer: 'enrich' })}
            onSubmit={() =>
              state.mode === 'ab'
                ? void atelier.compare(atelier.prompt)
                : void atelier.generate(atelier.prompt)
            }
          />
        </main>

        {isPanelVisible(state) && (
          <SettingsPanel
            tab={state.panelTab}
            onTabChange={(tab) => dispatch({ type: 'setPanelTab', tab })}
            onReset={atelier.resetParams}
            keysSummary={`image ×${atelier.imageKeyCount} · texte ×${
              atelier.keys.text ? 1 : 0
            } · ce navigateur`}
          >
            {state.panelTab === 'recipe' ? (
              <RecipeTab
                adapterId={state.adapterId}
                params={atelier.params}
                onParamsChange={atelier.setParams}
                recipe={atelier.recipe}
                onRecipeChange={atelier.setRecipe}
                openSections={state.openSections}
                onToggleSection={(section) => dispatch({ type: 'toggleSection', section })}
                activeRecipeName={atelier.activeRecipe?.name ?? null}
              />
            ) : (
              <JsonTab request={atelier.buildRequest(atelier.prompt || '…')} />
            )}
          </SettingsPanel>
        )}
      </div>
    </div>
  )
}
