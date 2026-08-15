---
{
  "id": "T-0007",
  "titre": "GenerationParams complet + panneau Recette (5 sections)",
  "colonne": "en-cours",
  "priorite": "haute",
  "charge": "l",
  "tags": [
    "ui",
    "params"
  ],
  "cree": "2026-08-15",
  "maj": "2026-08-15",
  "plan": "2026-08-15-img-creator-v2-atelier.md",
  "epic": "T-0001"
}
---

## Contexte

Le panneau de 320 px porte toute la surface de réglage de la v2 (handoff, section 8). `lib/types.ts` gagne `GenerationParams` et `Recipe` dans les formes exactes du handoff (section *State management*), en extension de `PromptParams` — sans casser l'existant.

`readImageFile()`, `ImageGrid` et `ExtraParamsEditor` de `components/PromptForm.tsx` sont réutilisés tels quels, déplacés sous `components/atelier/`.

## Critères d'acceptation

- [ ] `lib/types.ts` déclare `GenerationParams`, `Recipe`, `GalleryItem` et `Mode` conformes au handoff, sans `any`.
- [ ] En-tête de panneau 52 px : segmenté `Recette` / `JSON` + `réinitialiser` qui restaure toutes les valeurs par défaut.
- [ ] Cinq sections repliables, ouvertures par défaut du handoff : Références (ouverte), Cadrage & sortie (ouverte), Rendu, Personnes & modération, Paramètres bruts.
- [ ] Références : vignettes 52 px + zone de dépôt, curseurs de fidélité sujet et style (0–100, pas 5, libellé textuel), interrupteurs `Verrouiller l'identité` et `Transfert de palette`, mention `inlineData base64`.
- [ ] Cadrage & sortie : 4 boutons de format 44 px avec vignette proportionnelle, résolution 1K/2K/4K, fichier PNG/JPEG/WEBP, fond transparent, compression 20–100 affichée seulement hors PNG.
- [ ] Rendu : variantes ×1/×2/×4/×8, graine avec `relancer` (tire 7 chiffres et verrouille) et interrupteur de verrou, guidage 1–20 pas 0,5, étapes 10–80, échantillonneur.
- [ ] Curseurs (`accent-color` ambre, piste 4 px, bornes mono 9,5 px) et interrupteurs (30×17, pastille 12 px, 240 ms) conformes.
- [ ] Pied de panneau : rangée `Clés API — image ×N · texte ×N · ce navigateur`.
- [ ] Aucun objet d'état muté : toutes les mises à jour passent par des copies.
