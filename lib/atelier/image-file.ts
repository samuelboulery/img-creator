import type { ReferenceImage } from '@/lib/types'

/** Image de référence côté client : garde son aperçu, qui n'est jamais envoyé. */
export interface ImageState extends ReferenceImage {
  id: string
  preview: string
}

export function readImageFile(file: File): Promise<ImageState> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string
      const [header, base64] = dataUrl.split(',')
      const mimeType = header.match(/:(.*?);/)?.[1] ?? 'image/jpeg'
      resolve({ id: crypto.randomUUID(), base64, mimeType, preview: dataUrl })
    }
    reader.onerror = () => reject(new Error(`Lecture impossible : ${file.name}`))
    reader.readAsDataURL(file)
  })
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
