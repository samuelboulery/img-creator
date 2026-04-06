import { GoogleGenAI } from '@google/genai'
import type { GenerateImageAdapter, PromptParams, GenerationResult, ReferenceImage } from '@/lib/types'

const MODEL_ID = 'gemini-3.1-flash-image-preview'

// Known Gemini imageConfig keys — anything else gets injected into the prompt text
const GEMINI_IMAGE_CONFIG_KEYS = new Set(['imageSize', 'aspectRatio'])

function buildPrompt(params: PromptParams): string {
  const parts = [params.positiveText]

  if (params.negativeText) {
    parts.push(`Avoid: ${params.negativeText}`)
  }

  // Inject unknown extra params as prompt hints
  const promptHints = (params.extraParams ?? [])
    .filter((p) => p.key.trim() && p.value.trim() && !GEMINI_IMAGE_CONFIG_KEYS.has(p.key))
    .map((p) => `${p.key}: ${p.value}`)

  if (promptHints.length > 0) {
    parts.push(promptHints.join(', '))
  }

  return parts.join('. ')
}

function imagePart(img: ReferenceImage) {
  return { inlineData: { mimeType: img.mimeType, data: img.base64 } }
}

export const nanoBanana2Adapter: GenerateImageAdapter = {
  /**
   * Génère une image via Gemini 3.1 Flash Image (Nano Banana 2).
   * @param params - Prompt, images de référence, format, paramètres avancés
   * @param apiKeyOverride - Clé API optionnelle (prioritaire sur GEMINI_API_KEY)
   * @throws Si aucune clé n'est configurée ou si l'API ne retourne pas d'image
   */
  async generate(params: PromptParams, apiKeyOverride?: string): Promise<GenerationResult> {
    const apiKey = apiKeyOverride ?? process.env.GEMINI_API_KEY
    if (!apiKey) throw new Error('Aucune clé API configurée — renseignez-la dans l\'interface ou dans .env.local')

    const ai = new GoogleGenAI({ apiKey })

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const parts: any[] = []

    // Style reference images first
    if (params.styleImages?.length) {
      parts.push({ text: 'Style references:' })
      parts.push(...params.styleImages.map(imagePart))
    }

    // Subject reference images
    if (params.subjectImages?.length) {
      parts.push({ text: 'Subject references:' })
      parts.push(...params.subjectImages.map(imagePart))
    }

    parts.push({ text: buildPrompt(params) })

    // Extract Gemini-native imageConfig params from extraParams
    const extraImageConfig = Object.fromEntries(
      (params.extraParams ?? [])
        .filter((p) => p.key.trim() && p.value.trim() && GEMINI_IMAGE_CONFIG_KEYS.has(p.key))
        .map((p) => [p.key, p.value])
    )

    const response = await ai.models.generateContent({
      model: MODEL_ID,
      contents: [{ role: 'user', parts }],
      config: {
        responseModalities: ['IMAGE', 'TEXT'],
        imageConfig: {
          ...(params.aspectRatio && { aspectRatio: params.aspectRatio }),
          ...extraImageConfig,
        },
      },
    })

    const resultPart = response.candidates?.[0]?.content?.parts?.find(
      (p) => p.inlineData?.mimeType?.startsWith('image/')
    )

    if (!resultPart?.inlineData?.data) {
      throw new Error('No image returned from Nano Banana 2')
    }

    return {
      imageBase64: resultPart.inlineData.data,
      mimeType: resultPart.inlineData.mimeType ?? 'image/png',
    }
  },
}
