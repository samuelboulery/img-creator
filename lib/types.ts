export interface ReferenceImage {
  base64: string
  mimeType: string
}

export interface ExtraParam {
  key: string
  value: string
}

export interface PromptParams {
  positiveText: string
  negativeText?: string
  styleImages?: ReferenceImage[]
  subjectImages?: ReferenceImage[]
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
