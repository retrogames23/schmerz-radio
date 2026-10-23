import {
  ALMANACH_CHAPTERS,
  ALMANACH_SUBTITLE,
  ALMANACH_TITLE,
  ALMANACH_UI_TEXT,
} from "@/game/sektorenAlmanach";
import { registerBook, type ReadableBook } from "./registry";

export const ALMANACH_BOOK: ReadableBook = {
  id: "almanach",
  title: ALMANACH_TITLE,
  subtitle: ALMANACH_SUBTITLE,
  author: "Quadranten-Konvention",
  year: "1997",
  blurb:
    "Bewohner-Ausgabe des Sektoren-Almanachs. In-Game-Pendant zur Welt-Lore: enthält nur, was eine Figur 1997 wissen würde.",
  chapters: ALMANACH_CHAPTERS,
  uiText: ALMANACH_UI_TEXT,
  locationHint: "Wandregal, Layards Wohnung",
  lendable: false,
};

registerBook(ALMANACH_BOOK);
