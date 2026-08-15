---
{
  "id": "T-0009",
  "titre": "Onglet JSON : corps réel, encart « ignoré par ce modèle », copier",
  "colonne": "pret",
  "priorite": "haute",
  "charge": "s",
  "tags": ["ui", "params"],
  "cree": "2026-08-15",
  "maj": "2026-08-15",
  "plan": "2026-08-15-img-creator-v2-atelier.md",
  "epic": "T-0001"
}
---

## Contexte

Second onglet du panneau (handoff, section 8). C'est la pièce qui rend l'app lisible : elle montre le corps exact envoyé au modèle sélectionné. Dépend de `buildPayload()` et de `capabilities.ts` livrés par T-0008 — aucune logique de payload n'est réécrite ici.

## Critères d'acceptation

- [ ] Libellé `CORPS DE LA REQUÊTE` + bouton `copier` qui met le JSON dans le presse-papiers.
- [ ] Bloc `<pre>` `#0B0E14`, mono 10,5/1,65, `white-space: pre-wrap`.
- [ ] Le JSON se recompose à chaque changement de réglage **et** à chaque bascule de modèle.
- [ ] Encart `IGNORÉ PAR CE MODÈLE` listant les paramètres écartés, suivi de la note sur le négatif fusionné.
- [ ] Dans l'onglet Recette, tout paramètre non supporté par le modèle actif porte le badge mono `ignoré ici`.
- [ ] Les données base64 des références sont tronquées à l'affichage (le payload envoyé reste complet).
