---
{
  "id": "T-0008",
  "titre": "Adapters v2 : buildPayload pur, capacités par modèle, variantes, graine",
  "colonne": "fait",
  "priorite": "haute",
  "charge": "l",
  "tags": [
    "api",
    "adapters"
  ],
  "cree": "2026-08-15",
  "maj": "2026-08-15",
  "plan": "2026-08-15-img-creator-v2-atelier.md",
  "epic": "T-0001"
}
---

## Contexte

Cœur technique de la v2 (handoff, section *Mapping API*). Les adapters n'envoient aujourd'hui qu'une fraction des paramètres et retournent une seule image. Ils doivent porter la totalité de `GenerationParams`, et exposer une fonction **pure** `buildPayload(params)` que `generate()` envoie et que l'onglet JSON affiche : le panneau JSON montre alors le corps réel, pas une reconstitution.

Les capacités par modèle vivent au même endroit que l'élagage du payload (`lib/adapters/capabilities.ts`) — une seule source pour le filtrage et pour les badges `ignoré ici` de T-0009.

À faire en TDD : les deux JSON de référence du handoff sont les cas de test.

## Critères d'acceptation

- [ ] `lib/adapters/capabilities.ts` déclare, par `AdapterId`, les clés de `GenerationParams` supportées et ignorées.
- [ ] `buildPayload()` exporté par chaque adapter, pure et sans effet de bord ; `generate()` l'utilise.
- [ ] nano-banana-2 : `candidateCount`, `imageConfig.aspectRatio` + `imageSize`, `personGeneration`, `seed`, parties `inlineData` pour sujet et style.
- [ ] gpt-image-2 : `n`, `size`, `quality`, `background`, `output_format`, `output_compression`, `moderation`, `image[]`.
- [ ] Négatif fusionné en fin de texte et **dédupliqué** avec le négatif du preset ; paramètres bruts fusionnés en dernier dans le corps.
- [ ] Mapping résolution → qualité OpenAI (1K `low`, 2K `medium`, 4K `high`) et formats (1:1 `1024x1024`, 16:9 `1536x864`, 9:16 `864x1536`, 4:3 `1280x960`).
- [ ] Les paramètres non supportés par le modèle actif sortent du payload.
- [ ] `app/api/generate/route.ts` renvoie `data: GenerationResult[]` ; `GenerateResponse` est mis à jour et les appelants suivent. `checkRateLimit` et le mapping d'erreurs existants sont conservés.
- [ ] Tests Vitest : les deux payloads de référence du handoff sont reproduits à l'identique ; déduplication du négatif ; mappings résolution et format.
