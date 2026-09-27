import soutiensData from "../data/soutiens.json";

export interface Soutien {
  nom: string;
  /** Lien optionnel vers leur site, profil GitHub, etc. */
  url?: string;
}

/**
 * Liste des soutiens financiers du projet (Buy Me a Coffee, GitHub Sponsors...).
 * Pas d'intégration automatique : ces plateformes n'exposent pas d'API que ce
 * site statique pourrait interroger au build, et surtout, un don ne vaut pas
 * consentement implicite à être nommé publiquement. On n'ajoute un nom ici
 * que si la personne l'a explicitement demandé (voir web/README.md).
 */
export const SOUTIENS: Soutien[] = soutiensData as Soutien[];
