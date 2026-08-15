---
{
  "id": "T-0016",
  "titre": "Plein écran : métadonnées, navigation clavier, téléchargement",
  "colonne": "backlog",
  "priorite": "moyenne",
  "charge": "s",
  "tags": ["ui", "overlays"],
  "cree": "2026-08-15",
  "maj": "2026-08-15",
  "plan": "2026-08-15-img-creator-v2-atelier.md",
  "epic": "T-0001"
}
---

## Contexte

Handoff section 10. C'est la vue qui répond à « comment cette image a-t-elle été faite » : le tableau de métadonnées est la contrepartie visible de `GalleryItem`.

## Critères d'acceptation

- [ ] Overlay `z-index: 40`, fond `rgba(6,8,11,.72)` + `blur(30px)`, image centrée rayon 18, panneau 380 px.
- [ ] Barre haute : `← Retour`, position `N / M`, flèches précédent/suivant.
- [ ] Panneau : `PROMPT`, `NÉGATIF`, tableau mono (MODÈLE, GRAINE, FORMAT `1:1 · 2K`, PRESET, LATENCE, COÛT), `PALETTE EXTRAITE` en 3 pastilles 26 px.
- [ ] Pied : `Reprendre ce prompt` (bouton accent, remplit le composer et ferme), `Décliner ×4`, `Télécharger`.
- [ ] `←`/`→` naviguent, `Échap` ferme, le focus revient sur la vignette d'origine à la fermeture.
- [ ] `Télécharger` enregistre l'image dans le format de fichier de sa recette.
