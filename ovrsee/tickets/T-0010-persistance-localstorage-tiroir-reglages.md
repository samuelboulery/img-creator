---
{
  "id": "T-0010",
  "titre": "Persistance localStorage + tiroir Réglages et clés",
  "colonne": "backlog",
  "priorite": "haute",
  "charge": "m",
  "tags": ["state", "securite"],
  "cree": "2026-08-15",
  "maj": "2026-08-15",
  "plan": "2026-08-15-img-creator-v2-atelier.md",
  "epic": "T-0001"
}
---

## Contexte

L'app n'a ni serveur ni base : `localStorage` est la seule persistance (handoff, section *State management* et tiroir Réglages en section 9). Aujourd'hui seule la clé Gemini est stockée, par `components/ApiKeyInput.tsx`, qui disparaît au profit des cartes de clé du tiroir.

Rappel de sécurité : les clés restent dans le navigateur de l'utilisateur et ne partent que dans l'en-tête `x-api-key` vers `app/api/` — jamais en `NEXT_PUBLIC_*`, jamais journalisées.

## Critères d'acceptation

- [ ] `lib/atelier/storage.ts` : lecture/écriture typées, tolérantes au JSON corrompu (valeur par défaut plutôt qu'un crash), sans accès à `window` au rendu serveur.
- [ ] Clés persistées : `gemini_api_key`, `openai_api_key`, `text_api_key`, `imgc.recipes`, `imgc.session`, `imgc.params`, `imgc.prefs`, `imgc.onboarded`.
- [ ] Tiroir Réglages : trois cartes de clé (Google AI Studio, OpenAI, modèle de texte optionnel) avec valeur masquée, icône `key`, œil de révélation, état `active`/`inactive`.
- [ ] Interrupteur `Fond réactif`, rangée `Estimation des coûts → éditer` (tarifs stockés dans `imgc.prefs`), lien `Revoir l'écran d'accueil`.
- [ ] Après rechargement de la page : session, derniers réglages, presets et préférences sont restaurés.
- [ ] Aucune clé n'apparaît dans un log serveur ni dans le JSON affiché.
- [ ] Tests unitaires sur `storage.ts`, dont le cas d'une entrée corrompue.
