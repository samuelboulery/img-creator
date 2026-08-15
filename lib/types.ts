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

export interface PromptParams {
  adapterId?: AdapterId
  positiveText: string
  negativeText?: string
  styleImages?: ReferenceImage[]
  /** 0 = loose inspiration, 100 = strict adherence. Default: 50 */
  styleWeight?: number
  subjectImages?: ReferenceImage[]
  /** 0 = loose inspiration, 100 = strict adherence. Default: 50 */
  subjectWeight?: number
  aspectRatio?: '1:1' | '16:9' | '9:16' | '4:3' | '3:4'
  extraParams?: ExtraParam[]
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
  aspectRatio: NonNullable<PromptParams['aspectRatio']>
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
  generate(params: PromptParams, apiKeyOverride?: string): Promise<GenerationResult>
}


export interface GenerateResponse {
  success: boolean
  data?: GenerationResult
  error?: string
}
