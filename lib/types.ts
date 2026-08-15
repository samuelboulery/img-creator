export interface ReferenceImage {
  base64: string
  mimeType: string
}

export interface ExtraParam {
  key: string
  value: string
}

export type AdapterId = 'nano-banana-2' | 'gpt-image-2'

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

export interface GenerateImageAdapter {
  generate(params: PromptParams, apiKeyOverride?: string): Promise<GenerationResult>
}


export interface GenerateResponse {
  success: boolean
  data?: GenerationResult
  error?: string
}
