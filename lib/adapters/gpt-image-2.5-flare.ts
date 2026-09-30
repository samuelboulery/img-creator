import { buildGptImagePayload, makeGptImageAdapter, type GptImagePayload } from './gpt-image'
import type { GenerationRequest } from '@/lib/types'

export type GptImage25FlarePayload = GptImagePayload

export function buildGptImage25FlarePayload(request: GenerationRequest): GptImage25FlarePayload {
  return buildGptImagePayload('gpt-image-2.5-flare', request)
}

export const gptImage25FlareAdapter = makeGptImageAdapter('gpt-image-2.5-flare')
