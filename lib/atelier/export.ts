import { shortId } from './diff'
import type { GalleryItem } from '@/lib/types'

function download(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}

function base64ToBlob(base64: string, mimeType: string): Blob {
  const binary = atob(base64)
  const bytes = new Uint8Array(binary.length)
  for (let index = 0; index < binary.length; index++) bytes[index] = binary.charCodeAt(index)
  return new Blob([bytes], { type: mimeType })
}

export function downloadJson(content: string, filename: string) {
  download(new Blob([content], { type: 'application/json' }), filename)
}

export function downloadImage(item: GalleryItem) {
  const extension = item.result.mimeType.split('/')[1] ?? 'png'
  download(base64ToBlob(item.result.imageBase64, item.result.mimeType), `${shortId(item)}.${extension}`)
}

/**
 * Exporte la planche : une image par fichier, plus un `.json` qui garde les
 * recettes — prompt, négatif, modèle, graine et réglages de chaque visuel.
 *
 * ponytail: pas de zip, donc un fichier par image. Ajouter une dépendance de
 * compression seulement si le nombre de fichiers devient gênant.
 */
export function exportSheet(items: GalleryItem[]) {
  for (const item of items) downloadImage(item)

  const recipes = items.map((item) => ({
    id: shortId(item),
    model: item.adapterId,
    prompt: item.prompt,
    negative: item.negative,
    seed: item.seed,
    params: item.params,
    costEur: item.costEur,
    createdAt: item.createdAt,
  }))

  download(
    new Blob([JSON.stringify({ version: 1, recipes }, null, 2)], { type: 'application/json' }),
    'planche-recettes.json'
  )
}
