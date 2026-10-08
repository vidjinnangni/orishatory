// Encadrés à la GitHub dans les dossiers : une citation qui commence par
// `[!NOTE]` devient un <aside class="callout"> titré « À savoir ».
//
//   > [!NOTE]
//   > **Alaafin** : titre du souverain d'Oyo.
//
// Sätteri ne reconnaît pas cette syntaxe : sans ce plugin, « [!NOTE] »
// s'afficherait tel quel dans une citation ordinaire.
import { frenchSpacing } from "./typo.mjs";

const MARKER = /^\[!NOTE\][ \t]*(?:\r?\n|$)/;

/**
 * Copie un nœud mdast en objet simple, sans les champs internes de Sätteri. Les
 * nœuds recopiés ne repassent pas par le plugin de typographie : on l'applique ici.
 */
function plain(node) {
  return JSON.parse(
    JSON.stringify(node, (key, value) => (key === "position" || key.startsWith("_") ? undefined : value)),
    (key, value) => (key === "value" && typeof value === "string" ? frenchSpacing(value) : value),
  );
}

/** Plugin mdast (Sätteri) : `> [!NOTE]` -> encadré « À savoir ». */
export function callouts() {
  return {
    name: "orishatory-callouts",
    blockquote(node, ctx) {
      const first = node.children[0];
      const text = first?.type === "paragraph" ? first.children[0] : undefined;
      if (text?.type !== "text" || !MARKER.test(text.value)) return;

      const children = plain(node).children;
      const lead = children[0].children;
      const rest = text.value.replace(MARKER, "");
      if (rest) lead[0].value = rest;
      else lead.shift();
      if (lead.length === 0) children.shift();

      ctx.replaceNode(node, {
        type: "blockquote",
        data: { hName: "aside", hProperties: { className: ["callout"], role: "note" } },
        children: [
          { type: "paragraph", data: { hProperties: { className: ["callout-title"] } }, children: [{ type: "text", value: "À savoir" }] },
          ...children,
        ],
      });
    },
  };
}
