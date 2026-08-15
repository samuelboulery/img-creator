---
{
  "id": "T-0003",
  "titre": "Infra de test : Vitest + Playwright",
  "colonne": "fait",
  "priorite": "moyenne",
  "charge": "s",
  "tags": [
    "test",
    "socle"
  ],
  "cree": "2026-08-15",
  "maj": "2026-08-15",
  "plan": "2026-08-15-img-creator-v2-atelier.md",
  "epic": "T-0001"
}
---

## Contexte

Le projet n'a aucune infra de test. La v2 introduit de la logique pure qui mérite d'être testée avant d'être branchée à l'interface : construction du payload par modèle, déduplication du négatif, mapping résolution → qualité, extraction de palette. Poser l'outillage maintenant permet de faire les tickets suivants en TDD.

## Critères d'acceptation

- [ ] `vitest`, `@vitejs/plugin-react`, `@testing-library/react`, `@testing-library/jest-dom`, `jsdom` et `@playwright/test` installés en devDeps via `pnpm add -D`.
- [ ] `vitest.config.ts` avec l'alias `@/` aligné sur `tsconfig.json` et l'environnement `jsdom`.
- [ ] Scripts `package.json` : `test` (vitest run), `test:watch`, `test:e2e`.
- [ ] `playwright.config.ts` avec `webServer` lançant `pnpm dev` sur `http://localhost:3000`.
- [ ] Un test de fumée par runner passe : `pnpm test` et `pnpm test:e2e` verts.
- [ ] Les artefacts (`coverage/`, `test-results/`, `playwright-report/`) sont ignorés par git.
