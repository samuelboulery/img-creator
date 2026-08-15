---
{
  "id": "T-0019",
  "titre": "Responsive < 1100 px, accessibilité, E2E du parcours critique",
  "colonne": "fait",
  "priorite": "moyenne",
  "charge": "m",
  "tags": ["a11y", "test"],
  "cree": "2026-08-15",
  "maj": "2026-08-15",
  "plan": "2026-08-15-img-creator-v2-atelier.md",
  "epic": "T-0001"
}
---

## Contexte

Ticket de clôture de l'epic. Le handoff décrit un comportement responsive précis (le canvas a un plancher, ce sont les panneaux qui cèdent) et une interface entièrement pilotable au clavier. L'E2E fige le parcours critique pour que la suite du projet ne le casse pas en silence.

## Critères d'acceptation

- [ ] Sous ~1100 px, le panneau de paramètres se replie derrière un bouton ; le canvas garde son plancher de 420 px.
- [ ] L'en-tête de canvas et les boutons de l'image wrappent au lieu de tronquer.
- [ ] Navigation clavier complète : rail, segmentés, panneau, composer, overlays ; anneau de focus visible partout ; pas de piège de focus hors overlay.
- [ ] Les boutons à icône seule portent un `aria-label` ; les interrupteurs exposent leur état.
- [ ] `prefers-reduced-motion: reduce` : plus d'animation `drift`, transitions raccourcies.
- [ ] E2E Playwright, API mockée : sans clé → écran d'accueil ; clé saisie → atelier ; génération → la vignette apparaît et le fond change à la sélection ; `⌘K` ouvre la palette ; `Échap` ferme ; rechargement → session restaurée.
- [ ] `pnpm test`, `pnpm test:e2e`, `pnpm lint` et `pnpm exec tsc --noEmit` verts.
