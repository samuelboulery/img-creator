---
{
  "id": "T-0002",
  "titre": "Socle visuel : tokens, polices, icônes Phosphor",
  "colonne": "pret",
  "priorite": "haute",
  "charge": "s",
  "tags": ["ui", "socle"],
  "cree": "2026-08-15",
  "maj": "2026-08-15",
  "plan": "2026-08-15-img-creator-v2-atelier.md",
  "epic": "T-0001"
}
---

## Contexte

`app/globals.css` porte encore le thème du scaffold Next (blanc/noir, Arial) et `app/layout.tsx` charge Geist. Le handoff (section *Design tokens*) fixe une palette graphite froid, un accent ambre en oklch, deux polices et une échelle de rayons précise. Tous les tickets suivants s'appuient dessus — c'est le premier à passer.

Tailwind est en v4 : la configuration est CSS-first via `@theme` dans `app/globals.css`, il n'y a pas de `tailwind.config.js` à créer.

## Critères d'acceptation

- [ ] `app/globals.css` déclare en `@theme` les couleurs du handoff : fonds et surfaces (`#08090D`, `#0D0F15`, `#111520`, `#141821`, `#1A1F2A`, `#1F2531`, `#222834`, `#1D2330`, `#1C222D`, `#181D26`, `#28303D`, `#0B0E14`), les huit tiers de texte, l'accent `oklch(0.72 0.21 72)` et ses variantes, et l'état d'erreur.
- [ ] Les keyframes `shimmer`, `breathe` et `drift` sont définies, avec les durées du handoff.
- [ ] `app/layout.tsx` charge Space Grotesk (400/500/600) et IBM Plex Mono (400/500) via `next/font/google` ; Geist est retiré ; `<html lang="fr">`.
- [ ] `@phosphor-icons/react` est installé avec `pnpm add` et un import de test rend un glyphe en variantes `regular` et `fill`.
- [ ] Le fond de page est `#08090D` et la police par défaut Space Grotesk.
