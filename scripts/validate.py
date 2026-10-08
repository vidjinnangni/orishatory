#!/usr/bin/env python3
"""
Valide toutes les fiches JSON du dossier data/ contre le schéma défini
dans schema/entite.schema.json, et vérifie la cohérence région/dossier.
Valide aussi les dossiers thématiques Markdown de dossiers/ (en-tête YAML
contre schema/dossier.schema.json, liens vers les fiches, images déclarées
et présentes dans dossiers/images/<slug>/).

Usage:
    python scripts/validate.py
"""
import json
import re
import sys
from pathlib import Path

try:
    from jsonschema import Draft7Validator
except ImportError:
    sys.exit("Le module 'jsonschema' est requis : pip install jsonschema")

ROOT = Path(__file__).resolve().parent.parent
DATA_DIR = ROOT / "data"
SCHEMA_PATH = ROOT / "schema" / "entite.schema.json"
DOSSIERS_DIR = ROOT / "dossiers"
DOSSIER_SCHEMA_PATH = ROOT / "schema" / "dossier.schema.json"

DOSSIER_FILENAME = re.compile(r"^[a-z0-9]+(-[a-z0-9]+)*\.md$")
# Lien vers une fiche dans le corps d'un dossier : [texte](fiche:<id>)
FICHE_LINK = re.compile(r"\]\(\s*fiche:([^)\s]*)\s*\)")
# Image dans le corps d'un dossier : ![texte alternatif](images/<slug>/<fichier> "Légende")
IMAGE_REF = re.compile(r"!\[([^\]]*)\]\(\s*<?([^)\s>]+)>?")
IMAGES_DIR = DOSSIERS_DIR / "images"


def load_schema():
    with open(SCHEMA_PATH, encoding="utf-8") as f:
        return json.load(f)


def split_front_matter(text):
    """Renvoie (en-tête YAML brut, corps) ou None si le fichier n'a pas d'en-tête."""
    match = re.match(r"\A---[ \t]*\r?\n(.*?)\r?\n---[ \t]*(?:\r?\n|\Z)(.*)\Z", text, re.DOTALL)
    return (match.group(1), match.group(2)) if match else None


def check_dossiers(entities):
    """Valide dossiers/*.md ; renvoie (nombre vérifié, erreurs trouvées)."""
    if not DOSSIERS_DIR.is_dir():
        return 0, False
    paths = sorted(DOSSIERS_DIR.glob("*.md"))
    if not paths:
        return 0, False

    try:
        import yaml
    except ImportError:
        sys.exit("Le module 'pyyaml' est requis pour valider les dossiers : pip install pyyaml")

    with open(DOSSIER_SCHEMA_PATH, encoding="utf-8") as f:
        validator = Draft7Validator(json.load(f))

    errors_found = False
    for path in paths:
        rel = path.relative_to(ROOT)

        if not DOSSIER_FILENAME.match(path.name):
            print(f"[CHEMIN] {rel}: nom de fichier en kebab-case attendu (minuscules, chiffres, tirets)")
            errors_found = True

        parts = split_front_matter(path.read_text(encoding="utf-8"))
        if parts is None:
            print(f"[DOSSIER] {rel}: en-tête YAML manquant (le fichier doit commencer par '---')")
            errors_found = True
            continue
        raw_header, body = parts

        try:
            header = yaml.safe_load(raw_header)
        except yaml.YAMLError as e:
            print(f"[YAML] {rel}: {e}")
            errors_found = True
            continue
        if not isinstance(header, dict):
            print(f"[DOSSIER] {rel}: l'en-tête YAML doit être une liste de champs 'clé: valeur'")
            errors_found = True
            continue

        for err in validator.iter_errors(header):
            where = ".".join(str(p) for p in err.absolute_path)
            print(f"[SCHEMA] {rel}: {where + ' : ' if where else ''}{err.message}")
            errors_found = True

        if not body.strip():
            print(f"[DOSSIER] {rel}: le corps du dossier est vide")
            errors_found = True

        listed = header.get("fiches") if isinstance(header.get("fiches"), list) else []
        for ref in listed:
            if ref not in entities:
                print(f"[LIEN] {rel}: '{ref}' dans 'fiches' ne correspond à aucune fiche")
                errors_found = True

        for ref in dict.fromkeys(FICHE_LINK.findall(body)):
            if ref not in entities:
                print(f"[LIEN] {rel}: le lien fiche:{ref} du texte ne correspond à aucune fiche")
                errors_found = True
            elif ref not in listed:
                print(f"[LIEN] {rel}: le lien fiche:{ref} du texte doit aussi figurer dans 'fiches'")
                errors_found = True

        errors_found = check_dossier_images(rel, path.stem, header, body) or errors_found

    # Un dossier d'images doit correspondre à un dossier thématique existant
    if IMAGES_DIR.is_dir():
        slugs = {path.stem for path in paths}
        for folder in sorted(p for p in IMAGES_DIR.iterdir() if p.is_dir()):
            if folder.name not in slugs:
                print(f"[IMAGE] {folder.relative_to(ROOT)}: aucun dossier '{folder.name}.md' ne correspond à ce répertoire d'images")
                errors_found = True

    return len(paths), errors_found


def check_dossier_images(rel, slug, header, body):
    """Images d'un dossier : déclarées dans 'images', présentes sur le disque, sans fichier orphelin."""
    errors_found = False
    folder = IMAGES_DIR / slug
    declared = header.get("images") if isinstance(header.get("images"), list) else []
    names = {image.get("fichier") for image in declared if isinstance(image, dict)}

    for name in sorted(n for n in names if isinstance(n, str)):
        if not (folder / name).is_file():
            print(f"[IMAGE] {rel}: '{name}' est déclarée dans 'images' mais absente de {folder.relative_to(ROOT)}/")
            errors_found = True

    couverture = header.get("couverture")
    if isinstance(couverture, dict) and couverture.get("fichier") not in names:
        print(f"[IMAGE] {rel}: la couverture '{couverture.get('fichier')}' doit aussi être déclarée dans 'images'")
        errors_found = True

    prefix = f"images/{slug}/"
    used = {couverture.get("fichier")} if isinstance(couverture, dict) else set()
    for alt, url in IMAGE_REF.findall(body):
        path = url.removeprefix("./")
        name = path[len(prefix):]
        used.add(name)
        if not path.startswith(prefix) or "/" in name:
            print(f"[IMAGE] {rel}: l'image {url} doit se trouver dans {prefix}")
            errors_found = True
        elif name not in names:
            print(f"[IMAGE] {rel}: l'image {url} doit être déclarée dans 'images' (crédit, licence, source)")
            errors_found = True
        if not alt.strip():
            print(f"[IMAGE] {rel}: l'image {url} n'a pas de texte alternatif")
            errors_found = True

    # Une image déclarée doit servir : dans le texte ou comme couverture
    for name in sorted(n for n in names - used if isinstance(n, str)):
        print(f"[IMAGE] {rel}: '{name}' est déclarée dans 'images' mais n'est utilisée ni dans le texte ni en couverture")
        errors_found = True

    if folder.is_dir():
        for file in sorted(f for f in folder.iterdir() if f.is_file() and not f.name.startswith(".")):
            if file.name not in names:
                print(f"[IMAGE] {file.relative_to(ROOT)}: fichier non déclaré dans l'en-tête 'images' de {rel}")
                errors_found = True

    return errors_found


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
    entities = {}

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

        entities[data.get("id")] = (rel, data)

    # Les liens (genealogie, recits_associes) doivent pointer vers des fiches existantes
    for entity_id, (rel, data) in entities.items():
        links = [("recits_associes", ref) for ref in data.get("recits_associes", [])]
        for field, refs in data.get("genealogie", {}).items():
            links += [(f"genealogie.{field}", ref) for ref in refs]
        for field, ref in links:
            if ref not in entities:
                print(f"[LIEN] {rel}: '{ref}' dans '{field}' ne correspond à aucune fiche")
                errors_found = True

    dossiers_checked, dossier_errors = check_dossiers(entities)
    errors_found = errors_found or dossier_errors

    print(f"\n{checked} fiche(s) vérifiée(s), {dossiers_checked} dossier(s) vérifié(s).")
    if errors_found:
        print("Validation échouée.")
        sys.exit(1)
    else:
        print("Tout est valide. ✔")


if __name__ == "__main__":
    main()
