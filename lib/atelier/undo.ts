interface Dated {
  id: string
  createdAt: string
}

/** Sépare ce qui reste de ce qui part, sans toucher à l'ordre. */
export function withoutIds<T extends Dated>(items: T[], ids: string[]): { kept: T[]; removed: T[] } {
  const gone = new Set(ids)
  return {
    kept: items.filter((item) => !gone.has(item.id)),
    removed: items.filter((item) => gone.has(item.id)),
  }
}

/**
 * Remet des items retirés à leur place : la session est rangée de la plus
 * récente à la plus ancienne, et une image arrivée entre-temps reste en tête.
 */
export function restoreItems<T extends Dated>(current: T[], removed: T[]): T[] {
  const present = new Set(current.map((item) => item.id))
  return [...current, ...removed.filter((item) => !present.has(item.id))].sort((a, b) =>
    b.createdAt.localeCompare(a.createdAt)
  )
}
