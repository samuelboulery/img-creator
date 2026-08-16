import { estimateCost } from './cost'
import { extractPalette } from './palette'
import { DEFAULT_PARAMS } from './params'
import { makeThumbnail } from './thumbnail'
import type { AdapterId, GalleryItem } from '@/lib/types'

/**
 * Session de démonstration : de vraies photos, pour voir comment l'atelier se
 * comporte à plusieurs dizaines d'images sans brûler de crédits d'API.
 *
 * ponytail: les images viennent du réseau au moment du clic — picsum.photos
 * sert des photos Unsplash, libres d'usage — via `/api/seed-image`, la CSP
 * interdisant tout `connect-src` hors origine. Vendoriser des fixtures dans le
 * dépôt si la commande doit marcher hors ligne ou en CI.
 */
const SOURCE = '/api/seed-image'

const PROMPTS = [
  'un vase en céramique mate sur un socle de béton, lumière rasante',
  'portrait au 85 mm, fenêtre nord, arrière-plan gris chaud',
  'nature morte de fruits, contre-jour, ombres longues',
  'architecture brutaliste au petit matin, brume basse',
  'atelier de menuiserie, poussière dans un rai de lumière',
  'paysage de dunes, heure dorée, grain argentique',
]

const ADAPTERS: AdapterId[] = ['nano-banana-2', 'gpt-image-2']

async function fetchAsBase64(url: string): Promise<{ base64: string; mimeType: string } | null> {
  try {
    const response = await fetch(url)
    if (!response.ok) return null

    const blob = await response.blob()
    const dataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(String(reader.result))
      reader.onerror = () => reject(reader.error)
      reader.readAsDataURL(blob)
    })

    return { base64: dataUrl.split(',')[1] ?? '', mimeType: blob.type || 'image/jpeg' }
  } catch {
    return null
  }
}

/**
 * Renvoie `count` items prêts à être posés dans la session, du plus récent au
 * plus ancien. Un tiers d'entre eux dérive d'un autre item, pour que
 * l'arborescence de l'historique ait quelque chose à montrer.
 */
export async function seedSession(count = 24): Promise<GalleryItem[]> {
  const loaded = await Promise.all(
    Array.from({ length: count }, (_, index) => fetchAsBase64(`${SOURCE}?i=${index}`))
  )

  const items: GalleryItem[] = []

  for (const [index, image] of loaded.entries()) {
    if (!image) continue

    const dataUrl = `data:${image.mimeType};base64,${image.base64}`
    const [palette, thumb] = await Promise.all([
      extractPalette(dataUrl),
      makeThumbnail(dataUrl),
    ])

    const adapterId = ADAPTERS[index % ADAPTERS.length]
    const parent = index % 3 === 2 ? items[items.length - 1] : null

    items.push({
      id: crypto.randomUUID(),
      result: { imageBase64: image.base64, mimeType: image.mimeType },
      adapterId,
      prompt: PROMPTS[index % PROMPTS.length],
      negative: index % 4 === 0 ? 'flou, texte, watermark' : '',
      seed: index % 2 === 0 ? 1000 + index : null,
      params: DEFAULT_PARAMS,
      palette,
      thumb,
      parentId: parent?.id ?? null,
      recipeId: null,
      latencyMs: 1800 + index * 90,
      costEur: estimateCost(adapterId, 1),
      createdAt: new Date(Date.parse('2026-08-16T09:00:00.000Z') + index * 60_000).toISOString(),
    })
  }

  // La session est rangée du plus récent au plus ancien.
  return items.reverse()
}
