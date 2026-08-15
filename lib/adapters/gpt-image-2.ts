import OpenAI, { toFile } from 'openai'
import type { GenerateImageAdapter, PromptParams, GenerationResult, ReferenceImage } from '@/lib/types'

const MODEL_ID = 'gpt-image-2'

const OPENAI_EXTRA_KEYS = new Set(['quality', 'size'])

const ASPECT_RATIO_TO_SIZE: Record<string, string> = {
  '1:1': '1024x1024',
  '16:9': '1536x1024',
  '9:16': '1024x1536',
  '4:3': '1536x1024',
  '3:4': '1024x1536',
}

type Quality = 'low' | 'medium' | 'high' | 'auto'

function buildPrompt(params: PromptParams): string {
  const parts = [params.positiveText]

  if (params.negativeText) {
    parts.push(`Avoid: ${params.negativeText}`)
  }

  const promptHints = (params.extraParams ?? [])
    .filter((p) => p.key.trim() && p.value.trim() && !OPENAI_EXTRA_KEYS.has(p.key))
    .map((p) => `${p.key}: ${p.value}`)

  if (promptHints.length > 0) {
    parts.push(promptHints.join(', '))
  }

  return parts.join('. ')
}

function resolveSize(params: PromptParams): string {
  const sizeOverride = params.extraParams?.find((p) => p.key === 'size')?.value
  if (sizeOverride) return sizeOverride
  return ASPECT_RATIO_TO_SIZE[params.aspectRatio ?? '1:1'] ?? '1024x1024'
}

function resolveQuality(params: PromptParams): Quality {
  const q = params.extraParams?.find((p) => p.key === 'quality')?.value
  if (q === 'low' || q === 'medium' || q === 'high' || q === 'auto') return q
  return 'auto'
}

async function referenceToFile(img: ReferenceImage, name: string) {
  const buffer = Buffer.from(img.base64, 'base64')
  return toFile(buffer, name, { type: img.mimeType })
}

export const gptImage2Adapter: GenerateImageAdapter = {
  async generate(params: PromptParams, apiKeyOverride?: string): Promise<GenerationResult> {
    const apiKey = apiKeyOverride ?? process.env.OPENAI_API_KEY
    if (!apiKey) throw new Error('Aucune clé API OpenAI configurée — renseignez-la dans l\'interface ou dans .env.local')

    const openai = new OpenAI({ apiKey })
    const prompt = buildPrompt(params)
    const size = resolveSize(params)
    const quality = resolveQuality(params)

    const allRefs: ReferenceImage[] = [
      ...(params.styleImages ?? []),
      ...(params.subjectImages ?? []),
    ]

    let b64: string

    if (allRefs.length > 0) {
      const files = await Promise.all(
        allRefs.map((img, i) => referenceToFile(img, `ref-${i}.png`))
      )
      const result = await openai.images.edit({
        model: MODEL_ID,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        image: files as any,
        prompt,
        size: size as Parameters<typeof openai.images.edit>[0]['size'],
        quality: quality as Parameters<typeof openai.images.edit>[0]['quality'],
      })
      b64 = result.data?.[0]?.b64_json ?? ''
    } else {
      const result = await openai.images.generate({
        model: MODEL_ID,
        prompt,
        size: size as Parameters<typeof openai.images.generate>[0]['size'],
        quality: quality as Parameters<typeof openai.images.generate>[0]['quality'],
      })
      b64 = result.data?.[0]?.b64_json ?? ''
    }

    if (!b64) throw new Error('No image returned from gpt-image-2')

    return { imageBase64: b64, mimeType: 'image/png' }
  },
}
