import type { GalleryItem } from '@/lib/types'

/**
 * Budget de la session en octets. Le quota localStorage tourne autour de 5 Mo
 * pour toute l'origine, et les recettes partagent la place : on garde de la marge.
 */
export const SESSION_BUDGET_BYTES = 3_500_000

export interface PackedSession {
  /** Du plus récent au plus ancien, comme `items`. */
  items: GalleryItem[]
  /** Combien, parmi eux, gardent leur image pleine résolution. */
  fullCount: number
}

/** localStorage stocke de l'UTF-16 : deux octets par caractère. */
function bytesOf(value: unknown): number {
  return JSON.stringify(value).length * 2
}

/** Une image pleine résolution absente donne un item « aperçu seul ». */
export function hasFullImage(item: GalleryItem): boolean {
  return item.result.imageBase64.length > 0
}

/** Source d'affichage grand format : pleine résolution, sinon l'aperçu. */
export function imageSrc(item: GalleryItem): string {
  if (hasFullImage(item)) return `data:${item.result.mimeType};base64,${item.result.imageBase64}`
  return item.thumb ?? ''
}

/** Source d'affichage en liste : l'aperçu d'abord, pour ne pas décoder le plein format. */
export function thumbSrc(item: GalleryItem): string {
  return item.thumb ?? imageSrc(item)
}

function stripImage(item: GalleryItem): GalleryItem {
  return { ...item, result: { ...item.result, imageBase64: '' } }
}

/**
 * Range la session dans le budget : les aperçus d'abord — ils sont légers et
 * suffisent à garder toute la session visible — puis les images pleine
 * résolution, de la plus récente à la plus ancienne, tant qu'il reste de la place.
 */
export function packSession(
  items: GalleryItem[],
  budget = SESSION_BUDGET_BYTES
): PackedSession {
  const stripped = items.map(stripImage)

  // 1. Combien d'items tiennent en version allégée. `2` = les crochets du tableau.
  let used = 2
  let kept = 0

  for (const item of stripped) {
    const size = bytesOf(item) + 2 // + la virgule séparatrice
    if (used + size > budget) break
    used += size
    kept += 1
  }

  const packed = stripped.slice(0, kept)

  // 2. On remet l'image entière tant que le reste du budget l'absorbe.
  let fullCount = 0

  for (let index = 0; index < packed.length; index += 1) {
    const original = items[index]
    if (!hasFullImage(original)) continue

    const extra = bytesOf(original) - bytesOf(packed[index])
    // ponytail: on s'arrête au premier refus au lieu de continuer à chercher une
    // image plus petite plus loin — les pleines résolutions gardées restent ainsi
    // les plus récentes, sans trou.
    if (used + extra > budget) break

    used += extra
    packed[index] = original
    fullCount += 1
  }

  return { items: packed, fullCount }
}
