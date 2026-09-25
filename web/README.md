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

## Analytics

Le suivi Google Analytics (GA4) est géré par
[`src/components/Analytics.astro`](src/components/Analytics.astro) et se
déclenche via la variable d'environnement `PUBLIC_GA_ID` (voir
`.env.example`) :

1. Créer une propriété GA4 dans Google Analytics (Admin → Créer une
   propriété → Flux de données web) pour obtenir un identifiant `G-XXXXXXXXXX`.
2. En local : copier `.env.example` en `.env` et renseigner la valeur.
3. Sur Vercel/Netlify : ajouter `PUBLIC_GA_ID` dans les variables
   d'environnement du projet (idéalement pour l'environnement de production
   uniquement, pour ne pas polluer les données avec le trafic des previews).

Sans cette variable, aucun script n'est chargé ni aucune donnée envoyée à
Google — c'est le comportement par défaut en développement local.

Le RGPD est géré par [`src/components/ConsentBanner.astro`](src/components/ConsentBanner.astro) :
`gtag.js` n'est chargé qu'après un clic explicite sur « Accepter » (voir aussi
`/confidentialite/`). Conséquence : les outils de vérification automatique de
Google (qui ne cliquent pas sur le bandeau) peuvent signaler à tort une balise
« non détectée » — la seule vérification fiable est de regarder les rapports
temps réel de GA4 après avoir soi-même accepté le bandeau sur le site publié.

## Search Console

La vérification de propriété (méthode « balise HTML ») passe par la variable
`PUBLIC_GOOGLE_SITE_VERIFICATION` (voir `.env.example`), injectée dans le
`<head>` par [`src/layouts/BaseLayout.astro`](src/layouts/BaseLayout.astro).
Cette balise n'a aucune implication RGPD (aucune donnée envoyée, aucun
cookie) : elle peut rester chargée en permanence, sans passer par le bandeau
de consentement.

Un sitemap XML est généré automatiquement au build par `@astrojs/sitemap`
(config dans `astro.config.mjs`, référencé dans `public/robots.txt`) et peut
être soumis dans Search Console une fois la propriété vérifiée.

Penser à mettre à jour `site` dans `astro.config.mjs` (et le `Sitemap:` de
`public/robots.txt`) si un domaine personnalisé remplace `orishatory.vercel.app`.

## SEO (balises par page)

Tout passe par les props de [`src/layouts/BaseLayout.astro`](src/layouts/BaseLayout.astro),
que chaque page renseigne :

| Prop            | Rôle                                                                 |
| --------------- | --------------------------------------------------------------------- |
| `title`         | Suffixé automatiquement par « · Orishatory » (sauf `appendSiteName={false}`, utilisé sur l'accueil) |
| `description`   | `<meta name="description">` + `og:description` + `twitter:description` |
| `image`         | `og:image` / `twitter:image` — par défaut `/og-image.png` (1200×630) |
| `type`          | `og:type` : `website` (pages de liste) ou `article` (fiches)          |
| `breadcrumb`    | Alimente à la fois le `<Breadcrumb>` visuel et le JSON-LD `BreadcrumbList` |
| `jsonLd`        | Données structurées additionnelles (`WebSite`+`SearchAction` sur l'accueil, `DefinedTerm` sur chaque fiche) |

Une URL canonique (`<link rel="canonical">`) est calculée automatiquement à
partir de `site` (voir `astro.config.mjs`) et du chemin de la page — pas besoin
de la gérer manuellement.

Chaque fiche du codex est marquée en JSON-LD `DefinedTerm` (nom, variantes en
`alternateName`, résumé, URL canonique), ce qui aide Google à comprendre qu'il
s'agit d'entrées d'un même codex de référence plutôt que de pages isolées.

`public/og-image.png` est une image de partage générique (1200×630, générée
manuellement, pas de build automatique) : à remplacer si l'identité visuelle
change.
