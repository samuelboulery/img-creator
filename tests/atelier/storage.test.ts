import { beforeEach, describe, expect, test } from 'vitest'
import {
  DEFAULT_PREFS,
  readJson,
  readPrefs,
  readString,
  STORAGE_KEYS,
  writeJson,
  writeString,
} from '@/lib/atelier/storage'

beforeEach(() => {
  window.localStorage.clear()
})

describe('storage', () => {
  test('relit ce qui a été écrit', () => {
    writeJson('imgc.test', { a: 1 })
    expect(readJson('imgc.test', null)).toEqual({ a: 1 })
  })

  test('une entrée absente rend la valeur par défaut', () => {
    expect(readJson('imgc.absent', { fallback: true })).toEqual({ fallback: true })
  })

  test('une entrée corrompue rend la valeur par défaut sans lever', () => {
    window.localStorage.setItem('imgc.broken', '{ ceci n’est pas du JSON')
    expect(readJson('imgc.broken', { fallback: true })).toEqual({ fallback: true })
  })

  test('écrire une chaîne vide supprime la clé — pas de clé fantôme', () => {
    writeString(STORAGE_KEYS.textKey, 'sk-test')
    expect(readString(STORAGE_KEYS.textKey)).toBe('sk-test')

    writeString(STORAGE_KEYS.textKey, '')
    expect(readString(STORAGE_KEYS.textKey)).toBe('')
    expect(window.localStorage.getItem(STORAGE_KEYS.textKey)).toBeNull()
  })

  test('les préférences partielles sont complétées par les valeurs par défaut', () => {
    writeJson(STORAGE_KEYS.prefs, { ambientEnabled: false })
    const prefs = readPrefs()

    expect(prefs.ambientEnabled).toBe(false)
    expect(prefs.pricing).toEqual(DEFAULT_PREFS.pricing)
    expect(prefs.enrichPrePrompt).toBe(DEFAULT_PREFS.enrichPrePrompt)
  })
})
