import type { ErrorKind } from './reducer'

/**
 * Le client ne reçoit que le message déjà expurgé par `/api/generate` — il ne
 * voit jamais l'erreur amont brute. On classe donc sur ce vocabulaire-là, qui
 * est stable et défini par `lib/adapters/errors.ts`.
 *
 * `compare()` produit en plus ses propres messages (« Aucune clé Google AI
 * Studio enregistrée ») sans passer par le serveur : ils sont reconnus ici.
 */
const MISSING_KEY = /cl[ée]s?\s*api|aucune cl[ée]/i

export function classifyClientError(message: string): ErrorKind {
  return MISSING_KEY.test(message) ? 'missing-key' : 'generic'
}
