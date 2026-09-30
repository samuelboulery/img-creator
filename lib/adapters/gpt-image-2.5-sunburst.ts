import { buildGptImagePayload, makeGptImageAdapter, type GptImagePayload } from './gpt-image'
import type { GenerationRequest } from '@/lib/types'

export type GptImage25SunburstPayload = GptImagePayload

export function buildGptImage25SunburstPayload(request: GenerationRequest): GptImage25SunburstPayload {
  return buildGptImagePayload('gpt-image-2.5-sunburst', request)
}

export const gptImage25SunburstAdapter = makeGptImageAdapter('gpt-image-2.5-sunburst')
