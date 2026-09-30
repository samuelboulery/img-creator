import { describe, expect, test } from 'vitest'
import { exportFileName, exportManifest } from '@/lib/atelier/export'
import { DEFAULT_PARAMS } from '@/lib/atelier/params'
import type { GalleryItem } from '@/lib/types'

function item(id: string, mimeType = 'image/png'): GalleryItem {
  return {
    id,
    result: { imageBase64: 'AAAA', mimeType },
    adapterId: 'nano-banana-2',
    prompt: `prompt ${id}`,
    negative: '',
    seed: 7,
    params: DEFAULT_PARAMS,
    palette: null,
    thumb: null,
    parentId: null,
    recipeId: null,
    latencyMs: 0,
    costEur: 0.04,
    createdAt: '2026-09-30T10:00:00Z',
  }
}

describe('export', () => {
  test('les noms se rangent dans l’ordre et gardent l’extension du format choisi', () => {
    const a = item('1111-aaaa', 'image/webp')
    expect(exportFileName(a, 0, 'original')).toBe('obskura-01-gen_1111.webp')
    expect(exportFileName(a, 11, 'jpeg')).toBe('obskura-12-gen_1111.jpg')
    expect(exportFileName(a, 2, 'png')).toBe('obskura-03-gen_1111.png')
  })

  test('le manifeste nomme chaque fichier et garde de quoi refaire l’image', () => {
    const manifest = exportManifest([item('aaaa'), item('bbbb')], 'png')
    expect(manifest.images.map((entry) => entry.file)).toEqual([
      'obskura-01-gen_aaaa.png',
      'obskura-02-gen_bbbb.png',
    ])
    expect(manifest.images[0]).toMatchObject({ model: 'nano-banana-2', prompt: 'prompt aaaa', seed: 7 })
  })

  test('un aperçu seul figure au manifeste sans fichier', () => {
    const preview = { ...item('cccc'), result: { imageBase64: '', mimeType: 'image/png' } }
    expect(exportManifest([preview], 'original').images[0].file).toBeNull()
  })
})
