/**
 * Garde d'origine pour les routes POST.
 *
 * Sans elle, un site tiers peut émettre une requête *simple* — `Content-Type:
 * text/plain`, donc aucun préflight CORS — vers `/api/generate`. L'attaquant ne
 * lit pas la réponse, mais la requête part et s'exécute : elle consomme la clé
 * de repli du serveur. Le mode « instance de démo partagée » documenté dans le
 * README rend ce scénario concret.
 */

/**
 * `Sec-Fetch-Site` est envoyé par tous les navigateurs modernes et n'est pas
 * falsifiable depuis une page. `none` couvre la saisie directe d'URL et les
 * appels hors navigateur (curl), qui n'ont pas de contexte d'origine.
 */
export function isSameOrigin(req: Request): boolean {
  const site = req.headers.get('sec-fetch-site')
  if (site) return site === 'same-origin' || site === 'none'

  // Repli pour les agents sans Fetch Metadata : comparer l'hôte déclaré.
  const origin = req.headers.get('origin')
  if (!origin) return true

  try {
    return new URL(origin).host === new URL(req.url).host
  } catch {
    return false
  }
}

/**
 * Un corps JSON doit s'annoncer comme tel. C'est ce qui retire aux pages
 * tierces la possibilité d'émettre une requête simple : `application/json`
 * déclenche un préflight, que CORS refusera.
 */
export function isJsonRequest(req: Request): boolean {
  return req.headers.get('content-type')?.toLowerCase().includes('application/json') ?? false
}
