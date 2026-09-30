import { describe, expect, test } from 'vitest'
import {
  atelierReducer,
  initialAtelierState,
  isPanelVisible,
  type AtelierState,
} from '@/lib/atelier/reducer'

function reduce(state: AtelierState, ...actions: Parameters<typeof atelierReducer>[1][]) {
  return actions.reduce(atelierReducer, state)
}

describe('atelierReducer', () => {
  test('un bouton de rail déjà actif referme son tiroir', () => {
    const opened = reduce(initialAtelierState, { type: 'toggleDrawer', drawer: 'history' })
    expect(opened.openDrawer).toBe('history')

    const closed = atelierReducer(opened, { type: 'toggleDrawer', drawer: 'history' })
    expect(closed.openDrawer).toBeNull()
  })

  test('ouvrir un autre tiroir remplace le précédent', () => {
    const state = reduce(
      initialAtelierState,
      { type: 'toggleDrawer', drawer: 'history' },
      { type: 'toggleDrawer', drawer: 'recipes' }
    )
    expect(state.openDrawer).toBe('recipes')
  })

  test('le panneau de paramètres se replie tant qu’un tiroir est ouvert', () => {
    expect(isPanelVisible(initialAtelierState)).toBe(true)

    const withDrawer = atelierReducer(initialAtelierState, {
      type: 'toggleDrawer',
      drawer: 'settings',
    })
    expect(isPanelVisible(withDrawer)).toBe(false)
  })

  test('la bascule de modèle cycle sur les quatre adapters', () => {
    const s1 = atelierReducer(initialAtelierState, { type: 'toggleAdapter' })
    expect(s1.adapterId).toBe('gpt-image-2')

    const s2 = atelierReducer(s1, { type: 'toggleAdapter' })
    expect(s2.adapterId).toBe('gpt-image-2.5-sunburst')

    const s3 = atelierReducer(s2, { type: 'toggleAdapter' })
    expect(s3.adapterId).toBe('gpt-image-2.5-flare')

    const s4 = atelierReducer(s3, { type: 'toggleAdapter' })
    expect(s4.adapterId).toBe('nano-banana-2')
  })

  test('closeOverlays ferme le plein écran et la palette sans toucher au reste', () => {
    const state = reduce(
      initialAtelierState,
      { type: 'toggleDrawer', drawer: 'recipes' },
      { type: 'openViewer' },
      { type: 'toggleCmd' },
      { type: 'closeOverlays' }
    )

    expect(state.viewerOpen).toBe(false)
    expect(state.cmdOpen).toBe(false)
    expect(state.openDrawer).toBe('recipes')
  })

  test('les sections se replient indépendamment, sans muter l’état initial', () => {
    const state = atelierReducer(initialAtelierState, {
      type: 'toggleSection',
      section: 'render',
    })

    expect(state.openSections.render).toBe(true)
    expect(initialAtelierState.openSections.render).toBe(false)
    expect(state.openSections.references).toBe(true)
  })
})
