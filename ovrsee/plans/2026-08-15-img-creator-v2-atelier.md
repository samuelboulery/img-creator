---
{
  "status": "open",
  "title": "img-creator v2 — « Atelier »",
  "opened": "2026-08-15",
  "closed": null,
  "commits": [
    {
      "sha": "98d577f",
      "date": "2026-08-15",
      "files": [
        ".env.local.example",
        "app/api/generate/route.ts",
        "app/page.tsx",
        "components/ApiKeyInput.tsx",
        "components/PromptForm.tsx",
        "lib/adapters/gpt-image-2.ts",
        "lib/adapters/nano-banana-2.ts",
        "lib/types.ts"
      ]
    },
    {
      "sha": "308e94d",
      "date": "2026-08-15",
      "files": [
        "ovrsee.config.json"
      ]
    },
    {
      "sha": "a41a8bc",
      "date": "2026-08-15",
      "files": [
        ".gitignore",
        "app/globals.css",
        "app/layout.tsx",
        "e2e/smoke.spec.ts",
        "package.json",
        "playwright.config.ts",
        "pnpm-lock.yaml",
        "tests/setup.test.tsx",
        "tests/setup.ts",
        "vitest.config.ts"
      ]
    },
    {
      "sha": "5ca4cca",
      "date": "2026-08-15",
      "files": [
        "app/globals.css",
        "app/page.tsx",
        "components/atelier/CanvasHeader.tsx",
        "components/atelier/Composer.tsx",
        "components/atelier/Drawer.tsx",
        "components/atelier/ErrorBanner.tsx",
        "components/atelier/Rail.tsx",
        "components/atelier/modes/Explore.tsx",
        "components/atelier/panel/SettingsPanel.tsx",
        "lib/atelier/cost.ts",
        "lib/atelier/reducer.ts",
        "lib/types.ts",
        "tests/atelier/reducer.test.ts"
      ]
    },
    {
      "sha": "835b7d5",
      "date": "2026-08-15",
      "files": [
        "app/api/generate/route.ts",
        "app/page.tsx",
        "components/ApiKeyInput.tsx",
        "components/ImageGallery.tsx",
        "components/PromptForm.tsx",
        "components/atelier/panel/Choice.tsx",
        "components/atelier/panel/JsonTab.tsx",
        "components/atelier/panel/RawParams.tsx",
        "components/atelier/panel/RecipeTab.tsx",
        "components/atelier/panel/ReferenceGrid.tsx",
        "components/atelier/panel/Section.tsx",
        "components/atelier/panel/Slider.tsx",
        "components/atelier/panel/Switch.tsx",
        "lib/adapters/capabilities.ts",
        "lib/adapters/gpt-image-2.ts",
        "lib/adapters/nano-banana-2.ts",
        "lib/adapters/payload.ts",
        "lib/adapters/shared.ts",
        "lib/atelier/image-file.ts",
        "lib/atelier/params.ts",
        "lib/types.ts",
        "tests/adapters/payload.test.ts"
      ]
    },
    {
      "sha": "7aa8a9c",
      "date": "2026-08-15",
      "files": [
        "app/page.tsx",
        "components/atelier/drawers/SettingsDrawer.tsx",
        "lib/atelier/storage.ts",
        "tests/atelier/storage.test.ts"
      ]
    },
    {
      "sha": "991e306",
      "date": "2026-08-15",
      "files": [
        "app/page.tsx",
        "components/atelier/drawers/RecipesDrawer.tsx",
        "lib/atelier/image-file.ts",
        "lib/atelier/recipes.ts",
        "tests/atelier/recipes.test.ts"
      ]
    },
    {
      "sha": "8aa629a",
      "date": "2026-08-15",
      "files": [
        "app/page.tsx",
        "components/atelier/AmbientBackground.tsx",
        "lib/atelier/palette.ts",
        "tests/atelier/palette.test.ts"
      ]
    },
    {
      "sha": "35cc4a6",
      "date": "2026-08-15",
      "files": [
        "app/page.tsx",
        "components/atelier/drawers/HistoryDrawer.tsx",
        "components/atelier/drawers/SettingsDrawer.tsx",
        "components/atelier/modes/Explore.tsx",
        "components/atelier/modes/Iterate.tsx",
        "components/atelier/panel/RecipeTab.tsx",
        "lib/atelier/diff.ts",
        "lib/atelier/params.ts",
        "lib/atelier/use-atelier.ts",
        "lib/types.ts",
        "tests/atelier/diff.test.ts"
      ]
    },
    {
      "sha": "414bee7",
      "date": "2026-08-15",
      "files": [
        "app/page.tsx",
        "components/atelier/modes/Compare.tsx",
        "components/atelier/modes/Produce.tsx",
        "lib/atelier/export.ts",
        "lib/atelier/reducer.ts",
        "lib/atelier/use-atelier.ts"
      ]
    },
    {
      "sha": "7260c10",
      "date": "2026-08-15",
      "files": [
        "app/page.tsx",
        "components/atelier/overlays/CommandPalette.tsx",
        "components/atelier/overlays/Onboarding.tsx",
        "components/atelier/overlays/Viewer.tsx",
        "lib/atelier/export.ts"
      ]
    }
  ]
}
---

# img-creator v2 — « Atelier »

## Contexte

L'interface actuelle est un formulaire de 380 px à gauche + une grille de résultats à droite (`app/page.tsx`, `components/PromptForm.tsx`, `components/ImageGallery.tsx`). Elle envoie un prompt, reçoit **une** image, ne garde rien, et n'expose qu'une fraction des paramètres des deux modèles.

Le handoff `/Users/sam/Downloads/design_handoff_img_creator_v2/` (README + `Atelier.dc.html` comme référence principale) spécifie une refonte complète, haute fidélité : image au centre, rail d'outils 78 px, panneau de paramètres 320 px, prompt en barre de commande, trois modes de travail (Explorer / Itérer / Produire) + A/B, presets de recette, inspecteur JSON du corps de requête réel, fond ambiant coloré par l'image sélectionnée, palette ⌘K, écran d'accueil pour les clés.

Contraintes structurantes du handoff, à ne pas négocier :
- **Aucun serveur de données.** Tout persiste dans `localStorage`. Les presets s'exportent en `.json`.
- **Les clés sont celles de l'utilisateur**, y compris pour l'enrichissement de prompt.
- **Aucun effet coloré sur les images** — le halo vit dans le fond, pas sur les visuels.
- Les `.dc.html` sont des **références visuelles**, pas du code à copier : on reprend les valeurs (couleurs, tailles, copies, comportements), pas les styles inline ni `support.js`.

Décisions prises avec l'utilisateur : périmètre = les 6 phases complètes ; dépendances autorisées = `@phosphor-icons/react` + polices via `next/font/google` ; tests = Vitest (logique pure) + Playwright (parcours critique).

Résultat attendu : les six phases livrées, découpées en tickets ovrsee (1 epic + 18 tickets) dans `ovrsee/tickets/`, colonnes lues dans `ovrsee/board.json`.

## État du dépôt à respecter

- Next.js 16.2.2 / React 19.2.4 / Tailwind **v4** (config CSS-first dans `app/globals.css`, pas de `tailwind.config.js`).
- `lib/types.ts` — `PromptParams`, `ReferenceImage`, `ExtraParam`, `GenerateImageAdapter`, `GenerateResponse`. À **étendre**, pas à remplacer.
- `lib/adapters/nano-banana-2.ts` et `lib/adapters/gpt-image-2.ts` — déjà l'interface `generate(params, apiKeyOverride)`. Réutiliser `weightInstruction()`, `buildPrompt()`, `ASPECT_RATIO_TO_SIZE`, `referenceToFile()`.
- `lib/rate-limit.ts` — `checkRateLimit(ip)` déjà branché dans la route, à conserver.
- `app/api/generate/route.ts` — validation + mapping d'erreurs déjà en place, à étendre (multi-images).
- `components/PromptForm.tsx` — `readImageFile()`, `ImageGrid`, `ExtraParamsEditor` sont réutilisables tels quels dans le nouveau panneau ; le reste du composant disparaît.
- Travail non commité en cours (adapter `gpt-image-2`, rate-limit, sélecteur de modèle) : **commiter avant de démarrer**, pour que le diff v2 soit lisible.

## Approche

### Architecture cible

```
app/
  layout.tsx                 ← Space Grotesk + IBM Plex Mono (next/font)
  globals.css                ← @theme : tokens couleur/rayon/typo du handoff
  page.tsx                   ← shell, useReducer d'état d'atelier
  api/generate/route.ts      ← retourne un tableau d'images (variantes)
  api/enrich/route.ts        ← nouveau : enrichissement de prompt, clé utilisateur
components/
  atelier/Shell.tsx Rail.tsx CanvasHeader.tsx Composer.tsx
  atelier/modes/Explore.tsx Iterate.tsx Produce.tsx Compare.tsx
  atelier/panel/SettingsPanel.tsx RecipeTab.tsx JsonTab.tsx Section.tsx Slider.tsx Switch.tsx
  atelier/drawers/History.tsx Recipes.tsx Enrich.tsx Settings.tsx
  atelier/overlays/CommandPalette.tsx Onboarding.tsx Viewer.tsx
  atelier/AmbientBackground.tsx
lib/
  types.ts                   ← + GenerationParams, Recipe, GalleryItem, Mode
  atelier/reducer.ts         ← état d'interface (mode, sélection, tiroirs…)
  atelier/storage.ts         ← lecture/écriture localStorage typée
  atelier/palette.ts         ← extraction 3 couleurs dominantes (canvas 16×16)
  atelier/cost.ts            ← estimation locale de coût
  adapters/capabilities.ts   ← ce que chaque modèle supporte / ignore
  adapters/*.ts              ← + buildPayload() pur exporté, réutilisé par l'onglet JSON
```

**Point de conception central :** chaque adapter exporte une fonction **pure** `buildPayload(params): object` que `generate()` envoie et que l'onglet JSON affiche. Le panneau JSON n'est donc pas une reconstitution — c'est le corps réel. Les capacités par modèle vivent dans `lib/adapters/capabilities.ts` (une table `Record<AdapterId, Set<keyof GenerationParams>>`) et alimentent les badges `ignoré ici` **et** l'élagage du payload, au même endroit.

**Fond réactif :** `lib/atelier/palette.ts` dessine l'image reçue dans un `<canvas>` 16×16, quantifie par buckets de teinte, écarte la saturation < 0,08, garde 3 couleurs triées par population. Stocké sur l'item (`palette: [string, string, string]`). `AmbientBackground` empile une couche par item, seule celle de la sélection à `opacity .35`, transition 900 ms. `prefers-reduced-motion` coupe `drift` et raccourcit la transition.

**Multi-variantes :** `GenerationResult` reste tel quel, mais la route renvoie `data: GenerationResult[]` — les adapters bouclent (`candidateCount` côté Gemini, `n` côté OpenAI) et retournent un tableau. Changement de contrat à propager dans `GenerateResponse`.

**Sécurité inchangée :** aucune clé en `NEXT_PUBLIC_*`, tout appel externe passe par `app/api/`, y compris l'enrichissement — la clé texte transite en en-tête `x-api-key` comme les autres, jamais en variable de build. `checkRateLimit` s'applique aussi à `/api/enrich`.

### Découpage en tickets ovrsee

Colonnes lues dans `ovrsee/board.json` : `backlog · a-specifier · pret · en-cours (wip 3) · revue · fait`. Aucun ticket existant → numérotation à partir de `T-0001`. Tous les tickets portent `"epic": "T-0001"` et `plan` = ce fichier de plan une fois capturé dans `ovrsee/plans/`.

| Id | Titre | Colonne | Prio |
|---|---|---|---|
| T-0001 | **[epic]** img-creator v2 — Atelier | backlog | haute |
| T-0002 | Socle visuel : tokens, polices, icônes Phosphor | pret | haute |
| T-0003 | Infra de test : Vitest + Playwright | pret | moyenne |
| T-0004 | Shell, rail 78 px, en-tête de canvas, mécanique des tiroirs | pret | haute |
| T-0005 | Canvas Explorer : hero, vignettes, tuile en cours, états vide et erreur | pret | haute |
| T-0006 | Composer : prompt auto-grow, négatif fusionné, chips, coût, Générer | pret | haute |
| T-0007 | GenerationParams complet + panneau Recette (5 sections) | pret | haute |
| T-0008 | Adapters v2 : buildPayload pur, capacités par modèle, variantes, graine | pret | haute |
| T-0009 | Onglet JSON : corps réel, encart « ignoré par ce modèle », copier | pret | haute |
| T-0010 | Persistance localStorage + tiroir Réglages et clés | backlog | haute |
| T-0011 | Bibliothèque de recettes + export/import `.json` | backlog | moyenne |
| T-0012 | Extraction de palette + fond ambiant réactif | backlog | moyenne |
| T-0013 | Historique de session (arborescence) + mode Itérer | backlog | moyenne |
| T-0014 | Mode Produire : planche contact + export planche | backlog | moyenne |
| T-0015 | Mode A/B : deux modèles en parallèle | backlog | moyenne |
| T-0016 | Plein écran : métadonnées, navigation clavier, téléchargement | backlog | moyenne |
| T-0017 | Palette ⌘K + écran d'accueil des clés | backlog | moyenne |
| T-0018 | Enrichissement de prompt (`/api/enrich`, clé utilisateur) | backlog | basse |
| T-0019 | Responsive < 1100 px, accessibilité, E2E du parcours critique | backlog | moyenne |

Chaque ticket est écrit avec **Contexte** + **Critères d'acceptation** cochables, tirés des sections correspondantes du handoff (numéros de section cités dans le corps du ticket).

### Ordre d'exécution

Suit l'ordre du handoff, en insérant l'infra de test au début :

1. **T-0002, T-0003** — socle (tokens Tailwind `@theme`, polices, icônes, Vitest/Playwright).
2. **T-0004 → T-0006** — coquille visuelle branchée sur `/api/generate` **inchangé** : gain immédiat, risque faible.
3. **T-0007 → T-0009** — paramètres, adapters, JSON. Le lot le plus technique ; TDD sur `buildPayload` et les capacités.
4. **T-0010, T-0011** — persistance et presets.
5. **T-0012** — palette et fond réactif.
6. **T-0013 → T-0016** — modes Itérer, Produire, A/B, plein écran.
7. **T-0017 → T-0019** — ⌘K, accueil, responsive, a11y, E2E.

Discipline par ticket : un ticket = un lot de commits `feat:`/`refactor:` en français ; passage `pret → en-cours` automatique via les hooks ovrsee au premier edit sous plan actif.

### Dépendances à installer (approuvées)

```bash
pnpm add @phosphor-icons/react
pnpm add -D vitest @vitejs/plugin-react @testing-library/react @testing-library/jest-dom jsdom @playwright/test
```

Polices : `next/font/google` (`Space_Grotesk`, `IBM_Plex_Mono`), aucun paquet. Geist est retiré de `app/layout.tsx`.

## Fichiers critiques

- `app/globals.css` — remplacer le thème de scaffold par les tokens du handoff (`@theme` Tailwind v4).
- `app/layout.tsx` — polices.
- `app/page.tsx` — devient le shell + `useReducer`.
- `lib/types.ts` — ajout de `GenerationParams`, `Recipe`, `GalleryItem`, `Mode` (formes exactes dans le handoff, section *State management*).
- `lib/adapters/nano-banana-2.ts`, `lib/adapters/gpt-image-2.ts` — extraction de `buildPayload()`, ajout des paramètres supportés.
- `app/api/generate/route.ts` — réponse multi-images.
- `components/PromptForm.tsx`, `components/ApiKeyInput.tsx`, `components/ImageGallery.tsx` — démantelés ; `readImageFile`, `ImageGrid`, `ExtraParamsEditor` migrent vers `components/atelier/`.

## Vérification

Par ticket :
- `pnpm exec tsc --noEmit` et `pnpm lint` verts (règle projet : pas de `any`).
- `pnpm test` (Vitest) : `buildPayload` par modèle vs. les JSON de référence du handoff (section *Mapping API*), déduplication du négatif, mapping résolution → qualité OpenAI, mapping ratio → `size`, extraction de palette sur une image de test.
- Visuel : `pnpm dev`, comparer l'écran à `Atelier.dc.html` ouvert côte à côte (couleurs, rayons, espacements, copies).

En fin de parcours :
- Playwright : lancer l'app sans clé → écran d'accueil ; saisir une clé → atelier ; générer (API mockée) → la vignette apparaît, le fond change à la sélection ; `⌘K` ouvre la palette ; `Échap` ferme.
- Test manuel réel avec les vraies clés : une génération par modèle, bascule de modèle avec l'onglet JSON ouvert (le corps se recompose, les badges `ignoré ici` suivent), un export `.json` de recette puis réimport.
- Rechargement de la page : session, paramètres et presets sont restaurés depuis `localStorage`.
- `prefers-reduced-motion: reduce` : plus d'animation `drift`.
