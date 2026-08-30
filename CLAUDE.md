# img-creator — Atelier

Interface multi-API pour la génération d'images. Le prompt (positif, négatif, références de sujet et de style) part vers `gemini-3.1-flash-image-preview` (« Nano Banana 2 ») ou `gpt-image-2`, et les résultats se travaillent dans trois modes plus une comparaison A/B.

**Aucune base de données, aucun compte.** Tout ce qui persiste — clés, réglages, session, presets — vit dans `localStorage`. Les presets s'exportent en `.json`.

## Architecture

```
app/
  layout.tsx                  ← Space Grotesk + IBM Plex Mono (next/font)
  globals.css                 ← tokens de l'atelier (@theme, Tailwind v4)
  page.tsx                    ← shell : rail · tiroir · canvas · panneau
  api/generate/route.ts       ← proxy image, renvoie un tableau d'images
  api/enrich/route.ts         ← enrichissement de prompt, clé de l'utilisateur
components/atelier/
  Rail · CanvasHeader · Composer · Drawer · ErrorBanner · AmbientBackground
  modes/    Explore · Iterate · Produce · Compare
  panel/    SettingsPanel · RecipeTab · JsonTab · Section · Slider · Switch · Choice
            ReferenceGrid · RawParams
  drawers/  HistoryDrawer · RecipesDrawer · EnrichDrawer · SettingsDrawer
  overlays/ Viewer · CommandPalette · Onboarding
lib/
  types.ts                    ← GenerationParams, Recipe, GalleryItem, GenerationRequest…
  adapters/
    capabilities.ts           ← ce que chaque modèle supporte / ignore
    nano-banana-2.ts          ← buildNanoBanana2Payload + generate
    gpt-image-2.ts            ← buildGptImage2Payload + generate
    shared.ts · payload.ts    ← négatif fusionné, graine, paramètres bruts
  atelier/
    use-atelier.ts            ← état complet de l'atelier (hook)
    reducer.ts storage.ts params.ts recipes.ts palette.ts diff.ts cost.ts
    export.ts image-file.ts focus-trap.ts
```

**Tech stack :** Next.js 16 (App Router) · React 19 · TypeScript strict · Tailwind CSS 4 (config CSS-first) · Phosphor Icons · Vitest + Playwright.

## Key Commands

```bash
pnpm dev              # serveur de dev sur localhost:3000
pnpm build            # build de production
pnpm lint             # ESLint
pnpm exec tsc --noEmit# vérification TypeScript
pnpm test             # Vitest (logique pure)
pnpm test:e2e         # Playwright (parcours critique)
```

`pnpm` exclusivement — pas de `npm`, `yarn` ni `bun`.

## Code Conventions

- Un adapter par API dans `lib/adapters/`, implémentant `GenerateImageAdapter`.
- **Chaque adapter expose un `buildPayload` pur** : `generate()` l'envoie, l'onglet JSON l'affiche. Le panneau JSON montre le corps réel, jamais une reconstitution.
- Les capacités par modèle vivent uniquement dans `lib/adapters/capabilities.ts` : elles pilotent à la fois l'élagage du payload et les badges `ignoré ici`.
- Les clés API ne transitent jamais côté client au sens « bundle » : elles sont saisies par l'utilisateur, gardées dans `localStorage` et envoyées en en-tête `x-api-key` vers `app/api/`.
- Composants React en PascalCase, types partagés dans `lib/types.ts`.
- TypeScript strict, pas de `any`. Immutabilité : aucune mutation d'objet d'état.
- Les raccourcis assumés portent un commentaire `ponytail:` qui nomme leur plafond.

## Constraints

- Jamais de clé dans une variable `NEXT_PUBLIC_*`.
- Pas de clé serveur par défaut pour `/api/enrich` : l'enrichissement consomme la clé de l'utilisateur.
- Ne pas installer de dépendance sans demander.
- Tout appel externe passe par `app/api/`.
- Aucun effet coloré sur les images : le fond ambiant porte les couleurs, pas les visuels.

## Environment Variables

| Variable | Requis | Description |
|---|---|---|
| `GEMINI_API_KEY` | optionnel | Repli serveur pour nano-banana-2 si l'utilisateur n'a pas saisi de clé |
| `OPENAI_API_KEY` | optionnel | Repli serveur pour gpt-image-2 |
| `TRUSTED_PROXY_COUNT` | optionnel | Nombre de proxys de confiance devant l'app (défaut `0`). Tant qu'il vaut `0`, `X-Forwarded-For` est ignoré : un client peut le forger et se donner un quota neuf à chaque requête. |

## Notes API

**nano-banana-2** (`gemini-3.1-flash-image-preview`) — supporte format, résolution (`imageConfig.imageSize`), variantes (`candidateCount`), graine, `personGeneration` et les références en `inlineData`. Ignore guidage, étapes, échantillonneur, type de fichier, fond transparent, compression, modération.

**gpt-image-2** — supporte format (`size`), qualité (dérivée de la résolution : 1K `low`, 2K `medium`, 4K `high`), variantes (`n`), type de fichier, fond, compression et modération. Ignore graine, guidage, étapes, échantillonneur, `personGeneration`.

Le négatif n'a de champ dédié chez aucun des deux : il est fusionné en fin de prompt après déduplication avec le négatif du preset.

## Stockage local

`gemini_api_key` · `openai_api_key` · `text_api_key` · `imgc.recipes` · `imgc.session` (plafonnée, images en base64) · `imgc.params` · `imgc.prefs` · `imgc.onboarded`.
