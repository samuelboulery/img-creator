import { buildGptImage2Payload } from './gpt-image-2'
import { buildNanoBanana2Payload } from './nano-banana-2'
import type { GenerationRequest } from '@/lib/types'

/** Corps réel de la requête, pour le modèle sélectionné. */
export function buildPayload(request: GenerationRequest): object {
  return request.adapterId === 'gpt-image-2'
    ? buildGptImage2Payload(request)
    : buildNanoBanana2Payload(request)
}

/** Champs qui portent du base64 : `inlineData.data` côté Gemini, `image` côté OpenAI. */
const BASE64_KEYS = new Set(['data', 'image'])

function shorten(value: string): string {
  return value.length > 48 ? `${value.slice(0, 24)}… (${value.length} caractères)` : value
}

/**
 * Version lisible du corps : les données base64 sont raccourcies à l'affichage
 * seulement — ce qui part sur le réseau reste complet.
 */
export function truncateInlineData<T>(value: T, key?: string): T {
  const isBase64Field = key !== undefined && BASE64_KEYS.has(key)

  if (typeof value === 'string') {
    return (isBase64Field ? shorten(value) : value) as T
  }

  if (Array.isArray(value)) {
    return value.map((entry) => truncateInlineData(entry, key)) as T
  }

  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value).map(([entryKey, entry]) => [
        entryKey,
        truncateInlineData(entry, entryKey),
      ])
    ) as T
  }

  return value
}
