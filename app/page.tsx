'use client'

import { useEffect, useRef } from 'react'
import {
  BookmarkSimpleIcon,
  BroomIcon,
  ClockCounterClockwiseIcon,
  KeyIcon,
  SparkleIcon,
} from '@phosphor-icons/react/dist/ssr'
import Composer from '@/components/atelier/Composer'
import Drawer from '@/components/atelier/Drawer'
import Strip from '@/components/atelier/Strip'
import TopBar from '@/components/atelier/TopBar'
import { InspectorHeader } from '@/components/atelier/inspector/ImageInspector'
import FailureInspector from '@/components/atelier/inspector/FailureInspector'
import ImageInspector from '@/components/atelier/inspector/ImageInspector'
import SettingsInspector from '@/components/atelier/inspector/SettingsInspector'
import HistoryDrawer from '@/components/atelier/drawers/HistoryDrawer'
import RecipesDrawer from '@/components/atelier/drawers/RecipesDrawer'
import SettingsDrawer from '@/components/atelier/drawers/SettingsDrawer'
import CommandPalette, { type Command } from '@/components/atelier/overlays/CommandPalette'
import Stage from '@/components/atelier/stage/Stage'
import { useShortcuts } from '@/components/atelier/use-shortcuts'
import { Button } from '@/components/atelier/ui'
import { resolveSelection } from '@/lib/atelier/session-view'
import { useAtelier, type Atelier } from '@/lib/atelier/use-atelier'
import { I18nProvider, useT } from '@/lib/i18n'

export default function Home() {
  const atelier = useAtelier()
  const { prefs } = atelier

  // Le script de layout.tsx a posé thème et langue avant la première peinture.
  useEffect(() => {
    document.documentElement.dataset.theme = prefs.theme
    document.documentElement.lang = prefs.lang
  }, [prefs.theme, prefs.lang])

  return (
    <I18nProvider lang={prefs.lang}>
      <Workspace atelier={atelier} />
    </I18nProvider>
  )
}

function Workspace({ atelier }: { atelier: Atelier }) {
  const { state, dispatch, prefs } = atelier
  const promptRef = useRef<HTMLTextAreaElement>(null)
  useShortcuts(atelier, promptRef)

  return (
    <div className="flex h-dvh flex-col overflow-hidden">
      <TopBar
        overlay={state.overlay}
        onOverlay={(overlay) => dispatch({ type: 'toggleOverlay', overlay })}
        theme={prefs.theme}
        onTheme={() => atelier.setPrefs({ ...prefs, theme: prefs.theme === 'dark' ? 'light' : 'dark' })}
        lang={prefs.lang}
        onLang={() => atelier.setPrefs({ ...prefs, lang: prefs.lang === 'fr' ? 'en' : 'fr' })}
        sheetOpen={state.sheetOpen}
        onSheet={() => dispatch({ type: 'toggleSheet' })}
      />

      <div className="relative grid min-h-0 flex-1 grid-cols-[88px_minmax(0,1fr)_288px] gap-4 p-4 max-[1100px]:grid-cols-[88px_minmax(0,1fr)]">
        <Strip
          items={atelier.items}
          failures={atelier.failures}
          pending={atelier.pending}
          selectedIds={state.selectedIds}
          onSelect={(id, additive) => dispatch({ type: 'select', id, additive })}
          onNewSession={() => atelier.removeItems([...atelier.items, ...atelier.failures].map((entry) => entry.id))}
        />

        <main className="flex min-h-0 min-w-0 flex-col gap-4">
          <Stage atelier={atelier} />
          <Composer atelier={atelier} promptRef={promptRef} />
        </main>

        <Inspector atelier={atelier} />
      </div>

      <Overlays atelier={atelier} />
    </div>
  )
}

function Inspector({ atelier }: { atelier: Atelier }) {
  const t = useT()
  const { state, dispatch } = atelier
  const selected = resolveSelection(state.selectedIds, atelier.items, atelier.failures)

  let body: React.ReactNode
  if (selected.length === 0) {
    body = <SettingsInspector atelier={atelier} onOpenKeys={() => dispatch({ type: 'openOverlay', overlay: 'keys' })} />
  } else if (selected.length === 1) {
    const [entry] = selected
    body =
      entry.kind === 'item' ? (
        <ImageInspector item={entry.item} atelier={atelier} />
      ) : (
        <FailureInspector failure={entry.failure} atelier={atelier} />
      )
  } else {
    // ponytail: fiche multiple minimale — l'export et la comparaison arrivent au lot 5.
    body = (
      <>
        <InspectorHeader onBack={() => dispatch({ type: 'clearSelection' })} meta={t.multi.title(selected.length)} />
        <div className="p-2">
          <Button full variant="danger" onClick={() => atelier.removeItems(selected.map((entry) => entry.id))}>
            {t.multi.delete(selected.length)}
          </Button>
        </div>
      </>
    )
  }

  return (
    <aside
      aria-label={t.stage.inspector}
      className={`flex min-h-0 flex-col overflow-hidden rounded-xs border border-hairline bg-solid ${
        state.sheetOpen
          ? 'max-[1100px]:absolute max-[1100px]:inset-y-4 max-[1100px]:right-4 max-[1100px]:z-30 max-[1100px]:w-[288px]'
          : 'max-[1100px]:hidden'
      }`}
    >
      {body}
    </aside>
  )
}

// ponytail: tiroirs et palette de l'ancienne interface, gardés tels quels
// jusqu'au lot 6 qui les remplace par des dialogues.
function Overlays({ atelier }: { atelier: Atelier }) {
  const t = useT()
  const { state, dispatch, prefs } = atelier
  const close = () => dispatch({ type: 'closeOverlay' })

  const commands: Command[] = [
    { id: 'generate', label: t.composer.generate, icon: SparkleIcon, run: () => void atelier.generate() },
    { id: 'presets', label: t.top.presets, icon: BookmarkSimpleIcon, run: () => dispatch({ type: 'openOverlay', overlay: 'presets' }) },
    { id: 'history', label: t.palette.history, icon: ClockCounterClockwiseIcon, run: () => dispatch({ type: 'openOverlay', overlay: 'history' }) },
    { id: 'keys', label: t.palette.keysAndPrices, icon: KeyIcon, run: () => dispatch({ type: 'openOverlay', overlay: 'keys' }) },
    {
      id: 'new-session',
      label: t.palette.newSession,
      icon: BroomIcon,
      run: () => atelier.removeItems([...atelier.items, ...atelier.failures].map((entry) => entry.id)),
    },
  ]

  const drawer = (title: string, children: React.ReactNode) => (
    <div className="fixed inset-y-4 right-4 z-40 flex">
      <Drawer title={title} onClose={close}>
        {children}
      </Drawer>
    </div>
  )

  switch (state.overlay) {
    case 'palette':
      return <CommandPalette commands={commands} onClose={close} />
    case 'history':
      return drawer(
        t.history.title,
        <HistoryDrawer
          items={atelier.items}
          selectedId={state.selectedIds[0] ?? null}
          onSelect={(id) => dispatch({ type: 'select', id })}
        />
      )
    case 'presets':
      return drawer(
        t.presets.title,
        <RecipesDrawer
          recipes={atelier.recipes}
          activeRecipeId={atelier.activeRecipeId}
          onApply={atelier.applyRecipe}
          onSaveCurrent={atelier.saveCurrentRecipe}
          onImport={atelier.setRecipes}
          onDelete={atelier.deleteRecipe}
        />
      )
    case 'keys':
      return drawer(
        t.keys.title,
        <SettingsDrawer keys={atelier.keys} onKeyChange={atelier.setKey} prefs={prefs} onPrefsChange={atelier.setPrefs} />
      )
    default:
      return null
  }
}
