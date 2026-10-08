// Typographie française à l'affichage : remplace les espaces ordinaires par des
// espaces insécables là où une coupure de ligne serait fautive, sans toucher aux
// fichiers sources (fiches JSON et dossiers Markdown gardent des espaces simples).
//
//   « texte »   espace insécable après « et avant »
//   mot ; ! ?   espace fine insécable avant ; ! ?
//   mot :       espace insécable avant :
//   740 668     espace fine insécable entre les groupes de chiffres
//   p. 44, n° 27, vol. II   espace insécable après l'abréviation

const NBSP = " "; // espace insécable
const NNBSP = " "; // espace fine insécable
const SPACES = "[ \\u00A0\\u202F]+";

const RULES = [
  [new RegExp(`«${SPACES}`, "g"), `«${NBSP}`],
  [new RegExp(`${SPACES}»`, "g"), `${NBSP}»`],
  [new RegExp(`${SPACES}([;!?])`, "g"), `${NNBSP}$1`],
  [new RegExp(`${SPACES}:`, "g"), `${NBSP}:`],
  [new RegExp(`(\\b(?:p|pp|vol|chap|t|fig)\\.|n°)${SPACES}(?=[\\dIVXLC])`, "g"), `$1${NBSP}`],
];

// Groupes de chiffres « 1 942 949 » : à répéter tant qu'un groupe reste séparé.
const DIGIT_GROUPS = /(\d) (\d{3})(?!\d)/g;

/** Applique les espaces insécables de la typographie française à une chaîne. */
export function frenchSpacing(text) {
  if (typeof text !== "string" || text === "") return text;
  let out = text;
  for (const [pattern, replacement] of RULES) out = out.replace(pattern, replacement);
  let previous;
  do {
    previous = out;
    out = out.replace(DIGIT_GROUPS, `$1${NNBSP}$2`);
  } while (out !== previous);
  return out;
}

/** Plugin mdast (Sätteri) : applique frenchSpacing à tous les nœuds de texte d'un dossier. */
export function frenchTypography() {
  return {
    name: "orishatory-french-typography",
    text(node, ctx) {
      const value = frenchSpacing(node.value);
      if (value !== node.value) ctx.setProperty(node, "value", value);
    },
  };
}
