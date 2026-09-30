import { shortId } from './diff'
import { hasFullImage } from './session-store'
import type { GalleryItem } from '@/lib/types'

export type ExportFormat = 'original' | 'png' | 'jpeg'

const EXTENSIONS: Record<string, string> = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp' }

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
  download(base64ToBlob(item.result.imageBase64, item.result.mimeType), exportFileName(item, 0, 'original'))
}

/** `obskura-03-gen_ab12.jpg` : l'ordre de la sélection, puis l'identifiant court. */
export function exportFileName(item: GalleryItem, index: number, format: ExportFormat): string {
  const mime = format === 'original' ? item.result.mimeType : `image/${format}`
  const extension = EXTENSIONS[mime] ?? 'png'
  return `obskura-${String(index + 1).padStart(2, '0')}-${shortId(item)}.${extension}`
}

/** De quoi refaire chaque image. Un aperçu seul y figure, sans fichier. */
export function exportManifest(items: GalleryItem[], format: ExportFormat) {
  return {
    version: 1,
    images: items.map((item, index) => ({
      file: hasFullImage(item) ? exportFileName(item, index, format) : null,
      model: item.adapterId,
      prompt: item.prompt,
      negative: item.negative,
      seed: item.seed,
      params: item.params,
      createdAt: item.createdAt,
    })),
  }
}

async function convert(item: GalleryItem, format: 'png' | 'jpeg'): Promise<Blob> {
  const source = base64ToBlob(item.result.imageBase64, item.result.mimeType)
  if (item.result.mimeType === `image/${format}`) return source

  const bitmap = await createImageBitmap(source)
  const canvas = document.createElement('canvas')
  canvas.width = bitmap.width
  canvas.height = bitmap.height
  const context = canvas.getContext('2d')
  if (!context) throw new Error('Canvas 2D indisponible')
  // Le JPEG n'a pas de transparence : fond blanc plutôt que noir.
  if (format === 'jpeg') {
    context.fillStyle = '#fff'
    context.fillRect(0, 0, canvas.width, canvas.height)
  }
  context.drawImage(bitmap, 0, 0)
  bitmap.close()

  return new Promise((resolve, reject) =>
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error('Conversion impossible'))), `image/${format}`, 0.92)
  )
}

/**
 * Un fichier par image, plus le manifeste si demandé.
 *
 * ponytail: pas de zip, donc un fichier par image. Ajouter une dépendance de
 * compression seulement si le nombre de fichiers devient gênant.
 */
export async function exportImages(items: GalleryItem[], format: ExportFormat, withSettings: boolean) {
  for (const [index, item] of items.entries()) {
    if (!hasFullImage(item)) continue
    const blob =
      format === 'original' ? base64ToBlob(item.result.imageBase64, item.result.mimeType) : await convert(item, format)
    download(blob, exportFileName(item, index, format))
  }
  if (withSettings) downloadJson(JSON.stringify(exportManifest(items, format), null, 2), 'obskura-reglages.json')
}
