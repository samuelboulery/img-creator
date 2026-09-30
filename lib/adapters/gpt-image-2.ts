import { buildGptImagePayload, makeGptImageAdapter, type GptImagePayload } from './gpt-image'
import type { GenerationRequest } from '@/lib/types'

export type GptImage2Payload = GptImagePayload

export function buildGptImage2Payload(request: GenerationRequest): GptImage2Payload {
  return buildGptImagePayload('gpt-image-2', request)
}

export const gptImage2Adapter = makeGptImageAdapter('gpt-image-2')
