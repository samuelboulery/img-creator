---
{
  "id": "T-0011",
  "titre": "Bibliothèque de recettes + export/import .json",
  "colonne": "fait",
  "priorite": "moyenne",
  "charge": "m",
  "tags": ["ui", "state"],
  "cree": "2026-08-15",
  "maj": "2026-08-15",
  "plan": "2026-08-15-img-creator-v2-atelier.md",
  "epic": "T-0001"
}
---

## Contexte

Les presets réutilisables sont le remplacement du compte serveur (handoff, section 9, tiroir Bibliothèque). Une recette groupe références, poids, suffixe de prompt, négatif et paramètres. L'export `.json` est ce qui permet de transporter son travail d'une machine à l'autre sans base de données.

## Critères d'acceptation

- [ ] Tiroir Bibliothèque : note définissant la recette, puis une carte par preset (nom, meta `N réf · N %`, 3 vignettes de référence, ligne `+ suffixe de prompt`, ligne `− négatif`).
- [ ] La recette active porte le fond `#1A1F2A` et le contour ambre ; l'appliquer remplit le panneau Recette.
- [ ] `+ Enregistrer la recette actuelle` crée un preset depuis l'état courant.
- [ ] `Exporter .json` télécharge la bibliothèque ; `Importer` relit un fichier, valide sa forme et fusionne sans écraser les presets existants.
- [ ] Un import de fichier invalide affiche une erreur explicite et ne détruit rien.
- [ ] Mention `presets gardés en localStorage` affichée en pied de tiroir.
- [ ] Test unitaire sur la validation d'un `.json` importé (valide, champ manquant, JSON illisible).
