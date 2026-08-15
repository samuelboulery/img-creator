---
{
  "id": "T-0018",
  "titre": "Enrichissement de prompt (/api/enrich, clé utilisateur)",
  "colonne": "fait",
  "priorite": "basse",
  "charge": "s",
  "tags": ["api", "securite"],
  "cree": "2026-08-15",
  "maj": "2026-08-15",
  "plan": "2026-08-15-img-creator-v2-atelier.md",
  "epic": "T-0001"
}
---

## Contexte

Handoff section 9 (tiroir Enrichissement) et section *Mapping API*. Règle structurante : l'app fournit le pré-prompt, jamais le modèle — la clé texte est celle de l'utilisateur. Sans cette contrainte, la fonction coûterait de l'argent au propriétaire du dépôt.

## Critères d'acceptation

- [ ] `app/api/enrich/route.ts` : reçoit prompt + pré-prompt, lit la clé dans l'en-tête `x-api-key`, applique `checkRateLimit`, ne journalise ni la clé ni le prompt.
- [ ] Aucune clé par défaut côté serveur pour cette route : sans clé utilisateur, réponse d'erreur explicite, aucun appel sortant.
- [ ] Tiroir Enrichissement : explication de la règle, carte de clé (`aucune clé — fonction inactive` / `clé présente`) + `Enregistrer dans ce navigateur`.
- [ ] `PRÉ-PROMPT FOURNI` en `<textarea>` mono modifiable, valeur par défaut = le texte exact du handoff, persistée dans `imgc.prefs`.
- [ ] Bouton `Enrichir le prompt actuel` désactivé sans clé (fond `#1A1F2A`, texte `#666E7E`).
- [ ] Le prompt original est conservé et affiché à côté de l'enrichi ; l'utilisateur choisit lequel envoyer.
