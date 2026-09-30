# Obskura — refonte d'img-creator : plan d'implémentation

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** remplacer l'« Atelier » (4 modes, rail, panneau de 38 contrôles, fond ambiant) par l'espace unique d'Obskura : une scène qui montre l'image entière, une bande de session, un composeur, et un inspecteur qui ne rend que ce que le modèle choisi lit.

**Architecture:** la couche capacités devient descriptive (`MODELS`, un `ModelSpec` par modèle) et pilote à la fois le payload, la validation et l'inspecteur. L'interface est reconstruite sur des jetons papier/encre (clair et sombre) et un dictionnaire FR/EN typé ; l'état d'interface passe d'un `mode` à une sélection (`selectedIds`), dont l'inspecteur et la scène dérivent leur contenu.

**Tech Stack:** Next.js 16 App Router · React 19 · TypeScript strict · Tailwind CSS 4 (`@theme`) · `@phosphor-icons/react` (Regular) · Vitest · Playwright. Aucune dépendance ajoutée.

**Spec:** plan approuvé `/Users/sam/.claude/plans/fait-un-audit-complet-polymorphic-valiant.md` (parties 2 et 3) + maquettes du canvas https://claude.ai/artifact/WATM5Gsc27mVjhBPAvo9u1 (générateur : `scratchpad/gen2.py`, qui fixe les mesures et les libellés).

## Global Constraints

- `pnpm` exclusivement ; aucune dépendance ajoutée (pas de zip, pas d'i18n, pas de lib d'UI).
- Aucune clé dans une variable `NEXT_PUBLIC_*` ; tout appel externe passe par `app/api/`.
- `buildPayload` reste pur ; `PARAM_PATHS` reste une table séparée de `MODELS`.
- Immutabilité de l'état ; TypeScript strict sans `any` ; aucune erreur avalée en silence.
- Jetons (sombre par défaut) : stage `#121110`, panel `#1a1917`, raised `rgba(237,235,229,.1)`, sunken `rgba(237,235,229,.04)`, hairline `#2e2c28`, hairline-strong `#48453f`, ink `#edebe5`, ink-soft `#a09c92`, dim `#9d998f`, danger `#ff7a6b`. Clair : `#f3f2ee`, `#fafaf7`, `rgba(17,17,17,.08)`, `rgba(17,17,17,.04)`, `#d9d7d0`, `#b9b6ad`, `#111111`, `#5f5c55`, `#66625a`, `#c4291c`.
- Rayons 2 px, filets 1 px, aucune ombre de chrome ; transitions 140 ms (états) et 260 ms (panneaux), `cubic-bezier(.22,.61,.36,1)`.
- Polices : Space Grotesk (texte), JetBrains Mono (valeurs machine, labels 10 px capitales 0,18em), Unbounded 800 (titre d'accueil seulement).
- Une seule action en encre pleine à l'écran : Générer. Raccourcis écrits en capsules `<kbd>`.
- Aucun effet coloré sur les images : image en `object-contain`, rien dessus ; sélection = anneau autour.
- Deux langues : chaque libellé passe par `lib/i18n` ; commandes à l'infinitif, « vous » dans les phrases.
- Commits Conventional en français, un par lot, tests verts à chaque commit, sans ligne `Co-Authored-By`.

## Review Focus

1. **Session ancienne dans `localStorage`** (paramètres avec `guidance`/`steps`/`sampler`, résolution `6K` sur nano-banana-2) : l'app démarre sans erreur et recale les valeurs — test `normalizeParams` + `fitParams` (lot 1).
2. **Changer de modèle avec une valeur hors plage** (`8K` sur Flare puis Nano Banana 2) : la résolution est recalée à `4K`, jamais envoyée telle quelle ; la route refuse `6K` pour `gpt-image-2` — tests `fitParams` et `validate` (lot 1).
3. **Générer sans clé** : aucune requête ne part, la carte de clé apparaît sur la scène, le prompt est gardé, la génération part à l'enregistrement — E2E (lot 6).
4. **Supprimer par erreur** : l'image revient avec « Annuler » / ⌘Z — test du reducer d'annulation + E2E (lot 6).
5. **Écran étroit (1024 px)** : l'inspecteur devient une feuille, aucun débordement horizontal — E2E (lot 7).

---

## Structure des fichiers

```
lib/adapters/capabilities.ts   MODELS (ModelSpec), supports, ignoredParams, fitParams, modelChanges, pruneUnsupported
lib/adapters/gpt-image.ts      NOUVEAU — fabrique commune aux trois GPT (payload + adapter)
lib/adapters/gpt-image-2*.ts   réduits à trois lignes chacun (id → fabrique)
lib/atelier/params.ts          DEFAULT_PARAMS sans réglages morts, normalizeParams
lib/atelier/reducer.ts         sélection, focus, tiroirs, feuille, annulation — plus de `mode`
lib/atelier/use-atelier.ts     selectModel, parallèle, pending par modèle, échecs, annulation, suppression
lib/i18n/{fr,en,index}.ts      NOUVEAU — dictionnaires typés, useT()
app/globals.css · layout.tsx   jetons, thème, polices, script anti-flash
components/atelier/ui.tsx      NOUVEAU — Button, IconButton, Kbd, Segmented, Toggle, Section, Field
components/atelier/
  TopBar · Strip · Stage · Composer
  inspector/  SettingsInspector · ModelMenu · RatioTiles · ReferencesSection · AdvancedSection
              ImageInspector · MultiInspector · PairInspector · FailureInspector
  stage/      StageImage · PendingFrame · FailureFrame · KeyCard · Hello · DropZone
  overlays/   HistoryDrawer · PresetsMenu · KeysDialog · CommandPalette · ShortcutsDialog · Dialog
```

Supprimés au lot 4–5 : `Rail`, `CanvasHeader`, `AmbientBackground`, `ErrorBanner`, `Drawer`, `modes/*`, `panel/*`, `drawers/*`, `overlays/Onboarding`, `overlays/Viewer`.

---

### Task 1 (lot 1) : capacités descriptives

**Files:** Modify `lib/adapters/capabilities.ts`, `lib/types.ts`, `lib/atelier/params.ts`, `lib/adapters/validate.ts`, `lib/atelier/diff.ts`, `lib/atelier/use-atelier.ts:114` ; Create `lib/adapters/gpt-image.ts` ; Modify `lib/adapters/gpt-image-2.ts`, `gpt-image-2.5-*.ts` ; Test `tests/adapters/capabilities.test.ts`, `tests/adapters/validate.test.ts`, `tests/atelier/cost-params.test.ts`, `tests/adapters/securite.test.ts`.

**Interfaces — Produces:**

```ts
export type KeyKind = 'gemini' | 'openai'
export interface ValueOption<T> { value: T; label: string }
export interface ModelSpec {
  id: AdapterId
  name: string                       // « Nano Banana 2 »
  provider: 'Google' | 'OpenAI'
  keyKind: 'gemini' | 'openai'
  /** Nano : « Résolution » 1K/2K/4K ; GPT : « Qualité » low/medium/high(/xhigh/max). */
  resolution: { kind: 'resolution' | 'quality'; options: ValueOption<Resolution>[] }
  /** Taille réelle envoyée par format (GPT) ; absent = format en ratio seulement. */
  sizes?: Record<AspectRatio, string>
  referenceWeights: boolean
  supported: readonly PayloadParam[]
}
export const MODELS: Record<AdapterId, ModelSpec>
export function resolutionsOf(adapterId: AdapterId): Resolution[]
export function fitParams(params: GenerationParams, adapterId: AdapterId): GenerationParams
export function modelChanges(from: AdapterId, to: AdapterId): { added: PayloadParam[]; removed: PayloadParam[] }
// params.ts
export function normalizeParams(raw: unknown): GenerationParams
```

- [ ] Tests d'abord : `fitParams` recale `8K`→`4K` sur nano et laisse `4K` ; `resolutionsOf('gpt-image-2')` = `['1K','2K','4K']`, 2.5 = 5 valeurs ; `modelChanges('nano-banana-2','gpt-image-2')` ajoute `fileFormat`, `transparent`, `compression`, `moderation` et retire `seed`, `personGeneration` ; `normalizeParams({guidance: 7, resolution: '2K'})` n'a plus de clé `guidance` ; `parseGenerationRequest` refuse `resolution: '6K'` sur `gpt-image-2` et l'accepte sur `gpt-image-2.5-flare`. Lancer `pnpm test` : échec attendu (fonctions absentes).
- [ ] Retirer `guidance`, `steps`, `sampler` de `GenerationParams`, `DEFAULT_PARAMS`, `SAMPLERS`, `ALL_PARAMS`, `PARAM_LABELS`, `validate.ts`, des tests (MUTATIONS, securite).
- [ ] Écrire `MODELS` et dériver `supports()` de `MODELS[id].supported` ; garder `PARAM_PATHS` séparé.
- [ ] `validate.ts` : la résolution se valide contre `resolutionsOf(adapterId)` (adapterId lu avant `params`).
- [ ] `gpt-image.ts` : `buildGptImagePayload(modelId, request)` et `makeGptImageAdapter(modelId)` ; les trois fichiers GPT n'exportent plus que leurs noms historiques branchés sur la fabrique. `QUALITY` : 1K low, 2K medium, 4K high, 6K xhigh, 8K max.
- [ ] `use-atelier.ts` : lire `imgc.params` via `normalizeParams`.
- [ ] `pnpm test && pnpm lint && pnpm exec tsc --noEmit` verts ; commit `refactor(capacités): décrire chaque modèle et retirer les réglages morts`.

### Task 2 (lot 2) : fondations — jetons, thème, polices, i18n, primitives

**Files:** Modify `app/globals.css`, `app/layout.tsx`, `lib/atelier/storage.ts` (Prefs) ; Create `lib/i18n/fr.ts`, `lib/i18n/en.ts`, `lib/i18n/index.ts`, `components/atelier/ui.tsx` ; Test `tests/i18n/dictionnaires.test.ts`, `tests/atelier/storage.test.ts`.

**Interfaces — Produces:**

```ts
// storage.ts
export type Theme = 'dark' | 'light'
export type Lang = 'fr' | 'en'
export interface Prefs { pricing: Pricing; enrichPrePrompt: string; theme: Theme; lang: Lang }
// i18n
export type Dict = typeof fr               // fr.ts est la référence ; en.ts : `satisfies Dict`
export function dict(lang: Lang): Dict
export const I18nProvider: (props: { lang: Lang; children: ReactNode }) => JSX.Element
export function useT(): Dict
// ui.tsx
Button({ variant: 'primary'|'secondary'|'ghost'|'danger', size?: 'md'|'sm', ... })
IconButton({ label: string, icon: Icon, size?: 'md'|'sm', active?: boolean })
Kbd({ keys: string[] }) · Segmented<T>({ label, options: ValueOption<T>[], value, onChange, mono? })
Toggle({ label, checked, onChange, disabled? }) · Section({ label, meta?, action?, first?, children })
Field (input stylé, props natives)
```

- [ ] Tests d'abord : `readPrefs()` sans entrée rend `theme: 'dark'`, `lang: 'fr'` ; une entrée `{lang: 'de'}` retombe sur `fr` ; `en` et `fr` ont exactement les mêmes clés (parcours récursif) et aucune chaîne vide.
- [ ] `globals.css` : jetons en `@theme` (sombre) + surcharge `[data-theme='light']`, trame de points `.stage-dots`, `:focus-visible` encre 2 px décalé de 2 ; anciens noms (`app`, `panel`, `line`, `body`, `accent`…) gardés en **alias** vers les nouveaux jusqu'au lot 5.
- [ ] `layout.tsx` : JetBrains Mono + Unbounded 800 via `next/font/google` ; `<html data-theme>` posé avant peinture par un script inline qui lit `imgc.prefs` ; `colorScheme` `dark light` ; titre « Obskura ».
- [ ] Primitives `ui.tsx` aux mesures des maquettes (boutons 32 px, sélecteurs 26 px dans un rail de 2 px, interrupteur 34×20).
- [ ] Vert partout ; commit `feat(charte): jetons papier/encre, thème, polices et dictionnaires FR/EN`.

### Task 3 (lot 3) : inspecteur adaptatif et menu Modèle

**Files:** Create `components/atelier/inspector/{SettingsInspector,ModelMenu,RatioTiles,ReferencesSection,AdvancedSection}.tsx` ; Modify `lib/atelier/reducer.ts`, `lib/atelier/use-atelier.ts`, `app/page.tsx` (branche le nouvel inspecteur à la place de `SettingsPanel`/`RecipeTab`) ; Delete `panel/{RecipeTab,SettingsPanel,JsonTab,Choice,Slider,Switch}.tsx` ; Test `tests/atelier/reducer.test.ts`.

**Interfaces:** `useAtelier().selectModel(id: AdapterId)` : pose le modèle, recale `params` par `fitParams`, mémorise `modelNote: { added; removed } | null` ; `toggleAdapter` disparaît ; `setParallel(id: AdapterId | null)`.

- [ ] Test d'abord : `setAdapter` puis `setParallel` ; `setParallel` avec le modèle principal est ignoré ; `selectModel` sur le modèle parallèle l'échange.
- [ ] `SettingsInspector` : en-tête « Réglages » + réinitialiser ; section Modèle (bouton 48 px, nom 13/600, `Fournisseur · prix / image`, état de clé) ; Format (tuiles à glyphe, taille réelle pour GPT) ; Résolution **ou** Qualité selon `MODELS[id].resolution.kind` ; Variantes 1/2/4/8 avec coût ; Fichier + Fond transparent si supportés ; Références si jointes (poids en % seulement si `referenceWeights`, sinon la note « GPT Image lit les références sans poids. ») ; Avancé (`<details>`) : Graine (champ, verrou, nouvelle graine), Personnes, Modération, Langue du prompt, Paramètres bruts, Requête (le corps réel de `buildPayload`, bouton Copier).
- [ ] `ModelMenu` : `role="menu"`, les quatre modèles (`menuitemradio`), case « en parallèle » par ligne, note, « Gérer les clés » ; Échap et clic extérieur le ferment, focus rendu au bouton.
- [ ] Note de changement de modèle : « + qualité, fichier… / − résolution, graine… » sous le bouton, `role="status"`.
- [ ] Vert ; commit `feat(inspecteur): ne rendre que ce que le modèle lit`.

### Task 4 (lot 4) : espace unique — barre, bande, scène, composeur, fiche d'image

**Files:** Create `TopBar`, `Strip`, `Stage`, `stage/{StageImage,PendingFrame,Hello}`, `inspector/ImageInspector` ; Rewrite `Composer`, `app/page.tsx`, `lib/atelier/reducer.ts` ; Delete `Rail`, `CanvasHeader`, `AmbientBackground`, `modes/{Explore,Iterate}`, `overlays/Viewer`, `Drawer` ; Modify `lib/types.ts` (`Mode` retiré, `PendingTile` gagne `adapterId`, `count`) ; Test `tests/atelier/reducer.test.ts`, `e2e/atelier.spec.ts`.

**Interfaces — état :**

```ts
interface AtelierState {
  adapterId: AdapterId; parallelId: AdapterId | null
  selectedIds: string[]            // ce que l'inspecteur montre
  focusId: string | null           // ce que la scène montre quand rien n'est sélectionné
  overlay: 'history' | 'keys' | 'palette' | 'shortcuts' | 'presets' | 'model' | null
  sheetOpen: boolean               // < 1100 px
  keyPrompt: AdapterId | null      // carte « Clé requise » sur la scène
}
actions: select(id, additive) · clearSelection · focus(id) · openOverlay(o) · closeOverlay · toggleSheet · …
```

Règles : clic = sélection unique ; ⇧/⌘-clic = ajout/retrait ; une génération qui aboutit pose `focusId` sur la première image et **ne touche pas** `selectedIds` ; « ← Réglages » vide la sélection et garde l'image à l'écran (`focusId` = l'ancienne sélection) ; Échap ferme d'abord l'overlay, puis vide la sélection.

- [ ] Tests d'abord (reducer) : les quatre règles ci-dessus ; `select` d'un id déjà seul sélectionné le garde.
- [ ] Grille `88px | 1fr | 288px`, gouttière 16, barre 58 ; scène à trame de points, image `object-contain` à sa taille maximale ; bande : 64 px, plus récente en haut, filet entre deux générations, pied « N images » + Nouvelle session ; composeur 800 px max, 2 à 6 lignes, ⌘↵ génère, Entrée va à la ligne, ligne d'état `aria-live`.
- [ ] `ImageInspector` : Prompt (Copier), À éviter, Paramètres (kv mono), Couleurs (palette extraite), Origine ; actions Reprendre les réglages (R), Varier ×4 (V, **4 variantes réelles**), Utiliser comme référence, Télécharger (⌘E), Supprimer.
- [ ] E2E réécrits : premier contact (accueil « Décrire une image. »), génération → vignette + image sur la scène, rechargement restaure la session.
- [ ] Vert ; commit `feat(atelier): un seul espace de travail autour de l'image`.

### Task 5 (lot 5) : plusieurs images — multi-sélection, paire, parallèle, export

**Files:** Create `inspector/{MultiInspector,PairInspector}`, grille et paire dans `Stage` ; Modify `lib/atelier/export.ts` (conversion png/jpeg par canvas), `use-atelier.ts` (parallèle, `compare` et `AbState` supprimés) ; Delete `modes/{Produce,Compare}`, `panel/*` restants, alias de jetons ; Test `tests/atelier/export.test.ts`, E2E.

- [ ] Test d'abord : `exportName(item, format)` et le manifeste `.json` (réglages joints ou non).
- [ ] 3 images et plus : grille sur la scène, inspecteur « N images » : format original/png/jpeg, « Joindre les réglages (.json) », Télécharger N images (⌘E) — un fichier par image, sans zip (aucune dépendance) ; Supprimer N images.
- [ ] 2 images : deux moitiés égales légendées, inspecteur « Écarts » (tableau des seuls réglages qui diffèrent via `diffParams`, + « N réglages identiques »), Garder celle de gauche / droite (retire l'autre, annulable).
- [ ] Parallèle : Générer lance les deux modèles ; deux cadres en cours sur la scène ; à l'arrivée, sélection de la paire.
- [ ] E2E : ⇧-clic sur deux vignettes montre « Comparaison ».
- [ ] Vert ; commit `feat(atelier): comparer et exporter depuis la sélection`.

### Task 6 (lot 6) : parcours — clé, échec, arrêt, annulation, presets, historique, clés, ⌘K, raccourcis, enrichir

**Files:** Create `stage/{KeyCard,FailureFrame,DropZone}`, `inspector/FailureInspector`, `overlays/{Dialog,PresetsMenu,HistoryDrawer,KeysDialog,CommandPalette,ShortcutsDialog}` ; Delete `ErrorBanner`, `overlays/Onboarding`, `drawers/*` ; Modify `use-atelier.ts` ; Test `tests/atelier/undo.test.ts`, E2E.

**Interfaces:** `generate()` sans clé → `keyPrompt = adapterId`, aucune requête ; `saveKeyAndGenerate(kind, value)` ; `stop()` (AbortController par envoi) ; `failures: FailedRun[]` (`{ id; adapterId; prompt; message; kind: 'missing-key'|'quota'|'safety'|'no-image'|'generic'; createdAt }`) ; `removeItems(ids)` → `undo: { label: string; restore(): void } | null` ; `enrich()` réécrit le prompt sur place, annulable.

- [ ] Tests d'abord : `removeItems` puis `restore` rend la liste d'origine dans le même ordre ; un second `removeItems` remplace l'annulation précédente.
- [ ] Carte de clé sur la scène (Coller une clé…, Enregistrer la clé, Obtenir une clé, Utiliser l'autre fournisseur, le prompt est gardé).
- [ ] Échec : tuile « refusée » dans la bande, cadre sur la scène avec la cause et le remède (modération → « Passer la modération en low » ; clé → carte de clé ; sinon « Relancer ») ; plus aucun bandeau.
- [ ] Ligne d'état : coût → « N en cours · 14 s · Arrêter ⌘. » → « Image supprimée · Annuler ⌘Z ».
- [ ] Presets (menu depuis la barre, preset appliqué en tête d'inspecteur avec Détacher, enregistrer, importer/exporter .json), Historique (tiroir 420 px, recherche, filtre par modèle, prompts modifiés en diff), Clés et tarifs (dialogue : clés masquées, Supprimer, prix par image, clé d'enrichissement + consigne), ⌘K (Actions / Modèles / Préférences), `?` raccourcis ; références glissées sur la scène (Sujet / Style).
- [ ] E2E : génération sans clé → carte, aucune requête, enregistrer → image ; suppression → Annuler la rend ; ⌘K → Changer de modèle.
- [ ] Vert ; commit `feat(parcours): clé à la demande, échecs lisibles, annulation`.

### Task 7 (lot 7) : étroit, accessibilité, documentation

**Files:** Modify `app/page.tsx` (feuille < 1100 px), `CLAUDE.md`, `README.md`, `e2e/atelier.spec.ts`.

- [ ] Sous 1100 px : bouton « Réglages » dans la barre (`aria-pressed`), inspecteur en feuille superposée, fermable ; barre compacte (icônes seules avec `aria-label`).
- [ ] E2E : 1024 px → inspecteur masqué, bouton Réglages l'ouvre, aucun débordement horizontal ; 375 px → accueil lisible.
- [ ] `accesslint audit_live` sur l'espace de travail avec une session ; corriger les violations.
- [ ] `CLAUDE.md` et `README.md` : architecture, conventions (capacités descriptives, i18n, jetons), stockage (`imgc.prefs` porte `theme` et `lang`).
- [ ] `pnpm test && pnpm lint && pnpm exec tsc --noEmit && pnpm test:e2e && pnpm build` ; commit `feat(atelier): écran étroit, accessibilité et documentation`.
