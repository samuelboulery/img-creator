import { describe, expect, test } from 'vitest'
import { hasFullImage, imageSrc, packSession, thumbSrc } from '@/lib/atelier/session-store'
import { DEFAULT_PARAMS } from '@/lib/atelier/params'
import type { GalleryItem } from '@/lib/types'

/** Une image de `weight` caractères, plus un aperçu cent fois plus léger. */
function item(id: string, weight: number, withThumb = true): GalleryItem {
  return {
    id,
    result: { imageBase64: 'x'.repeat(weight), mimeType: 'image/png' },
    adapterId: 'nano-banana-2',
    prompt: 'p',
    negative: '',
    seed: null,
    params: DEFAULT_PARAMS,
    palette: null,
    thumb: withThumb ? `data:image/jpeg;base64,${'t'.repeat(Math.round(weight / 100))}` : null,
    parentId: null,
    recipeId: null,
    latencyMs: 0,
    costEur: 0,
    createdAt: '2026-08-16T10:00:00.000Z',
  }
}

describe('packSession', () => {
  test('sous le budget, tout est gardé en pleine résolution', () => {
    const items = [item('a', 1_000), item('b', 1_000), item('c', 1_000)]
    const packed = packSession(items, 5_000_000)

    expect(packed.items).toHaveLength(3)
    expect(packed.fullCount).toBe(3)
    expect(packed.items.every(hasFullImage)).toBe(true)
  })

  test('budget serré : toute la session reste visible, seules les récentes gardent leur image', () => {
    const items = Array.from({ length: 20 }, (_, index) => item(`i${index}`, 100_000))
    const packed = packSession(items, 1_000_000)

    expect(packed.items).toHaveLength(20)
    expect(packed.fullCount).toBeGreaterThan(0)
    expect(packed.fullCount).toBeLessThan(20)
    // Les pleines résolutions sont les plus récentes, en tête et sans trou.
    expect(packed.items.slice(0, packed.fullCount).every(hasFullImage)).toBe(true)
    expect(packed.items.slice(packed.fullCount).some(hasFullImage)).toBe(false)
  })

  test('budget minuscule : le nombre d’items baisse, les aperçus restent intacts', () => {
    const items = Array.from({ length: 20 }, (_, index) => item(`i${index}`, 100_000))
    const packed = packSession(items, 40_000)

    expect(packed.items.length).toBeGreaterThan(0)
    expect(packed.items.length).toBeLessThan(20)
    expect(packed.items.every((entry) => entry.thumb !== null)).toBe(true)
  })

  test('un item sans aperçu ne fait pas dérailler le calcul', () => {
    const packed = packSession([item('a', 50_000, false), item('b', 50_000)], 200_000)

    expect(packed.items).toHaveLength(2)
    expect(packed.items[0].thumb).toBeNull()
  })

  test('budget nul : rien n’est gardé', () => {
    expect(packSession([item('a', 1_000)], 0).items).toHaveLength(0)
  })
})

describe('sources d’affichage', () => {
  test('imageSrc préfère la pleine résolution, thumbSrc préfère l’aperçu', () => {
    const full = item('a', 1_000)

    expect(imageSrc(full)).toMatch(/^data:image\/png;base64,/)
    expect(thumbSrc(full)).toMatch(/^data:image\/jpeg;base64,/)
  })

  test('un item en aperçu seul retombe sur sa vignette', () => {
    const preview: GalleryItem = {
      ...item('a', 1_000),
      result: { imageBase64: '', mimeType: 'image/png' },
    }

    expect(hasFullImage(preview)).toBe(false)
    expect(imageSrc(preview)).toBe(preview.thumb)
  })

  test('sans image ni vignette, aucune source : jamais un src vide qui recharge la page', () => {
    const empty: GalleryItem = {
      ...item('a', 1_000),
      thumb: null,
      result: { imageBase64: '', mimeType: 'image/png' },
    }

    expect(imageSrc(empty)).toBeUndefined()
    expect(thumbSrc(empty)).toBeUndefined()
  })
})
