import { execFileSync } from "node:child_process";
import { resolve } from "node:path";

// Le schéma des fiches n'a pas de champ "date d'ajout" : on le déduit de
// l'historique git (premier commit qui a ajouté le fichier) plutôt que de
// forcer une migration de données rétroactive sur ~300 fiches existantes.
const REPO_ROOT = resolve(process.cwd(), "..");
const RECORD_SEP = "\x01";

function loadAddedDates(): Map<string, string> {
  const map = new Map<string, string>();
  let output: string;

  try {
    output = execFileSync(
      "git",
      ["log", "--diff-filter=A", "--name-only", `--format=${RECORD_SEP}%aI`, "--", "data"],
      { cwd: REPO_ROOT, encoding: "utf-8", maxBuffer: 1024 * 1024 * 64 },
    );
  } catch {
    // Pas un dépôt git, historique tronqué (clone shallow), ou git absent :
    // les dates de nouveauté seront simplement indisponibles, sans faire
    // échouer le build.
    return map;
  }

  let currentDate: string | null = null;
  for (const rawLine of output.split("\n")) {
    if (rawLine.startsWith(RECORD_SEP)) {
      currentDate = rawLine.slice(RECORD_SEP.length).trim();
      continue;
    }
    const path = rawLine.trim();
    if (!path || !currentDate) continue;
    // Un fichier peut apparaître plusieurs fois comme "ajouté" dans
    // l'historique (suppression puis recréation) : on garde la date la plus
    // ancienne, qui correspond à sa création réelle.
    const existing = map.get(path);
    if (!existing || currentDate < existing) {
      map.set(path, currentDate);
    }
  }

  return map;
}

const ADDED_DATES = loadAddedDates();

export function getAddedDate(relativePath: string): string | undefined {
  return ADDED_DATES.get(relativePath);
}
