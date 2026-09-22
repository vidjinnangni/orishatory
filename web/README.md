# Orishatory — web

Le site qui présente le contenu du codex (`../data/`). Généré statiquement avec
[Astro](https://astro.build) : les fiches JSON sont lues au moment du build,
aucune base de données ni API ne sont nécessaires en production.

## Commandes

Depuis ce dossier (`web/`) :

| Commande          | Action                                               |
| ----------------- | ----------------------------------------------------- |
| `npm install`     | Installe les dépendances                              |
| `npm run dev`     | Lance le serveur de développement sur `localhost:4321` |
| `npm run build`   | Génère le site statique dans `./dist/`                 |
| `npm run preview` | Prévisualise le build de production en local           |

## Structure

```
web/
├── src/
│   ├── lib/
│   │   ├── constants.ts   # libellés des régions/catégories, couleurs par catégorie
│   │   └── data.ts        # lecture des fiches JSON depuis ../data au build
│   ├── layouts/           # gabarit de page commun (header, footer, styles)
│   ├── components/        # cartes, badges, pastilles, fil d'Ariane
│   ├── styles/global.css  # tokens de design (couleurs OKLCH, typographie)
│   └── pages/
│       ├── index.astro                          # accueil : régions
│       ├── [region]/index.astro                 # catégories d'une région
│       ├── [region]/[categorie]/index.astro     # liste des fiches
│       ├── [region]/[categorie]/[id].astro      # fiche détaillée
│       ├── tags/, tags/[tag].astro               # motifs transversaux
│       ├── recherche.astro                       # recherche côté client
│       └── search-index.json.ts                  # index consommé par la recherche
└── astro.config.mjs
```

Toute nouvelle fiche ajoutée dans `../data/` apparaît automatiquement au
prochain build, sans code additionnel — pour peu qu'elle respecte le schéma
(`../schema/entite.schema.json`).

## Déploiement

Le site est statique (`output: "static"`) : il se déploie tel quel sur Vercel
ou Netlify en pointant le répertoire racine du build sur `web/` avec la
commande `npm run build` et le dossier de sortie `web/dist`.
