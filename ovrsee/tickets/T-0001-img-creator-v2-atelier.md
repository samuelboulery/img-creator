---
{
  "id": "T-0001",
  "type": "epic",
  "titre": "img-creator v2 — Atelier",
  "colonne": "fait",
  "priorite": "haute",
  "charge": "xl",
  "tags": ["v2", "refonte"],
  "cree": "2026-08-15",
  "maj": "2026-08-15",
  "plan": "2026-08-15-img-creator-v2-atelier.md"
}
---

## Contexte

Refonte complète de l'interface décrite par le handoff `~/Downloads/design_handoff_img_creator_v2/` (README + `Atelier.dc.html` comme référence principale). L'interface actuelle — formulaire 380 px à gauche, grille à droite — envoie un prompt, reçoit une image, ne garde rien et n'expose qu'une fraction des paramètres des deux modèles.

La v2 met l'image au centre : rail d'outils 78 px, canvas plein, panneau de paramètres 320 px, prompt en barre de commande. Elle ajoute trois modes de travail (Explorer / Itérer / Produire) plus un mode A/B, les presets de recette, l'inspecteur JSON du corps de requête réel, le fond ambiant coloré par l'image sélectionnée, la palette ⌘K, l'écran d'accueil des clés.

Contraintes non négociables : aucune base de données (tout en `localStorage`), les clés sont celles de l'utilisateur, aucun effet coloré sur les images elles-mêmes.

Cet epic regroupe T-0002 à T-0019.

## Critères d'acceptation

- [ ] Les six phases du handoff sont livrées (socle, shell, paramètres+JSON, persistance, fond réactif, modes et overlays).
- [ ] `pnpm exec tsc --noEmit` et `pnpm lint` verts, aucun `any` ajouté.
- [ ] Aucune clé API n'est exposée côté client ni en `NEXT_PUBLIC_*` ; tout appel externe passe par `app/api/`.
- [ ] L'écran rendu correspond à `Atelier.dc.html` (couleurs, rayons, espacements, copies).
