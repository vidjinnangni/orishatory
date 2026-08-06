# Codex Africain

Une base de données ouverte et structurée sur les mythologies du continent africain et de ses diasporas, organisée par grande aire culturelle.

## Objectif

Rassembler, de façon rigoureuse et sourcée, les figures divines, héros, créatures, récits et rites des traditions mythologiques africaines ; en faisant attention à deux écueils fréquents :

- l'homogénéisation ("la" mythologie africaine, comme un bloc uniforme) ;
- la survivance des lectures coloniales dans la façon de nommer et de décrire ces
  traditions.

## Structure du dépôt

```
codex-africain/
├── data/
│   ├── afrique-ouest/
│   ├── afrique-centrale/
│   ├── afrique-est/
│   ├── afrique-australe/
│   ├── afrique-nord/
│   ├── diaspora/
│   └── tags.json          # tags transversaux (thèmes récurrents inter-régions)
├── schema/
│   └── entite.schema.json # schéma JSON pour la validation de chaque fiche
├── scripts/
│   └── validate.py        # validation automatique des fiches
└── CONTRIBUTING.md
```

Chaque région contient cinq sous-dossiers de catégories :

| Dossier      | Contenu                                              |
| ------------ | ---------------------------------------------------- |
| `deites/`    | Divinités, orishas, esprits majeurs                  |
| `heros/`     | Figures culturelles, ancêtres fondateurs, tricksters |
| `creatures/` | Créatures, esprits mineurs, génies                   |
| `recits/`    | Mythes narratifs complets, contes                    |
| `rites/`     | Pratiques rituelles, divination, initiation          |

## Format d'une fiche

Chaque entité est un fichier JSON individuel, nommé `<id>.json`, conforme au schéma `schema/entite.schema.json`. Voir des exemples déjà remplis dans `data/afrique-ouest/` et `data/diaspora/`.

Champs clés :

- `id`, `nom`, `variantes` : identification
- `region`, `categorie`, `peuples` : classement
- `resume`, `domaines`, `attributs` : contenu descriptif
- `tags` : motifs transversaux (voir `data/tags.json`)
- `genealogie`, `recits_associes` : liens vers d'autres fiches
- `sources` : références (**obligatoire**, pas d'entrée sans source)

## Pourquoi ce découpage régional ?

Les frontières nationales actuelles ne correspondent presque jamais aux aires culturelles précoloniales. Le découpage par grande région (Ouest, Centrale, Est, Australe, Nord, Diaspora) suit plutôt les grandes zones de circulation historique des langues et des cosmologies. C'est une simplification assumée qui donne une bonne base de départ. Beaucoup de peuples et de traditions débordent ces catégories. Les tags transversaux (`data/tags.json`) servent justement à recoudre ce que le découpage régional sépare artificiellement (ex : les tricksters "araignée" ou "lièvre" apparaissent dans plusieurs régions).

## Validation

```bash
pip install jsonschema
python scripts/validate.py
```

Le script vérifie que chaque fiche respecte le schéma et que son contenu (`region`, `categorie`, `id`) correspond bien à son emplacement dans l'arborescence.

## Exigence de sourçage

Toute fiche doit citer au moins une source (ouvrage académique, article, corpus ethnographique). L'objectif est un codex de référence, pas une compilation de généralités trouvées en ligne. Voir `CONTRIBUTING.md`.

## Licence

Ce projet est distribué sous licence **CC BY-SA 4.0** (Attribution - Partage dans les mêmes conditions). Voir le fichier [`LICENSE`](./LICENSE). En résumé : réutilisation et adaptation libres, y compris commerciales, à condition de créditer le projet et de partager toute œuvre dérivée sous la même licence.
