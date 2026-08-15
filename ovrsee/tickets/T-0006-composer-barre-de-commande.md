---
{
  "id": "T-0006",
  "titre": "Composer : prompt auto-grow, négatif fusionné, chips, coût, Générer",
  "colonne": "en-cours",
  "priorite": "haute",
  "charge": "m",
  "tags": [
    "ui",
    "canvas"
  ],
  "cree": "2026-08-15",
  "maj": "2026-08-15",
  "plan": "2026-08-15-img-creator-v2-atelier.md",
  "epic": "T-0001"
}
---

## Contexte

Le prompt quitte le formulaire latéral pour devenir une barre de commande au bas du canvas (handoff, section 7). Remplace la partie prompt de `components/PromptForm.tsx`. Le halo du composer doit rester très discret pour ne pas empiéter sur les images.

Aucun des deux modèles n'expose de champ négatif : la mention `fusionné au prompt` est une information à afficher, pas une décoration.

## Critères d'acceptation

- [ ] Carte rayon 16, `rgba(20,24,33,.9)` + `backdrop-blur(20px)`, `inset 0 1px 0 #28303D`, halo `0 -10px 26px -22px oklch(0.72 0.21 72 / .3)`.
- [ ] Rangée prompt : point ambre 7 px qui respire + `<textarea>` auto-grow (hauteur = `scrollHeight`, `overflow:hidden`), 15 px/1,5.
- [ ] Rangée négatif séparée par un filet `#1A1F2A` : label mono `NÉGATIF`, champ, mention `fusionné au prompt` à droite.
- [ ] Rangée d'actions : chips d'état (preset actif, ratio, `×N`, extrait du négatif), chip `✨ Enrichir` avec pastille d'état de clé, estimation `≈ 0,00 €`, bouton Générer 38 px en dégradé ambre avec `⏎`.
- [ ] `Entrée` génère, `Maj+Entrée` retourne à la ligne.
- [ ] `Enrichir` sans clé texte ouvre le tiroir d'enrichissement au lieu d'appeler quoi que ce soit.
- [ ] L'estimation de coût vient de `lib/atelier/cost.ts` (tarif par modèle × variantes) et est couverte par un test unitaire.
