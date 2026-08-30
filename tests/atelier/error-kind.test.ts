import { describe, expect, test } from 'vitest'
import { atelierReducer, initialAtelierState } from '@/lib/atelier/reducer'

describe('reducer — nature de l’erreur', () => {
  test('une erreur de clé retient son genre', () => {
    const state = atelierReducer(initialAtelierState, {
      type: 'setError',
      error: 'Clé API invalide ou manquante',
      kind: 'missing-key',
    })

    expect(state.error).toBe('Clé API invalide ou manquante')
    expect(state.errorKind).toBe('missing-key')
  })

  test('sans genre précisé, une erreur est générique', () => {
    const state = atelierReducer(initialAtelierState, {
      type: 'setError',
      error: 'boom',
    })

    expect(state.errorKind).toBe('generic')
  })

  test('effacer l’erreur efface son genre — pas de bandeau fantôme', () => {
    const avec = atelierReducer(initialAtelierState, {
      type: 'setError',
      error: 'Clé API invalide ou manquante',
      kind: 'missing-key',
    })
    const sans = atelierReducer(avec, { type: 'setError', error: null })

    expect(sans.error).toBeNull()
    expect(sans.errorKind).toBeNull()
  })
})
