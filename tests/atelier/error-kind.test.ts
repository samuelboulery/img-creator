import { describe, expect, test } from 'vitest'
import { classifyClientError } from '@/lib/atelier/error-kind'
import { toClientMessage } from '@/lib/adapters/errors'

describe('nature d’un échec, vue du client', () => {
  // Le client ne voit que le message expurgé par la route : chaque message
  // qu'elle peut renvoyer doit retrouver sa nature, sans quoi la scène propose
  // « Relancer » là où il faudrait une clé.
  test.each([
    ['invalid api key', 'missing-key'],
    ['429 Too Many Requests', 'quota'],
    ['blocked by safety system', 'safety'],
    ['No image returned from gpt-image-2', 'no-image'],
    ['ECONNRESET', 'generic'],
  ] as const)('« %s » → %s', (amont, attendu) => {
    expect(classifyClientError(toClientMessage(amont))).toBe(attendu)
  })

  test('un message inconnu est générique', () => {
    expect(classifyClientError('boom')).toBe('generic')
  })
})
