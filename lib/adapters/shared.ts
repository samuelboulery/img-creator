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
 * Les paramètres bruts sont fusionnés tels quels, en dernier : c'est la soupape
 * quand un modèle ouvre un champ que l'interface ne connaît pas encore.
 */
export function mergeExtraParams<T extends object>(payload: T, extraParams: ExtraParam[]): T {
  const extras: Record<string, unknown> = {}

  for (const { key, value } of extraParams) {
    const name = key.trim()
    if (!name) continue
    try {
      extras[name] = JSON.parse(value)
    } catch {
      extras[name] = value
    }
  }

  return { ...payload, ...extras }
}
