export interface ReferenceImage {
  base64: string
  mimeType: string
}

export interface ExtraParam {
  key: string
  value: string
}

export type AdapterId = 'nano-banana-2' | 'gpt-image-2'

/** Modes de travail de l'atelier. `ab` compare les deux modèles côte à côte. */
export type Mode = 'explore' | 'iterate' | 'produce' | 'ab'

/** Tiroirs du rail — un seul ouvert à la fois. */
export type DrawerId = 'history' | 'recipes' | 'enrich' | 'settings'

/** Onglets du panneau de paramètres. */
export type PanelTab = 'recipe' | 'json'

export type AspectRatio = '1:1' | '16:9' | '9:16' | '4:3'
export type Resolution = '1K' | '2K' | '4K'
export type Batch = 1 | 2 | 4 | 8
export type FileFormat = 'png' | 'jpeg' | 'webp'
export type PersonGeneration = 'allow_adult' | 'allow_all' | 'dont_allow'
export type Moderation = 'auto' | 'low'
export type Language = 'auto' | 'fr' | 'en'

/**
 * Réglages de rendu. Tous les modèles n'en supportent pas la totalité : voir
 * `lib/adapters/capabilities.ts`, qui décide de ce qui part et de ce qui porte
 * le badge « ignoré ici ».
 */
export interface GenerationParams {
  aspectRatio: AspectRatio
  resolution: Resolution
  batch: Batch
  /** `null` = graine aléatoire à chaque envoi. */
  seed: number | null
  seedLock: boolean
  fileFormat: FileFormat
  transparent: boolean
  /** 20–100, sans effet en PNG. */
  compression: number
  /** Guidage (CFG), 1–20 par pas de 0,5. */
  guidance: number
  steps: number
  sampler: string
  personGeneration: PersonGeneration
  moderation: Moderation
  language: Language
  extraParams: ExtraParam[]
}

/** Un preset réutilisable : références, poids, suffixe, négatif et réglages. */
export interface Recipe {
  id: string
  name: string
  styleImages: ReferenceImage[]
  /** 0 = inspiration lointaine, 100 = reproduction. */
  styleWeight: number
  subjectImages: ReferenceImage[]
  subjectWeight: number
  identityLock: boolean
  paletteTransfer: boolean
  promptSuffix: string
  negative: string
  params: Partial<GenerationParams>
}

/**
 * Ce qu'un adapter reçoit. Le preset est déjà résolu côté client : seuls son
 * suffixe et son négatif voyagent, pour être fusionnés puis dédupliqués.
 */
export interface GenerationRequest {
  adapterId: AdapterId
  prompt: string
  negative?: string
  promptSuffix?: string
  recipeNegative?: string
  subjectImages?: ReferenceImage[]
  subjectWeight?: number
  styleImages?: ReferenceImage[]
  styleWeight?: number
  identityLock?: boolean
  paletteTransfer?: boolean
  params: GenerationParams
}

export interface GenerationResult {
  imageBase64: string
  mimeType: string
}

/**
 * Une image produite pendant la session. `createdAt` est une chaîne ISO et non
 * une `Date` : la session est sérialisée telle quelle dans localStorage.
 */
export interface GalleryItem {
  id: string
  result: GenerationResult
  adapterId: AdapterId
  prompt: string
  negative: string
  seed: number | null
  params: GenerationParams
  /** Trois couleurs dominantes extraites de l'image — alimente le fond ambiant. */
  palette: [string, string, string] | null
  /** Arborescence de la session : l'image dont celle-ci dérive. */
  parentId: string | null
  recipeId: string | null
  latencyMs: number
  costEur: number
  createdAt: string
}

export interface GenerateImageAdapter {
  /** Renvoie autant d'images que `params.batch` en demande. */
  generate(request: GenerationRequest, apiKeyOverride?: string): Promise<GenerationResult[]>
}

export interface GenerateResponse {
  success: boolean
  data?: GenerationResult[]
  error?: string
}
