import { describe, expect, test } from 'vitest'
import {
  ADAPTERS,
  ALL_PARAMS,
  ignoredParams,
  supports,
  type PayloadParam,
} from '@/lib/adapters/capabilities'
import { buildPayload } from '@/lib/adapters/payload'
import { DEFAULT_PARAMS } from '@/lib/atelier/params'
import type { AdapterId, GenerationRequest } from '@/lib/types'

function request(adapterId: AdapterId, overrides: Partial<typeof DEFAULT_PARAMS> = {}) {
  return {
    adapterId,
    prompt: 'un phare dans la tempête',
    drawnSeed: 4_242_424,
    params: { ...DEFAULT_PARAMS, ...overrides },
  } as GenerationRequest
}

/**
 * Valeurs alternatives, choisies pour différer des valeurs par défaut : muter
 * un réglage doit se voir dans le corps s'il est supporté, et rester invisible
 * sinon.
 */
const MUTATIONS: Partial<Record<PayloadParam, Partial<typeof DEFAULT_PARAMS>>> = {
  aspectRatio: { aspectRatio: '16:9' },
  resolution: { resolution: '4K' },
  batch: { batch: 8 },
  // La graine n'a d'effet qu'une fois verrouillée : sans verrou, c'est celle
  // tirée par l'appelant qui compte, et muter le champ ne doit rien changer.
  seed: { seed: 1_234_567, seedLock: true },
  fileFormat: { fileFormat: 'webp' },
  transparent: { transparent: true },
  // Le PNG n'a pas de compression (output_compression est forcé à null) :
  // pour observer le réglage, il faut un format qui la porte.
  compression: { fileFormat: 'jpeg', compression: 42 },
  guidance: { guidance: 19 },
  steps: { steps: 77 },
  sampler: { sampler: 'dpm' },
  personGeneration: { personGeneration: 'dont_allow' },
  moderation: { moderation: 'low' },
}

/** Réglages dont la mutation en entraîne une autre, non isolable. */
const COUPLED = new Set<PayloadParam>(['compression'])

describe('contrat : les capacités pilotent réellement le payload', () => {
  // Le cœur du ticket. Avant, les adapters n'importaient même pas
  // capabilities.ts : le badge « ignoré ici » s'affichait pendant que la
  // valeur continuait de partir.
  for (const adapterId of ADAPTERS) {
    for (const param of ALL_PARAMS) {
      const mutation = MUTATIONS[param]
      if (mutation === undefined) continue

      const attendu = supports(adapterId, param)

      // Une mutation couplée change forcément le corps par son co-réglage :
      // seul le sens « non supporté ⇒ invisible » reste vérifiable.
      if (attendu && COUPLED.has(param)) continue

      test(`${adapterId} — muter « ${param} » ${attendu ? 'change' : 'ne change pas'} le corps`, () => {
        const base = JSON.stringify(buildPayload(request(adapterId)))
        const muté = JSON.stringify(buildPayload(request(adapterId, mutation)))

        if (attendu) {
          expect(muté).not.toBe(base)
        } else {
          expect(muté).toBe(base)
        }
      })
    }
  }

  test('chaque paramètre ignoré est absent du corps sérialisé', () => {
    for (const adapterId of ADAPTERS) {
      const corps = JSON.stringify(buildPayload(request(adapterId)))

      for (const param of ignoredParams(adapterId)) {
        // `extraParams` et `language` n'ont pas de champ dédié : ils se fondent
        // dans le prompt ou ne partent pas du tout.
        if (param === 'extraParams' || param === 'language') continue
        expect(corps).not.toContain(`"${param}"`)
      }
    }
  })

  test('gpt-image-2 n’envoie pas de graine ni de personGeneration', () => {
    const corps = buildPayload(request('gpt-image-2')) as Record<string, unknown>

    expect(corps.seed).toBeUndefined()
    expect(corps.personGeneration).toBeUndefined()
  })

  test('nano-banana-2 n’envoie ni type de fichier ni compression', () => {
    const corps = buildPayload(request('nano-banana-2')) as Record<string, unknown>

    expect(corps.output_format).toBeUndefined()
    expect(corps.output_compression).toBeUndefined()
    expect(corps.background).toBeUndefined()
  })
})

describe('contrat : buildPayload est pure', () => {
  // Le README promet « le corps réel, jamais une reconstitution ». Tant que
  // resolveSeed tirait un Math.random(), l'onglet JSON affichait une graine
  // renouvelée à chaque frappe, qui n'était jamais celle envoyée.
  for (const adapterId of ADAPTERS) {
    test(`${adapterId} — deux appels identiques rendent le même corps`, () => {
      const a = JSON.stringify(buildPayload(request(adapterId)))
      const b = JSON.stringify(buildPayload(request(adapterId)))

      expect(a).toBe(b)
    })
  }

  test('la graine tirée par l’appelant se retrouve telle quelle dans le corps', () => {
    const corps = buildPayload(request('nano-banana-2')) as {
      config: Record<string, unknown>
    }

    expect(corps.config.seed).toBe(4_242_424)
  })

  test('une graine verrouillée l’emporte sur celle tirée', () => {
    const corps = buildPayload(
      request('nano-banana-2', { seed: 999_999, seedLock: true })
    ) as { config: Record<string, unknown> }

    expect(corps.config.seed).toBe(999_999)
  })

  test('sans graine tirée, le corps porte null plutôt qu’une valeur inventée', () => {
    const sans = {
      adapterId: 'nano-banana-2',
      prompt: 'x',
      params: { ...DEFAULT_PARAMS, seedLock: false },
    } as GenerationRequest

    const corps = buildPayload(sans) as { config: Record<string, unknown> }
    expect(corps.config.seed).toBeNull()
  })
})
