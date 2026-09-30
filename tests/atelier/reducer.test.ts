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

  test('choisir un modèle le pose, sans toucher au parallèle', () => {
    const state = reduce(
      initialAtelierState,
      { type: 'setParallel', adapterId: 'gpt-image-2' },
      { type: 'setAdapter', adapterId: 'gpt-image-2.5-flare' }
    )
    expect(state.adapterId).toBe('gpt-image-2.5-flare')
    expect(state.parallelId).toBe('gpt-image-2')
  })

  test('le modèle principal ne peut pas tourner en parallèle de lui-même', () => {
    const state = atelierReducer(initialAtelierState, {
      type: 'setParallel',
      adapterId: initialAtelierState.adapterId,
    })
    expect(state.parallelId).toBeNull()
  })

  test('choisir comme principal le modèle parallèle retire le parallèle', () => {
    const state = reduce(
      initialAtelierState,
      { type: 'setParallel', adapterId: 'gpt-image-2' },
      { type: 'setAdapter', adapterId: 'gpt-image-2' }
    )
    expect(state.adapterId).toBe('gpt-image-2')
    expect(state.parallelId).toBeNull()
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
})
