/**
 * Bestand der Bewohnerbibliothek in Raum 1101 (Gebäude E71, Etage 1).
 *
 * Alle Titel sind ausleihbar — es gibt keinen Präsenzbestand. Layard leiht
 * bei Herbert aus, trägt das Buch im Inventar und kann es zurückbringen.
 * Weitere Titel hier eintragen; Dialog und Szene lesen die Liste automatisch.
 */
import type { InventoryItemId } from "./types";

export interface LibraryBook {
  id: string;
  title: string;
  author: string;
  year: string;
  /** Kurzer Katalogeintrag, wie Herbert ihn vorlesen würde. */
  blurb: string;
  /** Inventar-Item, das Layard beim Ausleihen erhält. */
  itemId: InventoryItemId;
  /** Kurzname im Inventar. */
  itemName: string;
}

export const LIBRARY_BOOKS: LibraryBook[] = [
  {
    id: "sumer-listen",
    title: "Listen aus Uruk — Verwaltung vor der Literatur",
    author: "M. Ehrenhart",
    year: "1981",
    blurb:
      "Über die ältesten Tontafeln: Gerste, Bier, Schafe, Schulden. Herbert legt hier gern den Finger auf eine Zeile und schweigt dann.",
    itemId: "buchSumerListen",
    itemName: "Listen aus Uruk (Leihbuch)",
  },
  {
    id: "schmalspur",
    title: "Schmalspur — Nebenbahnen Mitteleuropas 1890–1946",
    author: "K. Obholz",
    year: "1974",
    blurb:
      "Streckenpläne, Fahrpläne, Betriebsstellen. Viele der Strecken gibt es nicht mehr; die Fahrpläne schon.",
    itemId: "buchSchmalspur",
    itemName: "Schmalspur (Leihbuch)",
  },
  {
    id: "resonanzhygiene-1956",
    title: "Resonanzhygiene — Ein Leitfaden für den Einzelnen",
    author: "Dr. med. H. C. Brennwald",
    year: "1956",
    blurb:
      "Noch aus der Zeit, bevor der Begriff seine soziale Seite bekam: Lüften, Dämmen, Abstandhalten, Ruhepausen. Brennwald schreibt über Resonanz wie über Staub oder Lärm — als individuelle Gefährdung, nicht als zwischenmenschliches Phänomen. Der Anhang listet zugelassene Schirme und Dichtungen.",
    itemId: "buchResonanzhygiene",
    itemName: "Resonanzhygiene (Leihbuch)",
  },
  {
    id: "gespaltener-geist",
    title: "Der gespaltene Geist — Eine Geschichte der Datenfluss-Maschinen",
    author: "S. R. Vossen",
    year: "1997",
    blurb:
      "Vossen erzählt, warum unsere Computer nie einen einzelnen Prozessor hatten: 1945 verschwand ein geheimer Entwurf des US-Kriegsministeriums in den Archiven, und die Welt entschied sich stattdessen für die strenge Trennung von Programm und Daten. Aus dieser Gabelung erwuchs nicht die sequenzielle Allzweck-CPU, sondern die Datenstrom-Maschine: hunderte kleiner Knoten, die feuern, sobald genug Eingänge anliegen, ohne Takt, ohne Flaschenhals, ohne das Hin-und-her-Schaufeln, das andere Architekturen plagt. Vossen führt von Aikens und Zuses getrennten Speichern über Intels asynchronen Matrix-1 bis hin zu den heutigen Cellular Arrays in Laptops und Türsteuerungen. Ein Kapitel widmet sich MARV und ähnlichen Systemen: Warum KI bei uns nicht simuliert, sondern eingeätzt wird. Technisch dicht, aber klar geschrieben; für Leser, die wissen wollen, warum ihre Geräte nie abstürzen und ihre Akkus monatelang halten.",
    itemId: "buchGespaltenerGeist",
    itemName: "Der gespaltene Geist (Leihbuch)",
  },
  {
    id: "ordnung-und-eigentum",
    title: "Ordnung und Eigentum — Wirtschaftssysteme im Vergleich",
    author: "Prof. Dr. E. Kallweit · Dr. R. Semmler",
    year: "1995",
    blurb:
      "Vergleicht drei Wirtschaftsordnungen: die Vereinigten Staaten, die Sowjetunion und das Mandatsgebiet. Kallweit und Semmler beschreiben, wie Eigentum, Plan und Verwaltung in jedem System verteilt sind — ohne zu predigen, aber mit scharfem Blick für Bürokratie.",
    itemId: "buchOrdnungEigentum",
    itemName: "Ordnung und Eigentum (Leihbuch)",
  },
  {
    id: "drehende-dreieck",
    title: "Das drehende Dreieck — Eine Geschichte des Automobils",
    author: "Dipl.-Ing. G. Rothstein",
    year: "1997",
    blurb:
      "Rothstein erzählt, wie der Rotationskolbenmotor zum Weltstandard wurde: Keramik-Dichtleisten ab 1968, Schichteinspritzung 1971, die Ölkrise als Rückenwind — und warum Autos seitdem außen kleiner und innen größer sind.",
    itemId: "buchDrehendeDreieck",
    itemName: "Das drehende Dreieck (Leihbuch)",
  },
  {
    id: "mandatsdeutsch",
    title: "Mandatsdeutsch — Wie am Schalter eine Sprache entstand",
    author: "Dr. phil. A. Ternes",
    year: "1993",
    blurb:
      "Ternes hat jahrelang in Wartebereichen zugehört. Herausgekommen ist eine Sprachbeschreibung: Sprawka, Naryad, Case, „nicht vorgesehen\" — und warum hier niemand sagt, wer etwas entschieden hat.",
    itemId: "buchMandatsdeutsch",
    itemName: "Mandatsdeutsch (Leihbuch)",
  },
  {
    id: "lob-des-vorgangs",
    title: "Lob des Vorgangs",
    author: "Dr. phil. J. A. Sonderegger",
    year: "1988",
    blurb:
      "Eine historisch-philosophische Verteidigung der Bürokratie: von Max Webers idealtypischem Beamten bis zur Psychologie des Wartens — und einem Schlussgedicht, das sich in die Aktenordnung verliebt.",
    itemId: "buchLobDesVorgangs",
    itemName: "Lob des Vorgangs (Leihbuch)",
  },
  {
    id: "nicht-vorgesehen",
    title: "Nicht vorgesehen",
    author: "Christa Wolf",
    year: "1987",
    blurb:
      "Ein Kurzroman: Eine Verwaltungsangestellte soll vierzig Tagebuchhefte aus einem Nachlass einstufen. Das Formblatt kennt drei Felder — verwertbar, zuzustellen, zu vernichten. Ein viertes gibt es nicht.",
    itemId: "buchNichtVorgesehen",
    itemName: "Nicht vorgesehen (Leihbuch)",
  },
  {
    id: "geschichte-resonanzbegriff",
    title: "Die Geschichte des Resonanzbegriffs",
    author: "Dr. phil. habil. I. Marnau",
    year: "1994",
    blurb:
      "Wie aus einem Wort der Akustik ein Verwaltungsbegriff wurde: von mitschwingenden Saiten über die Massenpsychologie des 19. Jahrhunderts und die leibliche Resonanz der Phänomenologen bis zum Resonanzindex im Wetterbericht. Herbert sagt dazu nur: „Lesen Sie das Schlusskapitel zuerst, wenn Sie es eilig haben.“",
    itemId: "buchResonanzbegriff",
    itemName: "Geschichte des Resonanzbegriffs (Leihbuch)",
  },
  {
    id: "sperrmuell-heft",
    title: "SPERRMÜLL — Das Heft, das nicht vorgesehen ist",
    author: "Ohne Herausgeber",
    year: "1992",
    blurb:
      "Ein geklammertes Satireheft von schlechtem Papier: Comics, erfundene Leserbriefe, ein ehrliches Formblatt und Kalle Nichtzuständig. Herbert stellt es zwischen die Fahrpläne, wo niemand sucht.",
    itemId: "heftSperrmuell",
    itemName: "SPERRMÜLL Nr. 7 (Leihheft)",
  },
  {
    id: "absurd-gedichte",
    title: "Absurd. Ein Assoziationsblaster für den verwalteten Menschen",
    author: "R. K. Zunder",
    year: "1989",
    blurb:
      "Gedichte zwischen Wartebereich und Weltuntergang. Manche erheiternd, manche düster, alle irgendwie mit einem Fuß im Schalter. Herbert blättert darin, wenn niemand hinschaut.",
    itemId: "buchAbsurd",
    itemName: "Absurd (Gedichtband)",
  },
  {
    id: "grundgesetz",
    title:
      "Grundgesetz für das Mandatsgebiet Mitteleuropa — Textausgabe mit Änderungsnachweis",
    author: "Mandatsrat, Abteilung Rechtsangelegenheiten (Hrsg.)",
    year: "1996",
    blurb:
      "Amtliche Textausgabe, 14., berichtigte Auflage. In Kraft gesetzt 1947 durch den Alliierten Kontrollrat, gültig „für eine Übergangszeit“ — seither einunddreißig Änderungsgesetze. Der Änderungsnachweis im Anhang ist die eigentliche Geschichte des Hauses.",
    itemId: "buchGrundgesetz",
    itemName: "Grundgesetz (Leihbuch)",
  },
];

/** Alle Titel sind ausleihbar — kein Präsenzbestand. */
export const openBooks = () => LIBRARY_BOOKS;

export const libraryBookByItemId = (itemId: string) =>
  LIBRARY_BOOKS.find((b) => b.itemId === itemId);
