---
{
  "id": "T-0013",
  "titre": "Historique de session (arborescence) + mode Itérer",
  "colonne": "fait",
  "priorite": "moyenne",
  "charge": "m",
  "tags": ["ui", "modes"],
  "cree": "2026-08-15",
  "maj": "2026-08-15",
  "plan": "2026-08-15-img-creator-v2-atelier.md",
  "epic": "T-0001"
}
---

## Contexte

Handoff sections 4 et 9. Les deux tiennent au même modèle de données : chaque `GalleryItem` porte un `parentId`, ce qui fait de la session un arbre. Le tiroir Historique le montre à plat avec indentation, le mode Itérer le montre localement (parent → actuelle → enfant) avec le diff de prompt et de réglages.

## Critères d'acceptation

- [ ] `parentId` renseigné à chaque génération dérivée (`Décliner`, `Reprendre ce prompt`).
- [ ] Tiroir Historique : note `arborescence de la session — stockée dans ce navigateur, aucun serveur`, rangées indentées 0/12/24 px avec tige verticale 2 px ambre pour le nœud courant, vignette 34 px, identifiant `gen_xxxx`, description du changement.
- [ ] Mode Itérer : image en cours + colonne 244 px avec `LIGNÉE` (trois cartes, l'actuelle en `#1A1F2A` + contour ambre 45 %).
- [ ] `ÉCART DE PROMPT` : texte inchangé en `#8F98A8`, retiré en `<s>` `#7F8896`, ajouté en `oklch(0.84 0.15 72)`.
- [ ] Delta des réglages affiché sous forme `libellé ancien → nouveau`, nouvelle valeur en ambre ; `graine inchangée` quand c'est le cas.
- [ ] La session (items + arborescence) survit au rechargement via `imgc.session`.
- [ ] Test unitaire du calcul de diff de prompt et de delta de réglages.
