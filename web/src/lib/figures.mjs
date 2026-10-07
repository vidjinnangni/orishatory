// Images des dossiers : une image seule dans son paragraphe devient une
// <figure> avec sa légende et son crédit.
//
//   ![Texte alternatif](images/<slug>/fichier.jpg "Légende")
//
// La légende est le titre de l'image (facultatif). Le crédit vient de l'entrée
// `images` de l'en-tête YAML qui porte le même nom de fichier :
// « Crédit : <auteur ou institution> (<licence>) », avec un lien vers l'original.
// scripts/validate.py vérifie que chaque image est déclarée et que le fichier existe.

/** Nom de fichier d'une URL d'image relative (« images/<slug>/x.jpg » -> « x.jpg »). */
function fileName(url) {
  return url.split(/[?#]/)[0].split("/").pop();
}

/** Copie un nœud mdast en objet simple, sans les champs internes de Sätteri. */
function plain(node) {
  return JSON.parse(JSON.stringify(node, (key, value) => (key === "position" || key.startsWith("_") ? undefined : value)));
}

function text(value) {
  return { type: "text", value };
}

/** Plugin mdast (Sätteri) : paragraphe réduit à une image -> <figure> légendée et créditée. */
export function figures() {
  return (doc) => {
    const declared = doc.data?.astro?.frontmatter?.images;
    const credits = new Map(Array.isArray(declared) ? declared.map((image) => [image.fichier, image]) : []);

    return {
      name: "orishatory-figures",
      paragraph(node, ctx) {
        const children = node.children.filter((child) => !(child.type === "text" && child.value.trim() === ""));
        if (children.length !== 1 || children[0].type !== "image") return;

        const image = plain(children[0]);
        const credit = credits.get(fileName(image.url));
        const caption = [];
        if (image.title) caption.push({ type: "emphasis", data: { hName: "span", hProperties: { className: ["figure-legende"] } }, children: [text(image.title)] });
        if (credit) {
          caption.push({
            type: "emphasis",
            data: { hName: "span", hProperties: { className: ["figure-credit"] } },
            children: [
              text("Crédit : "),
              { type: "link", url: credit.source, children: [text(credit.credit)] },
              text(` (${credit.licence})`),
            ],
          });
        }
        // Le titre sert de légende : inutile de le répéter en infobulle.
        delete image.title;

        ctx.replaceNode(node, {
          type: "paragraph",
          data: { hName: "figure", hProperties: { className: ["figure"] } },
          children: [
            image,
            ...(caption.length ? [{ type: "emphasis", data: { hName: "figcaption" }, children: caption }] : []),
          ],
        });
      },
    };
  };
}
