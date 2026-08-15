---
{
  "id": "T-0015",
  "titre": "Mode A/B : deux modèles en parallèle",
  "colonne": "backlog",
  "priorite": "moyenne",
  "charge": "m",
  "tags": ["ui", "modes", "api"],
  "cree": "2026-08-15",
  "maj": "2026-08-15",
  "plan": "2026-08-15-img-creator-v2-atelier.md",
  "epic": "T-0001"
}
---

## Contexte

Handoff section 6. Comparer `nano-banana-2` et `gpt-image-2` sur le même prompt est la raison d'être des deux adapters : sans cette vue, choisir un modèle relève du souvenir. Deux appels indépendants à `/api/generate`, un par modèle, avec la clé correspondante.

## Critères d'acceptation

- [ ] Le bouton `square-split-horizontal` du rail force le mode A/B.
- [ ] Deux colonnes égales ; par colonne : en-tête (point + nom de modèle en mono, `latence · coût` à droite), image, boutons `Garder A`/`Garder B` et `Décliner`.
- [ ] Seule la colonne A porte le liseré ambre à 14 %.
- [ ] En-tête global : `total 0,00 €` cumulé + `Relancer les deux`.
- [ ] Les deux appels partent en parallèle ; l'échec d'un modèle affiche son erreur dans sa colonne sans emporter l'autre.
- [ ] `Garder` conserve le résultat dans la session et sélectionne le modèle correspondant comme modèle actif.
- [ ] Une clé manquante pour l'un des deux modèles est signalée dans sa colonne, sans appel réseau.
