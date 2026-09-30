import { describe, expect, test } from 'vitest'
import { resolveSelection, stripEntries, usualSeconds, variantOf } from '@/lib/atelier/session-view'
import { DEFAULT_PARAMS } from '@/lib/atelier/params'
import type { FailedRun, GalleryItem } from '@/lib/types'

function item(id: string, createdAt: string, extra: Partial<GalleryItem> = {}): GalleryItem {
  return {
    id,
    result: { imageBase64: 'AAAA', mimeType: 'image/png' },
    adapterId: 'nano-banana-2',
    prompt: 'un phare',
    negative: '',
    seed: null,
    params: DEFAULT_PARAMS,
    palette: null,
    thumb: null,
    parentId: null,
    recipeId: null,
    latencyMs: 20_000,
    costEur: 0.03,
    createdAt,
    ...extra,
  }
}

const failure: FailedRun = {
  id: 'f',
  adapterId: 'gpt-image-2',
  prompt: 'un phare',
  message: 'Demande refusée par la modération du modèle',
  kind: 'safety',
  createdAt: '2026-09-30T14:40:00Z',
}

describe('bande de session', () => {
  const items = [
    item('b1', '2026-09-30T14:32:00Z'),
    item('b0', '2026-09-30T14:32:00Z'),
    item('a0', '2026-09-30T14:05:00Z'),
  ]

  test('échecs et images, du plus récent au plus ancien, un filet entre deux générations', () => {
    const entries = stripEntries(items, [failure])
    expect(entries.map((entry) => (entry.kind === 'separator' ? '|' : entry.id))).toEqual([
      'f',
      '|',
      'b1',
      'b0',
      '|',
      'a0',
    ])
  })

  test('une session vide ne produit rien', () => {
    expect(stripEntries([], [])).toEqual([])
  })
})

describe('durée habituelle', () => {
  test('moyenne arrondie des générations du même modèle', () => {
    const items = [
      item('x', '2026-09-30T14:00:00Z', { latencyMs: 20_000 }),
      item('y', '2026-09-30T14:01:00Z', { latencyMs: 24_000 }),
      item('z', '2026-09-30T14:02:00Z', { adapterId: 'gpt-image-2', latencyMs: 90_000 }),
    ]
    expect(usualSeconds(items, 'nano-banana-2')).toBe(22)
    expect(usualSeconds(items, 'gpt-image-2.5-flare')).toBeNull()
  })
})

describe('origine', () => {
  test('rang d’une variante dans sa génération', () => {
    const items = [
      item('b1', '2026-09-30T14:32:00Z'),
      item('b0', '2026-09-30T14:32:00Z'),
      item('a0', '2026-09-30T14:05:00Z'),
    ]
    expect(variantOf(items[0], items)).toEqual({ index: 1, count: 2 })
    expect(variantOf(items[1], items)).toEqual({ index: 2, count: 2 })
    expect(variantOf(items[2], items)).toEqual({ index: 1, count: 1 })
  })
})

describe('sélection résolue', () => {
  test('les ids disparus sont ignorés', () => {
    const items = [item('a', '2026-09-30T14:05:00Z')]
    const view = resolveSelection(['a', 'fantome'], items, [failure])
    expect(view.map((entry) => entry.id)).toEqual(['a'])
  })

  test('un échec se résout aussi', () => {
    expect(resolveSelection(['f'], [], [failure])[0]).toMatchObject({ kind: 'failure' })
  })
})
