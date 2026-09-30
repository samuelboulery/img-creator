import {
  ASPECT_RATIOS,
  BATCHES,
  FILE_FORMATS,
  LANGUAGES,
  MODERATIONS,
  PERSON_GENERATIONS,
  RESOLUTIONS,
} from '@/lib/adapters/validate'
import type { ExtraParam, GenerationParams, ReferenceImage } from '@/lib/types'
import type { ImageState } from './image-file'

/** Références et poids : la part de la recette qui n'est pas un réglage. */
export interface RecipeState {
  subjectImages: ImageState[]
  subjectWeight: number
  identityLock: boolean
  styleImages: ImageState[]
  styleWeight: number
  paletteTransfer: boolean
}

export const DEFAULT_RECIPE_STATE: RecipeState = {
  subjectImages: [],
  subjectWeight: 75,
  identityLock: false,
  styleImages: [],
  styleWeight: 65,
  paletteTransfer: false,
}

/** Les références telles qu'elles partent dans le payload. */
export function referencesOf(images: ImageState[]): ReferenceImage[] {
  return images.map(({ base64, mimeType }) => ({ base64, mimeType }))
}

export const DEFAULT_PARAMS: GenerationParams = {
  aspectRatio: '1:1',
  resolution: '2K',
  batch: 1,
  seed: null,
  seedLock: false,
  fileFormat: 'png',
  transparent: false,
  compression: 80,
  personGeneration: 'allow_adult',
  moderation: 'auto',
  language: 'auto',
  extraParams: [],
}

function pick<T>(value: unknown, allowed: readonly T[], fallback: T): T {
  return allowed.includes(value as T) ? (value as T) : fallback
}

/**
 * Relit des réglages venus de `localStorage` : chaque champ connu est vérifié,
 * les champs morts d'une version précédente (guidage, étapes…) tombent, et une
 * valeur hors énumération retombe sur son défaut.
 */
export function normalizeParams(raw: unknown): GenerationParams {
  if (typeof raw !== 'object' || raw === null) return DEFAULT_PARAMS
  const p = raw as Record<string, unknown>
  const d = DEFAULT_PARAMS

  return {
    aspectRatio: pick(p.aspectRatio, ASPECT_RATIOS, d.aspectRatio),
    resolution: pick(p.resolution, RESOLUTIONS, d.resolution),
    batch: pick(p.batch, BATCHES, d.batch),
    seed: Number.isInteger(p.seed) ? (p.seed as number) : null,
    seedLock: p.seedLock === true,
    fileFormat: pick(p.fileFormat, FILE_FORMATS, d.fileFormat),
    transparent: p.transparent === true,
    compression:
      typeof p.compression === 'number' && p.compression >= 20 && p.compression <= 100
        ? p.compression
        : d.compression,
    personGeneration: pick(p.personGeneration, PERSON_GENERATIONS, d.personGeneration),
    moderation: pick(p.moderation, MODERATIONS, d.moderation),
    language: pick(p.language, LANGUAGES, d.language),
    extraParams: Array.isArray(p.extraParams)
      ? p.extraParams.filter(
          (entry): entry is ExtraParam =>
            typeof entry?.key === 'string' && typeof entry?.value === 'string'
        )
      : [],
  }
}

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
