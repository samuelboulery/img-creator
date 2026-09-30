import type { Command } from './overlays/CommandPalette'
import { ADAPTERS, MODELS } from '@/lib/adapters/capabilities'
import { exportImages } from '@/lib/atelier/export'
import { resolveSelection } from '@/lib/atelier/session-view'
import type { Atelier } from '@/lib/atelier/use-atelier'
import type { Dict } from '@/lib/i18n/fr'

/** Tout ce que ⌘K sait faire, dans l'état courant. */
export function buildCommands(atelier: Atelier, t: Dict): Command[] {
  const { state, dispatch, prefs } = atelier
  const p = t.palette
  const images = resolveSelection(state.selectedIds, atelier.items, atelier.failures).flatMap((entry) =>
    entry.kind === 'item' ? [entry.item] : []
  )
  const open = (overlay: 'history' | 'keys' | 'shortcuts' | 'clear') => () => dispatch({ type: 'openOverlay', overlay })

  const actions: Command[] = [
    { id: 'generate', group: p.actions, label: t.composer.generate, keys: ['mod', '↵'], run: () => void atelier.generate() },
    ...(images.length > 0
      ? [{ id: 'export', group: p.actions, label: p.exportSelection, keys: ['mod', 'E'], run: () => void exportImages(images, 'original', true) }]
      : []),
    ...(images.length === 1
      ? [{ id: 'vary', group: p.actions, label: p.varySelected, keys: ['V'], run: () => void atelier.vary(images[0]) }]
      : []),
    { id: 'history', group: p.actions, label: p.history, run: open('history') },
    { id: 'keys', group: p.actions, label: p.keysAndPrices, run: open('keys') },
    { id: 'shortcuts', group: p.actions, label: p.shortcuts, keys: ['?'], run: open('shortcuts') },
    { id: 'new-session', group: p.actions, label: p.newSession, run: open('clear') },
  ]

  const models: Command[] = ADAPTERS.map((id) => ({
    id: `model-${id}`,
    group: p.models,
    label: MODELS[id].name,
    hint: id === state.adapterId ? p.current : undefined,
    run: () => atelier.selectModel(id),
  }))

  const presets: Command[] = atelier.recipes.map((recipe) => ({
    id: `preset-${recipe.id}`,
    group: p.presets,
    label: recipe.name,
    hint: recipe.id === atelier.activeRecipeId ? p.current : undefined,
    run: () => atelier.applyRecipe(recipe),
  }))

  const preferences: Command[] = [
    {
      id: 'theme',
      group: p.preferences,
      label: prefs.theme === 'dark' ? p.lightTheme : p.darkTheme,
      run: () => atelier.setPrefs({ ...prefs, theme: prefs.theme === 'dark' ? 'light' : 'dark' }),
    },
    {
      id: 'lang',
      group: p.preferences,
      label: t.top.switchLanguage,
      run: () => atelier.setPrefs({ ...prefs, lang: prefs.lang === 'fr' ? 'en' : 'fr' }),
    },
  ]

  return [...actions, ...models, ...presets, ...preferences]
}
