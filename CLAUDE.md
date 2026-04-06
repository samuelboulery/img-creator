# img-creator

Interface multi-API pour la génération d'images. Permet d'envoyer des prompts (positifs, négatifs, image de référence) à Gemini 3.1 Flash Image (alias "Nano Banana 2") et de visualiser/télécharger les résultats.

## Architecture

```
Browser
  └── Next.js App (TypeScript)
        ├── app/page.tsx              ← interface principale
        ├── app/api/generate/route.ts ← proxy sécurisé (clé API côté serveur)
        ├── components/
        │     ├── PromptForm.tsx      ← saisie des prompts + image de référence
        │     └── ImageGallery.tsx   ← affichage + téléchargement des résultats
        └── lib/
              ├── types.ts            ← interfaces partagées
              └── adapters/
                    └── nano-banana-2.ts  ← adapter Gemini 3.1 Flash Image
```

**Tech stack:**
- Frontend: Next.js 15 (App Router) + TypeScript
- UI: Tailwind CSS
- API image: `gemini-3.1-flash-image-preview` via `@google/genai`
- Auth: `GEMINI_API_KEY` (serveur uniquement)

## Key Commands

```bash
# Development
npm run dev          # Lance le serveur sur localhost:3000

# Build & Lint
npm run build        # Build de production
npm run lint         # ESLint
npx tsc --noEmit     # Vérification TypeScript
```

## Code Conventions

- Les adapters vivent dans `lib/adapters/` — un fichier par API (ex: `nano-banana-2.ts`)
- Chaque adapter implémente `GenerateImageAdapter` avec `generate(params: PromptParams)`
- Les clés API **ne transitent jamais côté client** — uniquement dans les route handlers
- Composants React en PascalCase dans `components/`
- Types partagés dans `lib/types.ts`
- Immutabilité stricte — pas de mutation d'objets existants

## Constraints

- Ne jamais mettre `GEMINI_API_KEY` dans une variable `NEXT_PUBLIC_*`
- Ne pas installer de dépendances sans demander
- Toujours passer par `/app/api/` pour les appels API externes

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `GEMINI_API_KEY` | ✅ | Clé API Google AI Studio |

## Notes API Nano Banana 2

- Model ID : `gemini-3.1-flash-image-preview`
- Endpoint : `https://generativelanguage.googleapis.com/v1beta/`
- Les images générées sont retournées en `inlineData` (base64)
- Pour l'édition conversationnelle, les `thoughtSignature` sont obligatoires (gérées auto par le SDK)
- `imageConfig.aspectRatio` : `"1:1"`, `"16:9"`, `"9:16"`, `"4:3"`, `"3:4"`
