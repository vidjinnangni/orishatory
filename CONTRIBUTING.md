# Contribuer au Codex Africain

En contribuant, vous acceptez que votre contribution soit diffusée sous licence
CC BY-SA 4.0 (voir [`LICENSE`](./LICENSE)), au même titre que le reste du projet.

## Ajouter une fiche

1. Choisir la région et la catégorie appropriées.

2. Créer un fichier `data/<region>/<categorie>/<id>.json`, où `<id>` est le nom de l'entité en kebab-case (minuscules, tirets, sans accents), ex: `eshu-elegba`.

3. Remplir les champs selon `schema/entite.schema.json`. Champs obligatoires :
   `id`, `nom`, `region`, `categorie`, `peuples`, `resume`, `sources`.

4. Lancer la validation :
   
   ```bash
   python scripts/validate.py
   ```

Cette même validation tourne automatiquement via GitHub Actions à chaque pull request (voir `.github/workflows/validate.yml`). Une fiche invalide bloque le merge.

5. Ouvrir une pull request.

## Standards de qualité

- **Sourçage obligatoire** : au moins une référence académique ou ethnographique par fiche (ouvrage, article, corpus de terrain). Éviter les sources uniquement encyclopédiques grand public quand une source primaire existe.
- **Neutralité de ton** : décrire les traditions dans leurs propres termes, éviter le vocabulaire connoté hérité des lectures missionnaires/coloniales (ex: éviter de qualifier des figures ambivalentes de "démoniaques").
- **Signaler l'incertitude** : quand une information est contestée ou varie selon les sources, l'indiquer dans le champ `notes` plutôt que de trancher arbitrairement.
- **Peuples précis** : indiquer le(s) peuple(s) exact(s) associé(s) à une entité plutôt qu'une généralisation nationale ou continentale, sauf pour les entrées `diaspora` qui sont par nature syncrétiques.

## Ajouter un nouveau tag transversal

Modifier `data/tags.json` en ajoutant un objet `{ "id": "...", "label": "..." }`, puis référencer cet id dans les fiches concernées.

## Idées de contributions futures

- Scripts d'export (vers un format consultable : site statique, API)
- Traductions des résumés dans d'autres langues
- Cartographie des zones culturelles associées à chaque région
