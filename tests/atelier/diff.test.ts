import { describe, expect, test } from 'vitest'
import { buildLineage, diffParams, diffPrompt, lineageDepth, pairDifferences } from '@/lib/atelier/diff'
import { DEFAULT_PARAMS } from '@/lib/atelier/params'
import type { GalleryItem } from '@/lib/types'

function item(id: string, parentId: string | null, createdAt: string): GalleryItem {
  return {
    id,
    result: { imageBase64: '', mimeType: 'image/png' },
    adapterId: 'nano-banana-2',
    prompt: 'p',
    negative: '',
    seed: null,
    params: DEFAULT_PARAMS,
    palette: null,
    thumb: null,
    parentId,
    recipeId: null,
    latencyMs: 0,
    costEur: 0,
    createdAt,
  }
}

describe('diffPrompt', () => {
  test('marque ce qui est retiré et ce qui est ajouté', () => {
    const tokens = diffPrompt('un vase en céramique mate', 'un vase en céramique brillante')

    expect(tokens.find((token) => token.kind === 'removed')?.text).toBe('mate')
    expect(tokens.find((token) => token.kind === 'added')?.text).toBe('brillante')
    expect(tokens.find((token) => token.kind === 'same')?.text).toBe('un vase en céramique')
  })

  test('deux prompts identiques ne produisent que du texte inchangé', () => {
    expect(diffPrompt('un vase', 'un vase')).toEqual([{ text: 'un vase', kind: 'same' }])
  })
})

describe('diffParams', () => {
  test('ne liste que les réglages modifiés', () => {
    const deltas = diffParams(DEFAULT_PARAMS, { ...DEFAULT_PARAMS, resolution: '4K' })

    expect(deltas).toEqual([{ label: 'résolution', from: '2K', to: '4K' }])
  })

  test('une graine nulle s’affiche comme aléatoire', () => {
    const deltas = diffParams({ ...DEFAULT_PARAMS, seed: 4471902 }, DEFAULT_PARAMS)
    expect(deltas[0]).toEqual({ label: 'graine', from: '4471902', to: 'aléatoire' })
  })

  test('sans changement, la liste est vide', () => {
    expect(diffParams(DEFAULT_PARAMS, { ...DEFAULT_PARAMS })).toEqual([])
  })
})

describe('arborescence', () => {
  test('la profondeur suit la chaîne des parents', () => {
    const items = [
      item('a', null, '2026-08-15T10:00:00Z'),
      item('b', 'a', '2026-08-15T10:01:00Z'),
      item('c', 'b', '2026-08-15T10:02:00Z'),
    ]

    expect(lineageDepth(items[2], items)).toBe(2)
  })

  test('les enfants suivent leur parent dans l’ordre d’affichage', () => {
    const items = [
      item('c', 'a', '2026-08-15T10:02:00Z'),
      item('a', null, '2026-08-15T10:00:00Z'),
      item('b', null, '2026-08-15T10:01:00Z'),
    ]

    expect(buildLineage(items).map((node) => [node.item.id, node.depth])).toEqual([
      ['a', 0],
      ['c', 1],
      ['b', 0],
    ])
  })

  test('un parent absent ne fait pas disparaître l’enfant', () => {
    const items = [item('orphan', 'disparu', '2026-08-15T10:00:00Z')]
    expect(buildLineage(items).map((node) => node.item.id)).toEqual(['orphan'])
  })
})

describe('pairDifferences', () => {
  test('liste modèle, prompt et réglages qui diffèrent, et compte le reste', () => {
    const left = { ...item('a', null, '2026-09-30T10:00:00Z'), seed: 12 }
    const right = {
      ...item('b', null, '2026-09-30T10:00:00Z'),
      adapterId: 'gpt-image-2' as const,
      seed: 12,
      params: { ...DEFAULT_PARAMS, aspectRatio: '16:9' as const },
    }

    const { deltas, same } = pairDifferences(left, right)
    expect(deltas.map((delta) => delta.key)).toEqual(['model', 'aspectRatio'])
    expect(deltas[1]).toEqual({ key: 'aspectRatio', left: DEFAULT_PARAMS.aspectRatio, right: '16:9' })
    expect(same).toBeGreaterThan(0)
  })

  test('la graine comparée est celle réellement envoyée, pas le réglage', () => {
    const left = { ...item('a', null, 't'), seed: 1 }
    const right = { ...item('b', null, 't'), seed: 2 }
    expect(pairDifferences(left, right).deltas).toEqual([{ key: 'seed', left: '1', right: '2' }])
  })
})
