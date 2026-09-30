import { describe, expect, test } from 'vitest'
import { restoreItems, withoutIds } from '@/lib/atelier/undo'

const item = (id: string, createdAt: string) => ({ id, createdAt })

describe('annuler une suppression', () => {
  const session = [
    item('c', '2026-09-30T14:32:00Z'),
    item('b', '2026-09-30T14:18:00Z'),
    item('a', '2026-09-30T14:05:00Z'),
  ]

  test('retirer garde l’ordre du reste et rend ce qui part', () => {
    const { kept, removed } = withoutIds(session, ['b'])
    expect(kept.map((entry) => entry.id)).toEqual(['c', 'a'])
    expect(removed.map((entry) => entry.id)).toEqual(['b'])
  })

  test('restaurer rend la liste d’origine, dans le même ordre', () => {
    const { kept, removed } = withoutIds(session, ['c', 'a'])
    expect(restoreItems(kept, removed)).toEqual(session)
  })

  test('restaurer après une nouvelle arrivée la garde en tête', () => {
    const { kept, removed } = withoutIds(session, ['b'])
    const nouvelle = item('d', '2026-09-30T15:00:00Z')
    expect(restoreItems([nouvelle, ...kept], removed).map((entry) => entry.id)).toEqual([
      'd',
      'c',
      'b',
      'a',
    ])
  })

  test('restaurer n’introduit pas de doublon', () => {
    expect(restoreItems(session, [session[1]])).toEqual(session)
  })
})
