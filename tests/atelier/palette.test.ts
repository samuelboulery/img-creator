import { describe, expect, test } from 'vitest'
import { quantize } from '@/lib/atelier/palette'

function pixels(colors: [number, number, number][], alpha = 255): number[] {
  return colors.flatMap(([r, g, b]) => [r, g, b, alpha])
}

describe('quantize', () => {
  test('trie les teintes par population', () => {
    const palette = quantize(
      pixels([
        [200, 30, 30],
        [210, 40, 40],
        [190, 20, 20],
        [30, 200, 30],
        [30, 30, 200],
      ])
    )

    expect(palette).not.toBeNull()
    // Le rouge domine : il arrive en tête.
    expect(palette![0]).toMatch(/^#c/)
    expect(palette).toHaveLength(3)
  })

  test('écarte les pixels quasi neutres', () => {
    const palette = quantize(
      pixels([
        [128, 128, 128],
        [10, 10, 10],
        [240, 240, 240],
        [200, 30, 30],
      ])
    )

    expect(palette).not.toBeNull()
    expect(palette![0]).toMatch(/^#c8/)
  })

  test('une image entièrement neutre ne donne pas de palette', () => {
    expect(quantize(pixels([[128, 128, 128], [64, 64, 64]]))).toBeNull()
  })

  test('les pixels transparents sont ignorés', () => {
    expect(quantize(pixels([[200, 30, 30]], 10))).toBeNull()
  })

  test('complète à trois couleurs quand une seule teinte est présente', () => {
    const palette = quantize(pixels([[200, 30, 30], [205, 35, 35]]))
    expect(palette).toHaveLength(3)
    expect(palette![1]).toBe(palette![0])
  })
})
