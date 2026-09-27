import rss from "@astrojs/rss";
import type { APIRoute } from "astro";
import { CATEGORY_LABELS_SINGULAR, REGION_LABELS } from "../lib/constants";
import { entityHref, getRecentEntities } from "../lib/data";

export const prerender = true;

export const GET: APIRoute = (context) => {
  const recent = getRecentEntities(40);

  return rss({
    title: "Orishatory — Nouveautés",
    description: "Les dernières fiches ajoutées au codex des mythologies africaines et de leurs diasporas.",
    site: context.site!,
    items: recent.map((entity) => ({
      title: `${entity.nom} — ${CATEGORY_LABELS_SINGULAR[entity.categorie]} (${REGION_LABELS[entity.region]})`,
      description: entity.resume,
      link: entityHref(entity),
      pubDate: new Date(entity.dateAjout),
    })),
  });
};
