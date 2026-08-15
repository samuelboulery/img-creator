---
{
  "id": "T-0005",
  "titre": "Canvas Explorer : hero, vignettes, tuile en cours, états vide et erreur",
  "colonne": "en-cours",
  "priorite": "haute",
  "charge": "m",
  "tags": [
    "ui",
    "canvas"
  ],
  "cree": "2026-08-15",
  "maj": "2026-08-15",
  "plan": "2026-08-15-img-creator-v2-atelier.md",
  "epic": "T-0001"
}
---

## Contexte

Mode par défaut de l'atelier (handoff, sections 3 et 11). Remplace `components/ImageGallery.tsx`. À ce stade il consomme encore `/api/generate` tel quel — une image par appel — ce qui donne le gain visuel immédiat sans toucher aux adapters.

## Critères d'acceptation

- [ ] Grille `1.62fr 1fr 1fr` sur deux rangées, gouttière 13 px : hero sur deux rangées, trois vignettes, une tuile en cours.
- [ ] Hero : rayon 14, chip `seed` et chip des 3 pastilles de palette en haut, boutons `Agrandir` et `Décliner ×4` en bas à droite qui wrappent. Aucune légende centrée sur l'image.
- [ ] Clic sur une vignette change la sélection (hero + métadonnées) ; clic sur le hero ouvre le plein écran (le hook est posé même si T-0016 livre l'overlay).
- [ ] Tuile en cours : fond `#14111E`, balayage `shimmer` ambre 18 %, compteur mono `génération · N s`. Le bouton Générer reste actif pour empiler une autre demande.
- [ ] État vide : cadre pointillé, icône `sparkle` 26 px, les deux copies exactes du handoff.
- [ ] État d'erreur : bandeau au-dessus du composer avec `warning-circle`, le message exact renvoyé par l'API, bouton `Réessayer` et fermeture. Les réglages ne sont jamais perdus.
- [ ] Aucun halo coloré sur les images : le visuel sélectionné ne porte que le liseré blanc 7 % + ambre 14 %.
