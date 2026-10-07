import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";
import { DOSSIER_TYPES } from "./lib/constants";

// Miroir de schema/dossier.schema.json (validé en CI par scripts/validate.py) :
// ici, la même règle fait échouer le build plutôt que de publier un dossier mal formé.
const FICHE_ID = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const IMAGE_FILE = /^[a-z0-9]+(-[a-z0-9]+)*\.(jpg|jpeg|png|webp|avif|svg)$/;
// La couverture sert d'image de partage : pas de SVG, que les réseaux sociaux n'affichent pas.
const COVER_FILE = /^[a-z0-9]+(-[a-z0-9]+)*\.(jpg|jpeg|png|webp|avif)$/;
// Licences libres seulement : ni NC (non commerciale) ni ND (pas de modification).
const LICENCE = /^(Domaine public|CC0 1\.0|CC BY(-SA)? [1-4]\.[05])$/;

const dossiers = defineCollection({
  loader: glob({ pattern: "*.md", base: "../dossiers" }),
  schema: z.strictObject({
    titre: z.string().min(1),
    type: z.enum(DOSSIER_TYPES),
    resume: z.string().min(1),
    fiches: z.array(z.string().regex(FICHE_ID)).min(1),
    sources: z.array(z.string().min(1)).min(1),
    couverture: z.strictObject({ fichier: z.string().regex(COVER_FILE), alt: z.string().min(1) }).optional(),
    images: z
      .array(
        z.strictObject({
          fichier: z.string().regex(IMAGE_FILE),
          credit: z.string().min(1),
          licence: z.string().regex(LICENCE),
          source: z.string().regex(/^https?:\/\//),
        }),
      )
      .min(1)
      .optional(),
  }),
});

export const collections = { dossiers };
