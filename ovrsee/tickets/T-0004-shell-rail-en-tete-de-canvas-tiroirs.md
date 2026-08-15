---
{
  "id": "T-0004",
  "titre": "Shell, rail 78 px, en-tête de canvas, mécanique des tiroirs",
  "colonne": "pret",
  "priorite": "haute",
  "charge": "m",
  "tags": [
    "ui",
    "shell"
  ],
  "cree": "2026-08-15",
  "maj": "2026-08-15",
  "plan": "2026-08-15-img-creator-v2-atelier.md",
  "epic": "T-0001"
}
---

## Contexte

Structure porteuse de la v2 (handoff, sections 0 à 2 et 9). `app/page.tsx` devient le shell : une rangée flex rail · tiroir · canvas · panneau, dans un `100vw/100vh` sans scroll, avec des cartes flottantes arrondies plutôt que des colonnes bord à bord. L'état d'interface (`mode`, `selectedId`, `openDrawer`, `panelTab`, `openSections`, `viewerOpen`, `cmdOpen`, `error`) vit dans un `useReducer` dans `lib/atelier/reducer.ts`.

Le rail et l'en-tête sont la navigation de tout le reste : ils précèdent les modes.

## Critères d'acceptation

- [ ] Rail de 78 px : marque 30 px avec point ambre qui respire, quatre boutons 46×46 rayon 14 (`plus-circle`, `clock-counter-clockwise`, `books`, `square-split-horizontal`), espaceur, jauge de consommation 34 px en `conic-gradient`, bouton Réglages.
- [ ] Règle d'état actif appliquée partout : icône en variante `fill` + `oklch(0.82 0.16 72)`, fond `#171C26` ; inactif `regular` + `#848D9E` sur fond transparent.
- [ ] Cliquer un bouton de rail déjà actif referme son tiroir (bascule).
- [ ] En-tête de canvas ≥ 56 px : titre de session non compressible, compteur mono qui se tronque en premier, segmenté Explorer/Itérer/Produire, chip modèle cliquable qui bascule `nano-banana-2` ↔ `gpt-image-2`, chip `⌘K`. L'en-tête wrappe sur deux rangées quand la largeur manque, sans jamais tronquer le titre.
- [ ] Tiroir de 268 px en colonne flex avec en-tête 56 px et bouton `x` ; quand il est ouvert le panneau de paramètres se replie, jamais de superposition sur le composer.
- [ ] Le canvas garde un plancher de 420 px ; ce sont les panneaux qui cèdent.
- [ ] Le reducer et ses actions sont testés en unitaire (bascules de tiroir, changement de mode, sélection).
