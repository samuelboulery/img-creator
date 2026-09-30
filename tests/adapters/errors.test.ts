import { describe, expect, test } from 'vitest'
import { classifyUpstreamError, toClientMessage } from '@/lib/adapters/errors'
import { classifyClientError } from '@/lib/atelier/error-kind'

describe('classification des erreurs amont', () => {
  // Le message que lèvent réellement les deux adapters (nano-banana-2.ts:73,
  // gpt-image-2.ts) : il est en français et ne matchait aucune regex anglaise.
  test('le message français de clé manquante est reconnu', () => {
    const reel = "Aucune clé API configurée — renseignez-la dans l'interface ou dans .env.local"

    expect(classifyUpstreamError(reel)).toBe('missing-key')
    expect(toClientMessage(reel)).toBe('Clé API invalide ou manquante')
  })

  test.each([
    ['Incorrect API key provided: sk-***', 'missing-key'],
    ['401 Unauthorized', 'missing-key'],
    ['API key not valid. Please pass a valid API key.', 'missing-key'],
    ['429 Too Many Requests', 'quota'],
    ['RESOURCE_EXHAUSTED: quota exceeded', 'quota'],
    ['You exceeded your current billing quota', 'quota'],
    ['No image returned from Nano Banana 2', 'no-image'],
    ['Request blocked by content policy', 'safety'],
    ['ECONNRESET', 'unknown'],
  ])('%s → %s', (message, attendu) => {
    expect(classifyUpstreamError(message)).toBe(attendu)
  })

  test('un message inconnu retombe sur le générique', () => {
    expect(toClientMessage('boom')).toBe('Erreur lors de la génération')
  })

  test("le message brut n'est jamais renvoyé tel quel", () => {
    const fuite = 'Invalid API key: sk-proj-SECRET123 at https://api.openai.com/v1/images'

    // Classé comme clé manquante, mais la réponse ne contient ni la clé ni l'URL.
    const client = toClientMessage(fuite)
    expect(client).toBe('Clé API invalide ou manquante')
    expect(client).not.toContain('SECRET123')
    expect(client).not.toContain('openai.com')
  })
})

describe("classification côté client (choix du remède sur la scène)", () => {
  test('le message expurgé du serveur mène aux réglages', () => {
    expect(classifyClientError('Clé API invalide ou manquante')).toBe('missing-key')
  })

  test('les messages « aucune clé enregistrée » sont reconnus', () => {
    expect(classifyClientError('Aucune clé Google AI Studio enregistrée')).toBe('missing-key')
    expect(classifyClientError('Aucune clé OpenAI enregistrée')).toBe('missing-key')
  })

  test('une panne réseau reste « réessayable »', () => {
    expect(classifyClientError('Erreur lors de la génération')).toBe('generic')
  })

  test('un quota atteint se distingue : on patiente ou on change de modèle', () => {
    expect(classifyClientError('Quota API dépassé')).toBe('quota')
  })
})
