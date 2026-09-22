import { readFileSync, readdirSync } from "node:fs";
import { resolve } from "node:path";
import { CATEGORIES, REGIONS, type Categorie, type Region } from "./constants";

// Resolved from the working directory (the `web/` package root) rather than
// import.meta.url, since bundling during `astro build` relocates this module
// and would otherwise break the relative path to the sibling `data/` folder.
const DATA_DIR = resolve(process.cwd(), "..", "data");

export interface Genealogie {
  parents: string[];
  conjoints: string[];
  enfants: string[];
  entites_liees: string[];
}

export interface Entite {
  id: string;
  nom: string;
  variantes: string[];
  region: Region;
  categorie: Categorie;
  peuples: string[];
  resume: string;
  domaines: string[];
  tags: string[];
  genealogie: Genealogie;
  attributs: string[];
  recits_associes: string[];
  culte_contemporain: string;
  sources: string[];
  notes: string;
}

export interface Tag {
  id: string;
  label: string;
}

function loadEntities(): Entite[] {
  const entities: Entite[] = [];
  for (const region of REGIONS) {
    for (const categorie of CATEGORIES) {
      let files: string[];
      try {
        files = readdirSync(`${DATA_DIR}/${region}/${categorie}`);
      } catch {
        continue;
      }
      for (const file of files) {
        if (!file.endsWith(".json")) continue;
        const raw = readFileSync(`${DATA_DIR}/${region}/${categorie}/${file}`, "utf-8");
        entities.push(JSON.parse(raw) as Entite);
      }
    }
  }
  return entities.sort((a, b) => a.nom.localeCompare(b.nom, "fr"));
}

function loadTags(): Tag[] {
  const raw = readFileSync(`${DATA_DIR}/tags.json`, "utf-8");
  return (JSON.parse(raw) as { tags: Tag[] }).tags;
}

/** Loaded once per build; Astro's build is single-process so module-level caching is safe. */
export const ALL_ENTITIES: Entite[] = loadEntities();
export const ALL_TAGS: Tag[] = loadTags();

const BY_ID = new Map<string, Entite>(ALL_ENTITIES.map((e) => [e.id, e]));

export function getEntityById(id: string): Entite | undefined {
  return BY_ID.get(id);
}

export function getEntitiesByRegion(region: Region): Entite[] {
  return ALL_ENTITIES.filter((e) => e.region === region);
}

export function getEntitiesByRegionAndCategorie(region: Region, categorie: Categorie): Entite[] {
  return ALL_ENTITIES.filter((e) => e.region === region && e.categorie === categorie);
}

export function getEntitiesByTag(tagId: string): Entite[] {
  return ALL_ENTITIES.filter((e) => e.tags.includes(tagId));
}

export function getTagById(tagId: string): Tag | undefined {
  return ALL_TAGS.find((t) => t.id === tagId);
}

export function getTagCounts(): Map<string, number> {
  const counts = new Map<string, number>();
  for (const entity of ALL_ENTITIES) {
    for (const tag of entity.tags) {
      counts.set(tag, (counts.get(tag) ?? 0) + 1);
    }
  }
  return counts;
}

export function entityHref(entity: Pick<Entite, "region" | "categorie" | "id">): string {
  return `/${entity.region}/${entity.categorie}/${entity.id}/`;
}

export interface SearchEntry {
  id: string;
  nom: string;
  region: Region;
  categorie: Categorie;
  peuples: string[];
  resume: string;
  href: string;
}

export function buildSearchIndex(): SearchEntry[] {
  return ALL_ENTITIES.map((e) => ({
    id: e.id,
    nom: e.nom,
    region: e.region,
    categorie: e.categorie,
    peuples: e.peuples,
    resume: e.resume,
    href: entityHref(e),
  }));
}
