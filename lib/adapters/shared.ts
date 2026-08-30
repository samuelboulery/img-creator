import type { ExtraParam, GenerationParams } from '@/lib/types'

/**
 * Fusionne le négatif saisi et celui du preset, puis déduplique : aucun des
 * deux modèles n'a de champ négatif, tout finit dans le texte du prompt.
 */
export function mergeNegatives(negative?: string, recipeNegative?: string): string {
  const seen = new Map<string, string>()

  for (const source of [negative, recipeNegative]) {
    for (const term of (source ?? '').split(',')) {
      const trimmed = term.trim()
      if (!trimmed) continue
      const key = trimmed.toLocaleLowerCase()
      if (!seen.has(key)) seen.set(key, trimmed)
    }
  }

  return [...seen.values()].join(', ')
}

/** Graine effective : celle du champ si elle est verrouillée, sinon un tirage. */
export function resolveSeed(params: GenerationParams): number {
  if (params.seedLock && params.seed !== null) return params.seed
  return Math.floor(1_000_000 + Math.random() * 9_000_000)
}

/**
 * Compose le texte envoyé : prompt, suffixe du preset, puis le négatif fusionné.
 * `connector` change avec la langue — c'est le seul effet de ce réglage.
 */
export function composePrompt(
  prompt: string,
  promptSuffix: string | undefined,
  negative: string,
  connector: string
): string {
  const head = [prompt.trim(), promptSuffix?.trim()].filter(Boolean).join(', ')
  return negative ? `${head}. ${connector} ${negative}` : head
}

/**
 * Champs structurants du corps amont : ils décident du modèle appelé, du
 * nombre d'images produites et de la politique de modération. `extraParams`
 * est une soupape pour les champs que l'interface ne connaît pas encore — pas
 * un moyen de réécrire la requête. Sans cette liste, toute validation faite en
 * amont (`lib/adapters/validate.ts`) serait contournable depuis le client.
 */
const RESERVED = new Set([
  'model',
  'contents',
  'config',
  'prompt',
  'n',
  'candidateCount',
  'image',
  'quality',
  'size',
  'moderation',
  'background',
  'output_format',
  'output_compression',
])

/** Clés qui réassignent un prototype plutôt qu'une propriété. */
const POISONED = new Set(['__proto__', 'constructor', 'prototype'])

const MAX_EXTRAS = 20

/**
 * Les paramètres bruts sont fusionnés en dernier : c'est la soupape quand un
 * modèle ouvre un champ que l'interface ne connaît pas encore. Les champs
 * structurants en sont exclus — voir `RESERVED`.
 */
export function mergeExtraParams<T extends object>(payload: T, extraParams: ExtraParam[]): T {
  // Un `extraParams` non tabulaire ferait itérer `for…of` sur une chaîne, puis
  // planter en déstructuration : la route répondrait 500 au lieu de 400.
  if (!Array.isArray(extraParams)) return payload

  const extras: Record<string, unknown> = {}

  for (const entry of extraParams.slice(0, MAX_EXTRAS)) {
    if (typeof entry?.key !== 'string' || typeof entry?.value !== 'string') continue

    const name = entry.key.trim()
    if (!name || RESERVED.has(name) || POISONED.has(name)) continue

    try {
      extras[name] = JSON.parse(entry.value)
    } catch {
      extras[name] = entry.value
    }
  }

  return { ...payload, ...extras }
}
