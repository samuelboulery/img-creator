'use client'

import { useEffect, useMemo } from 'react'
import {
  Books,
  Broom,
  ClockCounterClockwise,
  FileArrowDown,
  GitBranch,
  GridFour,
  Images,
  SlidersHorizontal,
  Sparkle,
  SquareSplitHorizontal,
  Swap,
  WarningCircle,
} from '@phosphor-icons/react/dist/ssr'
import CanvasHeader from '@/components/atelier/CanvasHeader'
import Composer from '@/components/atelier/Composer'
import Drawer from '@/components/atelier/Drawer'
import ErrorBanner from '@/components/atelier/ErrorBanner'
import Rail from '@/components/atelier/Rail'
import RecipesDrawer from '@/components/atelier/drawers/RecipesDrawer'
import EnrichDrawer from '@/components/atelier/drawers/EnrichDrawer'
import HistoryDrawer from '@/components/atelier/drawers/HistoryDrawer'
import SettingsDrawer from '@/components/atelier/drawers/SettingsDrawer'
import Compare from '@/components/atelier/modes/Compare'
import Explore from '@/components/atelier/modes/Explore'
import Iterate from '@/components/atelier/modes/Iterate'
import Produce from '@/components/atelier/modes/Produce'
import CommandPalette, { type Command } from '@/components/atelier/overlays/CommandPalette'
import Onboarding from '@/components/atelier/overlays/Onboarding'
import Viewer from '@/components/atelier/overlays/Viewer'
import SettingsInspector from '@/components/atelier/inspector/SettingsInspector'
import { ADAPTERS } from '@/lib/adapters/capabilities'
import { downloadImage, downloadJson, exportSheet } from '@/lib/atelier/export'
import { createRecipe, serializeRecipes } from '@/lib/atelier/recipes'
import { seedSession } from '@/lib/atelier/seed'
import { toReferenceImage } from '@/lib/atelier/image-file'
import { isPanelVisible } from '@/lib/atelier/reducer'
import { useAtelier } from '@/lib/atelier/use-atelier'
import { I18nProvider } from '@/lib/i18n'
import type { AdapterId, DrawerId } from '@/lib/types'

const DRAWER_TITLES: Record<DrawerId, string> = {
  history: 'Historique',
  recipes: 'Bibliothèque de recettes',
  enrich: 'Enrichissement du prompt',
  settings: 'Clés & préférences',
}

// ponytail: cycle provisoire du bouton de l'en-tête, remplacé par le menu Modèle au lot 4.
function nextAdapter(current: AdapterId): AdapterId {
  return ADAPTERS[(ADAPTERS.indexOf(current) + 1) % ADAPTERS.length]
}

export default function Home() {
  const atelier = useAtelier()
  const { state, dispatch, items, prefs } = atelier

  // Thème et langue suivent les préférences ; le script de layout.tsx a déjà
  // posé la bonne valeur avant la première peinture.
  useEffect(() => {
    document.documentElement.dataset.theme = prefs.theme
    document.documentElement.lang = prefs.lang
  }, [prefs.theme, prefs.lang])

  // ⌘K ouvre la palette, Échap referme ce qui est au-dessus.
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key.toLowerCase() === 'k' && (event.metaKey || event.ctrlKey)) {
        event.preventDefault()
        dispatch({ type: 'toggleCmd' })
      }
      if (event.key === 'Escape') dispatch({ type: 'closeOverlays' })
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [dispatch])

  const commands: Command[] = useMemo(
    () => [
      {
        id: 'generate',
        label: 'Générer maintenant',
        shortcut: '⏎',
        icon: Sparkle,
        run: () => void atelier.generate(atelier.prompt),
      },
      {
        id: 'swap-model',
        label: 'Changer de modèle',
        shortcut: 'M',
        icon: Swap,
        run: () => atelier.selectModel(nextAdapter(state.adapterId)),
      },
      {
        id: 'compare',
        label: 'Comparer les deux modèles',
        shortcut: 'A/B',
        icon: SquareSplitHorizontal,
        run: () => dispatch({ type: 'setMode', mode: 'ab' }),
      },
      {
        id: 'iterate',
        label: 'Passer en mode Itérer',
        icon: GitBranch,
        run: () => dispatch({ type: 'setMode', mode: 'iterate' }),
      },
      {
        id: 'produce',
        label: 'Passer en mode Produire',
        icon: GridFour,
        run: () => dispatch({ type: 'setMode', mode: 'produce' }),
      },
      {
        id: 'library',
        label: 'Ouvrir la bibliothèque',
        icon: Books,
        run: () => dispatch({ type: 'toggleDrawer', drawer: 'recipes' }),
      },
      {
        id: 'history',
        label: "Ouvrir l'historique",
        icon: ClockCounterClockwise,
        run: () => dispatch({ type: 'toggleDrawer', drawer: 'history' }),
      },
      {
        id: 'settings',
        label: 'Clés & préférences',
        icon: SlidersHorizontal,
        run: () => dispatch({ type: 'toggleDrawer', drawer: 'settings' }),
      },
      {
        id: 'export-recipe',
        label: 'Exporter la recette en .json',
        icon: FileArrowDown,
        run: () =>
          downloadJson(
            serializeRecipes([
              createRecipe({
                id: crypto.randomUUID(),
                name: atelier.activeRecipe?.name ?? 'recette courante',
                subjectImages: atelier.recipe.subjectImages.map(toReferenceImage),
                subjectWeight: atelier.recipe.subjectWeight,
                styleImages: atelier.recipe.styleImages.map(toReferenceImage),
                styleWeight: atelier.recipe.styleWeight,
                identityLock: atelier.recipe.identityLock,
                paletteTransfer: atelier.recipe.paletteTransfer,
                promptSuffix: atelier.promptSuffix,
                negative: atelier.negative,
                params: atelier.params,
              }),
            ]),
            'recette.json'
          ),
      },
      {
        id: 'clear',
        label: 'Vider la session',
        icon: Broom,
        run: () => {
          atelier.setItems([])
          dispatch({ type: 'select', id: null })
          dispatch({ type: 'selectSheet', ids: [] })
        },
      },
      {
        id: 'seed-session',
        label: '(dev) Charger 24 images de démo',
        icon: Images,
        run: () => {
          void seedSession().then((seeded) => {
            atelier.setItems(seeded)
            dispatch({ type: 'select', id: seeded[0]?.id ?? null })
          })
        },
      },
      {
        id: 'simulate-error',
        label: "(dev) Simuler un échec d'API",
        icon: WarningCircle,
        run: () =>
          dispatch({
            type: 'setError',
            error:
              'gpt-image-2 a renvoyé 429 — quota de ta clé OpenAI atteint. Les réglages sont conservés.',
          }),
      },
    ],
    [atelier, dispatch, state.adapterId]
  )

  const needsOnboarding = atelier.onboarding

  // Le plafond de stockage se dit à voix haute : sans ça, l'utilisateur croit
  // que toute la session revient après un rechargement.
  const { kept, fullCount } = atelier.persisted
  const storageLabel =
    kept < items.length
      ? `${kept} gardée${kept > 1 ? 's' : ''} · ${fullCount} en pleine déf`
      : fullCount < kept
        ? `${fullCount}/${kept} en pleine déf`
        : 'session locale'

  const counterLabel =
    items.length > 0
      ? `${items.length} variante${items.length > 1 ? 's' : ''} · ${storageLabel}`
      : 'session locale'

  return (
    <I18nProvider lang={prefs.lang}>
    <div className="relative h-screen w-screen overflow-hidden">

      <div className="relative flex h-full gap-[10px] p-[10px]">
        <Rail
          openDrawer={state.openDrawer}
          usagePercent={0}
          usageEur={items.reduce((total, item) => total + item.costEur, 0)}
          onToggleDrawer={(drawer) => dispatch({ type: 'toggleDrawer', drawer })}
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
                onReviewOnboarding={atelier.reviewOnboarding}
              />
            ) : state.openDrawer === 'recipes' ? (
              <RecipesDrawer
                recipes={atelier.recipes}
                activeRecipeId={atelier.activeRecipeId}
                onApply={atelier.applyRecipe}
                onSaveCurrent={atelier.saveCurrentRecipe}
                onImport={atelier.setRecipes}
                onDelete={(id) =>
                  atelier.setRecipes(atelier.recipes.filter((entry) => entry.id !== id))
                }
              />
            ) : state.openDrawer === 'history' ? (
              <HistoryDrawer
                items={items}
                selectedId={state.selectedId}
                onSelect={(id) => dispatch({ type: 'select', id })}
              />
            ) : (
              <EnrichDrawer
                apiKey={atelier.keys.text}
                onKeyChange={(value) => atelier.setKey('text', value)}
                prePrompt={prefs.enrichPrePrompt}
                onPrePromptChange={(value) =>
                  atelier.setPrefs({ ...prefs, enrichPrePrompt: value })
                }
                prompt={atelier.prompt}
                onUseEnriched={(value) => atelier.setPrompt(value)}
              />
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
            onToggleAdapter={() => atelier.selectModel(nextAdapter(state.adapterId))}
            onOpenCommandPalette={() => dispatch({ type: 'toggleCmd' })}
            onTogglePanel={() => dispatch({ type: 'togglePanel' })}
            panelOpen={state.panelOpen}
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
                onExit={() => dispatch({ type: 'setMode', mode: 'explore' })}
              />
            )}
          </div>

          {state.error && (
            <ErrorBanner
              message={state.error}
              kind={state.errorKind}
              onRetry={() => void atelier.generate(atelier.prompt)}
              onOpenSettings={() => {
                dispatch({ type: 'setError', error: null })
                dispatch({ type: 'toggleDrawer', drawer: 'settings' })
              }}
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
          <aside
            aria-label="Réglages"
            className={`w-[288px] shrink-0 flex-col overflow-hidden rounded-xs border border-hairline bg-solid ${
              state.panelOpen
                ? 'flex max-[1100px]:absolute max-[1100px]:inset-y-[10px] max-[1100px]:right-[10px] max-[1100px]:z-30'
                : 'flex max-[1100px]:hidden'
            }`}
          >
            <SettingsInspector
              atelier={atelier}
              onOpenKeys={() => dispatch({ type: 'toggleDrawer', drawer: 'settings' })}
            />
          </aside>
        )}
        {state.cmdOpen && (
          <CommandPalette
            commands={commands}
            onClose={() => dispatch({ type: 'closeOverlays' })}
          />
        )}

        {needsOnboarding && (
          <Onboarding
            keys={atelier.keys}
            onKeyChange={atelier.setKey}
            onEnter={atelier.finishOnboarding}
          />
        )}

        {state.viewerOpen && (
          <Viewer
            items={items}
            selectedId={state.selectedId}
            recipeName={atelier.activeRecipe?.name ?? null}
            onSelect={(id) => dispatch({ type: 'select', id })}
            onClose={() => dispatch({ type: 'closeViewer' })}
            onReusePrompt={(item) => {
              atelier.setPrompt(item.prompt)
              atelier.setNegative(item.negative)
              dispatch({ type: 'closeViewer' })
            }}
            onDecline={(item) => void atelier.generate(item.prompt, { parentId: item.id })}
            onDownload={downloadImage}
          />
        )}
      </div>
    </div>
    </I18nProvider>
  )
}
