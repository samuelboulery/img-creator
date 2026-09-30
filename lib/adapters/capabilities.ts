import type { AdapterId, GenerationParams } from '@/lib/types'

/** Réglages susceptibles de partir dans un corps de requête. */
export type PayloadParam = Exclude<keyof GenerationParams, 'seedLock'>

/**
 * Source unique de la liste des adapters. `AdapterId` en dérive, si bien
 * qu'ajouter un modèle ici force le compilateur à signaler chaque endroit qui
 * doit suivre.
 */
export const ADAPTERS = [
  'nano-banana-2',
  'gpt-image-2',
  'gpt-image-2.5-sunburst',
  'gpt-image-2.5-flare',
] as const

export const ALL_PARAMS: readonly PayloadParam[] = [
  'aspectRatio',
  'resolution',
  'batch',
  'seed',
  'fileFormat',
  'transparent',
  'compression',
  'guidance',
  'steps',
  'sampler',
  'personGeneration',
  'moderation',
  'language',
  'extraParams',
]

/**
 * Ce que chaque modèle sait faire. Source unique : elle décide à la fois de
 * l'élagage du payload (via `pruneUnsupported`, appelée par chaque
 * `buildPayload`) et des badges « ignoré ici » du panneau.
 *
 * Retirer une entrée doit faire disparaître le champ du corps envoyé — c'est
 * vérifié par un test de contrat, `tests/adapters/capabilities.test.ts`.
 */
const SUPPORTED: Record<AdapterId, readonly PayloadParam[]> = {
  'nano-banana-2': [
    'aspectRatio',
    'resolution',
    'batch',
    'seed',
    'personGeneration',
    'language',
    'extraParams',
  ],
  'gpt-image-2': [
    'aspectRatio',
    'resolution',
    'batch',
    'fileFormat',
    'transparent',
    'compression',
    'moderation',
    'language',
    'extraParams',
  ],
  'gpt-image-2.5-sunburst': [
    'aspectRatio',
    'resolution',
    'batch',
    'fileFormat',
    'transparent',
    'compression',
    'moderation',
    'language',
    'extraParams',
  ],
  'gpt-image-2.5-flare': [
    'aspectRatio',
    'resolution',
    'batch',
    'fileFormat',
    'transparent',
    'compression',
    'moderation',
    'language',
    'extraParams',
  ],
}

/** Libellés affichés dans l'encart « ignoré par ce modèle ». */
export const PARAM_LABELS: Record<PayloadParam, string> = {
  aspectRatio: 'format',
  resolution: 'résolution',
  batch: 'variantes',
  seed: 'graine',
  fileFormat: 'type de fichier',
  transparent: 'fond transparent',
  compression: 'compression',
  guidance: 'guidage (CFG)',
  steps: 'étapes',
  sampler: 'échantillonneur',
  personGeneration: 'personGeneration',
  moderation: 'modération',
  language: 'langue envoyée',
  extraParams: 'paramètres bruts',
}

export function supports(adapterId: AdapterId, param: PayloadParam): boolean {
  return SUPPORTED[adapterId].includes(param)
}

export function ignoredParams(adapterId: AdapterId): PayloadParam[] {
  return ALL_PARAMS.filter((param) => !supports(adapterId, param))
}

/**
 * Où chaque réglage atterrit dans le corps de chaque modèle.
 *
 * Sans cette table, `SUPPORTED` ne décrivait que les badges de l'interface :
 * les adapters omettaient les champs non supportés par simple absence dans
 * leur littéral, si bien que retirer une entrée de `SUPPORTED` affichait
 * « ignoré ici » pendant que la valeur continuait de partir.
 *
 * Le chemin est exprimé depuis la racine du corps ; `null` signale un réglage
 * qui n'a pas de champ dédié (il est fondu dans le prompt, comme la langue).
 */
const PARAM_PATHS: Record<AdapterId, Partial<Record<PayloadParam, string | null>>> = {
  'nano-banana-2': {
    aspectRatio: 'config.imageConfig.aspectRatio',
    resolution: 'config.imageConfig.imageSize',
    batch: 'config.candidateCount',
    seed: 'config.seed',
    personGeneration: 'config.personGeneration',
    language: null,
    extraParams: null,
  },
  'gpt-image-2': {
    aspectRatio: 'size',
    resolution: 'quality',
    batch: 'n',
    fileFormat: 'output_format',
    transparent: 'background',
    compression: 'output_compression',
    moderation: 'moderation',
    language: null,
    extraParams: null,
  },
  'gpt-image-2.5-sunburst': {
    aspectRatio: 'size',
    resolution: 'quality',
    batch: 'n',
    fileFormat: 'output_format',
    transparent: 'background',
    compression: 'output_compression',
    moderation: 'moderation',
    language: null,
    extraParams: null,
  },
  'gpt-image-2.5-flare': {
    aspectRatio: 'size',
    resolution: 'quality',
    batch: 'n',
    fileFormat: 'output_format',
    transparent: 'background',
    compression: 'output_compression',
    moderation: 'moderation',
    language: null,
    extraParams: null,
  },
}

function deleteAtPath(target: Record<string, unknown>, path: string) {
  const segments = path.split('.')
  const last = segments.pop()
  if (!last) return

  let node: Record<string, unknown> = target
  for (const segment of segments) {
    const next = node[segment]
    if (typeof next !== 'object' || next === null) return
    node = next as Record<string, unknown>
  }

  delete node[last]
}

/**
 * Retire du corps les champs que ce modèle ne supporte pas.
 *
 * Appelée en fin de chaque `buildPayload`, avant la fusion des paramètres
 * bruts : `capabilities.ts` devient ainsi la seule autorité, et le badge
 * « ignoré ici » cesse d'être une promesse que rien ne tient.
 */
export function pruneUnsupported<T extends object>(adapterId: AdapterId, payload: T): T {
  const clone = structuredClone(payload) as Record<string, unknown>

  for (const param of ignoredParams(adapterId)) {
    const path = PARAM_PATHS[adapterId][param]
    if (path) deleteAtPath(clone, path)
  }

  return clone as T
}
