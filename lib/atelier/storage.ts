import type { GalleryItem } from '@/lib/types'
import { DEFAULT_PRICING, type Pricing } from './cost'
import { packSession, type PackedSession } from './session-store'

/**
 * L'app n'a ni serveur ni base : localStorage est la seule persistance.
 * Les clés API restent dans le navigateur et ne partent qu'en en-tête
 * `x-api-key` vers `/app/api`.
 */
export const STORAGE_KEYS = {
  geminiKey: 'gemini_api_key',
  openaiKey: 'openai_api_key',
  textKey: 'text_api_key',
  recipes: 'imgc.recipes',
  session: 'imgc.session',
  params: 'imgc.params',
  prefs: 'imgc.prefs',
  onboarded: 'imgc.onboarded',
} as const

export const ENRICH_PRE_PROMPT = `Tu es directeur artistique. Réécris le prompt de l'utilisateur pour un modèle texte-vers-image.
Conserve son intention et son sujet exactement — n'invente aucun élément nouveau.
Précise ce qui est implicite : cadrage, focale, source et qualité de lumière, matière, arrière-plan, palette, heure.
Une seule phrase dense, sans liste, sans adjectif publicitaire, sans mention de marque ni de style d'artiste vivant.
Renvoie uniquement le prompt réécrit.`

export interface Prefs {
  ambientEnabled: boolean
  pricing: Pricing
  enrichPrePrompt: string
}

export const DEFAULT_PREFS: Prefs = {
  ambientEnabled: true,
  pricing: DEFAULT_PRICING,
  enrichPrePrompt: ENRICH_PRE_PROMPT,
}

function storage(): Storage | null {
  // Rendu serveur, ou navigateur qui refuse le stockage (mode privé strict).
  try {
    return typeof window === 'undefined' ? null : window.localStorage
  } catch {
    return null
  }
}

/** Une entrée illisible vaut une entrée absente : on retombe sur la valeur par défaut. */
export function readJson<T>(key: string, fallback: T): T {
  const raw = storage()?.getItem(key)
  if (raw === null || raw === undefined) return fallback

  try {
    const parsed = JSON.parse(raw) as T
    return parsed ?? fallback
  } catch {
    return fallback
  }
}

export function writeJson(key: string, value: unknown): void {
  try {
    storage()?.setItem(key, JSON.stringify(value))
  } catch {
    // Quota dépassé ou stockage refusé : la session reste utilisable en mémoire.
  }
}

/**
 * Écrit la session en la rangeant dans le budget, et **renvoie ce qui a
 * réellement été écrit** : l'appelant peut l'afficher au lieu de laisser
 * l'utilisateur croire que tout est gardé.
 */
export function writeSession(items: GalleryItem[]): PackedSession {
  let packed = packSession(items)

  while (packed.items.length > 0) {
    try {
      storage()?.setItem(STORAGE_KEYS.session, JSON.stringify(packed.items))
      return packed
    } catch {
      // Quota atteint malgré le budget (le reste de l'origine a grossi) : on
      // réduit de moitié et on retente.
      const half = Math.floor(packed.items.length / 2)
      packed = {
        items: packed.items.slice(0, half),
        fullCount: Math.min(packed.fullCount, half),
      }
    }
  }

  try {
    storage()?.removeItem(STORAGE_KEYS.session)
  } catch {
    // Stockage refusé : la session reste utilisable en mémoire.
  }

  return { items: [], fullCount: 0 }
}

export function readString(key: string): string {
  return storage()?.getItem(key) ?? ''
}

export function writeString(key: string, value: string): void {
  try {
    if (value) storage()?.setItem(key, value)
    else storage()?.removeItem(key)
  } catch {
    // idem : on n'interrompt jamais l'atelier pour un échec d'écriture.
  }
}

export function readPrefs(): Prefs {
  const stored = readJson<Partial<Prefs>>(STORAGE_KEYS.prefs, {})
  return {
    ...DEFAULT_PREFS,
    ...stored,
    pricing: { ...DEFAULT_PREFS.pricing, ...stored.pricing },
  }
}
