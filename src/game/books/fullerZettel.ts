import type { HandbookChapter } from "@/game/e67Handbook";
import { registerBook, type ReadableBook } from "./registry";

/**
 * Hannes Fuller-Zettel — eigene Übersetzungen aus Fullers Texten,
 * die sie Layard beim ersten Gespräch über Buckminster Fuller anbietet.
 * Der Text bleibt bewusst unverändert: er ist ein Fundstück, kein Lehrbuch.
 */
export const FULLER_ZETTEL_CHAPTERS: HandbookChapter[] = [
  {
    id: "hebelprinzip",
    shortTitle: "Das Hebelprinzip",
    title: "Die Entdeckung des verallgemeinerten Hebelprinzips",
    body: [
      "> „Um dieses Gesamtsystem zu begreifen, halten wir fest, dass vor langer Zeit ein Mensch durch den Wald ging – so wie Sie es vielleicht getan haben und ich sicherlich auch –, um den kürzesten Weg durch den Wald in eine bestimmte Richtung zu finden. Er fand umgestürzte Bäume auf seinem Weg. Er kletterte über diese kreuz und quer liegenden Bäume und fand sich plötzlich auf einem Baum wieder, der langsam wippte. Er lag zufällig über einem anderen großen Baum, und das andere Ende des Baumes, auf dem er wippte, lag unter einem dritten großen, umgestürzten Baum. Während er wippte, sah er, wie sich der dritte große Baum hob. Es schien ihm unmöglich. Er ging hinüber und versuchte, seine eigenen Muskeln einzusetzen, um diesen großen Baum zu heben. Er konnte ihn nicht bewegen. Dann kletterte er zurück auf den ersten, kleineren Baum, wippte gezielt auf ihm, und tatsächlich hob er den größeren Baum erneut an. Ich bin sicher, dass der erste Mensch, der einen solchen Baum fand, glaubte, es handele sich um einen Zauberbaum, und ihn vielleicht nach Hause schleifte und als den ersten Totempfahl der Menschheit errichtete. Es dauerte wahrscheinlich lange, bis er lernte, dass jeder kräftige Baum dies tun würde, und so das Konzept des verallgemeinerten Hebelprinzips aus all seinen früheren, aufeinanderfolgenden Einzelfallerfahrungen mit solchen zufälligen Entdeckungen ableitete.“",
    ],
  },
  {
    id: "raumschiff-erde",
    shortTitle: "Raumschiff Erde",
    title: "Raumschiff Erde und die Metapher des künftigen Ausbrütens",
    body: [
      "> „Um unsere Position an Bord unseres Raumschiffs Erde zu bestimmen, müssen wir zuerst anerkennen, dass die Fülle an sofort verbrauchbaren, offensichtlich begehrenswerten oder absolut essenziellen Ressourcen bisher ausreichte, um uns trotz unserer Unwissenheit weiterleben zu lassen. Da sie letztlich erschöpfbar und verderblich sind, waren sie nur bis zu diesem kritischen Moment ausreichend. Dieses Fehlertoleranz-Polster für das Überleben und Wachstum der Menschheit bis heute wurde offenbar genau so bereitgestellt, wie ein Vogel im Ei mit flüssiger Nahrung versorgt wird, um sich bis zu einem bestimmten Punkt zu entwickeln. Doch dann ist diese Nahrung planmäßig genau zu dem Zeitpunkt aufgebraucht, an dem das Küken groß genug ist, um sich auf seinen eigenen Beinen fortzubewegen. Und während das Küken an der Schale pickt, um mehr Nahrung zu suchen, bricht es unbeabsichtigt die Schale auf.“",
    ],
  },
  {
    id: "aphorismen",
    shortTitle: "Aphorismen",
    title: "Kürzere Zitate und Aphorismen",
    body: [
      "- Über Technologie und Weltordnung: „Eine neue, physisch unbeeinträchtigte, metaphysische Initiative unvoreingenommener Integrität könnte die Welt vereinen. Sie könnte und wird wahrscheinlich durch die völlig unpersönlichen Problemlösungen der Computer bereitgestellt werden.“",
      "- Über Physik und Erfahrung: „Heisenbergs Prinzip der ‚Unbestimmtheit‘ [...], das die experimentelle Entdeckung anerkannte, dass der Akt des Messens das Gemessene immer verändert, verwandelt Erfahrung in ein kontinuierliches und sich niemals wiederholendes evolutionäres Szenario.“",
      "- Über Ökonomie: „Der Goldvorrat ist so geringfügig, dass es reiner Voodoo ist, zu versuchen, den wirtschaftlichen Evolutionsverkehr der Welt durch das Nadelöhr der Goldgröße zu schleusen.“",
      "- Über Geist und Wohlstand: „Das Gehirn befasst sich ausschließlich mit dem Physischen, der Geist ausschließlich mit dem Metaphysischen. Wohlstand ist die fortschreitende Beherrschung der Materie durch den Geist...“",
      "- Über Entwicklung: „Das junge Vogelküken, das aus seinem ursprünglichen Schutzraum heraustritt, muss nun auf seinen eigenen Beinen und Flügeln nach Nahrung suchen, um die nächste Phase seiner regenerativen Existenzsicherung zu entdecken.“",
    ],
  },
];

export const FULLER_ZETTEL_UI_TEXT = {
  ariaLabel: "Hannes Fuller-Übersetzungen",
  closeLabel: "Zettel schließen",
  contents: "Inhalt",
  chaptersUnit: (n: number) => `${n} Abschnitte`,
  edition: "Übersetzt und abgeschrieben von Hanne Brodersen",
  pagerStart: "— Anfang —",
  pagerEnd: "— Ende —",
  pagerOf: (idx: number, total: number) => `Seite ${idx} / ${total}`,
  chapterSelectLabel: "Abschnitt",
} as const;

export const FULLER_ZETTEL_BOOK: ReadableBook = {
  id: "fullerZettel",
  title: "Buckminster Fuller",
  subtitle: "Übersetzungen aus seinen Texten",
  author: "R. Buckminster Fuller / Hanne Brodersen (Übers.)",
  year: "o. J.",
  blurb:
    "Ein Zettel mit Hannes eigenen Übersetzungen aus Fullers Texten: das Hebelprinzip, das Raumschiff Erde, einige Aphorismen.",
  chapters: FULLER_ZETTEL_CHAPTERS,
  uiText: FULLER_ZETTEL_UI_TEXT,
  locationHint: "Von Hanne Brodersen, Wohnung 1104",
  lendable: true,
};

registerBook(FULLER_ZETTEL_BOOK);
