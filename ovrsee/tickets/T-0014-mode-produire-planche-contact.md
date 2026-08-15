---
{
  "id": "T-0014",
  "titre": "Mode Produire : planche contact + export planche",
  "colonne": "backlog",
  "priorite": "moyenne",
  "charge": "s",
  "tags": ["ui", "modes"],
  "cree": "2026-08-15",
  "maj": "2026-08-15",
  "plan": "2026-08-15-img-creator-v2-atelier.md",
  "epic": "T-0001"
}
---

## Contexte

Handoff section 5. Le mode de sortie : on sélectionne parmi les variantes produites et on exporte les images avec leurs recettes, pour retrouver plus tard comment un visuel a été obtenu.

## Critères d'acceptation

- [ ] En-tête `PLANCHE — N sélectionnées sur M`, bouton `Tout sélectionner` (`selection-all`), bouton `Exporter planche + recettes` (`file-arrow-down`).
- [ ] Grille `repeat(4, 1fr)` × 2, gouttière 10 px, rayon 12, label `v1`…`v8` en bas à gauche.
- [ ] Case 18 px en haut à droite : cochée = fond accent + `fill/check` `#231400` ; décochée = `rgba(8,9,13,.55)` + contour blanc 18 % + `plus`. Cellule sélectionnée = contour ambre 55 %.
- [ ] Le compteur suit chaque coche/décoche.
- [ ] L'export produit les images sélectionnées **et** leurs recettes en `.json`.
- [ ] `sheetSelection` fait partie de l'état d'interface et se vide au changement de session.
