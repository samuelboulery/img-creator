import type { ReferenceImage } from '@/lib/types'

/** Image de référence côté client : garde son aperçu, qui n'est jamais envoyé. */
export interface ImageState extends ReferenceImage {
  id: string
  preview: string
}

const MAX_DIMENSION = 2048

// ponytail: JPEG 0.85 pour tout — qualité suffisante pour des références IA,
// PNG préservé seulement si déjà sous la limite max après resize.
async function compressToJpeg(file: File): Promise<{ base64: string; mimeType: string; preview: string }> {
  const bitmap = await createImageBitmap(file)
  const scale = Math.min(1, MAX_DIMENSION / Math.max(bitmap.width, bitmap.height))
  const w = Math.round(bitmap.width * scale)
  const h = Math.round(bitmap.height * scale)

  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  canvas.getContext('2d')!.drawImage(bitmap, 0, 0, w, h)
  bitmap.close()

  const dataUrl = canvas.toDataURL('image/jpeg', 0.85)
  const [, base64] = dataUrl.split(',')
  return { base64, mimeType: 'image/jpeg', preview: dataUrl }
}

export async function readImageFile(file: File): Promise<ImageState> {
  const { base64, mimeType, preview } = await compressToJpeg(file)
  return { id: crypto.randomUUID(), base64, mimeType, preview }
}

export function toReferenceImage({ base64, mimeType }: ImageState): ReferenceImage {
  return { base64, mimeType }
}

/** Reconstruit l'aperçu d'une référence venue d'une recette enregistrée. */
export function toImageState(image: ReferenceImage): ImageState {
  return {
    ...image,
    id: crypto.randomUUID(),
    preview: `data:${image.mimeType};base64,${image.base64}`,
  }
}
