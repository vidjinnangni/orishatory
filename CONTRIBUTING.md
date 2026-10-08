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

## Le champ `description_detaillee`

Ce champ optionnel accueille un développement plus riche que le resume : 2 à 4 paragraphes qui vise à couvrir, selon ce qui est pertinent pour l'entité, son origine et son contexte culturel, son rôle mythologique ou rituel, ses variantes régionales ou selon les sources, ainsi que ses liens avec d'autres figures déjà présentes dans le codex.

Sa rédaction est recommandée, mais reste optionnelle si les sources disponibles ne permettent pas un développement substantiel.

> [!NOTE]
> Il ne s'agit pas d'une reformulation étendue du resumé. La description doit apporter une information nouvelle (contexte historique, nuances entre sources, éléments de comparaison).

## Ajouter un nouveau tag transversal

Modifier `data/tags.json` en ajoutant un objet `{ "id": "...", "label": "..." }`, puis référencer cet id dans les fiches concernées.

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

3. Rédiger le corps en Markdown (titres `##` pour les sections, notes de bas de page `[^1]`, citations, listes, tableaux). Pour renvoyer vers une fiche, utiliser `[Shango](fiche:shango)` : l'id doit exister et figurer aussi dans `fiches`. Pour renvoyer vers un autre dossier, utiliser `[le dossier consacré à Shango](dossier:shango-d-oyo-aux-ameriques)`, avec le nom du fichier sans `.md`. Taper directement les guillemets « » et l'apostrophe ’ : il n'y a pas de conversion automatique. Pour expliquer une notion au lecteur qui découvre le sujet (un titre, un mot vernaculaire), ajouter un encadré « À savoir » avec une citation qui commence par `> [!NOTE]` sur sa propre ligne.

4. Pour illustrer le dossier (facultatif), placer les images dans `dossiers/images/<slug>/` (noms en kebab-case, formats jpg, png, webp, avif ou svg) et les déclarer dans l'en-tête, avec, si on le souhaite, une image de couverture. Elle est affichée en tête de page et sur la carte du dossier. Elle sert d'image de partage sur les réseaux sociaux et dans les moteurs de recherche. À cet effet, l'image doit être au format jpg, png, webp ou avif (pas de SVG), idéalement en 1200 × 630 pixels. Pour une carte ou un schéma en SVG, il faudra en exporter une version PNG pour la couverture.
   
   ```yaml
   couverture:                      # facultatif : image principale et image de partage
     fichier: oshe-shango.jpg
     alt: "Bâton de danse oṣé Shango en bois sculpté"
   images:
     - fichier: oshe-shango.jpg
       credit: "Brooklyn Museum"    # auteur, photographe ou institution
       licence: "CC0 1.0"
       source: "https://…"          # page de l'original
   ```
   
   Dans le texte, une image seule sur sa ligne devient une figure : `![Texte alternatif](images/<slug>/oshe-shango.jpg "Légende")`. Le texte alternatif décrit l'image pour les lecteurs qui ne la voient pas. La légende est facultative et le crédit est ajouté automatiquement à partir de l'en-tête.
   
   > [!IMPORTANT]
   > Seules les images sous licence libre sont acceptées : domaine public, CC0 1.0, CC BY ou CC BY-SA. Les licences « pas d'utilisation commerciale » (NC) ou « pas de modification » (ND), et les images dont la licence n'est pas indiquée, sont refusées. Chaque image doit être créditée et renvoyer vers la page de l'original (musée, Wikimedia Commons, etc.), où sa licence peut être vérifiée.
   > 
   > Les illustrations créées pour le projet (cartes, schémas, frises) sont publiées sous CC BY 4.0, avec le crédit « Orishatory » et, comme source, le lien vers le fichier sur GitHub. Ne pas reprendre la licence du projet (CC BY-NC 4.0), qui n'est pas acceptée pour les images.

5. Lancer `python scripts/validate.py` (nécessite `pip install jsonschema pyyaml`), puis ouvrir une pull request. La même validation tourne en CI et le build du site échoue aussi sur un lien, un id ou une image invalide.

Les standards ci-dessous s'appliquent aussi aux dossiers : toute comparaison ou affirmation s'appuie sur une source citée et ce que les sources ne permettent pas d'affirmer est dit explicitement.

## Standards de qualité

- **Sourçage obligatoire** : au moins une référence académique ou ethnographique par fiche (ouvrage, article, corpus de terrain). Éviter les sources uniquement encyclopédiques grand public quand une source primaire existe.
- **Neutralité de ton** : décrire les traditions dans leurs propres termes, éviter le vocabulaire connoté hérité des lectures missionnaires/coloniales (ex: éviter de qualifier des figures ambivalentes de "démoniaques").
- **Signaler l'incertitude** : quand une information est contestée ou varie selon les sources, l'indiquer dans le champ `notes` plutôt que de trancher arbitrairement.
- **Peuples précis** : indiquer le(s) peuple(s) exact(s) associé(s) à une entité plutôt qu'une généralisation nationale ou continentale, sauf pour les entrées `diaspora` qui sont par nature syncrétiques.

## Idées de contributions futures

- Scripts d'export (vers un format consultable : site statique, API)
- Traductions des résumés dans d'autres langues
- Cartographie des zones culturelles associées à chaque région
- Illustrations, vidéos...
