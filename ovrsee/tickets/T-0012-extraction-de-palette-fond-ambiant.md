---
{
  "id": "T-0012",
  "titre": "Extraction de palette + fond ambiant réactif",
  "colonne": "backlog",
  "priorite": "moyenne",
  "charge": "m",
  "tags": ["ui", "a11y"],
  "cree": "2026-08-15",
  "maj": "2026-08-15",
  "plan": "2026-08-15-img-creator-v2-atelier.md",
  "epic": "T-0001"
}
---

## Contexte

La pièce la plus spécifique du design (handoff, section *Le fond réactif*) : le fond de l'app reflète les couleurs de l'image sélectionnée, en halo très diffus. Les images, elles, ne portent aucun effet coloré — c'est la règle qui protège la lecture des résultats.

Coût nul côté réseau : l'extraction se fait dans un `<canvas>` local à la réception de l'image.

## Critères d'acceptation

- [ ] `lib/atelier/palette.ts` : image base64 → `<canvas>` ~16×16 → quantification par buckets de teinte (ou k-means k=3) → 3 couleurs triées par population, saturation < 0,08 écartée.
- [ ] `palette: [string, string, string]` stockée sur chaque `GalleryItem`.
- [ ] `AmbientBackground` empile une couche par item avec le mélange de trois `radial-gradient` du handoff, `blur(96px) saturate(1.25)`, `drift 34s`.
- [ ] Seule la couche de l'image sélectionnée est visible (`opacity: .35`) ; changer de sélection fait un fondu de 900 ms.
- [ ] Voile `linear-gradient` par-dessus, couches en `pointer-events: none`.
- [ ] `prefers-reduced-motion: reduce` coupe `drift` et raccourcit la transition.
- [ ] L'interrupteur `Fond réactif` des réglages désactive l'ensemble.
- [ ] Test unitaire de l'extraction sur une image synthétique de couleurs connues.
