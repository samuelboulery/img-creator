<div align="center">

# img-creator

**Un atelier local pour la génération d'images.**
Un prompt, plusieurs modèles côte à côte — pas de compte, pas de base de données, aucun serveur qui garde tes clés.

[![CI](https://github.com/samuelboulery/img-creator/actions/workflows/ci.yml/badge.svg)](https://github.com/samuelboulery/img-creator/actions/workflows/ci.yml)
[![Licence : MIT](https://img.shields.io/badge/License-MIT-f5a623.svg)](LICENSE)
[![Next.js 16](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org)
[![TypeScript strict](https://img.shields.io/badge/TypeScript-strict-3178c6?logo=typescript&logoColor=white)](tsconfig.json)

[Démarrage](#démarrage) · [Pourquoi](#pourquoi) · [Modèles](#modèles) · [Fonctionnement](#fonctionnement) · [English](README.md)

<img src="docs/screenshot.png" alt="L'atelier img-creator : rail d'outils, canvas, composer et panneau de réglages" width="900">

</div>

---

## Pourquoi

La plupart des interfaces de génération d'images cachent la requête. Tu bouges un curseur, quelque chose se passe, et tu n'apprends jamais si le modèle a reçu la valeur — ou l'a silencieusement jetée.

img-creator fait l'inverse. **L'onglet JSON affiche le corps réel de la requête**, construit par la fonction pure que l'adapter envoie. Les paramètres qu'un modèle ne supporte pas sont élagués du payload *et* marqués `ignoré ici` dans le panneau. Ce que tu vois est ce qui quitte ton navigateur.

<div align="center">
<img src="docs/screenshot-json.png" alt="L'onglet JSON montrant le corps exact de la requête et les paramètres ignorés par ce modèle" width="900">
</div>

## Fonctionnalités

- **Deux modèles, un prompt** — `nano-banana-2` (Gemini 3.1 Flash Image) et `gpt-image-2`, avec un mode A/B qui lance les deux en parallèle sur une entrée identique.
- **Quatre modes de travail** — *Explorer* (ouvrir large), *Itérer* (affiner un résultat), *Produire* (planche contact), *Comparer* (A/B deux modèles).
- **Payloads honnêtes** — chaque adapter expose un `buildPayload()` pur. L'inspecteur affiche cet objet exact, jamais une reconstitution.
- **Capacités par modèle** — une source unique (`lib/adapters/capabilities.ts`) pilote à la fois l'élagage du payload et les badges « ignoré ici ».
- **Recettes** — enregistre références, poids, suffixe de prompt, négatif et réglages en preset réutilisable. Export et import en `.json`.
- **Références de sujet et de style** — glisse des images, dose de *inspiration* à *reproduction*, verrouille l'identité, transfère la palette.
- **Enrichissement de prompt** — réécris un prompt via un modèle de texte avec *ta* clé. Aucune clé serveur n'est utilisée pour ça.
- **Fond ambiant** — la palette dominante du dernier résultat teinte la pièce autour du canvas. Jamais les images elles-mêmes.
- **Estimation de coût locale** — un tarif par image éditable ; l'app n'interroge aucune grille tarifaire.
- **Palette de commandes** — <kbd>⌘K</kbd> / <kbd>Ctrl+K</kbd>, et <kbd>⏎</kbd> pour générer.

## Démarrage

```bash
git clone https://github.com/samuelboulery/img-creator.git
cd img-creator
pnpm install
pnpm dev
```

Ouvre <http://localhost:3000>, colle une clé API dans l'écran d'accueil, et tu es dans l'atelier.

> **pnpm exclusivement.** `npm`, `yarn` et `bun` ne sont pas supportés — le lockfile et le champ `packageManager` épinglent pnpm.

### Obtenir les clés

| Modèle | Clé chez |
|---|---|
| `nano-banana-2` | [Google AI Studio](https://aistudio.google.com/apikey) |
| `gpt-image-2` | [Plateforme OpenAI](https://platform.openai.com/api-keys) |

Les clés sont saisies par toi, gardées dans `localStorage`, et transmises en en-tête `x-api-key` aux routes API de l'app. Elles ne sont jamais bundlées, jamais journalisées, jamais persistées côté serveur.

### Repli serveur optionnel

Pour une instance de démo partagée, tu peux fournir des clés de repli — copie `.env.local.example` vers `.env.local` :

```bash
GEMINI_API_KEY=...   # repli optionnel pour nano-banana-2
OPENAI_API_KEY=...   # repli optionnel pour gpt-image-2
```

L'enrichissement de prompt n'a délibérément **aucun** repli serveur : il consomme toujours la clé texte de l'utilisateur, ou reste inactif.

## Modèles

| Capacité | `nano-banana-2` | `gpt-image-2` |
|---|:---:|:---:|
| Format | ✅ | ✅ `size` |
| Résolution | ✅ `imageConfig.imageSize` | ✅ qualité dérivée (1K→low, 2K→medium, 4K→high) |
| Variantes par envoi | ✅ `candidateCount` | ✅ `n` |
| Graine | ✅ | — |
| Type de fichier / transparence / compression | — | ✅ |
| `personGeneration` | ✅ | — |
| Modération | — | ✅ |
| Références image | ✅ `inlineData` | ✅ |
| Guidage (CFG), étapes, échantillonneur | — | — |

Aucune des deux API n'expose de champ dédié au négatif : il est donc **fusionné en fin de prompt** après déduplication avec le négatif de la recette. Le panneau le dit, et l'onglet JSON montre le résultat.

## Fonctionnement

```
app/
  page.tsx                 shell : rail · tiroir · canvas · panneau
  api/generate/route.ts    proxy image — valide, limite le débit, choisit l'adapter
  api/enrich/route.ts      réécriture de prompt avec la clé texte de l'utilisateur
components/atelier/
  modes/     Explore · Iterate · Produce · Compare
  panel/     SettingsPanel · RecipeTab · JsonTab · ReferenceGrid · RawParams
  drawers/   History · Recipes · Enrich · Settings
  overlays/  Viewer · CommandPalette · Onboarding
lib/
  adapters/  capabilities · nano-banana-2 · gpt-image-2 · shared · payload
  atelier/   use-atelier (état) · reducer · storage · recipes · palette · diff · cost
```

Ajouter un modèle, c'est un fichier dans `lib/adapters/` implémentant `GenerateImageAdapter`, plus une entrée dans `capabilities.ts`. L'UI, l'élagage du payload et les badges « ignoré ici » suivent tout seuls.

**Les règles que le code s'impose :**

- Aucun appel API ne part d'un composant React — tout passe par `app/api/`.
- Aucun secret dans une variable `NEXT_PUBLIC_*`, jamais.
- TypeScript strict, pas de `any`, aucune mutation d'état.
- Les raccourcis assumés portent un commentaire `ponytail:` qui nomme leur plafond.

### Vie privée et stockage

Rien n'est stocké hors de ton navigateur. `localStorage` contient :

| Clé | Contenu |
|---|---|
| `gemini_api_key` · `openai_api_key` · `text_api_key` | tes clés |
| `imgc.recipes` | presets enregistrés |
| `imgc.session` | session courante, plafonnée, images en base64 |
| `imgc.params` · `imgc.prefs` · `imgc.onboarded` | réglages et état d'interface |

Les routes API appliquent une limite de débit naïve en mémoire (10 requêtes/minute par IP). Elle se réinitialise au redémarrage et ne survit pas à plusieurs instances — suffisant pour un déploiement auto-hébergé, pas pour un service public.

## Scripts

```bash
pnpm dev         # serveur de dev sur :3000
pnpm build       # build de production
pnpm lint        # ESLint
pnpm typecheck   # tsc --noEmit
pnpm test        # Vitest — logique pure (adapters, reducer, storage, recettes…)
pnpm test:e2e    # Playwright — parcours critique
```

## Contribuer

Issues et pull requests bienvenues. Avant d'ouvrir une PR, lance `pnpm lint && pnpm typecheck && pnpm test`.

Les textes d'interface et les commentaires sont en français ; les identifiants et le README principal sont en anglais. Le nouveau code suit la même répartition.

## Licence

[MIT](LICENSE) © Samuel Boulery
