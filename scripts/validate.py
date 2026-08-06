#!/usr/bin/env python3
"""
Valide toutes les fiches JSON du dossier data/ contre le schéma défini
dans schema/entite.schema.json, et vérifie la cohérence région/dossier.

Usage:
    python scripts/validate.py
"""
import json
import sys
from pathlib import Path

try:
    from jsonschema import Draft7Validator
except ImportError:
    sys.exit("Le module 'jsonschema' est requis : pip install jsonschema")

ROOT = Path(__file__).resolve().parent.parent
DATA_DIR = ROOT / "data"
SCHEMA_PATH = ROOT / "schema" / "entite.schema.json"


def load_schema():
    with open(SCHEMA_PATH, encoding="utf-8") as f:
        return json.load(f)


def iter_entity_files():
    for path in DATA_DIR.rglob("*.json"):
        if path.name == "tags.json":
            continue
        yield path


def main():
    schema = load_schema()
    validator = Draft7Validator(schema)
    errors_found = False
    checked = 0

    for path in iter_entity_files():
        checked += 1
        rel = path.relative_to(ROOT)
        with open(path, encoding="utf-8") as f:
            try:
                data = json.load(f)
            except json.JSONDecodeError as e:
                print(f"[ERREUR JSON] {rel}: {e}")
                errors_found = True
                continue

        # Validation contre le schéma
        for err in validator.iter_errors(data):
            print(f"[SCHEMA] {rel}: {err.message}")
            errors_found = True

        # Cohérence du chemin: data/<region>/<categorie>/<id>.json
        parts = path.relative_to(DATA_DIR).parts
        if len(parts) == 3:
            region_dir, categorie_dir, filename = parts
            if data.get("region") != region_dir:
                print(f"[CHEMIN] {rel}: region='{data.get('region')}' ne correspond pas au dossier '{region_dir}'")
                errors_found = True
            if data.get("categorie") != categorie_dir:
                print(f"[CHEMIN] {rel}: categorie='{data.get('categorie')}' ne correspond pas au dossier '{categorie_dir}'")
                errors_found = True
            if data.get("id") != filename.replace(".json", ""):
                print(f"[CHEMIN] {rel}: id='{data.get('id')}' ne correspond pas au nom de fichier")
                errors_found = True

    print(f"\n{checked} fiche(s) vérifiée(s).")
    if errors_found:
        print("Validation échouée.")
        sys.exit(1)
    else:
        print("Toutes les fiches sont valides. ✔")


if __name__ == "__main__":
    main()
