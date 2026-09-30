import { ALL_PARAMS, PARAM_LABELS, type PayloadParam } from '@/lib/adapters/capabilities'
import type { GalleryItem, GenerationParams } from '@/lib/types'

export type DiffKind = 'same' | 'added' | 'removed'

export interface DiffToken {
  text: string
  kind: DiffKind
}

/**
 * Différence mot à mot entre deux prompts (plus longue sous-séquence commune).
 * Assez fin pour lire un écart de prompt, assez court pour rester lisible.
 */
export function diffPrompt(previous: string, next: string): DiffToken[] {
  const before = previous.split(/\s+/).filter(Boolean)
  const after = next.split(/\s+/).filter(Boolean)

  // Table des longueurs de LCS.
  const lengths: number[][] = Array.from({ length: before.length + 1 }, () =>
    new Array<number>(after.length + 1).fill(0)
  )

  for (let i = before.length - 1; i >= 0; i--) {
    for (let j = after.length - 1; j >= 0; j--) {
      lengths[i][j] =
        before[i] === after[j]
          ? lengths[i + 1][j + 1] + 1
          : Math.max(lengths[i + 1][j], lengths[i][j + 1])
    }
  }

  const tokens: DiffToken[] = []
  let i = 0
  let j = 0

  const push = (text: string, kind: DiffKind) => {
    const last = tokens[tokens.length - 1]
    if (last && last.kind === kind) last.text += ` ${text}`
    else tokens.push({ text, kind })
  }

  while (i < before.length && j < after.length) {
    if (before[i] === after[j]) {
      push(before[i], 'same')
      i++
      j++
    } else if (lengths[i + 1][j] >= lengths[i][j + 1]) {
      push(before[i], 'removed')
      i++
    } else {
      push(after[j], 'added')
      j++
    }
  }

  while (i < before.length) push(before[i++], 'removed')
  while (j < after.length) push(after[j++], 'added')

  return tokens
}

export interface ParamDelta {
  label: string
  from: string
  to: string
}

/**
 * Tous les réglages sauf les paramètres bruts, qui n'ont pas de valeur
 * scalaire à comparer. Dérivé de `ALL_PARAMS` : ajouter un réglage le rend
 * comparable sans qu'on ait à y penser.
 */
const COMPARED: readonly PayloadParam[] = ALL_PARAMS.filter((param) => param !== 'extraParams')

function show(value: unknown): string {
  if (value === null) return 'aléatoire'
  if (typeof value === 'boolean') return value ? 'oui' : 'non'
  return String(value)
}

/** Réglages qui ont changé entre deux générations. */
export function diffParams(
  previous: GenerationParams,
  next: GenerationParams
): ParamDelta[] {
  return COMPARED.filter((key) => previous[key] !== next[key]).map((key) => ({
    label: PARAM_LABELS[key],
    from: show(previous[key]),
    to: show(next[key]),
  }))
}

export type PairKey = PayloadParam | 'model' | 'prompt'

export interface PairDelta {
  key: PairKey
  left: string
  right: string
}

/**
 * Écarts entre deux images comparées. La graine est celle réellement envoyée
 * (`item.seed`), pas le réglage : deux tirages aléatoires diffèrent aussi.
 */
export function pairDifferences(a: GalleryItem, b: GalleryItem): { deltas: PairDelta[]; same: number } {
  const value = (item: GalleryItem, key: PairKey): string => {
    if (key === 'model') return item.adapterId
    if (key === 'prompt') return item.prompt
    if (key === 'seed') return item.seed === null ? '—' : String(item.seed)
    return show(item.params[key])
  }
  const keys: PairKey[] = ['model', 'prompt', ...COMPARED]
  const deltas = keys
    .map((key) => ({ key, left: value(a, key), right: value(b, key) }))
    .filter((delta) => delta.left !== delta.right)
  return { deltas, same: keys.length - deltas.length }
}

export interface LineageNode {
  item: GalleryItem
  depth: number
}

/** Profondeur d'un item dans l'arborescence de la session. */
export function lineageDepth(item: GalleryItem, items: GalleryItem[]): number {
  const byId = new Map(items.map((entry) => [entry.id, entry]))
  let depth = 0
  let current = item

  while (current.parentId) {
    const parent = byId.get(current.parentId)
    if (!parent) break
    depth++
    current = parent
    if (depth > 24) break // garde-fou contre un cycle dans une session corrompue
  }

  return depth
}

/** Ordre d'affichage de l'historique : les racines d'abord, enfants sous leur parent. */
export function buildLineage(items: GalleryItem[]): LineageNode[] {
  const chronological = [...items].sort((a, b) => a.createdAt.localeCompare(b.createdAt))
  const childrenOf = new Map<string | null, GalleryItem[]>()

  for (const item of chronological) {
    const key = item.parentId
    childrenOf.set(key, [...(childrenOf.get(key) ?? []), item])
  }

  const known = new Set(chronological.map((item) => item.id))
  const nodes: LineageNode[] = []

  function walk(parentId: string | null, depth: number) {
    for (const item of childrenOf.get(parentId) ?? []) {
      nodes.push({ item, depth })
      walk(item.id, depth + 1)
    }
  }

  walk(null, 0)

  // Un parent absent (session tronquée) : l'enfant remonte à la racine.
  for (const item of chronological) {
    if (item.parentId && !known.has(item.parentId)) nodes.push({ item, depth: 0 })
  }

  return nodes
}

export function shortId(item: GalleryItem): string {
  return `gen_${item.id.replace(/-/g, '').slice(0, 4)}`
}
