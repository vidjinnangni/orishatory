# Contribuer à Orishatory

En contribuant, vous acceptez que votre contribution soit diffusée sous licence
CC BY-NC 4.0 (voir [`LICENSE`](./LICENSE)), au même titre que le reste du projet.

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

## Ajouter un dossier thématique

Un dossier aborde un sujet avec plus de détails à partir des fiches (une figure à travers les régions, un thème, une comparaison) et d'autres sources pertinentes. Ainsi, la rédaction d'une fiche s'appuie sur des fiches existantes ; il ne s'agit pas de les recopier tout simplement.

1. Créer `dossiers/<slug>.md`, où `<slug>` est en kebab-case (minuscules, tirets, sans accents), ex: `cosmogonies`. Il devient l'adresse `/dossiers/<slug>/`.

2. Commencer par un en-tête YAML, dont tous les champs sont obligatoires :
   
   ```markdown
   ---
   titre: "Shango, d'Oyo à Cuba"
   type: figure            # figure | theme | comparaison
   resume: "1 à 3 phrases : chapeau du dossier et description pour les moteurs de recherche."
   fiches: [shango, xango, chango]   # ids des fiches, dans l'ordre d'affichage
   sources:
     - "Référence bibliographique ou académique"
   ---
   ```

3. Rédiger le corps en Markdown (titres `##` pour les sections, notes de bas de page `[^1]`, citations, listes, tableaux). Pour renvoyer vers une fiche, utiliser `[Shango](fiche:shango)` : l'id doit exister et figurer aussi dans `fiches`. Taper directement les guillemets « » et l'apostrophe ’ : il n'y a pas de conversion automatique.

4. Lancer `python scripts/validate.py` (nécessite `pip install jsonschema pyyaml`), puis ouvrir une pull request. La même validation tourne en CI et le build du site échoue aussi sur un lien ou un id invalide.

Les standards ci-dessous s'appliquent aussi aux dossiers : toute comparaison ou affirmation s'appuie sur une source citée et ce que les sources ne permettent pas d'affirmer est dit explicitement.

## Standards de qualité

- **Sourçage obligatoire** : au moins une référence académique ou ethnographique par fiche (ouvrage, article, corpus de terrain). Éviter les sources uniquement encyclopédiques grand public quand une source primaire existe.
- **Neutralité de ton** : décrire les traditions dans leurs propres termes, éviter le vocabulaire connoté hérité des lectures missionnaires/coloniales (ex: éviter de qualifier des figures ambivalentes de "démoniaques").
- **Signaler l'incertitude** : quand une information est contestée ou varie selon les sources, l'indiquer dans le champ `notes` plutôt que de trancher arbitrairement.
- **Peuples précis** : indiquer le(s) peuple(s) exact(s) associé(s) à une entité plutôt qu'une généralisation nationale ou continentale, sauf pour les entrées `diaspora` qui sont par nature syncrétiques.

## Le champ `description_detaillee`

Ce champ optionnel accueille un développement plus riche que le resume : 2 à 4 paragraphes qui vise à couvrir, selon ce qui est pertinent pour l'entité, son origine et son contexte culturel, son rôle mythologique ou rituel, ses variantes régionales ou selon les sources, ainsi que ses liens avec d'autres figures déjà présentes dans le codex.

Sa rédaction est recommandée, mais reste optionnelle si les sources disponibles ne permettent pas un développement substantiel.

> [!NOTE]
> Il ne s'agit pas d'une reformulation étendue du resumé. La description doit apporter une information nouvelle (contexte historique, nuances entre sources, éléments de comparaison).

## Ajouter un nouveau tag transversal

Modifier `data/tags.json` en ajoutant un objet `{ "id": "...", "label": "..." }`, puis référencer cet id dans les fiches concernées.

## Idées de contributions futures

- Scripts d'export (vers un format consultable : site statique, API)
- Traductions des résumés dans d'autres langues
- Cartographie des zones culturelles associées à chaque région
