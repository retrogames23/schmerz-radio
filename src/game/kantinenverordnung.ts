/**
 * Kantinenverordnung — statisches Buch-Item in Layards Bücherschrank.
 *
 * Sammelt die alten Kantinen-Paragraphen aus der ursprünglichen
 * Bürokratie-Duell-Mechanik. Seit das Duell auf Phrasen umgestellt
 * wurde, sind diese §§ nur noch Weltkolorit — sie haben keine
 * mechanische Wirkung mehr. Das Buch ist im Inventar einsteckbar und
 * über ein Lese-Overlay aufschlagbar; ansonsten ist es nutzlos.
 *
 * Alle Strings sind ganze Sätze (i18n-konform).
 */

export interface VerordnungsParagraph {
  /** Kurze Bezeichnung (Aushang/§-Kürzel). */
  shortLabel: string;
  /** Volltext, wie er im Buch steht. */
  fullText: string;
  /** Optionaler Randnotiz-Hinweis (handgeschrieben). */
  marginNote?: string;
}

/** Inhaltsabschnitte des Buches. */
export interface VerordnungsSection {
  title: string;
  intro?: string;
  entries: VerordnungsParagraph[];
}

export const KANTINENVERORDNUNG_SECTIONS: VerordnungsSection[] = [
  {
    title: "I. Aushänge & Übersagung",
    intro:
      "Aushänge gelten in chronologischer Reihenfolge — sofern der ältere im Wortlaut widerrufen wurde. Genau das passiert selten.",
    entries: [
      {
        shortLabel: "Aushang 4.2 (1996)",
        fullText:
          "Aushang 4.2 vom 14. März 1996: »Ausgaben der Schicht B erfolgen ausschließlich gegen Schicht-B-Gegenzeichnung. Schicht-A-Vollmachten gelten in Schicht B nicht.«",
        marginNote: "Brusts Lieblingsaushang. Junges Datum, scharfer Ton.",
      },
      {
        shortLabel: "Aushang 7.1 (1991)",
        fullText:
          "Aushang 7.1 vom 02. August 1991: »Gegenzeichnungen aus benachbarten Schichten gelten als gleichwertig, sofern Identität und Anliegen unstrittig sind.« — Niemals ausdrücklich widerrufen.",
        marginNote: "Älter, aber nie widerrufen. Kowalks stilles Schwert.",
      },
      {
        shortLabel: "Hausordnung §1a (Übersagung)",
        fullText:
          "Hausordnung §1a: »Bei mehrfacher Überlagerung gilt der jüngere Aushang, sofern der ältere im Wortlaut widerrufen wurde.«",
        marginNote:
          "Die Übersagungs-Klausel — und die Hintertür dazu: »sofern widerrufen«.",
      },
      {
        shortLabel: "Hausordnung §1a — Wortlaut-Klausel",
        fullText:
          "Hausordnung §1a, zweiter Halbsatz: »…sofern der ältere im Wortlaut widerrufen wurde.« — Übersagung allein genügt nicht; das Wort »widerrufen« muss im neuen Aushang stehen.",
        marginNote:
          "Die Hintertür: ohne ausdrücklichen Widerruf bleibt der ältere Aushang in Kraft.",
      },
    ],
  },
  {
    title: "II. Schichtordnung",
    entries: [
      {
        shortLabel: "Schichtordnung §3 Abs. 4",
        fullText:
          "Schichtordnung §3 Abs. 4: »Schichtwechsel erfolgt nahtlos; in der Übergabezeit dürfen Vorgänge der vorhergehenden Schicht von der nachfolgenden Schicht abgeschlossen werden.«",
        marginNote: "Übergabe = Fortführung.",
      },
      {
        shortLabel: "Schichtordnung §3 Abs. 4 lit. b",
        fullText:
          "Schichtordnung §3 Abs. 4 lit. b: »Schichtfremde Vorgänge sind fortzuführen, sofern keine ausdrückliche schriftliche Einrede erhoben wird. Eine bloße mündliche Verweigerung gilt nicht als Einrede.«",
        marginNote:
          "Mündliche Verweigerung zählt nicht. Nur schriftliche Einrede stoppt den Vorgang.",
      },
    ],
  },
  {
    title: "III. Vollmachten",
    entries: [
      {
        shortLabel: "Vollmachtsordnung §12",
        fullText:
          "Vollmachtsordnung §12: »Eine Vollmacht erlischt mit Schichtende des ausstellenden Bediensteten.«",
        marginNote: "Brusts Trick: Vollmacht 4317 sei mit Schicht A erloschen.",
      },
      {
        shortLabel: "Vollmachtsordnung §12 Abs. 2",
        fullText:
          "Vollmachtsordnung §12 Abs. 2: »Vollmachten zugunsten von Bewohnern bleiben bis zur tatsächlichen Einlösung wirksam, unabhängig von Schichten oder Personalwechseln. Maßgeblich ist das Ausstellungsdatum, nicht der Einlösezeitpunkt.«",
        marginNote:
          "Bewohner-Vollmachten überleben den Schichtwechsel. Datum zählt, nicht Uhrzeit.",
      },
    ],
  },
  {
    title: "IV. Identität & Gegenzeichnung",
    entries: [
      {
        shortLabel: "Identitätsordnung §2",
        fullText:
          "Identitätsordnung §2: »Gegenzeichnung nur durch Bedienstete derselben Schicht und desselben Sektors zulässig.«",
        marginNote: "Strenge Auslegung: Schicht UND Sektor müssen passen.",
      },
      {
        shortLabel: "Identitätsordnung §2 Abs. 3",
        fullText:
          "Identitätsordnung §2 Abs. 3: »Bei Personalmangel oder unbesetzter Schicht kann die Gegenzeichnung durch eine sektorbenachbarte Stelle erfolgen. Die Annahme darf nicht verweigert werden, sofern die Identität des Bewohners feststeht.«",
        marginNote:
          "Personalmangel-Klausel: Nachbarstellen dürfen — und müssen — gegenzeichnen.",
      },
    ],
  },
  {
    title: "V. Generalvorbehalt",
    entries: [
      {
        shortLabel: "Verwaltungsrahmenordnung §99",
        fullText:
          "Verwaltungsrahmenordnung §99: »Die Verwaltung behält sich in Zweifelsfällen die endgültige Entscheidung vor.«",
        marginNote:
          "Vossbecks Trumpf — angeblich. Klingt allmächtig, hat aber eine Bedingung.",
      },
      {
        shortLabel: "§99 — Zweifelsfall-Bedingung",
        fullText:
          "Verwaltungsrahmenordnung §99, Erläuterung: »Ein Zweifelsfall liegt nur vor, wenn die einschlägigen Spezialnormen lückenhaft oder widersprüchlich sind. Bei klarer Spezialregelung ist §99 nicht anwendbar.«",
        marginNote:
          "§99 greift nur in echten Lücken. Existiert eine Spezialnorm, ist er gesperrt.",
      },
    ],
  },
  {
    title: "VI. Anhang: Kuriositäten der Hauspraxis",
    intro:
      "Aushänge, die niemand mehr ernst nimmt, aber auch niemand abhängt. Sammelposten.",
    entries: [
      {
        shortLabel: "Pausenordnung §4",
        fullText:
          "Pausenordnung §4: »Brötchen sind vor der Suppe auszugeben.«",
      },
      {
        shortLabel: "Aushang 12.3 (1988)",
        fullText:
          "Aushang 12.3 vom 09. Mai 1988: »Tabletts sind in Fahrtrichtung der Ausgabezone zu führen.«",
      },
      {
        shortLabel: "Identitätsordnung §7",
        fullText:
          "Identitätsordnung §7: »Bei Nachschlag ist der Lichtbildausweis erneut vorzuzeigen.«",
      },
      {
        shortLabel: "Hausordnung §9c",
        fullText: "Hausordnung §9c: »Pfeifen im Speisesaal ist zu unterlassen.«",
      },
      {
        shortLabel: "Aushang 2.2 (1993)",
        fullText:
          "Aushang 2.2 vom 17. November 1993: »Suppenlöffel sind nach Gebrauch mit der konvexen Seite nach oben abzulegen.«",
      },
      {
        shortLabel: "Vorratsordnung §5",
        fullText:
          "Vorratsordnung §5: »Nachschub aus dem Lager B-Süd erfolgt ausschließlich freitags nach 14 Uhr.«",
      },
      {
        shortLabel: "Tresenordnung §3",
        fullText:
          "Tresenordnung §3: »Bewohner haben einen Mindestabstand von vierzig Zentimetern zur Ausgabekante zu wahren.«",
      },
      {
        shortLabel: "Stempelordnung §1 lit. b",
        fullText:
          "Stempelordnung §1 lit. b: »Stempel sind mittig auf der Unterschriftenzeile zu setzen, niemals darüber.«",
      },
    ],
  },
];

export const KANTINENVERORDNUNG_TITLE = "Kantinenverordnung — Sammelausgabe";
export const KANTINENVERORDNUNG_SUBTITLE =
  "Aushänge, Hausordnung, Schicht- und Vollmachtsklauseln. Stand: ungewiss.";
export const KANTINENVERORDNUNG_PREFACE =
  "Auf dem Vorsatzblatt, in winziger Handschrift: »Wer das ganz liest, hat schon verloren.«";