---
{
  "id": "T-0017",
  "titre": "Palette ⌘K + écran d'accueil des clés",
  "colonne": "fait",
  "priorite": "moyenne",
  "charge": "m",
  "tags": ["ui", "overlays"],
  "cree": "2026-08-15",
  "maj": "2026-08-15",
  "plan": "2026-08-15-img-creator-v2-atelier.md",
  "epic": "T-0001"
}
---

## Contexte

Handoff section 10. Deux overlays qui encadrent l'usage : l'accueil au premier lancement (l'app ne sert à rien sans clé), la palette ⌘K ensuite (raccourci vers tout ce que le rail et les segmentés exposent).

## Critères d'acceptation

- [ ] Palette `z-index: 50`, carte 460 px à 96 px du haut, rangée de recherche (`magnifying-glass`, placeholder `Chercher une commande…`, `esc` à droite), liste icône + libellé + raccourci mono.
- [ ] Commandes du handoff câblées : Générer maintenant, Changer de modèle, Comparer les deux modèles, Itérer, Produire, Bibliothèque, Historique, Réglages & clés, Exporter la recette, Vider la session, et la commande de simulation d'échec d'API.
- [ ] `⌘K` / `Ctrl+K` ouvre et ferme ; `Échap` ou clic sur le fond ferme ; la recherche filtre la liste ; les flèches et `Entrée` naviguent.
- [ ] Écran d'accueil `z-index: 60` : carré 36 px `fill/sparkle`, titre `Connecte un modèle`, carte Google AI Studio (contour ambre + `fill/check-circle` quand la clé est saisie), carte OpenAI optionnelle, bouton 42 px `Entrer dans l'atelier`, note `ou utiliser la clé du serveur (.env.local)`.
- [ ] L'accueil s'affiche au premier lancement si aucune clé n'est trouvée, et pas après (`imgc.onboarded`) ; `Revoir l'écran d'accueil` le rouvre.
- [ ] Les deux overlays piègent le focus et sont utilisables au clavier seul.
