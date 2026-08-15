import type { AdapterId, GenerationParams } from '@/lib/types'

/** Réglages susceptibles de partir dans un corps de requête. */
export type PayloadParam = Exclude<keyof GenerationParams, 'seedLock'>

const ALL: PayloadParam[] = [
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
 * l'élagage du payload et des badges « ignoré ici » du panneau.
 */
const SUPPORTED: Record<AdapterId, PayloadParam[]> = {
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
  return ALL.filter((param) => !supports(adapterId, param))
}
