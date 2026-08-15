import type { GenerationParams } from '@/lib/types'

export const DEFAULT_PARAMS: GenerationParams = {
  aspectRatio: '1:1',
  resolution: '2K',
  batch: 1,
  seed: null,
  seedLock: false,
  fileFormat: 'png',
  transparent: false,
  compression: 80,
  guidance: 7,
  steps: 30,
  sampler: 'DPM++ 2M Karras',
  personGeneration: 'allow_adult',
  moderation: 'auto',
  language: 'auto',
  extraParams: [],
}

export const SAMPLERS = ['DPM++ 2M Karras', 'DPM++ SDE', 'Euler a', 'DDIM'] as const

/** Graine à sept chiffres, tirée par le bouton `relancer`. */
export function randomSeed(): number {
  return Math.floor(1_000_000 + Math.random() * 9_000_000)
}

/** Mise à jour immuable d'un réglage. */
export function setParam<K extends keyof GenerationParams>(
  params: GenerationParams,
  key: K,
  value: GenerationParams[K]
): GenerationParams {
  return { ...params, [key]: value }
}

/** Libellé textuel d'un curseur de fidélité, ex. « proche · 75 ». */
export function weightLabel(weight: number): string {
  if (weight <= 20) return 'très libre'
  if (weight <= 40) return 'libre'
  if (weight <= 60) return 'équilibré'
  if (weight <= 80) return 'proche'
  return 'reproduction'
}
