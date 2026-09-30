import { describe, expect, test } from 'vitest'
import { en } from '@/lib/i18n/en'
import { fr } from '@/lib/i18n/fr'

type Tree = Record<string, unknown>

/** Chemins de toutes les feuilles, avec leur nature (chaîne ou fonction). */
function leaves(tree: Tree, prefix = ''): Map<string, string> {
  const out = new Map<string, string>()
  for (const [key, value] of Object.entries(tree)) {
    const path = prefix ? `${prefix}.${key}` : key
    if (value && typeof value === 'object') {
      for (const [p, kind] of leaves(value as Tree, path)) out.set(p, kind)
    } else {
      out.set(path, typeof value)
    }
  }
  return out
}

describe('dictionnaires', () => {
  test('l’anglais reprend chaque clé du français, avec la même nature', () => {
    expect([...leaves(en)].sort()).toEqual([...leaves(fr)].sort())
  })

  test('aucun libellé vide', () => {
    for (const dict of [fr, en]) {
      for (const [path, kind] of leaves(dict)) {
        if (kind !== 'string') continue
        const value = path.split('.').reduce<unknown>((node, key) => (node as Tree)[key], dict)
        expect(value, path).not.toBe('')
      }
    }
  })

  test('les pluriels suivent le nombre', () => {
    expect(fr.common.images(1)).toBe('1 image')
    expect(fr.common.images(3)).toBe('3 images')
    expect(en.multi.download(1)).toBe('Download 1 image')
  })

  test('les montants suivent la langue', () => {
    expect(fr.eur(0.12)).toBe('0,12 €')
    expect(en.eur(0.12)).toBe('€0.12')
  })
})
