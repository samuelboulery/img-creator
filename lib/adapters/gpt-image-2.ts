import OpenAI, { toFile } from 'openai'
import { composePrompt, mergeExtraParams, mergeNegatives } from './shared'
import type {
  GenerateImageAdapter,
  GenerationRequest,
  GenerationResult,
  ReferenceImage,
  Resolution,
} from '@/lib/types'

const MODEL_ID = 'gpt-image-2'

/** Formats OpenAI, handoff « Mapping API ». */
const SIZES: Record<string, string> = {
  '1:1': '1024x1024',
  '16:9': '1536x864',
  '9:16': '864x1536',
  '4:3': '1280x960',
}

const QUALITIES: Record<Resolution, string> = {
  '1K': 'low',
  '2K': 'medium',
  '4K': 'high',
}

/** Corps exact envoyé au modèle — même fonction pour l'envoi et pour l'onglet JSON. */
export function buildGptImage2Payload(request: GenerationRequest): object {
  const { params } = request
  const negative = mergeNegatives(request.negative, request.recipeNegative)
  const connector = params.language === 'fr' ? 'À éviter :' : 'Avoid:'

  const instructions: string[] = []
  if (request.identityLock) instructions.push('keep the exact identity of the reference subject')
  if (request.paletteTransfer) instructions.push('reuse the palette of the style references')

  const suffix = [request.promptSuffix, ...instructions].filter(Boolean).join(', ') || undefined

  const references: ReferenceImage[] = [
    ...(request.subjectImages ?? []),
    ...(request.styleImages ?? []),
  ]

  const payload = {
    model: MODEL_ID,
    prompt: composePrompt(request.prompt, suffix, negative, connector),
    n: params.batch,
    size: SIZES[params.aspectRatio] ?? '1024x1024',
    quality: QUALITIES[params.resolution],
    background: params.transparent ? 'transparent' : 'opaque',
    output_format: params.fileFormat,
    // Le PNG n'a pas de compression.
    output_compression: params.fileFormat === 'png' ? null : params.compression,
    moderation: params.moderation,
    image: references.map((image) => image.base64),
  }

  return mergeExtraParams(payload, params.extraParams)
}

type OpenAIPayload = {
  model: string
  prompt: string
  n: number
  size: string
  quality: string
  background: string
  output_format: string
  output_compression: number | null
  moderation: string
  image: string[]
}

async function referenceToFile(image: ReferenceImage, name: string) {
  return toFile(Buffer.from(image.base64, 'base64'), name, { type: image.mimeType })
}

export const gptImage2Adapter: GenerateImageAdapter = {
  async generate(
    request: GenerationRequest,
    apiKeyOverride?: string
  ): Promise<GenerationResult[]> {
    const apiKey = apiKeyOverride ?? process.env.OPENAI_API_KEY
    if (!apiKey) {
      throw new Error(
        "Aucune clé API OpenAI configurée — renseignez-la dans l'interface ou dans .env.local"
      )
    }

    const openai = new OpenAI({ apiKey })
    const payload = buildGptImage2Payload(request) as OpenAIPayload

    const references = [...(request.subjectImages ?? []), ...(request.styleImages ?? [])]

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const common: any = {
      model: payload.model,
      prompt: payload.prompt,
      n: payload.n,
      size: payload.size,
      quality: payload.quality,
      output_format: payload.output_format,
      moderation: payload.moderation,
      ...(payload.output_compression !== null && {
        output_compression: payload.output_compression,
      }),
      ...(payload.background === 'transparent' && { background: 'transparent' }),
    }

    const response =
      references.length > 0
        ? await openai.images.edit({
            ...common,
            image: await Promise.all(
              references.map((image, index) => referenceToFile(image, `ref-${index}.png`))
            ),
          })
        : await openai.images.generate(common)

    const images: GenerationResult[] = (response.data ?? [])
      .filter((entry) => entry.b64_json)
      .map((entry) => ({
        imageBase64: entry.b64_json as string,
        mimeType: `image/${payload.output_format}`,
      }))

    if (images.length === 0) throw new Error('No image returned from gpt-image-2')

    return images
  },
}
