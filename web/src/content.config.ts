import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";
import { DOSSIER_TYPES } from "./lib/constants";

// Miroir de schema/dossier.schema.json (validé en CI par scripts/validate.py) :
// ici, la même règle fait échouer le build plutôt que de publier un dossier mal formé.
const FICHE_ID = /^[a-z0-9]+(-[a-z0-9]+)*$/;

const dossiers = defineCollection({
  loader: glob({ pattern: "*.md", base: "../dossiers" }),
  schema: z.strictObject({
    titre: z.string().min(1),
    type: z.enum(DOSSIER_TYPES),
    resume: z.string().min(1),
    fiches: z.array(z.string().regex(FICHE_ID)).min(1),
    sources: z.array(z.string().min(1)).min(1),
  }),
});

export const collections = { dossiers };
