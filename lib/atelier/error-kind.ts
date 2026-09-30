import { classifyUpstreamError } from '@/lib/adapters/errors'

/** Ce que la scène propose face à l'échec : une clé, patienter, baisser la modération, relancer. */
export type FailureKind = 'missing-key' | 'quota' | 'safety' | 'no-image' | 'generic'

/**
 * Le client ne reçoit que le message déjà expurgé par `/api/generate` — il ne
 * voit jamais l'erreur amont brute. Ces messages-là sont stables et définis
 * par `lib/adapters/errors.ts` : on les reclasse avec le même classifieur.
 */
export function classifyClientError(message: string): FailureKind {
  const kind = classifyUpstreamError(message)
  return kind === 'unknown' ? 'generic' : kind
}
