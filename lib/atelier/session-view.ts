import type { AdapterId, FailedRun, GalleryItem } from '@/lib/types'

/** Une entrée de la bande : une image, un échec, ou le filet entre deux générations. */
export type StripEntry =
  | { kind: 'item'; id: string; item: GalleryItem }
  | { kind: 'failure'; id: string; failure: FailedRun }
  | { kind: 'separator'; id: string }

/** Ce que la sélection désigne réellement — les ids disparus sont ignorés. */
export type Resolved =
  | { kind: 'item'; id: string; item: GalleryItem }
  | { kind: 'failure'; id: string; failure: FailedRun }

/**
 * Images et échecs, du plus récent au plus ancien. Les images d'une même
 * génération partagent leur date de création : un filet sépare deux dates.
 */
export function stripEntries(items: GalleryItem[], failures: FailedRun[]): StripEntry[] {
  const merged: Resolved[] = [
    ...items.map((item) => ({ kind: 'item' as const, id: item.id, item })),
    ...failures.map((failure) => ({ kind: 'failure' as const, id: failure.id, failure })),
  ].sort((a, b) => createdAt(b).localeCompare(createdAt(a)))

  const out: StripEntry[] = []
  let previous: string | null = null
  for (const entry of merged) {
    const date = createdAt(entry)
    if (previous !== null && date !== previous) out.push({ kind: 'separator', id: `sep-${entry.id}` })
    out.push(entry)
    previous = date
  }
  return out
}

function createdAt(entry: Resolved): string {
  return entry.kind === 'item' ? entry.item.createdAt : entry.failure.createdAt
}

export function resolveSelection(
  ids: string[],
  items: GalleryItem[],
  failures: FailedRun[]
): Resolved[] {
  const byId = new Map<string, Resolved>([
    ...items.map((item) => [item.id, { kind: 'item' as const, id: item.id, item }] as const),
    ...failures.map((failure) => [failure.id, { kind: 'failure' as const, id: failure.id, failure }] as const),
  ])
  return ids.map((id) => byId.get(id)).filter((entry): entry is Resolved => !!entry)
}

/** Durée habituelle d'un modèle dans cette session, en secondes — ou null s'il n'a rien produit. */
export function usualSeconds(items: GalleryItem[], adapterId: AdapterId): number | null {
  const times = items.filter((item) => item.adapterId === adapterId).map((item) => item.latencyMs)
  if (times.length === 0) return null
  return Math.round(times.reduce((total, ms) => total + ms, 0) / times.length / 1000)
}

/** Rang d'une image parmi les variantes de sa génération (même date, même prompt). */
export function variantOf(item: GalleryItem, items: GalleryItem[]): { index: number; count: number } {
  const siblings = items.filter(
    (entry) => entry.createdAt === item.createdAt && entry.prompt === item.prompt
  )
  return { index: siblings.indexOf(item) + 1, count: siblings.length }
}
