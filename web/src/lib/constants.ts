export const REGIONS = [
  "afrique-ouest",
  "afrique-centrale",
  "afrique-est",
  "afrique-australe",
  "afrique-nord",
  "diaspora",
] as const;

export type Region = (typeof REGIONS)[number];

export const CATEGORIES = ["deites", "heros", "creatures", "recits", "rites"] as const;

export type Categorie = (typeof CATEGORIES)[number];

export const REGION_LABELS: Record<Region, string> = {
  "afrique-ouest": "Afrique de l'Ouest",
  "afrique-centrale": "Afrique centrale",
  "afrique-est": "Afrique de l'Est",
  "afrique-australe": "Afrique australe",
  "afrique-nord": "Afrique du Nord",
  diaspora: "Diaspora",
};

export const REGION_DESCRIPTIONS: Record<Region, string> = {
  "afrique-ouest":
    "Panthéons yoruba, fon, akan et voisins. Orishas, vodun et figures tricksters qui irrigueront largement les diasporas.",
  "afrique-centrale":
    "Cosmogonies kongo, luba et voisines, culte des ancêtres et figures de la forêt et des grands fleuves.",
  "afrique-est":
    "Traditions swahilies, éthiopiennes, kényanes et voisines, entre corne de l'Afrique et grands lacs.",
  "afrique-australe":
    "Traditions zoulou, xhosa, shona et voisines, ancêtres et divination au sud du continent.",
  "afrique-nord":
    "Panthéons berbère et égyptien antique, syncrétismes méditerranéens et sahariens.",
  diaspora:
    "Survivances et recompositions syncrétiques dans les Amériques et les Caraïbes : vodou, santería, candomblé et au-delà.",
};

export const CATEGORY_LABELS: Record<Categorie, string> = {
  deites: "Divinités",
  heros: "Héros",
  creatures: "Créatures",
  recits: "Récits",
  rites: "Rites",
};

export const CATEGORY_LABELS_SINGULAR: Record<Categorie, string> = {
  deites: "Divinité",
  heros: "Héros",
  creatures: "Créature",
  recits: "Récit",
  rites: "Rite",
};

export const CATEGORY_DESCRIPTIONS: Record<Categorie, string> = {
  deites: "Divinités, orishas, esprits majeurs",
  heros: "Figures culturelles, ancêtres fondateurs, tricksters",
  creatures: "Créatures, esprits mineurs, génies",
  recits: "Mythes narratifs complets, contes",
  rites: "Pratiques rituelles, divination, initiation",
};
