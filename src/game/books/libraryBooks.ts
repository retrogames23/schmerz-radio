import type { HandbookChapter } from "@/game/e67Handbook";
import imgSumerUruk from "@/assets/books/sumer-uruk.jpg";
import imgSumerTafeln from "@/assets/books/sumer-tafeln.jpg";
import imgSumerVerwaltung from "@/assets/books/sumer-verwaltung.jpg";
import imgBahnEntstehung from "@/assets/books/bahn-entstehung.jpg";
import imgBahnMandat from "@/assets/books/bahn-mandat.jpg";
import imgBahnFahrplaene from "@/assets/books/bahn-fahrplaene.jpg";
import imgResPhysik from "@/assets/books/res-physik.jpg";
import imgResDaemmung from "@/assets/books/res-daemmung.jpg";
import imgResLueften from "@/assets/books/res-lueften.jpg";
import imgDfFruehe from "@/assets/books/df-fruehe.jpg";
import imgDfHarvard from "@/assets/books/df-harvard.jpg";
import imgDfRevolution from "@/assets/books/df-revolution.jpg";
import imgDfMatrix from "@/assets/books/df-matrix.jpg";
import imgDfCellular from "@/assets/books/df-cellular.jpg";
import imgDfMarv from "@/assets/books/df-marv.jpg";
import imgDfProgrammieren from "@/assets/books/df-programmieren.jpg";
import imgWirtUsa from "@/assets/books/wirt-usa.jpg";
import imgWirtUdssr from "@/assets/books/wirt-udssr.jpg";
import imgWirtMandat from "@/assets/books/wirt-mandat.jpg";
import imgAutoWankel from "@/assets/books/auto-wankel.jpg";
import imgAutoSerie72 from "@/assets/books/auto-serie72.jpg";
import imgAutoDesign90 from "@/assets/books/auto-design90.jpg";
import imgSpracheFormular from "@/assets/books/sprache-formular.jpg";
import imgSpracheSchalter from "@/assets/books/sprache-schalter.jpg";
import imgSpracheJugend from "@/assets/books/sprache-jugend.jpg";
import imgLobArchiv from "@/assets/books/lob-vorgang-archiv.jpg";
import imgLobSchalter from "@/assets/books/lob-vorgang-schalter.jpg";
import imgLobGedicht from "@/assets/books/lob-vorgang-gedicht.jpg";
import imgSperrmuellTitel from "@/assets/books/sperrmuell-titel.jpg";
import imgSperrmuellSektorbericht from "@/assets/books/sperrmuell-sektorbericht.jpg";
import imgSperrmuellWetter from "@/assets/books/sperrmuell-wetter.jpg";
import imgSperrmuellRueckseite from "@/assets/books/sperrmuell-rueckseite.jpg";
import imgSperrmuellDuell from "@/assets/books/sperrmuell-duell.jpg";
import {
  registerBook,
  type BookUiText,
  type ReadableBook,
} from "./registry";

const libraryReadableBooks = new Map<string, ReadableBook>();

function registerLibraryBook(book: ReadableBook) {
  libraryReadableBooks.set(book.id, book);
  registerBook(book);
}

/** Direkter Zugriff auf Bibliotheksvolltexte, unabhängig von der HMR-Registry. */
export function getLibraryReadableBook(id: string): ReadableBook | undefined {
  return libraryReadableBooks.get(id);
}

const LIBRARY_UI_TEXT: BookUiText = {
  ariaLabel: "Buch lesen",
  closeLabel: "Buch schließen",
  contents: "Inhalt",
  chaptersUnit: (n: number) => `${n} Kapitel`,
  edition: "Bibliotheksbestand",
  pagerStart: "— Anfang —",
  pagerEnd: "— Ende —",
  pagerOf: (idx: number, total: number) => `Seite ${idx} / ${total}`,
  chapterSelectLabel: "Kapitel",
};

const sumerChapters: HandbookChapter[] = [
  {
    id: "sumer-vorwort",
    shortTitle: "Vorwort",
    title: "Vorwort: Warum Listen zuerst kamen",
    body: [
      "Dieses Buch handelt von der ältesten bekannten Schrift der Menschheit. Nicht von Dichtung, nicht von Gesetzen, nicht von Gebeten — von Listen.",
      "Die ersten Tontafeln aus Uruk verzeichnen Gerste, Bier, Schafe, Arbeitstage und Schulden. Wer sie heute liest, liest Bürokratie in ihrer Urform. Das ist weniger romantisch, aber ehrlicher als die meisten Geschichten über die Geburt der Schrift.",
      "Ich habe versucht, die Tafeln so zu übersetzen, wie sie gemeint waren: als Vermögensaufstellung, als Quittung, als Warnung.",
    ],
  },
  {
    id: "sumer-uruk",
    image: imgSumerUruk,
    imageCaption: "Tafel I — Uruk, Eanna-Bezirk, Rekonstruktion",
    shortTitle: "Uruk",
    title: "Uruk, um 3300 vor unserer Zeitrechnung",
    body: [
      "Uruk war eine der ersten Städte, die man ohne Übertreibung als Stadt bezeichnen kann. Nicht wegen ihrer Mauern — die gab es auch —, sondern wegen ihrer Organisation.",
      "Rund um den Eanna-Bezirk, dem Tempelkomplex der Göttin Inanna, sammelten sich Arbeiter, Verwalter, Töpfer, Schreiber und Händler. Die Stadt hatte vielleicht zehntausend Einwohner. Sie mussten irgendwie ernährt, eingeteilt und kontrolliert werden.",
      "Die Schrift entstand dort nicht aus einem plötzlichen kulturellen Bedürfnis. Sie entstand, weil der Tempel wissen musste, was ihm zustand.",
    ],
  },
  {
    id: "sumer-tafeln",
    image: imgSumerTafeln,
    imageCaption: "Tafel II — Frühe Tontafeln mit Schilfrohrgriffel",
    shortTitle: "Tafeln",
    title: "Was auf den Tafeln steht",
    body: [
      "Die frühesten Tafeln sind klein, handlich und oft nur auf einer Seite beschrieben. Sie wurden im feuchten Ton mit einem Schilfrohr eingeritzt, dann an der Sonne oder im Ofen getrocknet.",
      "Typische Einträge lauten: »3 Scheffel Gerste«, »2 Krüge Bier«, »1 Schaf«, »5 Arbeitstage«. Manche Tafeln nennen Namen, manche nicht. Manche sind Quittungen, manche Forderungen.",
      "Was sie gemeinsam haben: Sie alle dokumentieren einen **Übergang**. Etwas wurde gegeben, geleistet, geschuldet oder abgeliefert. Die Schrift war ein Werkzeug der Verwaltung, bevor sie ein Werkzeug der Erzählung wurde.",
    ],
  },
  {
    id: "sumer-verwaltung",
    image: imgSumerVerwaltung,
    imageCaption: "Tafel III — Abrechnung im Tempelspeicher",
    shortTitle: "Verwaltung",
    title: "Verwaltung vor der Literatur",
    body: [
      "Es dauerte Jahrhunderte, bis aus Listen Geschichten wurden. Die ersten literarischen Texte — das Gilgamesch-Epos, Hymnen, Weisheitslehren — entstanden erst, als Schreiben selbstverständlich geworden war.",
      "Die Verwaltung kam zuerst. Sie musste nicht erfunden werden; sie war schon da, in Köpfen und mündlichen Abmachungen. Die Schrift machte sie durchsetzbar, speicherbar, prüfbar.",
      "Wer heute ein Formular ausfüllt, setzt eine Tradition fort, die in Uruk begann. Das ist keine Beleidigung. Es ist eine Verwandtschaft.",
    ],
  },
  {
    id: "sumer-anhang",
    shortTitle: "Anhang",
    title: "Anhang: Eine Tafel im Original",
    body: [
      "> Übersetzung einer Tafel aus Uruk IVa (ca. 3200 v. u. Z.):",
      "> »4 Scheffel Gerste — Lugal-uru",
      "> »2 Krüge Bier — Gemeinschaftsraum",
      "> »1 Schaf — für den Priester",
      "> »Rest: 0«",
      "Die Tafel endet mit einer Null. Schon damals gab es jemanden, der wissen wollte, ob etwas übrig geblieben war.",
    ],
  },
];

const railwayChapters: HandbookChapter[] = [
  {
    id: "bahn-vorwort",
    shortTitle: "Vorwort",
    title: "Vorwort: Von Linien, die verschwinden",
    body: [
      "Dieses Buch sammelt Strecken, die es nicht mehr gibt. Nicht aus Nostalgie, sondern aus Respekt vor der Genauigkeit, mit der sie einmal geplant wurden.",
      "Nebenbahnen waren keine Hauptstrecken mit schwächerem Verkehr. Sie waren ein eigenes Netz, mit eigenen Bahnhöfen, eigenen Fahrplänen, eigenen Dampfloks. Wer sie benutzte, kannte die Schaffner oft beim Vornamen.",
      "Viele der hier abgedruckten Fahrpläne stammen aus dem Mandatsgebiet und den angrenzenden Konventionsstaaten. Einige Strecken existieren heute nur noch als Radwege oder Feldwege.",
    ],
  },
  {
    id: "bahn-entstehung",
    image: imgBahnEntstehung,
    imageCaption: "Abb. 1 — Nebenbahnzug auf freier Strecke, um 1908",
    shortTitle: "Entstehung",
    title: "Entstehung der Nebenbahnen",
    body: [
      "Zwischen 1890 und 1910 entstanden in Mitteleuropa Tausende von Nebenstrecken. Sie verbanden Dörfer mit Märkten, Fabriken mit Bahnhöfen, Minen mit Häfen.",
      "Die meisten wurden von privaten Gesellschaften gebaut, oft mit knappem Kapital und optimistischen Prognosen. Manche wurden nie rentabel. Sie wurden trotzdem weiterbetrieben, weil sie eine Region zusammenhielten.",
      "Die Lokomotiven waren kleiner und langsamer als auf Hauptstrecken. Dafür hielten sie an Haltestellen, die auf keiner großen Karte verzeichnet waren.",
    ],
  },
  {
    id: "bahn-mandat",
    image: imgBahnMandat,
    imageCaption: "Abb. 2 — Haltestelle im Mandatsgebiet, um 1949",
    shortTitle: "Im Mandatsgebiet",
    title: "Nebenbahnen im Mandatsgebiet",
    body: [
      "Nach 1946 wurden viele Strecken zunächst weiterbetrieben, weil das Straßennetz zerstört war und Lkw-Motoren knapp. Die Nebenbahn war oft der einzige zuverlässige Transport.",
      "In den 50er Jahren begann die Stilllegung. Zuerst die unrentabelsten Strecken, dann die, die parallel zur Straße verliefen, schließlich die, deren Brücken zu teuer zu reparieren waren.",
      "Heute, 1974, gibt es im Mandatsgebiet noch etwa ein Drittel der Strecken von 1946. Der Rest ist abgebaut, zugewachsen oder zu Wanderwegen umgewidmet.",
    ],
  },
  {
    id: "bahn-fahrplaene",
    image: imgBahnFahrplaene,
    imageCaption: "Abb. 3 — Bahnsteiguhr, letzter Zug des Tages",
    shortTitle: "Fahrpläne",
    title: "Fahrpläne als Zeitzeugen",
    body: [
      "Ein Fahrplan ist mehr als eine Abfahrtsliste. Er ist ein Dokument darüber, wie eine Gesellschaft ihre Zeit organisiert hat.",
      "Die hier abgedruckten Fahrpläne zeigen Verbindungen, die bis auf die Minute genau waren — auch wenn die Züge oft Verspätung hatten. Sie nennen Bahnhöfe, die heute leer stehen, und Anschlüsse, die heute nicht mehr existieren.",
      "Wer einen alten Fahrplan liest, liest eine Karte der Vergangenheit. Nicht jede Strecke führt noch irgendwohin. Aber sie führte einmal.",
    ],
  },
  {
    id: "bahn-anhang",
    shortTitle: "Anhang",
    title: "Anhang: Ausgewählte Strecken",
    body: [
      "| Streckennummer | Verlauf | Stillgelegt",
      "| NB-12 | Waldhof — Kleinkirchheim — Brünning | 1962",
      "| NB-33 | Emsbüren — Südhamm | 1958",
      "| NB-47 | Löbau — Herrnhut | 1967",
      "| NB-89 | Passau — Hauzenberg | 1954",
      "| NB-105 | Sektor 12 — Sektor 14 (Grenzstrecke) | 1971",
      "Die Liste ist unvollständig. Vollständigkeit wäre ein weiteres Buch.",
    ],
  },
];

const resonanzChapters: HandbookChapter[] = [
  {
    id: "res-vorwort",
    shortTitle: "Vorwort",
    title: "Vorwort: Resonanz als Gefährdung",
    body: [
      "Ich schreibe dies im Dezember 1956. Der Begriff *Resonanz* ist mir in den letzten Jahren immer häufiger begegnet, und zwar in einem Zusammenhang, den die meisten Menschen nicht erwarten: als Gefährdung des Einzelnen in seiner eigenen Wohnung.",
      "Was ich darunter verstehe, ist zunächst eine physikalische Wirkung — Schwingungen, die sich verstärken, wenn sie auf das richtige Material treffen. Resonanz ist ein Problem des Bauwesens, der Akustik, der Maschinentechnik. Meine Aufgabe ist es, zu zeigen, wie der Einzelne sie in seinem Alltag erkennt und ihr begegnet.",
      "Ich bin Sektorarzt und berate mehrere Verwaltungen bei der Bewertung von Wohnraum. In diesem Buch versuche ich nüchtern und ohne Umschweife zu beschreiben, was jeder für sich selbst tun kann, um seine Umgebung zu kontrollieren.",
      "Berlin, Dezember 1956",
    ],
  },
  {
    id: "res-physik",
    image: imgResPhysik,
    imageCaption: "Abb. 1 — Übertragung von Schwingungen zwischen zwei Räumen",
    shortTitle: "Physik",
    title: "Was Resonanz physisch ist",
    body: [
      "Resonanz entsteht, wenn ein schwingendes System auf eine äußere Frequenz trifft, die seiner eigenen Eigenfrequenz entspricht. Das System schwingt dann stärker mit, als es eigentlich müsste.",
      "Im Alltag begegnet uns das als Vibration, als Drohnen, als Klappern in der Wand, wenn ein bestimmter Zug vorbeifährt. Nicht jeder Lärm ist Resonanz. Aber jede Resonanz ist zunächst Lärm, bevor sie Schaden wird.",
      "Der Körper reagiert auf Dauerschwingungen. Schlafstörungen, Konzentrationsschwäche, nervöse Reizbarkeit können Folgen sein — nicht aus Schwäche, sondern aus dauerhafter Anpassungsleistung.",
    ],
  },
  {
    id: "res-daemmung",
    image: imgResDaemmung,
    imageCaption: "Abb. 2 — Wandaufbau mit Dämmschicht und Falzdichtung",
    shortTitle: "Dämmen",
    title: "Dämmen und Abschirmen",
    body: [
      "Die wichtigste Maßnahme gegen Resonanz ist die Unterbrechung der Schwingungsübertragung. Das geschieht durch Masse, Elastizität oder beides.",
      "- **Wände:** Doppelte Beplankung mit Zwischenraum verringert die Übertragung niedriger Frequenzen.",
      "- **Böden:** Schwimmende Estriche oder elastische Unterlagen bremsen Trittschall.",
      "- **Fenster:** Dichte Fensterfalzabdichtungen sind oft wirksamer als dickes Glas.",
      "Nicht jede Maßnahme muss teuer sein. Ein schwerer Vorhang vor einer Wand, ein Teppich auf einem Holzboden, ein Schrank in der Ecke — alles verändert die Schwingungseigenschaften eines Raums.",
    ],
  },
  {
    id: "res-lueften",
    image: imgResLueften,
    imageCaption: "Abb. 3 — Lüftung, Abstand und Ruhepause im Wohnraum",
    shortTitle: "Lüften",
    title: "Lüften, Abstandhalten, Ruhepausen",
    body: [
      "Resonanz braucht Kontakt. Je mehr Schichten zwischen dem Schwingungsursprung und dem Empfänger liegen, desto geringer die Wirkung.",
      "**Lüften** ist in diesem Buch nicht nur Frischluftzufuhr. Es bedeutet, Räume zu entlasten: übermäßige Wärme, Feuchtigkeit und elektromagnetische Felder gleichermaßen zu reduzieren.",
      "**Abstandhalten** bedeutet, Geräte und Möbel so zu platzieren, dass keine direkte Schwingungsbrücke entsteht. Ein Bett sollte nicht mit dem Kopfende an eine Heizungsleitung grenzen.",
      "**Ruhepausen** sind die einfachste und wirksamste Maßnahme. Wer regelmäßig aus einem resonanzbelasteten Raum herausgeht, gibt seinem Körper Zeit zur Erholung.",
    ],
  },
  {
    id: "res-anhang",
    shortTitle: "Anhang",
    title: "Anhang: Zugelassene Schirme und Dichtungen",
    body: [
      "Der folgende Anhang listet Produkte auf, die 1956 von der Zentralstelle für Wohnhygiene geprüft wurden. Die Liste ist nicht vollständig.",
      "- **Schwingungsdämpfer Typ A:** Gummi-Metall-Element für Möbel und Maschinenfüße.",
      "- **Fensterdichtung FD-3:** Selbstklebend, für Holzfenster mit Falz.",
      "- **Türabschlussleiste D-12:** Für den Spalt zwischen Türblatt und Boden.",
      "- **Wandbehang WS-7:** Schwerer Stoff mit Bitumeneinlage, reduziert Hochfrequenzanteile.",
      "> Hinweis: Produkte, die nicht aufgeführt sind, sind nicht automatisch ungeeignet. Sie wurden nur nicht geprüft.",
    ],
  },
];

const dataflowChapters: HandbookChapter[] = [
  {
    id: "df-vorwort",
    shortTitle: "Vorwort",
    title: "Vorwort: Die Trennung als Prinzip",
    body: [
      "Dieses Buch erzählt eine Geschichte der Computer, wie sie sich in diesem Jahrhundert entwickelt haben. Es geht um Maschinen, die aus Netzwerken kleiner, spezialisierter Rechenknoten bestehen.",
      "Der Ausgangspunkt liegt in den Arbeiten der 1940er Jahre. Howard Aiken in Harvard und Konrad Zuse in Europa bauten Systeme, in denen Programm und Daten physisch getrennt blieben. Ihr Grundsatz war einfach: Befehle sind Befehle, Daten sind Daten. Wer sie vermischt, macht eine Maschine schwerer zu verstehen und schwerer zu schützen. Diese Strenge erwies sich als verlässlicher, prüfbarer und leichter zu beherrschen. Aus ihr erwuchs die Datenfluss-Maschine.",
    ],
  },
  {
    id: "df-geheim",
    image: imgDfFruehe,
    imageCaption: "Abb. 1 — Rechenanlage mit getrennten Speicherwerken, 1940er Jahre",
    shortTitle: "Frühe Entwürfe",
    title: "Frühe Entwürfe: Aiken, Zuse und die getrennte Speicherung",
    body: [
      "In den 1940er Jahren entstanden die ersten programmgesteuerten Rechenmaschinen. Sie waren groß, laut, störanfällig und jede für sich eine Ingenieursleistung. Doch schon früh teilten sich die Schulen.",
      "Howard Aiken an der Harvard University baute das Mark-I-System. Sein Grundsatz: Programm und Daten liegen in getrennten Speichern. Ein Programm wird eingelesen, ausgeführt, und erst danach verarbeitet die Maschine die Ergebnisse. Der Programmspeicher bleibt während der Rechnung unverändert.",
      "Konrad Zuse in Europa verfolgte einen ähnlichen Weg. Seine Z-Maschinen trennten Befehls- und Datenspeicher ebenfalls strikt. Für Zuse war diese Trennung keine akademische Vorliebe, sondern eine Frage der Übersichtlichkeit: Wer die Befehle nicht von den Daten trennt, verliert schnell den Überblick über das, was die Maschine tut.",
      "Aus diesen Arbeiten entstand der verbindliche Grundsatz der Speichertrennung. Hochschulen, Rechenämter und Hersteller übernahmen ihn, weil sich getrennte Befehls- und Datenwege prüfen, warten und eindeutig dokumentieren ließen. Die Harvard-Bauweise wurde damit zur gemeinsamen Grundlage der weiteren Entwicklung.",
    ],
  },
  {
    id: "df-harvard",
    image: imgDfHarvard,
    imageCaption: "Abb. 2 — Getrennte Befehls- und Datenträger am Prüfstand",
    shortTitle: "Harvard",
    title: "Aiken, Zuse und die Reine Harvard-Architektur",
    body: [
      "Howard Aikens Harvard-Mark-Systeme und Konrad Zuses Z-Maschinen teilten einen Grundsatz: Programmspeicher und Datenspeicher sind getrennte Räume. Man schreibt nicht in den Programmspeicher hinein, während man ihn liest.",
      "Das machte Computer weniger flexibel, aber vorhersehbarer. Ein Programm war eine feste Schaltung, ein Datenstrom war ein Datenstrom. Die beiden durften sich nicht vermischen.",
      "Diese Trennung verhinderte eine ganze Klasse von Fehlerquellen: Speicherüberläufe, Pufferfehler, das Einschleusen von Code als Daten. Die Sicherheit lag in der Struktur, nicht in der Kontrolle.",
    ],
  },
  {
    id: "df-revolution",
    image: imgDfRevolution,
    imageCaption: "Abb. 3 — Knotenhalle einer frühen Datenfluss-Anlage",
    shortTitle: "Datenfluss",
    title: "Die Datenfluss-Revolution",
    body: [
      "In den 1970er Jahren setzte sich eine neue Art der Programmierung durch: datengesteuerte Verarbeitung. Ein Rechenknoten feuert genau dann, wenn alle benötigten Eingangsdaten bereitstehen.",
      "Es gibt keinen zentralen Programmzähler, der Befehl für Befehl abarbeitet. Stattdessen gibt es ein Netz aus Knoten. Jeder Knoten wartet, bis er genug hat, dann rechnet er und gibt sein Ergebnis weiter.",
      "Diese Architektur eignet sich besonders für Aufgaben, die parallel ablaufen können: Bildverarbeitung, Simulation, neuronale Netze. Sie war nicht schneller im Einzelnen, aber skalierbarer im Ganzen.",
    ],
  },
  {
    id: "df-matrix",
    image: imgDfMatrix,
    imageCaption: "Abb. 4 — Matrix-1: Gitter identischer Rechenzellen",
    shortTitle: "Matrix-1",
    title: "Intels asynchroner Matrix-1",
    body: [
      "Als in den 1970ern die Mikrochips boomen, baute Intel den **Matrix-1**: einen Chip aus einem Gitter von 64 winzigen, asynchronen Rechenkernen.",
      "Es gab kein globales Taktsignal. Jeder Kern verbrauchte nur dann Strom, wenn Daten bei ihm ankamen. Das sparte Energie und reduzierte Wärmeentwicklung drastisch.",
      "Der Matrix-1 war nicht darauf ausgelegt, einzelne Berechnungen so schnell wie möglich zu erledigen. Er war anders: weniger eine Rechenmaschine, mehr ein Schaltwerk aus tausenden kleinen Entscheidungen.",
    ],
  },
  {
    id: "df-cellular",
    image: imgDfCellular,
    imageCaption: "Abb. 5 — Cellular Array, schematische Darstellung",
    shortTitle: "Cellular Arrays",
    title: "Cellular Arrays: Das Gitter der Gegenwart",
    body: [
      "Heute, 1997, bestehen Computer aus **Cellular Arrays** — Milliarden mikroskopischer Knoten, die wie biologische Synapsen funktionieren. Ein Laptop unterscheidet sich von einem Supercomputer nur durch die physische Größe des Gitters.",
      "Programmspeicher und Datenspeicher sind nach wie vor getrennt. Ein Virus kann sich nicht als Datenstrom tarnen und dann als Code ausführen. Das ist physikalisch unmöglich.",
      "Die Akkus halten monatelang, weil kein globaler Takt die Zellen ständig umschaltet. Wer seinen Laptop vergisst, findet ihn oft noch an — nicht weil die Batterie besser ist, sondern weil das Gerät im Leerlauf fast nichts verbraucht.",
    ],
  },
  {
    id: "df-marvs",
    image: imgDfMarv,
    imageCaption: "Abb. 6 — Eingeätztes MARV-Modul in einem Arbeitsplatzgerät",
    shortTitle: "MARV",
    title: "MARV und eingeatzte Künstliche Intelligenz",
    body: [
      "Neuronale Netze lassen sich auf Datenfluss-Architekturen nativ abbilden. Das hat die Künstliche Intelligenz früh und kompakter werden lassen.",
      "Systeme wie MARV, die intelligente Türsteuerung, sind keine Simulationen auf einer fremden Bauweise. Sie sind eingeatzt — direkt in das Cellular Array hineinverdrahtet.",
      "Das macht sie vernünftiger, stabiler und weniger fehleranfällig. Sie denken, sofern man das Wort erlaubt, in Datenflüssen.",
    ],
  },
  {
    id: "df-programmieren",
    image: imgDfProgrammieren,
    imageCaption: "Abb. 7 — Arbeitsplatz mit Knotenliste und Ausdruck",
    shortTitle: "Programmieren",
    title: "Wie man heute programmiert",
    body: [
      "In der Ausbildung haben sich zwei Arbeitsweisen durchgesetzt: visuelle Datenflusspläne und mathematisch-funktionale Sprachen.",
      "Programmierer beschreiben darin Knoten, Verbindungen und die Bedingungen, unter denen Daten weitergegeben werden. Vor der Ausführung lassen sich diese Wege formal prüfen und mit bekannten Eingabemengen erproben.",
      "Befehlsfolgen werden in den geschützten Programmspeicher übertragen; Messwerte, Akten und Zwischenergebnisse verbleiben auf den getrennten Datenwegen. Jede Änderung erhält eine Prüfsumme und einen Eintrag im Laufprotokoll.",
      "Die Arbeit verlangt Sorgfalt und ein gutes Verständnis für Abläufe. Dafür sind Fehler meist bis zu jener Verbindung zurückzuverfolgen, an der ein Wert unerwartet weitergegeben oder zurückgehalten wurde.",
    ],
  },
];

registerLibraryBook({
  id: "sumer-listen",
  title: "Listen aus Uruk — Verwaltung vor der Literatur",
  subtitle: "M. Ehrenhart · 1981 · Bewohnerbibliothek E71",
  author: "M. Ehrenhart",
  year: "1981",
  blurb:
    "Über die ältesten Tontafeln: Gerste, Bier, Schafe, Schulden. Herbert legt hier gern den Finger auf eine Zeile und schweigt dann.",
  chapters: sumerChapters,
  uiText: LIBRARY_UI_TEXT,
  locationHint: "Bewohnerbibliothek 1101, Gebäude E71",
  lendable: true,
});

registerLibraryBook({
  id: "schmalspur",
  title: "Schmalspur — Nebenbahnen Mitteleuropas 1890–1946",
  subtitle: "K. Obholz · 1974 · Bewohnerbibliothek E71",
  author: "K. Obholz",
  year: "1974",
  blurb:
    "Streckenpläne, Fahrpläne, Betriebsstellen. Viele der Strecken gibt es nicht mehr; die Fahrpläne schon.",
  chapters: railwayChapters,
  uiText: LIBRARY_UI_TEXT,
  locationHint: "Bewohnerbibliothek 1101, Gebäude E71",
  lendable: true,
});

registerLibraryBook({
  id: "resonanzhygiene-1956",
  title: "Resonanzhygiene — Ein Leitfaden für den Einzelnen",
  subtitle: "Dr. med. H. C. Brennwald · 1956 · Bewohnerbibliothek E71",
  author: "Dr. med. H. C. Brennwald",
  year: "1956",
  blurb:
    "Noch aus der Zeit, bevor der Begriff seine soziale Seite bekam: Lüften, Dämmen, Abstandhalten, Ruhepausen. Brennwald schreibt über Resonanz wie über Staub oder Lärm.",
  chapters: resonanzChapters,
  uiText: LIBRARY_UI_TEXT,
  locationHint: "Bewohnerbibliothek 1101, Gebäude E71",
  lendable: true,
});

registerLibraryBook({
  id: "gespaltener-geist",
  title: "Der gespaltene Geist — Eine Geschichte der Datenfluss-Maschinen",
  subtitle: "S. R. Vossen · 1997 · Bewohnerbibliothek E71",
  author: "S. R. Vossen",
  year: "1997",
  blurb:
    "Vossen erzählt, wie die Datenfluss-Architektur zur dominierenden Form des Rechnens wurde — ausgehend von der strengen Trennung von Programm und Daten, die Aiken, Zuse und die frühen Harvard-Systeme prägten.",
  chapters: dataflowChapters,
  uiText: LIBRARY_UI_TEXT,
  locationHint: "Bewohnerbibliothek 1101, Gebäude E71",
  lendable: true,
});

const wirtschaftsChapters: HandbookChapter[] = [
  {
    id: "wirt-vorwort",
    shortTitle: "Vorwort",
    title: "Vorwort: Warum drei?",
    body: [
      "Dieses Buch ist aus Gesprächen entstanden. Der eine von uns lehrt vergleichende Politikwissenschaft an einer Universität, die nicht im Mandatsgebiet liegt; der andere berät den Mandatsrat in Wirtschaftsfragen. Wir haben uns oft gestritten, selten überzeugt, aber immer darin geübt, die Systeme zu beschreiben, wie sie tatsächlich funktionieren, nicht wie sie beschrieben werden sollen.",
      "Wir vergleichen drei Wirtschaftsordnungen, die auf dieselbe Frage unterschiedliche Antworten geben: Wie soll eine Gesellschaft produzieren, verteilen und verbrauchen? Die Vereinigten Staaten setzen auf Eigentum, Vertrag und Preisbildung. Die Sowjetunion setzt auf staatlichen Besitz, Plan und kollektive Verteilung. Das Mandatsgebiet setzt auf eine Mischform: Eigentum erlaubt, Märkte geduldet, aber die Verwaltung hat das letzte Wort.",
      "Wir schreiben im Jahr 1995. Das Mandatsgebiet existiert seit fast fünfzig Jahren als Übergangslösung. Wer es verstehen will, muss verstehen, wovon es sich abhebt.",
    ],
  },
  {
    id: "wirt-frage",
    shortTitle: "Die Frage",
    title: "Kapitel I: Drei Antworten auf dieselbe Frage",
    body: [
      "Jede Gesellschaft muss entscheiden, wer wofür arbeitet, wer was erhält und wer überhaupt mitredet. Diese Entscheidungen lassen sich nicht vermeiden; sie lassen sich nur verschleiern.",
      "Die erste Antwort lautet: Der Einzelne entscheidet selbst, solange er Vertragspartner findet. Eigentum ist das Fundament, der Markt ist das Verfahren, der Staat hält den Rahmen.",
      "Die zweite Antwort lautet: Die Gesellschaft entscheidet kollektiv, vertreten durch den Staat. Große Güter gehören allen, der Plan legt die Richtung fest, der Markt spielt eine untergeordnete Rolle.",
      "Die dritte Antwort ist komplizierter. Sie sagt: Eigentum bleibt erlaubt, aber es wird verwaltet. Private Betriebe dürfen existieren, aber sie brauchen Genehmigungen, Quoten und Zuteilungen. Der Staat greift nicht ein, weil er alles besitzen will, sondern weil er alles koordinieren will. Das ist die Antwort des Mandatsgebiets.",
    ],
  },
  {
    id: "wirt-usa",
    image: imgWirtUsa,
    imageCaption: "Börse in den Vereinigten Staaten, 1992",
    shortTitle: "Vereinigte Staaten",
    title: "Kapitel II: Die Vereinigten Staaten — Markt, Vertrag und Anteil",
    body: [
      "In den Vereinigten Staaten wird Wirtschaft als Folge von Verträgen verstanden. Wer etwas besitzt, darf damit handeln, vermieten, verkaufen oder vererben. Wer etwas herstellen will, gründet eine Firma, sucht Investoren und bietet Produkte auf einem Markt an, auf dem die Preise durch Angebot und Nachfrage entstehen.",
      "Der Staat ist hier nicht der Hauptakteur. Er schützt Eigentum, erzwingt Verträge, baut Straßen und Schienenwege und greift in Krisen ein, wenn Banken, Landwirtschaft oder ganze Branchen zusammenbrechen. Zwischen diesen Eingriffen lässt er die Wirtschaft weitgehend sich selbst über.",
      "Das Ergebnis ist eine hohe Dynamik. Neue Güter entstehen schnell, alte verschwinden ebenso schnell. Reichtum und Armut liegen nah beieinander; Arbeitslosigkeit ist ein normales Risiko, nicht ein Ausnahmezustand. Der einzelne Bürger hat große Freiheit in der Wahl von Beruf, Wohnort und Verbrauch. Er hat aber auch weniger Sicherheit als in anderen Systemen.",
      "Kritiker innerhalb der Vereinigten Staaten nennen das System ungerecht, weil Startbedingungen ungleich sind. Befürworter nennen es frei, weil niemand gezwungen wird, etwas Bestimmtes zu tun. Beides trifft zu; darum ist der Vergleich so schwierig.",
    ],
  },
  {
    id: "wirt-udssr",
    image: imgWirtUdssr,
    imageCaption: "Planungsbüro einer sowjetischen Fabrik, 1988",
    shortTitle: "Sowjetunion",
    title: "Kapitel III: Die Sowjetunion — Plan, Verteilung und Kollektiv",
    body: [
      "Die Sowjetunion antwortet auf dieselbe Frage anders. Große Betriebe, Minen, Bahnen und Banken gehören dem Staat. Fünfjahrespläne legen fest, was produziert wird, in welcher Menge und zu welchem Preis. Der Staat ist gleichzeitig Eigentümer, Auftraggeber und Verteiler.",
      "Kleine private Betriebe existieren, besonders im Handwerk und in der Landwirtschaft. Genossenschaften dürfen Waren herstellen und verkaufen. In manchen Republiken hat der lokale Handel mehr Bedeutung als der zentrale Plan vorsieht. Die Partei kontrolliert die großen Linien, nicht jeden einzelnen Tausch.",
      "Das System bietet Sicherheit. Es gibt praktisch keine Arbeitslosigkeit; Wohnraum, Gesundheitsversorgung und Grundbildung sind staatliche Aufgaben. Preise schwanken weniger als in Marktwirtschaften. Aber das System leidet unter Engpässen: Waren, die der Plan nicht vorsieht, fehlen oft; Waren, die niemand braucht, werden trotzdem produziert. Innovationen kommen langsamer voran, weil der einzelne Betrieb wenig Anreiz hat, Risiken einzugehen.",
      "Die Sowjetunion ist kein Modell, das man einfach übernehmen kann. Sie ist ein eigenständiger Versuch, Wirtschaft als staatliche Planungsaufgabe zu begreifen.",
    ],
  },
  {
    id: "wirt-mandat",
    image: imgWirtMandat,
    imageCaption: "Verwaltungsarchiv im Mandatsgebiet, 1991",
    shortTitle: "Mandatsgebiet",
    title: "Kapitel IV: Das Mandatsgebiet — Eigentum unter Verwaltung",
    body: [
      "Das Mandatsgebiet entstand 1946 als vorübergehende Verwaltung. Vier Schutzmächte übergaben die Aufgabe einem Mandatsrat, der bis zur endgültigen Regelung wirtschaften sollte. Die endgültige Regelung ist bis heute nicht erfolgt.",
      "In dieser Zwischenzeit ist eine eigene Wirtschaftsordnung gewachsen. Private Betriebe existieren; es gibt Eigentum an Häusern, Maschinen und Läden. Doch kaum eine Entscheidung läuft ohne Verwaltung. Wer eine Fabrik eröffnen will, braucht Genehmigungen. Wer Waren importieren will, braucht Zuteilungen. Wer arbeiten will, meldet sich bei einer Stelle, die wiederum einem Sektor zugeordnet ist. Der Markt ist erlaubt, aber er ist eingefasst.",
      "Das Ergebnis ist eine Wirtschaft, die weder planmäßig noch marktwirtschaftlich funktioniert. Sie ist bürokratisch. Jeder Vorgang braucht ein Formular, jede Änderung ein Aktenzeichen, jede Lieferung eine Quittung. Der Staat besitzt nicht alles, aber er weiß über alles Bescheid und kann über alles entscheiden.",
      "Die Befürworter dieser Ordnung nennen sie stabil. Es gibt keine großen Zusammenbrüche, keine plötzlichen Enteignungen, keine Spekulationskrisen. Die Kritiker nennen sie erstarrt. Unternehmerische Ideen verlaufen in Warteschleifen; wer erfolgreich wird, wird schnell zum Verwaltungspartner und damit zum halben Staatsbetrieb.",
      "Das Mandatsgebiet ist keine Kopie der Vereinigten Staaten und keine Kopie der Sowjetunion. Es ist ein eigenes Experiment: Eigentum ohne freien Markt, Verwaltung ohne totale Planung.",
    ],
  },
  {
    id: "wirt-vergleich",
    shortTitle: "Vergleich",
    title: "Kapitel V: Was bleibt?",
    body: [
      "Keine der drei Ordnungen ist rein. In den Vereinigten Staaten gibt es staatliche Subventionen, Zölle und Eingriffe in Krisen. In der Sowjetunion gibt es private Tauschbeziehungen, lokale Märkte und Genossenschaften. Im Mandatsgebiet gibt es Unternehmer, die innerhalb der Verwaltung handeln, als wäre es ein Markt.",
      "Dennoch unterscheiden sich die Systeme in einer entscheidenden Frage: Wer trägt das Risiko? In den Vereinigten Staaten trägt es der Einzelne. In der Sowjetunion trägt es der Staat. Im Mandatsgebiet trägt es derjenige, der gerade das Formular in der Hand hat.",
      "Das Mandatsgebiet wird oft als Übergangslösung beschrieben. Aber Übergänge können lange dauern. Nach fast fünfzig Jahren ist es nicht mehr vorübergehend; es ist gewachsen. Wer es verstehen will, muss es ernst nehmen — auch wenn es absurd wirkt.",
      "Wir schließen ohne Empfehlung. Ein Vergleich sollte zuerst beschreiben. Urteile überlassen wir dem Leser, der in einem dieser Systeme lebt und es jeden Tag erfährt.",
    ],
  },
];

registerLibraryBook({
  id: "ordnung-und-eigentum",
  title: "Ordnung und Eigentum — Wirtschaftssysteme im Vergleich",
  subtitle: "Prof. Dr. E. Kallweit · Dr. R. Semmler · 1995 · Bewohnerbibliothek E71",
  author: "Prof. Dr. E. Kallweit · Dr. R. Semmler",
  year: "1995",
  blurb:
    "Ein Fachbuch über drei Wirtschaftsordnungen: die Vereinigten Staaten, die Sowjetunion und das Mandatsgebiet. Kallweit und Semmler beschreiben, wie Eigentum, Plan und Verwaltung in jedem System verteilt sind — ohne zu predigen, aber mit scharfem Blick für Bürokratie.",
  chapters: wirtschaftsChapters,
  uiText: LIBRARY_UI_TEXT,
  locationHint: "Bewohnerbibliothek 1101, Gebäude E71",
  lendable: true,
});

const autoChapters: HandbookChapter[] = [
  {
    id: "auto-vorwort",
    shortTitle: "Vorwort",
    title: "Vorwort: Ein Dreieck dreht sich",
    body: [
      "Wer heute die Motorhaube eines Wagens öffnet, sieht viel Luft. In der Mitte, meist tief unten und weit vorn, sitzt ein Block von der Größe eines Reisekoffers. Er hat keine Ventile, keine Nockenwelle, keine Kipphebel. Er hat zwei Scheiben, die sich drehen, und er läuft so ruhig, dass man am Straßenrand nicht hört, ob ein Wagen steht oder wartet.",
      "Dieses Buch erzählt, wie es dazu kam. Es ist keine Heldengeschichte. Der Rotationskolbenmotor war lange eine Randerscheinung, belächelt von Ingenieuren, die ihn für eine hübsche Idee mit schmutzigen Details hielten. Zwei dieser Details — die Dichtleisten und der Verbrauch — entschieden alles.",
      "Ich schreibe für Leser, die Autos benutzen, nicht bauen. Formeln stehen im Anhang. Im Text steht, was passiert ist und warum es sich gelohnt hat.",
    ],
  },
  {
    id: "auto-anfang",
    image: imgAutoWankel,
    imageCaption: "Abb. 1 — Zweischeiben-Rotationsmotor im Schnitt, Werkzeichnung",
    shortTitle: "Anfang",
    title: "Kapitel I: Die Dichtleiste, an der alles hing",
    body: [
      "Das Prinzip ist alt und einfach: Ein dreieckiger Läufer dreht sich in einem geschwungenen Gehäuse. Bei jeder Umdrehung entstehen an seinen drei Flanken nacheinander Ansaugen, Verdichten, Verbrennen und Ausstoßen. Kein Kolben muss abgebremst und zurückgeworfen werden. Deshalb läuft die Maschine ohne die Erschütterungen, die ein Hubkolbenmotor mit Ausgleichswellen mühsam glätten muss.",
      "Das Problem saß in den Ecken. Die Dichtleisten an den drei Spitzen des Läufers streifen bei jeder Umdrehung über die Gehäusewand. Frühe Leisten aus Kohle oder Metall rieben Rillen in die Bahn, verloren Druck, fraßen Öl. Fahrzeuge liefen fünfzigtausend Kilometer, dann kam die Werkstattrechnung.",
      "1968 löste ein Konsortium aus NSU, Mazda und General Motors das Problem mit einem Werkstoff: Dichtleisten aus Siliziumnitrid-Keramik. Sie sind hart, hitzefest und dehnen sich kaum. Riffelbildung und Dichtungsverluste verschwanden binnen einer Motorengeneration aus den Prüfprotokollen. Was vorher ein Verschleißteil war, hielt nun länger als die Karosserie.",
    ],
  },
  {
    id: "auto-einspritzung",
    shortTitle: "Einspritzung",
    title: "Kapitel II: 1971 — Der Verbrauch fällt",
    body: [
      "Die zweite Schwäche war der Durst. Die langgezogene Brennkammer verbrannte das Gemisch unvollständig; ein Teil des Kraftstoffs verließ den Motor, ohne Arbeit geleistet zu haben.",
      "Mazda beantwortete das 1971 mit einer elektronisch gesteuerten Schichteinspritzung: Der Kraftstoff wird nicht mehr vorgemischt angesaugt, sondern unter hohem Druck direkt in die wandernde Kammer gegeben, dosiert nach Last und Drehzahl. Damit lag der Verbrauch erstmals auf dem Niveau vergleichbarer Hubkolbenmotoren — bei geringerem Gewicht und deutlich kleinerem Bauraum.",
      "Zwei Jahre lang blieb das eine Fachmeldung. Dann wurde es die wichtigste Zahl der Branche.",
    ],
  },
  {
    id: "auto-serie",
    image: imgAutoSerie72,
    imageCaption: "Abb. 2 — Endmontage in einem amerikanischen Werk, 1972",
    shortTitle: "Serie",
    title: "Kapitel III: 1972 — Das Signal aus Detroit",
    body: [
      "Entschieden wurde die Sache nicht in einem Labor, sondern in einer Verkaufsstatistik. General Motors brachte 1972 den Chevrolet Vega mit Rotationsmotor. Der Wagen war leise, drehfreudig und billig zu bauen; er verkaufte sich besser als jede Prognose.",
      "Ford und Chrysler nahmen innerhalb eines Jahres Lizenzen. Wer in Detroit als Zulieferer überleben wollte, stellte auf Gehäuse, Läufer und Keramikleisten um. Die Kostenrechnung war schlicht: Ein Rotationsmotor hat keine Ventile, keine Nockenwellen, keine Kipphebel. Weniger Teile bedeuten weniger Fertigungsschritte, weniger Prüfstationen, weniger Ausschuss.",
    ],
  },
  {
    id: "auto-oelkrise",
    shortTitle: "Ölkrise",
    title: "Kapitel IV: 1973–1985 — Die Krise als Beschleuniger",
    body: [
      "Als 1973 der Ölpreis sprang, hatte die Branche zufällig genau die Maschine im Programm, die sie brauchte. Ein Zweischeiben-Rotationsmotor beansprucht rund ein Drittel des Bauraums und die Hälfte des Gewichts eines Reihenvierzylinders. Wagen wurden dadurch nicht um Gramm, sondern um hundertfünfzig bis zweihundert Kilogramm leichter — und leichte Wagen verbrauchen weniger, unabhängig davon, was unter der Haube arbeitet.",
      "In Europa übernahm die NSU-Audi-AG 1976 die technische Führung im Volkswagen-Konzern. Der Golf II erschien 1983 serienmäßig mit einem Einliter-Zweischeiben-Rotationsmotor; die Nachfrage überstieg die Fertigung um Monate.",
      "In Asien ging es schneller. Toyota und Honda stellten ihre Fertigungsstraßen bis 1980 vollständig um und senkten ihre Produktionskosten um etwa ein Viertel. Wer damals noch Zylinderköpfe goss, lieferte fünf Jahre später Traktoren zu.",
    ],
  },
  {
    id: "auto-design",
    image: imgAutoDesign90,
    imageCaption: "Abb. 3 — Karosseriestudie im Windkanal, 1995",
    shortTitle: "Design",
    title: "Kapitel V: 1986–1997 — Was kleine Motoren mit Karosserien machen",
    body: [
      "Ein Motor, der klein und flach baut, verändert nicht nur die Werkstatt, sondern das Aussehen der Straße. Weil vorn kein hoher Block mehr Platz braucht, fallen die Frontpartien seit Ende der Achtzigerjahre steil ab. Die Luftwiderstandsbeiwerte sanken auf Werte, die man zwei Jahrzehnte zuvor nur von Rekordfahrzeugen kannte.",
      "Der gewonnene Raum landete im Innenraum. Ein Mittelklassewagen von 1995 ist außen kürzer als sein Vorgänger von 1975 und innen deutlich größer. Familien fahren kompakte Wagen mit dem Platzangebot alter Limousinen.",
      "Nebenbei änderte sich der Klang der Städte. Rotationsmotoren laufen ohne den harten Rhythmus der Hubkolben; wer an einer Kreuzung steht, hört Reifen, nicht Zylinder.",
    ],
  },
  {
    id: "auto-1997",
    shortTitle: "1997",
    title: "Kapitel VI: Der Stand der Dinge",
    body: [
      "Über drei Viertel aller weltweit neu zugelassenen Personenwagen fahren mit Rotationsmotoren. Hubkolben findet man noch dort, wo Drehmoment bei niedriger Drehzahl über alles geht: in Lastwagen mit Dieselmotor, in Traktoren, in stationären Aggregaten.",
      "Im Rennsport schreibt die Formel 1 seit 1992 Vierscheiben-Motoren vor, die bis achtzehntausend Umdrehungen drehen. In der Sportfliegerei hat der vibrationsfreie Lauf den Kolbenmotor vollständig verdrängt; Zellen halten länger, wenn nichts sie durchschüttelt.",
      "Am interessantesten ist die Kraftstofffrage. Weil Ansaug- und Verbrennungsbereich beim Rotationsmotor räumlich getrennt liegen, entzündet sich Wasserstoff nicht vorzeitig am heißen Bauteil — das Hindernis, an dem Hubkolbenversuche seit Jahrzehnten scheitern. Mazda und BMW fahren seit diesem Jahr erste seriennahe Flotten mit Wasserstoff.",
      "Ob daraus eine Umstellung wird, entscheidet nicht die Technik, sondern die Versorgung. Motoren gibt es. Tankstellen noch nicht.",
    ],
  },
];

registerLibraryBook({
  id: "drehende-dreieck",
  title: "Das drehende Dreieck — Eine Geschichte des Automobils",
  subtitle: "Dipl.-Ing. G. Rothstein · 1997 · Bewohnerbibliothek E71",
  author: "Dipl.-Ing. G. Rothstein",
  year: "1997",
  blurb:
    "Wie der Rotationskolbenmotor vom Sorgenkind zum Weltstandard wurde: Keramik-Dichtleisten, Schichteinspritzung, die Ölkrise als Rückenwind — und was kleine Motoren mit Karosserien anstellen.",
  chapters: autoChapters,
  uiText: LIBRARY_UI_TEXT,
  locationHint: "Bewohnerbibliothek 1101, Gebäude E71",
  lendable: true,
});

const spracheChapters: HandbookChapter[] = [
  {
    id: "spr-vorwort",
    shortTitle: "Vorwort",
    title: "Vorwort: Eine Sprache, die aus Formularen kommt",
    body: [
      "Sprachen entstehen selten dort, wo man sie vermutet. Nicht in Gedichten, nicht auf Bühnen, nicht in Schulen. Das Deutsch, das im Mandatsgebiet gesprochen wird, ist an Schaltern entstanden, in Wartebereichen, in Kopierstellen und in Aktenkellern.",
      "Man nennt es Mandatsdeutsch. Der Ausdruck war lange spöttisch gemeint. Ich verwende ihn ohne Spott. Was hier gewachsen ist, hat eine eigene Grammatik, ein eigenes Wortfeld und einen eigenen Höflichkeitsapparat, und es funktioniert.",
      "Dieses Buch beschreibt, was gesprochen wird, nicht was gesprochen werden sollte. Wer eine Empfehlung sucht, welche Wendung korrekt sei, wird enttäuscht sein. Ich verzeichne, ich urteile nicht.",
    ],
  },
  {
    id: "spr-herkunft",
    image: imgSpracheSchalter,
    imageCaption: "Abb. 1 — Schalterhalle einer Bezirksstelle, um 1957",
    shortTitle: "Herkunft",
    title: "Kapitel I: Vier Amtssprachen an einem Tresen",
    body: [
      "Nach der Einrichtung der Verwaltung arbeiteten in denselben Häusern Beamte aus vier Sprachräumen nebeneinander. Vorschriften wurden in mehreren Fassungen ausgegeben, Vordrucke aber nur einmal gedruckt — und zwar in der Sprache, die vor Ort am meisten Leute lasen.",
      "Deutsch wurde so zur Trägersprache des Schriftverkehrs. Die Begriffe darin kamen aus allen vier Verwaltungen. Wer ein Formular ausfüllte, übernahm die Wörter, die darauf standen, ohne sie zu übersetzen. Nach zwei Jahrzehnten sprachen die Leute so.",
      "Der Sprachwandel verlief deshalb ungewöhnlich: nicht von der Straße in die Ämter, sondern von den Ämtern auf die Straße.",
    ],
  },
  {
    id: "spr-lehnwoerter",
    image: imgSpracheFormular,
    imageCaption: "Abb. 2 — Vordruck mit Feldbezeichnungen, Bezirksdruckerei",
    shortTitle: "Lehnwörter",
    title: "Kapitel II: Woher die Wörter stammen",
    body: [
      "Aus dem Französischen stammen die Wörter der Ordnung und der Zuständigkeit: das Ressort, die Instanz, das Dossier, das Bureau, die Kontrolle, der Bescheid „en règle“ — im Mandatsdeutsch verkürzt zu „ongregel“, geschrieben meist „in Regel“.",
      "Aus dem Russischen kamen die Wörter der Zuteilung und des Bestands: das Kontingent (kontingjent, betont auf der letzten Silbe), der Naryad — der Zuteilungsschein —, und das verbreitete „Sprawka“ für jede Bescheinigung, die man vorlegen muss, um eine andere zu bekommen.",
      "Aus dem Englischen kamen die Wörter der Abläufe: der Vorgang heißt in vielen Häusern schlicht „Case“, die Bearbeitungsspur „Track“, der abgeschlossene Fall ist „gecleart“.",
      "Kaum jemand empfindet diese Wörter noch als fremd. „Reich mir mal die Sprawka“ sagt man auch zu Hause, wenn der Impfnachweis gemeint ist.",
    ],
  },
  {
    id: "spr-grammatik",
    shortTitle: "Grammatik",
    title: "Kapitel III: Die Grammatik der Unzuständigkeit",
    body: [
      "Auffälliger als die Wörter ist der Satzbau. Mandatsdeutsch vermeidet den Handelnden. Nicht „ich lehne ab“, sondern „es ergeht Ablehnung“. Nicht „Sie haben etwas vergessen“, sondern „die Unterlage liegt nicht vor“.",
      "Man kann das für Feigheit halten. Zutreffender ist: Der Sprecher am Schalter hat den Bescheid nicht gefasst und kann ihn nicht ändern. Die Sprache bildet diese Lage genau ab.",
      "Daraus folgt eine zweite Eigenart, die Fremde regelmäßig irritiert: die dreistufige Höflichkeit. „Das wäre möglich“ heißt: es geht. „Das ließe sich prüfen“ heißt: es geht wahrscheinlich nicht, aber Sie dürfen einen Antrag stellen. „Das ist nicht vorgesehen“ heißt: hören Sie auf.",
      "Wer diese drei Stufen nicht unterscheidet, verbringt Jahre in Wartebereichen.",
    ],
  },
  {
    id: "spr-jugend",
    image: imgSpracheJugend,
    imageCaption: "Abb. 3 — Jugendliche vor einem Wohnblock, Sektor 14",
    shortTitle: "Jugend",
    title: "Kapitel IV: Was die Jungen daraus machen",
    body: [
      "Die Kinder derer, die das Mandatsdeutsch am Schalter lernten, sprechen es lockerer und respektloser. Sie verwenden dieselben Wörter, aber im Alltag und mit umgekehrtem Vorzeichen.",
      "„Bist du in Regel?“ heißt: Geht es dir gut? „Ich hab keine Sprawka dafür“ heißt: Ich kann es nicht beweisen, glaub es einfach. Und wer jemanden abweisen will, sagt „nicht vorgesehen“ und lacht dabei.",
      "Besonders produktiv ist die Vorsilbe „an-“ aus dem Formularwesen: anmelden, anzeigen, anhören — daraus wurde „anquatschen“ für ein Gespräch, das man ohne Termin beginnt, und „angeben“ im Sinne von: jemandem etwas erzählen, das im Protokoll schlecht aussähe.",
      "Die Verwaltung hat, ohne es zu wollen, den Jargon einer ganzen Generation geliefert.",
    ],
  },
  {
    id: "spr-anhang",
    shortTitle: "Anhang",
    title: "Anhang: Kleines Verzeichnis",
    body: [
      "Sprawka — jede Bescheinigung, die Voraussetzung für eine weitere ist.",
      "Naryad — Zuteilungsschein für Material, Wohnraum, Arbeitszeit.",
      "Kontingjent — bewilligte Menge innerhalb eines Zeitraums.",
      "Case — Vorgang; das Aktenzeichen heißt „Casenummer“, auch schriftlich.",
      "in Regel — formal einwandfrei; umgangssprachlich auch: gesund, in Ordnung.",
      "Dossier — Sammelakte zu einer Person oder Sache.",
      "es ergeht — unpersönliche Form für jede Entscheidung, die zugestellt wird.",
      "nicht vorgesehen — höchste Ablehnungsstufe; kein Widerspruch erwartet.",
      "vorbehaltlich — der häufigste Bestandteil aller Zusagen im Mandatsgebiet.",
    ],
  },
];

registerLibraryBook({
  id: "mandatsdeutsch",
  title: "Mandatsdeutsch — Wie am Schalter eine Sprache entstand",
  subtitle: "Dr. phil. A. Ternes · 1993 · Bewohnerbibliothek E71",
  author: "Dr. phil. A. Ternes",
  year: "1993",
  blurb:
    "Eine Sprachbeschreibung des Verwaltungsdeutschen: woher seine Lehnwörter stammen, warum es den Handelnden vermeidet und was Jugendliche heute daraus machen.",
  chapters: spracheChapters,
  uiText: LIBRARY_UI_TEXT,
  locationHint: "Bewohnerbibliothek 1101, Gebäude E71",
  lendable: true,
});

const lobChapters: HandbookChapter[] = [
  {
    id: "lob-vorwort",
    shortTitle: "Lob der Bürokratie",
    title: "Lob der Bürokratie",
    body: [
      "Bürokratie hat schlechte Presse. Man nennt sie kalt, langsam, sinnlos. Das ist ein Urteil, das sich bequem anfühlt, weil es den Sprecher ausnimmt: er ist das Opfer, das Amt ist der Schurke.",
      "Dieses Buch wagt das Gegenteil. Es versucht, die Verwaltung so zu sehen, wie sie sich selbst sieht: nicht als Hindernis, sondern als Form. Eine Form, die den Zufall bändigt, die Gewalt verzögert und das Individuum vor der Willkür des Individuums schützt.",
      "Ich schreibe als Philosoph, nicht als Beamter. Mein Lehrer in dieser Sache ist Max Weber, der die Bürokratie einmal als „Herrschaft mit der Schreibstube“ beschrieb. Was er damit meinte, war keine Beleidigung. Er meinte: Macht wird hier nicht mehr durch Geburt, Muskeln oder Waffen ausgeübt, sondern durch Akten, Signaturen und Verfahren. Das ist keine Verarmung. Das ist eine Zivilisationsleistung.",
    ],
  },
  {
    id: "lob-amt",
    image: imgLobArchiv,
    imageCaption: "Abb. 1 — Verwaltungsarchiv, Gang C, Sektor 7",
    shortTitle: "Das Amt",
    title: "Kapitel I: Das Amt vor dem Menschen",
    body: [
      "Der bürokratische Beamte ist ein Idealtyp. Er kennt nicht die Person, die vor ihm steht; er kennt den Fall. Das klingt grausam. Aber gerade darin liegt seine Güte.",
      "Wer ein Amt betritt, trägt sein Privates nicht mit. Er wird zum Antragsteller, zur Aktennummer, zum Vorgang. Diese Entpersönlichung ist keine Demütigung; sie ist ein Schutz. Der Fürst entscheidet nach Gunst, der Verwandte nach Sympathie, der Beamte nach der Akte. Die Akte liegt offen. Jeder kann sie lesen, jeder kann sie prüfen.",
      "Weber nennt das „Lebensführung als Beruf“. Der Beamte übt keine Tätigkeit aus, um reich zu werden, und nicht, um geliebt zu werden. Er übt sie aus, weil sie eine Ordnung erhält. In dieser Haltung gibt es etwas Asketisches — und etwas Edles.",
      "Das Amt steht also vor dem Menschen, damit der Mensch nicht vor dem Menschen stehen muss.",
    ],
  },
  {
    id: "lob-warten",
    image: imgLobSchalter,
    imageCaption: "Abb. 2 — Wartebereich, Bezirksstelle Sektor 4",
    shortTitle: "Warten",
    title: "Kapitel II: Die Psychologie des Wartens",
    body: [
      "Warten gilt als Zeitverlust. Aber Warten ist auch eine Übung. Wer wartet, übt Geduld. Wer Geduld übt, übt Gleichbehandlung: andere waren vor ihm, andere kommen nach ihm, und niemand springt vor.",
      "Die Warteschlange ist eine kleine Schule der Demokratie. Sie sagt: Ihr Anliegen ist wichtig, aber nicht wichtiger als das der anderen. Der Stuhl, auf dem Sie sitzen, ist gleich dem allen. Die Nummer, die Sie halten, folgt einer Regel, die niemanden bevorzugt.",
      "Natürlich gibt es Ungeduld. Sie kommt aus der Illusion, dass das eigene Leid einzigartig sei. Die Verwaltung kennt diese Illusion nicht. Sie hat gestern schon einen ähnlichen Fall bearbeitet und wird morgen einen weiteren bearbeiten. Das ist nicht Gleichgültigkeit; das ist Erfahrung.",
      "Wer das Warten als Ritual begreift, empfindet es nicht mehr als Leere. Er empfindet es als Teilnahme an einer Ordnung, die größer ist als sein eigener Tag.",
    ],
  },
  {
    id: "lob-verfahren",
    shortTitle: "Verfahren",
    title: "Kapitel III: Die Schönheit des Verfahrens",
    body: [
      "Ein Verfahren ist mehr als eine Abfolge von Schritten. Es ist eine Versicherung gegen Hast. Es sagt: Bevor etwas geschieht, muss es geprüft, dokumentiert und mitgeteilt werden. Nicht, weil die Verwaltung langsam sein will, sondern weil Schnelligkeit oft die Feindin der Gerechtigkeit ist.",
      "Das Formular ist das Gedicht des Verfahrens. Es fragt nach Namen, Daten, Zuständigkeiten. Es wiederholt sich. Es scheint überflüssig. Aber in seiner Wiederholung liegt seine Kraft: Wer alles zweimal sagt, kann sich einmal irren und wird trotzdem verstanden.",
      "Die Unterschrift ist ein Akt des Einverständnisses. Sie bindet den Einzelnen an das, was er selbst beantragt hat. Sie macht ihn zum Mitverantwortlichen. Ohne sie wäre die Verwaltung Willkür; mit ihr wird sie zum Vertrag.",
      "Es gibt eine Ästhetik der Akte: der saubere Rand, die fortlaufende Nummer, die korrekte Vermerkung. Nicht jeder sieht sie. Aber wer sie einmal gesehen hat, vermisst sie, wenn sie fehlt.",
    ],
  },
  {
    id: "lob-gedicht",
    image: imgLobGedicht,
    imageCaption: "Abb. 3 — Handschriftliche Niederschrift des Schlussgedichts",
    shortTitle: "Liebeserklärung",
    title: "Liebeserklärung an die Bürokratie",
    body: [
      "Du, die du niemals fragst, wer ich bin,",
      "sondern nur, was ich beantrage.",
      "Du, die du mein Gesicht vergisst,",
      "sobald der Stempel fällt.",
      "",
      "Ich liebe dich, weil du gleich bist",
      "für den Reichen und den Armen,",
      "weil du den Fürsten nicht erkennst",
      "und den Bettler nicht verachtest.",
      "",
      "Ich liebe deine Formulare,",
      "deine dreifache Durchschrift,",
      "deine Nummern, die kein Ende kennen,",
      "weil sie ein Anfang waren.",
      "",
      "Ich liebe dein Warten,",
      "denn es lehrt mich, dass ich nicht allein bin",
      "in meinem Drang, etwas zu wollen.",
      "",
      "Ich liebe dich, Bürokratie,",
      "nicht trotz deiner Kälte,",
      "sondern wegen ihr.",
      "Denn in deiner Kälte wohnt",
      "die Wärme der Gleichbehandlung.",
      "",
      "Amen, Akte, Ende.",
    ],
  },
];

registerLibraryBook({
  id: "lob-des-vorgangs",
  title: "Lob des Vorgangs",
  subtitle: "Dr. phil. J. A. Sonderegger · 1988 · Bewohnerbibliothek E71",
  author: "Dr. phil. J. A. Sonderegger",
  year: "1988",
  blurb:
    "Eine historisch-philosophische Verteidigung der Bürokratie: von Max Webers idealtypischem Beamten bis zur Psychologie des Wartens — und einem Schlussgedicht, das sich in die Aktenordnung verliebt.",
  chapters: lobChapters,
  uiText: LIBRARY_UI_TEXT,
  locationHint: "Bewohnerbibliothek 1101, Gebäude E71",
  lendable: true,
});

/* ─── SPERRMÜLL — Satiremagazin ─────────────────────────── */

const sperrmuellChapters: HandbookChapter[] = [
  {
    id: "sperrmuell-titel",
    image: imgSperrmuellTitel,
    imageCaption: "Nr. 7 · März 92 · RM 2,50",
    shortTitle: "Titel",
    title: "SPERRMÜLL — Das Heft, das nicht vorgesehen ist",
    body: [
      "Vergilbtes Papier, zwei Farben, davon eine schief gedruckt. Der Bogen ist geklammert, nicht gebunden. Auf der Innenseite steht in kleiner Schrift:",
      "„Herausgegeben ohne Zuteilung. Vervielfältigung erwünscht. Rückgabe an die Bibliothek, wenn Sie fertig gelacht haben.“",
      "Darunter, handschriftlich, mit Bleistift: „H. — bitte nicht im Katalog führen. Steht trotzdem drin.“",
      "AUS DEM INHALT: Der Sektorbericht in vier Bildern · Leserbriefe, die niemand geschickt hat · Wetter & Resonanz für Fortgeschrittene · Sachbearbeiter gegen Sachbearbeiter · Kalle Nichtzuständig · Das ehrliche Formblatt.",
    ],
  },
  {
    id: "sperrmuell-impressum",
    shortTitle: "Impressum",
    title: "Impressum (unvollständig, absichtlich)",
    body: [
      "Redaktion: nicht vorgesehen.",
      "Verantwortlich im Sinne der Ordnung: siehe Redaktion.",
      "Anschrift: Ein Kasten hinter der Heizung, Etage 1, Gebäude Ihrer Wahl.",
      "Erscheinungsweise: sobald jemand Papier hat.",
      "Auflage: schwankt mit der Zahl der funktionierenden Kopiergeräte im Quadranten.",
      "Der Mandatsrat weist darauf hin, dass diese Zeitschrift nicht zugelassen ist. Die Redaktion weist darauf hin, dass sie auch nicht verboten ist, weil dafür ein Formblatt fehlt. Es ist beantragt. Seit 1989.",
    ],
  },
  {
    id: "sperrmuell-sektorbericht",
    image: imgSperrmuellSektorbericht,
    imageCaption: "Comic: „Der Sektorbericht“ — vier Bilder, ein Sprecher, kein Ausweg",
    shortTitle: "Sektorbericht",
    title: "Comic: Der Sektorbericht",
    body: [
      "BILD 1 — Studio. Sprecher im grauen Anzug, hinter ihm ein gemaltes Verwaltungsgebäude.",
      "SPRECHER: „Guten Abend. Die Versorgungslage im Sektor ist stabil.“",
      "",
      "BILD 2 — Derselbe Sprecher. Neben ihm ein kleiner Stapel Papier.",
      "SPRECHER: „Die Versorgungslage im Sektor ist weiterhin stabil. Zu Abweichungen liegt keine Meldung vor, weil keine Meldung vorgesehen ist.“",
      "",
      "BILD 3 — Der Stapel reicht ihm bis zur Brust. Der Sprecher lächelt unverändert.",
      "SPRECHER: „Die Instandsetzung in Gebäude E71 ist eingeleitet. Ein Zeitraum wird nachgereicht. Der Zeitraum für das Nachreichen wird ebenfalls nachgereicht.“",
      "",
      "BILD 4 — Nur noch der Kopf schaut aus dem Papier heraus.",
      "SPRECHER: „Die Lage ist stabil.“",
      "Kleingedruckt unter dem Comic: „Nachdruck genehmigt, sobald der Sprecher gefunden wird.“",
    ],
  },
  {
    id: "sperrmuell-leserbriefe",
    shortTitle: "Leserbriefe",
    title: "Bürgerfunk — Leserbriefe, die niemand geschickt hat",
    body: [
      "„Ich möchte mich bedanken. Wofür, weiß ich nicht. Aber es hat sich so ergeben.“ — B. aus E67",
      "",
      "„Mein Nachbar klopft seit Tagen an die Wand. Ich habe eine Störungsmeldung aufgegeben. Jetzt klopfen wir gemeinsam. Es ist erträglicher zu zweit.“ — Ungezeichnet, Etage 4",
      "",
      "„Ich habe in der Kantine nach dem zweiten Löffel gefragt. Man hat mir gesagt, der zweite Löffel sei nicht vorgesehen. Ich esse jetzt schneller. Das ist auch eine Lösung.“ — W. aus A66",
      "",
      "„Sehr geehrte Redaktion, ich schreibe Ihnen, weil ich sonst niemandem schreiben darf. Bitte antworten Sie nicht. Es könnte auffallen.“ — Name der Redaktion bekannt, dem Sektor nicht",
      "",
      "Die Redaktion antwortet: Wir haben alle Zuschriften geprüft und für zutreffend befunden. Da wir sie selbst geschrieben haben, war das nicht schwer.",
    ],
  },
  {
    id: "sperrmuell-wetter",
    image: imgSperrmuellWetter,
    imageCaption: "„Wetter & Resonanz“ — Vorhersage für Menschen, die zu Hause bleiben",
    shortTitle: "Wetter",
    title: "Wetter & Resonanz für Fortgeschrittene",
    body: [
      "VORHERSAGE FÜR DEN QUADRANTEN, gültig bis Widerruf:",
      "Morgens verhaltene Zuversicht, nach Dienstschluss aufkommende Ernüchterung. Örtlich Rührung, in Treppenhäusern anhaltend.",
      "Resonanzlage: erhöht. Wer heute etwas fühlt, fühlt es voraussichtlich auch durch die Wand. Betroffene Bewohner werden gebeten, gedämpft zu empfinden.",
      "Empfohlene Hygienemaßnahmen: Lüften, Abstand, Zurückhaltung. Bei starker Freude bitte Fenster schließen.",
      "Aussichten: Es bleibt bei allem.",
      "Anmerkung der Redaktion: Wir haben diese Vorhersage aus dem letzten Jahr abgeschrieben. Sie hat wieder gestimmt.",
    ],
  },
  {
    id: "sperrmuell-duell",
    shortTitle: "Duell",
    title: "Sachbearbeiter gegen Sachbearbeiter (ohne Worte)",
    image: imgSperrmuellDuell,
    imageCaption:
      "„Zuständigkeit ist der Zustand, in dem sich zwei Menschen einig sind.“",
    body: [],
  },

  {
    id: "sperrmuell-kalle",
    shortTitle: "Kalle",
    title: "Kalle Nichtzuständig — Der Held mit dem leeren Feld",
    body: [
      "Kalle Nichtzuständig hat große Ohren, einen zu weiten Anzug und einen Stempel, auf dem nichts steht. Er ist die einzige Figur im Mandatsgebiet, die nie in Schwierigkeiten gerät, weil sie für nichts zuständig ist.",
      "FOLGE 7: Kalle wird verhört.",
      "PRÜFER: „Wo waren Sie am Dienstag?“",
      "KALLE: „Nicht vorgesehen.“",
      "PRÜFER: „Das ist keine Antwort.“",
      "KALLE: „Das ist Ihre Antwort. Ich habe sie mir nur geliehen.“",
      "PRÜFER: „Ich lasse Sie eintragen.“",
      "KALLE: „Bitte. Ich stehe schon dreimal drin. Einmal davon als Sachverhalt.“",
      "Im letzten Bild geht Kalle pfeifend durch eine Tür, an der ein Schild hängt: KEIN DURCHGANG. Die Tür ist nicht abgeschlossen. Sie war es nie.",
    ],
  },
  {
    id: "sperrmuell-formblatt",
    shortTitle: "Formblatt",
    title: "Das ehrliche Formblatt (zum Heraustrennen)",
    body: [
      "ANTRAG AUF DAS, WAS SIE OHNEHIN NICHT BEKOMMEN — Formblatt 0/0",
      "",
      "1. Name: ______________________ (wird nicht gelesen)",
      "2. Anliegen: __________________ (wird gelesen, aber nicht verstanden)",
      "3. Dringlichkeit: ☐ dringend ☐ sehr dringend ☐ egal, es dauert gleich lang",
      "4. Sind Sie schon einmal weggeschickt worden? ☐ ja ☐ noch nicht, aber gleich",
      "5. Wer hat entschieden? ______________________",
      "   (Dieses Feld ist absichtlich vorhanden und wird absichtlich nie ausgefüllt.)",
      "6. Unterschrift des Antragstellers: __________",
      "7. Unterschrift der entscheidenden Person: (siehe 5)",
      "",
      "Hinweis: Ihr Vorgang wird zugeteilt. Ein Zeitraum ist nicht vorgesehen. Bei Rückfragen wenden Sie sich bitte an sich selbst.",
    ],
  },
  {
    id: "sperrmuell-rueckseite",
    image: imgSperrmuellRueckseite,
    imageCaption: "Rückseite: Kalle wartet. Nummer 43. Aufgerufen wird 12.",
    shortTitle: "Rückseite",
    title: "Rückseite: Warten mit Kalle",
    body: [
      "Ein einziges großes Bild. Kalle sitzt in einem leeren Wartebereich, hält seine Nummer hoch und grinst.",
      "Text darunter: „Der Sektor bleibt stabil, solange niemand aufsteht.“",
      "Ganz unten, kleiner, fast schon verschämt: „Wenn Sie das hier lesen, haben Sie schon zu viel gelesen. Geben Sie das Heft weiter. Nicht ab.“",
      "Auf dem letzten freien Fleck hat jemand mit Kugelschreiber ein Kürzel hinterlassen. Es sind drei Buchstaben mit Punkten dazwischen.",
    ],
  },
];

registerLibraryBook({
  id: "sperrmuell-heft",
  title: "SPERRMÜLL — Das Heft, das nicht vorgesehen ist",
  subtitle: "Ohne Herausgeber · Nr. 7, März 1992 · Bewohnerbibliothek E71",
  author: "Ohne Herausgeber",
  year: "1992",
  blurb:
    "Ein geklammertes Satireheft von schlechtem Papier: Comics, erfundene Leserbriefe, ein ehrliches Formblatt und Kalle Nichtzuständig. Herbert stellt es zwischen die Fahrpläne, wo niemand sucht.",
  chapters: sperrmuellChapters,
  uiText: LIBRARY_UI_TEXT,
  locationHint: "Bewohnerbibliothek 1101, Gebäude E71",
  lendable: true,
});

/* ─── Die Geschichte des Resonanzbegriffs ───────────────── */

const resbegriffChapters: HandbookChapter[] = [
  {
    id: "resb-vorwort",
    shortTitle: "Vorwort",
    title: "Vorwort: Ein Wort wechselt das Fach",
    body: [
      "Es gibt Wörter, die bleiben, wo sie herkommen. „Drehmoment“ ist in der Mechanik geblieben, „Sublimation“ hat es immerhin bis in die Seelenkunde geschafft. Und dann gibt es Wörter wie Resonanz: geboren in der Akustik, weitergereicht an die Physik, ausgeliehen von der Psychologie, verfeinert von der Philosophie — und heute nachzulesen im Wetterbericht, gleich hinter dem Luftdruck.",
      "Dieses Buch verfolgt diesen Weg. Es ist keine Streitschrift. Ich behaupte nicht, dass der Begriff missbraucht wird; ich behaupte nur, dass niemand mehr genau sagen kann, was er bedeutet, und dass genau darin sein Nutzen liegt.",
      "Wer wissen will, warum in seinem Treppenhaus ein Aushang zur Resonanz-Hygiene klebt, muss bei einer Saite anfangen, die von selbst zu klingen beginnt.",
    ],
  },
  {
    id: "resb-akustik",
    image: imgResPhysik,
    shortTitle: "Die Saite",
    title: "I. Die mitschwingende Saite",
    body: [
      "Resonare heißt widerhallen. Der Begriff gehört zunächst den Instrumentenbauern: Ein Körper schwingt mit, wenn man ihn mit seiner eigenen Frequenz anregt. Man muss ihn nicht anfassen. Man muss nur den richtigen Ton treffen.",
      "Das 19. Jahrhundert macht daraus Physik. Hermann von Helmholtz baut in den 1860er Jahren seine Resonatoren — Hohlkugeln aus Messing, die aus einem Klanggemisch genau einen Ton herausfischen und ihn dem Ohr zutragen. Zum ersten Mal ist Resonanz nicht nur ein Phänomen, sondern ein Messgerät.",
      "Der Ingenieur lernt sie von ihrer unangenehmen Seite kennen. Brücken geraten unter gleichmäßigem Marschtritt in Schwingung; Maschinenfundamente schaukeln sich bei bestimmten Drehzahlen auf. Seitdem hat jede Bauordnung ein Kapitel über Resonanz, und in jedem dieser Kapitel steht dasselbe: Die Kraft ist klein, die Wirkung ist groß, entscheidend ist allein der Gleichtakt.",
      "Man merke sich diesen Satz. Er wird in diesem Buch noch mehrmals auftauchen, jedes Mal in einem anderen Fach.",
    ],
  },
  {
    id: "resb-massen",
    shortTitle: "Die Menge",
    title: "II. Nachahmung und Ansteckung (1890–1895)",
    body: [
      "Als die europäischen Städte wachsen, wächst eine neue Frage mit: Warum verhalten sich Menschen in Mengen anders als einzeln? Die frühe Soziologie greift zur Sprache der Physik, weil sie noch keine eigene hat.",
      "Gabriel Tarde veröffentlicht 1890 „Die Gesetze der Nachahmung“. Für ihn besteht Gesellschaft aus Wiederholung: Eine Neuerung entsteht an einer Stelle und pflanzt sich fort wie eine Welle im Wasser — von oben nach unten, von der Stadt aufs Land, ohne dass jemand befiehlt.",
      "Gustave Le Bon setzt 1895 mit der „Psychologie der Massen“ nach und spricht offen von Ansteckung. Ein Gefühl springt über, sagt er, wie ein Funke; die Menge sei ein einziger Körper, der in Schwingung gerate.",
      "Beides ist eher Bild als Beweis, und beide Autoren wissen das. Aber die Metapher hält sich, weil sie etwas trifft, das jeder kennt: Stimmungen brauchen keine Argumente, um sich zu verbreiten. Sie brauchen nur Nähe und Gleichtakt.",
      "Von hier an ist Resonanz doppelt besetzt — als Messgröße und als Bild für das, was zwischen Menschen passiert.",
    ],
  },
  {
    id: "resb-leib",
    shortTitle: "Der Leib",
    title: "III. Leibliche Resonanz und Atmosphären (ab 1960)",
    body: [
      "Der Philosoph Hermann Schmitz nimmt das Bild ernst. In seiner Neuen Phänomenologie beschreibt er ab den sechziger Jahren, wie Gefühle nicht im Kopf sitzen, sondern im Raum: als Atmosphären, die man beim Eintreten spürt, bevor jemand ein Wort gesagt hat.",
      "Sein Begriff dafür ist die leibliche Resonanz: Enge und Weite, Anspannung und Lösung übertragen sich unmittelbar von Leib zu Leib. Wer einen Raum betritt, in dem eben gestritten wurde, weiß es, ohne informiert worden zu sein.",
      "Für die Wissenschaft ist das schwer zu handhaben, weil es sich nicht wiegen lässt. Für die Verwaltung ist es später ausgesprochen praktisch: Es liefert eine ehrbare Begründung dafür, dass ein Zustand im Haus als Zustand des Hauses behandelt wird und nicht als Angelegenheit einzelner Bewohner.",
      "Schmitz selbst hätte gegen diese Verwendung vermutlich einiges einzuwenden. Er wird in den Verordnungen auch nirgends zitiert. Er steht nur in den Fußnoten der Gutachten, die zu ihnen führen.",
    ],
  },
  {
    id: "resb-bau",
    image: imgResDaemmung,
    shortTitle: "Der Bau",
    title: "IV. Der Messwert im Stahlbeton (1946–1958)",
    body: [
      "Nach 1946 wird schnell und dicht gebaut. Die Großkomplexe des Wiederaufbaus sind aus durchgehendem Stahlbeton, und Stahlbeton leitet Körperschall vorzüglich. Ein Stuhl, der im vierzehnten Geschoss verrückt wird, ist im zwölften zu hören; ein tieffrequentes Brummen der Heizanlage wandert durch dreißig Etagen und findet in einzelnen Wohneinheiten seinen Gleichtakt.",
      "Die Bauabteilungen des Mandatsrats reagieren mit Messreihen. Was sie erheben, nennen sie schlicht die Resonanz eines Komplexes: Schwingungswerte an Decken, Schächten und Trennwänden. Der Begriff ist zu diesem Zeitpunkt völlig unauffällig. Er steht neben Feuchtigkeit und Wärmedurchgang.",
      "Aus derselben Zeit stammt der erste Ratgeber, der das Wort in einen Wohnungsflur trägt: Brennwalds „Resonanzhygiene“ von 1956. Er behandelt sie wie Staub oder Zugluft — als Gefährdung des Einzelnen, gegen die Dämmung, Lüftung und Ruhepausen helfen. Von Nachbarn ist bei ihm noch kaum die Rede.",
      "Das ändert sich innerhalb weniger Jahre, und zwar nicht durch eine Entdeckung, sondern durch eine Formulierung.",
    ],
  },
  {
    id: "resb-verwaltung",
    image: imgResLueften,
    shortTitle: "Der Index",
    title: "V. Wie zwei Bedeutungen zusammenrutschen",
    body: [
      "In den späten fünfziger Jahren tauchen in den Sektorberichten erstmals Tabellen auf, die neben Schwingungswerten auch Beschwerden, Krankmeldungen und Aufzugsvorfälle führen. Die Begründung ist harmlos und einleuchtend: Man will wissen, ob die gemessene Bauresonanz mit dem Befinden der Bewohner zusammenhängt.",
      "Die Spalten stehen nebeneinander. Ein paar Jahre später stehen sie in einer Summe. Aus der Summe wird der Resonanzindex, den heute jeder aus dem Resonanzbericht nach dem Wetter kennt. Wie er berechnet wird, ist nicht veröffentlicht.",
      "Damit ist der entscheidende Schritt getan, und er ist an keiner Stelle beschlossen worden. Wer von Resonanz spricht, spricht ab jetzt von zweierlei zugleich: von Körperschall in einer Wand und vom Klima zwischen Menschen. Der Vorteil liegt auf der Hand. Über Bauakustik lässt sich sachlich reden, und wer über Bauakustik redet, regelt nebenbei Ruhezeiten, Belegungsdichte, Türsiegel und Krankmeldungen, ohne je sagen zu müssen, dass er Menschen regelt.",
      "Der ganze Regelkatalog heißt seither Resonanz-Hygiene. Er ist medizinisch begründet, nicht sicherheitsbehördlich — ein Unterschied, auf den in den Verordnungen großer Wert gelegt wird und der in der Praxis geringe Folgen hat.",
    ],
  },
  {
    id: "resb-luhmann",
    shortTitle: "Das System",
    title: "VI. Luhmann, oder: Der Widerhall nach eigenen Regeln (1986)",
    body: [
      "1986 erscheint Niklas Luhmanns „Ökologische Kommunikation“, und der Begriff wird zum ersten Mal wieder scharf. Luhmann fragt, wie eine Gesellschaft Warnungen aus ihrer Umwelt aufnimmt, und antwortet: nur als Resonanz.",
      "Seine Systeme — Wirtschaft, Recht, Politik, Verwaltung — sind geschlossen. Die Umwelt kann sie nicht steuern, sie kann sie nur stören. Ob eine Störung überhaupt bemerkt wird, entscheidet allein die innere Struktur des Systems: Die Wirtschaft hört einen Preis, das Recht hört einen Verstoß, die Verwaltung hört einen Vorgang. Alles andere geht durch das Haus, ohne etwas zum Schwingen zu bringen.",
      "Das ist keine Anklage, sondern eine Beschreibung, und sie erklärt ohne jede Bosheit, warum eine Eingabe unbeantwortet bleibt, bis sie in die richtige Form gebracht ist. Nicht Gleichgültigkeit, sondern fehlender Gleichtakt.",
      "Man kann diesen Gedanken auf zweierlei Weise lesen. Als Trost: Das Haus meint es nicht persönlich. Oder als Anleitung: Wer gehört werden will, muss die Frequenz treffen, auf die das System anspricht. Die zweite Lesart hat sich in den Wartebereichen des Mandatsgebiets deutlich besser durchgesetzt.",
    ],
  },
  {
    id: "resb-schluss",
    shortTitle: "Schluss",
    title: "VII. Schluss: Die Randnische",
    body: [
      "Bleibt der Rest, den ein Buch wie dieses gewöhnlich verschweigt. Seit den sechziger Jahren gibt es Bastler, die den Doppelsinn des Wortes wörtlich nehmen und behaupten, das soziale Klima eines Komplexes lasse sich mit einem Empfänger tatsächlich abhören. Man findet sie in Kellern, in Kleinanzeigen und gelegentlich in Beschwerdeakten.",
      "Ich halte das für eine Verwechslung, aber für eine aufschlussreiche: Sie entsteht nur, weil der Begriff selbst zwei Dinge meint. Wo ein Wort zugleich einen Messwert und ein Gefühl bezeichnet, wird früher oder später jemand ein Gerät bauen, das beides verwechselt.",
      "Die Verwaltung nennt so etwas eine Fehldeutung. Sie hat recht. Sie sollte nur dazusagen, dass die Fehldeutung im Wort angelegt ist und dass sie das Wort in dieser Form seit fast vierzig Jahren selbst benutzt.",
      "Der Rest ist Praxis. Nachts leiser sein, dem Nachbarn nicht ins Treppenhaus schreien, den Aufzug nicht als Bühne benutzen. Dagegen ist nichts zu sagen. Nur sagen sollte man, was man tut.",
    ],
  },
];

registerLibraryBook({
  id: "geschichte-resonanzbegriff",
  title: "Die Geschichte des Resonanzbegriffs",
  subtitle: "Dr. phil. habil. I. Marnau · 1994 · Bewohnerbibliothek E71",
  author: "Dr. phil. habil. I. Marnau",
  year: "1994",
  blurb:
    "Von der mitschwingenden Saite über Nachahmung, Ansteckung und leibliche Atmosphären bis zum Resonanzindex im Wetterbericht — die Laufbahn eines Wortes, das den Beruf gewechselt hat.",
  chapters: resbegriffChapters,
  uiText: LIBRARY_UI_TEXT,
  locationHint: "Bewohnerbibliothek 1101, Gebäude E71",
  lendable: true,
});

/* ─── Absurd. Ein Assoziationsblaster für den verwalteten Menschen ─── */

const absurdChapters: HandbookChapter[] = [
  {
    id: "absurd-vorwort",
    shortTitle: "Vorwort",
    title: "Vorwort: Vom Nutzen des Unnützen",
    body: [
      "Dieses Buch enthält Gedichte. Sie sind nicht nützlich. Sie lösen keinen Vorgang, beantragen keine Quittung und passieren keine Sachbearbeitung.",
      "Das ist ihre einzige Erlaubnis. In einer verwalteten Welt ist das Unnütze manchmal der letzte Ort, an dem noch etwas wahrgenommen werden kann, ohne gleich gemessen zu werden.",
      "Manche der folgenden Stücke sind lustig, manche traurig, manche absichtlich unbehaust. Lesen Sie sie, wie Sie wollen — der Reihe nach, rückwärts oder nur das eine, das gerade passt.",
    ],
  },
  {
    id: "absurd-stadt",
    shortTitle: "stadt",
    title: "stadt",
    body: [
      "In tausend Jahren werden Engel diese Stadt beweinen",
      "Der Smog der Geschichte errichtet eine Ordnung gegen die Dinge",
      "Der Kreuzzug ewigen Glückes richtet sich gegen den Menschen",
      "Die Welt erscheint im Glanze ewiger Zerrissenheit",
      "Ohne die übliche Langeweile der Vernunft sind wir",
      "Erscheint der Mensch auf der Bühne der Geschichte, wird die Welt verloren sein",
      "Ohne die Kälte der Vernunft werden wir das Paradies erben",
      "Der Baum der Erkenntnis wächst auf dem Kompost verlorener Seelen",
      "Er trägt die Früchte der ewigen Suche nach dem Endlichen",
      "Sollte er fallen, wird er die Welt richten",
      "Die Schlange wird die Frucht der Qualen essen",
      "Der Mensch hat von der Schlange gekostet",
      "Verbotenerweise stürzt er sich ins Unglück",
      "Die Nacht wird heller sein als der Tag, schwärzer als das Paradies, deutlicher abgefuckter noch als die Hölle",
      "Im Lichte der Vernunft wird der Mensch sein Ich erkennen",
      "Er will sich entledigen von seiner Selbst",
      "Das Göttliche wird aus der Welt vertrieben",
      "Die Hoffnung stirbt. Zuletzt.",
    ],
  },
  {
    id: "absurd-kueche",
    shortTitle: "küche, nachts",
    title: "küche, nachts",
    body: [
      "Der Wasserkocher steht auf der Platte und denkt an nichts.",
      "Das Fenster über dem Spülbecken zeigt einen Hinterhof,",
      "den niemand betreten will.",
      "",
      "Ich sitze im Dunkeln, weil das Licht zu viel erklären würde.",
      "Der Kühlschrank summt sein einziges Lied.",
      "Draußen fährt ein Bus, der nicht mehr hält.",
      "",
      "Morgens wird wieder jemand fragen,",
      "warum ich so früh aufgestanden bin.",
      "Ich werde sagen: Ich konnte nicht schlafen.",
      "Das ist fast wahr.",
    ],
  },
  {
    id: "absurd-kaffee",
    shortTitle: "kaffee, morgens",
    title: "kaffee, morgens",
    body: [
      "Die Kanne ist schwarz von innen",
      "und weiß von außen,",
      "wie ein Mensch, der sich verkleidet hat.",
      "",
      "Ich gieße die Flüssigkeit in eine Tasse,",
      "die einen Sprung hat, den ich nicht sehe.",
      "Der Geschmack ist bitter,",
      "was bedeutet, dass er echt ist.",
      "",
      "Draußen geht jemand vorbei,",
      "den ich nicht kenne.",
      "Wir beide existieren eine Weile nebeneinander,",
      "ohne uns zu begegnen.",
      "Das ist fast eine Freundschaft.",
    ],
  },
  {
    id: "absurd-park",
    shortTitle: "im park",
    title: "im park",
    body: [
      "Die Bänke stehen in einer Reihe,",
      "als hätte jemand vergessen, sie wieder wegzuräumen.",
      "Auf jeder sitzt jemand, der allein sein möchte.",
      "",
      "Ein Hund läuft vorbei und schaut mich an",
      "mit den Augen eines Philosophen,",
      "der beschlossen hat, dass Fragen überbewertet sind.",
      "",
      "Die Blätter fallen nicht mehr.",
      "Sie warten ab.",
      "Erst wenn niemand hinschaut,",
      "lassen sie sich fallen.",
      "",
      "Ich schaue weg.",
      "Es ist das Mindeste, was ich tun kann.",
    ],
  },
  {
    id: "absurd-fahrplan",
    shortTitle: "fahrplan",
    title: "fahrplan",
    body: [
      "Der Zug um sieben fährt um sechs.",
      "Der Zug um acht fährt nie.",
      "Der Zug um neun ist schon gestern angekommen.",
      "",
      "Ich stehe auf dem Bahnsteig",
      "und halte ein Ticket, das ich nicht gekauft habe.",
      "Der Schaffner nickt, als würde er mich erkennen.",
      "",
      "Wir fahren durch Städte, die ich vergessen habe,",
      "an Flüssen vorbei, die noch keinen Namen haben.",
      "",
      "Am Ende steige ich aus",
      "und merke, dass ich am Anfang bin.",
      "Der Fahrplan war ein Kreis.",
      "Das hätte ich wissen müssen.",
    ],
  },
  {
    id: "absurd-schlaf",
    shortTitle: "schlaf",
    title: "schlaf",
    body: [
      "Im Schlaf bin ich zwei Meter groß",
      "und bestehe aus Glas.",
      "Jeder kann durch mich hindurchsehen,",
      "niemand tut es.",
      "",
      "Ich träume von einem Haus ohne Türen.",
      "Die Bewohner kommen trotzdem herein,",
      "indem sie sich an die Wände denken.",
      "",
      "Morgens bin ich wieder aus Pappe und Wasser.",
      "Meine Knochen knirschen beim Aufstehen,",
      "als würden sie sich beschweren, dass ich zurückgekommen bin.",
      "",
      "Ich beschwere mich nicht.",
      "Ich bin froh, dass sie da sind.",
    ],
  },
  {
    id: "absurd-regen",
    shortTitle: "anweisung zum regen",
    title: "anweisung zum regen",
    body: [
      "Wenn es regnet, öffne das Fenster nicht.",
      "Wenn es regnet und du öffnest das Fenster,",
      "wird der Tisch nass.",
      "Das ist erlaubt.",
      "",
      "Wenn der Tisch nass ist,",
      "steht er im Raum wie eine Frage,",
      "die niemand gestellt hat.",
      "",
      "Lass ihn stehen.",
      "Manche Fragen brauchen nur einen nassen Tisch,",
      "um beantwortet zu werden.",
    ],
  },
  {
    id: "absurd-stille",
    shortTitle: "die stillen räume",
    title: "die stillen räume",
    body: [
      "Es gibt Räume, die nicht leer sind,",
      "nur weil niemand darin spricht.",
      "Sie füllen sich mit dem, was nicht gesagt wurde,",
      "mit den Atemzügen, die übrig blieben,",
      "mit dem leisen Klicken der Heizung,",
      "die sich an etwas erinnert, das sie nie war.",
      "",
      "In solchen Räumen steht man auf,",
      "ohne einen Grund zu haben,",
      "und geht zur Tür,",
      "ohne sie zu öffnen.",
      "",
      "Draußen wartet die Stadt mit ihren tausend Stimmen.",
      "Drinnen wartet etwas, das keine Stimme braucht.",
      "Manchmal ist das genug.",
    ],
  },
  {
    id: "absurd-notiz",
    shortTitle: "herberts notiz",
    title: "Herberts Notiz auf dem hinteren Einband",
    body: [
      "Auf der Rückseite des Einbands hat Herbert mit Bleistift eine Zeile hinterlassen:",
      "",
      "„Wer Gedichte ausleiht, leiht Löcher. Man gibt sie zurück, aber sie sind nicht mehr dieselben.“",
      "",
      "Darunter, noch kleiner:",
      "",
      "„Frist: unbegrenzt. Verlängerung: nicht vorgesehen.“",
    ],
  },
];

registerLibraryBook({
  id: "absurd-gedichte",
  title: "Absurd. Ein Assoziationsblaster für den verwalteten Menschen",
  subtitle: "R. K. Zunder · 1989 · Bewohnerbibliothek E71",
  author: "R. K. Zunder",
  year: "1989",
  blurb:
    "Gedichte zwischen Wartebereich und Weltuntergang. Manche erheiternd, manche düster, alle irgendwie mit einem Fuß im Schalter. Herbert blättert darin, wenn niemand hinschaut.",
  chapters: absurdChapters,
  uiText: LIBRARY_UI_TEXT,
  locationHint: "Bewohnerbibliothek 1101, Gebäude E71",
  lendable: true,
});

const grundgesetzChapters: HandbookChapter[] = [
  {
    id: "gg-vorbemerkung",
    shortTitle: "Vorbemerkung",
    title: "Vorbemerkung des Herausgebers",
    body: [
      "Die vorliegende Textausgabe gibt das Grundgesetz für das Mandatsgebiet Mitteleuropa in der am 1. Januar 1996 geltenden Fassung wieder.",
      "Das Grundgesetz wurde am 12. Mai 1947 durch Proklamation Nr. 4 des Alliierten Kontrollrats in Kraft gesetzt. Es beruht auf dem Mandatsfrieden von 1946 und war nach seinem eigenen Wortlaut für eine Übergangszeit bestimmt.",
      "Bis 1986 stand jede Änderung unter dem Vorbehalt der Zustimmung des Alliierten Kontrollrats (Art. 70 a. F.). Mit dem Mandatsbundgesetz vom 3. Oktober 1986 ist dieser Vorbehalt entfallen; das Änderungsrecht liegt seither beim Mandatsrat.",
      "Seit Inkrafttreten sind einunddreißig Änderungsgesetze ergangen. Sie sind im Änderungsnachweis am Schluss dieser Ausgabe verzeichnet. Eingriffe in die Präambel hat es nicht gegeben.",
      "Redaktionelle Berichtigungen dieser Auflage betreffen die Artikelzählung in Abschnitt IV sowie die Schreibweise der Sektorbezeichnungen nach der Sektor-Reform 1996.",
    ],
  },
  {
    id: "gg-praeambel",
    shortTitle: "Präambel",
    title: "Präambel",
    body: [
      "Im Bewußtsein seiner Verantwortung vor der Geschichte, von dem Willen beseelt, dem Frieden in Europa zu dienen, und in der Absicht, dem staatlichen Leben für eine Übergangszeit eine neue Ordnung zu geben, hat der Mandatsrat, handelnd auf Grund des Mandatsfriedens von 1946, dieses Grundgesetz beschlossen.",
      "Es gilt, bis ein Friedensvertrag mit dem Deutschen Reich in Kraft getreten ist und das deutsche Volk in freier Selbstbestimmung sich eine Verfassung gegeben hat.",
      "Die Bewohner des Mandatsgebiets sind aufgefordert, bis dahin an der Erhaltung der öffentlichen Ordnung und der Versorgung mitzuwirken.",
    ],
  },
  {
    id: "gg-grundrechte",
    shortTitle: "I. Grundrechte",
    title: "Erster Abschnitt — Die Grundrechte (Art. 1 bis 17)",
    body: [
      "**Artikel 1** (1) Die Würde des Menschen ist unantastbar. Sie zu achten und zu schützen ist Verpflichtung aller Verwaltung. (2) Die nachfolgenden Grundrechte binden Rechtsetzung, Verwaltung und Rechtsprechung als unmittelbar geltendes Recht.",
      "**Artikel 2** (1) Jeder hat das Recht auf die freie Entfaltung seiner Persönlichkeit, soweit er nicht die Rechte anderer verletzt oder gegen die verfassungsmäßige Ordnung verstößt. (2) Jeder hat das Recht auf Leben und körperliche Unversehrtheit. Die Freiheit der Person ist unverletzlich. In diese Rechte darf nur auf Grund eines Gesetzes eingegriffen werden.",
      "**Artikel 3** (1) Alle Bewohner sind vor dem Gesetz gleich. (2) Männer und Frauen sind gleichberechtigt; die Verwaltung wirkt auf die tatsächliche Durchsetzung hin. (3) Niemand darf wegen seiner Herkunft, Sprache, Heimat, seines Glaubens oder seiner politischen Anschauungen benachteiligt oder bevorzugt werden. Die Zuweisung von Wohnraum und Arbeit nach den Versorgungsplänen bleibt unberührt.",
      "**Artikel 4** (1) Die Freiheit des Glaubens und des weltanschaulichen Bekenntnisses ist unverletzlich. (2) Die ungestörte Religionsausübung wird gewährleistet.",
      "**Artikel 5** (1) Jeder hat das Recht, seine Meinung in Wort, Schrift und Bild frei zu äußern und sich aus allgemein zugänglichen Quellen zu unterrichten. Eine Zensur findet nicht statt. (2) Diese Rechte finden ihre Schranken in den Vorschriften der allgemeinen Gesetze, in den Bestimmungen über die Ordnung des Druck- und Sendewesens sowie in dem Recht der persönlichen Ehre. (3) Wissenschaft, Forschung und Lehre sind frei; die Freiheit der Lehre entbindet nicht von der Treue zur verfassungsmäßigen Ordnung.",
      "**Artikel 6** (1) Ehe und Familie stehen unter dem besonderen Schutz der Ordnung. (2) Pflege und Erziehung der Kinder sind das natürliche Recht der Eltern und die zuvörderst ihnen obliegende Pflicht.",
      "**Artikel 7** (1) Das gesamte Schulwesen steht unter der Aufsicht der Verwaltung. (2) Jeder hat das Recht auf Bildung. Der Zugang zu den weiterführenden Einrichtungen richtet sich nach Eignung und nach dem Bedarf der Versorgungsplanung.",
      "**Artikel 8** Alle Bewohner haben das Recht, sich ohne Anmeldung und ohne Erlaubnis friedlich und ohne Waffen zu versammeln. Für Versammlungen unter freiem Himmel kann dieses Recht durch Gesetz beschränkt werden.",
      "**Artikel 9** (1) Alle Bewohner haben das Recht, Vereine und Gesellschaften zu bilden. (2) Das Recht, zur Wahrung und Förderung der Arbeits- und Lebensbedingungen Vereinigungen zu bilden, ist für jedermann und für alle Tätigkeiten gewährleistet.",
      "**Artikel 10** Das Brief-, Post- und Fernmeldegeheimnis ist unverletzlich. Beschränkungen dürfen nur auf Grund eines Gesetzes angeordnet werden.",
      "**Artikel 11** (1) Alle Bewohner genießen Freizügigkeit im gesamten Mandatsgebiet. (2) Dieses Recht darf durch Gesetz beschränkt werden, soweit die Wohnraumzuweisung, die Versorgungslage oder die Sektorenordnung es erfordern.",
      "**Artikel 12** (1) Jeder hat das Recht auf Arbeit sowie auf die freie Wahl des Berufes und des Arbeitsplatzes nach Maßgabe der Gesetze und im Rahmen der Versorgungsplanung. (2) Niemand darf zu einer bestimmten Arbeit gezwungen werden außer im Rahmen einer allgemeinen, für alle gleichen öffentlichen Dienstleistungspflicht.",
      "**Artikel 13** (1) Die Wohnung ist unverletzlich. (2) Jeder hat Anspruch auf angemessenen Wohnraum nach Maßgabe der Zuteilungsordnung. (3) Durchsuchungen dürfen nur durch den Richter, bei Gefahr im Verzuge auch durch die in den Gesetzen vorgesehenen Stellen angeordnet werden. Betretungsrechte zur Wartung technischer Anlagen bleiben unberührt.",
      "**Artikel 14** (1) Jeder hat das Recht auf ärztliche Versorgung und auf Sicherung bei Krankheit, Unfall, Invalidität und im Alter. (2) Das Nähere regelt das Versorgungsgesetz.",
      "**Artikel 15** (1) Das Eigentum wird gewährleistet. Inhalt und Schranken werden durch die Gesetze bestimmt. (2) Eigentum verpflichtet. Sein Gebrauch soll zugleich dem Wohle der Allgemeinheit dienen. (3) Eine Enteignung ist nur zum Wohle der Allgemeinheit und gegen Entschädigung zulässig.",
      "**Artikel 16** Grund und Boden, Wohnraum, Bodenschätze, Verkehrswege und die Einrichtungen der Versorgung stehen unter Verwaltungsvorbehalt. Sie können durch Gesetz in Gemeineigentum überführt werden.",
      "**Artikel 17** Jeder hat das Recht, sich einzeln oder in Gemeinschaft mit anderen schriftlich mit Bitten oder Beschwerden an die zuständigen Stellen und an den Mandatsrat zu wenden. Über Eingaben ist innerhalb der gesetzlichen Frist zu entscheiden.",
    ],
  },
  {
    id: "gg-ordnung",
    shortTitle: "II. Ordnung",
    title: "Zweiter Abschnitt — Das Mandatsgebiet und seine Ordnung (Art. 18 bis 29)",
    body: [
      "**Artikel 18** (1) Das Mandatsgebiet Mitteleuropa ist eine auf dem Mandatsfrieden von 1946 beruhende Verwaltungsordnung von vorläufigem Bestand. (2) Es ist kein Staat im Sinne des Völkerrechts und tritt in die Rechtsnachfolge des Deutschen Reiches nicht ein.",
      "**Artikel 19** Alle Gewalt geht von den Bewohnern aus; sie wird bis zum Inkrafttreten einer Verfassung nach Maßgabe dieses Grundgesetzes durch den Mandatsrat und die ihm nachgeordneten Stellen ausgeübt.",
      "**Artikel 20** (1) Bis zum 3. Oktober 1986 übten die vier Mandatsmächte die oberste Gewalt durch den Alliierten Kontrollrat aus. (2) Mit dem Mandatsbundgesetz sind diese Befugnisse auf den Mandatsrat übergegangen. Die Mandatsmächte behalten das Recht auf Unterrichtung.",
      "**Artikel 21** Amtssprache und Verwaltungssprache ist Deutsch. Fassungen in den Sprachen der Mandatsmächte sind gleichermaßen amtlich; bei Abweichungen ist die deutsche Fassung maßgebend.",
      "**Artikel 22** (1) Das Mandatsgebiet gliedert sich in Sektoren, diese in Quadranten. (2) Die Einteilung erfolgt durch Verordnung. Änderungen der Einteilung berühren bestehende Rechtsverhältnisse nicht.",
      "**Artikel 23** Die Adressierung von Personen, Gebäuden und Vorgängen richtet sich nach der Quadranten-Konvention von 1971 in ihrer jeweils geltenden Fassung.",
      "**Artikel 24** Auf Gebäudeebene bestehen Bewohnervertretungen. Ihre Aufgaben sind beratend und verwaltend; sie führen ein eigenes Trockensiegel.",
      "**Artikel 25** Die allgemeinen Regeln des Völkerrechts sind Bestandteil des im Mandatsgebiet geltenden Rechts. Sie gehen den Gesetzen vor.",
      "**Artikel 26** Handlungen, die geeignet sind, das friedliche Zusammenleben der Völker zu stören, sind verfassungswidrig.",
      "**Artikel 27** Das vor dem 12. Mai 1947 geltende Recht bleibt in Kraft, soweit es diesem Grundgesetz nicht widerspricht. Ob ein Widerspruch vorliegt, stellt das Verwaltungsgericht fest.",
      "**Artikel 28** Die Flaggen-, Siegel- und Stempelführung wird durch Verordnung geregelt.",
      "**Artikel 29** Die Währung des Mandatsgebiets wird durch Gesetz bestimmt.",
    ],
  },
  {
    id: "gg-mandatsrat",
    shortTitle: "III. Mandatsrat",
    title: "Dritter Abschnitt — Der Mandatsrat (Art. 30 bis 45)",
    body: [
      "**Artikel 30** (1) Der Mandatsrat ist das oberste Organ des Mandatsgebiets. (2) Er besteht aus den von den Sektoren entsandten Räten sowie aus den Leitern der Abteilungen.",
      "**Artikel 31** (1) Die Sektoren entsenden ihre Räte auf sechs Jahre. (2) Die Entsendung erfolgt durch die Sektorversammlungen, deren Zusammensetzung sich aus den Bewohnervertretungen ergibt. Eine unmittelbare Wahl findet nicht statt.",
      "**Artikel 32** Der Mandatsrat beschließt die Gesetze. Ein Gesetz kommt zustande, wenn ihm die Mehrheit der Räte zustimmt.",
      "**Artikel 33** (1) Der Mandatsrat kann die Abteilungen ermächtigen, Rechtsverordnungen zu erlassen. (2) Inhalt, Zweck und Ausmaß der Ermächtigung müssen im Gesetz bestimmt sein.",
      "**Artikel 34** Bei Gefahr für die Versorgung oder die öffentliche Ordnung kann der Mandatsrat Verordnungen mit Gesetzeskraft erlassen. Sie treten außer Kraft, wenn er sie nicht binnen sechs Monaten bestätigt.",
      "**Artikel 35** Der Haushaltsplan wird jährlich durch Gesetz festgestellt.",
      "**Artikel 36** Die Abteilungen führen die Gesetze aus. Sie sind dem Mandatsrat verantwortlich.",
      "**Artikel 37** Die Räte sind an Aufträge und Weisungen nicht gebunden und nur ihrem Gewissen unterworfen. Sie bleiben ihrem Sektor zur Berichterstattung verpflichtet.",
      "**Artikel 38** Über Eingaben nach Artikel 17 berichtet die Abteilung Rechtsangelegenheiten jährlich.",
      "**Artikel 39** Dieses Grundgesetz kann nur durch ein Gesetz geändert werden, das seinen Wortlaut ausdrücklich ändert oder ergänzt. Das Gesetz bedarf der Zustimmung von zwei Dritteln der Räte.",
      "**Artikel 40** Eine Änderung, durch welche die in den Artikeln 1 bis 3 niedergelegten Grundsätze berührt werden, ist unzulässig.",
      "**Artikel 41** Die Präambel ist einer Änderung nicht zugänglich.",
    ],
  },
  {
    id: "gg-verwaltung",
    shortTitle: "IV. Verwaltung",
    title: "Vierter Abschnitt — Verwaltung und Rechtsweg (Art. 46 bis 60)",
    body: [
      "**Artikel 46** Die Verwaltung gliedert sich in Abteilungen, Sektorstellen und Gebäudestellen. Der Aufbau wird durch Verordnung bestimmt.",
      "**Artikel 47** (1) Jede Angelegenheit wird als Vorgang geführt. (2) Ein Vorgang erhält bei seiner Anlegung ein Kennzeichen; er gilt bis zu seinem Abschluß als anhängig.",
      "**Artikel 48** Amtshandlungen sind schriftlich zu dokumentieren. Mündliche Auskünfte begründen keine Rechte.",
      "**Artikel 49** (1) Ist eine Stelle für einen Vorgang nicht zuständig, so gibt sie ihn an die zuständige Stelle ab und unterrichtet den Antragsteller. (2) Läßt sich eine zuständige Stelle nicht feststellen, so entscheidet die nächsthöhere Stelle über die Zuständigkeit.",
      "**Artikel 50** Gegen einen Verwaltungsakt ist der Widerspruch innerhalb eines Monats nach Bekanntgabe zulässig.",
      "**Artikel 51** (1) Wird dem Widerspruch nicht abgeholfen, so steht der Rechtsweg zum Verwaltungsgericht offen. (2) Die Richter sind unabhängig und nur dem Gesetz unterworfen.",
      "**Artikel 52** Niemand darf seinem gesetzlichen Richter entzogen werden. Ausnahmegerichte sind unzulässig.",
      "**Artikel 53** Eine Tat kann nur bestraft werden, wenn die Strafbarkeit gesetzlich bestimmt war, bevor die Tat begangen wurde.",
      "**Artikel 54** Die Todesstrafe ist abgeschafft.",
      "**Artikel 55** Verletzt jemand in Ausübung eines öffentlichen Amtes die ihm obliegenden Pflichten, so trifft die Verantwortlichkeit die Stelle, in deren Dienst er steht.",
      "**Artikel 56** Entscheidungen sind zu begründen und mit einer Belehrung über den Rechtsbehelf zu versehen.",
      "**Artikel 57** Über einen Antrag ist binnen drei Monaten zu entscheiden. Die Frist kann einmal verlängert werden; die Verlängerung ist mitzuteilen.",
      "**Artikel 58** Ergeht innerhalb der Frist keine Entscheidung, so gilt der Antrag als abgelehnt; der Rechtsweg bleibt offen.",
      "**Artikel 59** Akten sind aufzubewahren. Das Nähere, insbesondere die Aussonderung, regelt die Archivordnung.",
      "**Artikel 60** Jeder hat das Recht auf Einsicht in die ihn betreffenden Akten, soweit nicht überwiegende Belange Dritter oder der Ordnung entgegenstehen.",
    ],
  },
  {
    id: "gg-schluss",
    shortTitle: "V. Schluß",
    title: "Fünfter Abschnitt — Übergangs- und Schlußbestimmungen (Art. 61 bis 72)",
    body: [
      "**Artikel 61** Dieses Grundgesetz gilt zunächst im Gebiet der vier Mandatszonen. Es ist in einem anderen Teile Mitteleuropas nach dessen Beitritt in Kraft zu setzen.",
      "**Artikel 62** Das bei Inkrafttreten bestehende Personal der Verwaltung bleibt im Dienst; seine Rechtsverhältnisse werden durch Gesetz geregelt.",
      "**Artikel 63** Vermögensfragen, die sich aus der Auflösung früherer Träger öffentlicher Verwaltung ergeben, werden durch Gesetz geregelt.",
      "**Artikel 64** Die vor dem 3. Oktober 1986 mit Zustimmung des Alliierten Kontrollrats ergangenen Rechtsvorschriften bleiben in Kraft.",
      "**Artikel 65** Der Vorbehalt des Alliierten Kontrollrats (Artikel 70 alter Fassung) ist mit dem 3. Oktober 1986 entfallen.",
      "**Artikel 66** Verweisungen auf Vorschriften, die durch die Sektor-Reform 1996 aufgehoben worden sind, gelten als Verweisungen auf die an ihre Stelle getretenen Vorschriften.",
      "**Artikel 67** Die Bezeichnungen „Provisorium“ und „Mandatsgebiet“ sind gleichbedeutend. In amtlichen Schriftstücken ist die Bezeichnung „Mandatsgebiet Mitteleuropa“ zu verwenden.",
      "**Artikel 68** Bis zum Abschluß eines Friedensvertrages führt der Mandatsrat die Geschäfte weiter, auch wenn die im Mandatsfrieden vorgesehene Übergangszeit abgelaufen ist.",
      "**Artikel 69** Der Mandatsrat berichtet alle fünf Jahre über den Stand der Friedensvertragsverhandlungen. Der Bericht wird veröffentlicht.",
      "**Artikel 70** Dieses Grundgesetz ist am Tage seiner Verkündung in Kraft getreten.",
      "**Artikel 71** Es verliert seine Gültigkeit an dem Tage, an dem ein Friedensvertrag mit dem Deutschen Reich in Kraft tritt und eine Verfassung in Kraft tritt, die von dem deutschen Volke in freier Entscheidung beschlossen worden ist.",
      "**Artikel 72** Bis zu diesem Tage gilt es fort.",
    ],
  },
  {
    id: "gg-aenderungsnachweis",
    shortTitle: "Änderungen",
    title: "Änderungsnachweis (1949 bis 1996)",
    body: [
      "| Nr. | Datum | Gegenstand",
      "| 1 | 14.03.1949 | Einfügung der Versorgungsplanung in Art. 12",
      "| 2 | 02.11.1950 | Fristenregelung, Art. 57",
      "| 3 | 19.06.1951 | Wohnraumzuteilung, Art. 13 Abs. 2",
      "| 4 | 08.04.1953 | Verwaltungsgerichtsbarkeit, Art. 51",
      "| 5 | 27.01.1954 | Betretungsrecht zur Wartung, Art. 13 Abs. 3",
      "| 6 | 11.09.1955 | Abschaffung der Todesstrafe, Art. 54",
      "| 7 | 30.05.1957 | Recht auf ärztliche Versorgung, Art. 14",
      "| 8 | 16.02.1958 | Verwaltungsvorbehalt an Grund und Boden, Art. 16",
      "| 9 | 05.12.1959 | Sektorgliederung, Art. 22",
      "| 10 | 21.07.1961 | Entsendungsdauer der Räte auf sechs Jahre",
      "| 11 | 03.03.1963 | Aktenaufbewahrung, Art. 59",
      "| 12 | 12.10.1964 | Zuständigkeitsvermutung, Art. 49 Abs. 2",
      "| 13 | 29.04.1966 | Berichtspflicht über Eingaben, Art. 38",
      "| 14 | 07.08.1967 | Schriftformerfordernis, Art. 48",
      "| 15 | 18.01.1969 | Freizügigkeit unter Versorgungsvorbehalt, Art. 11 Abs. 2",
      "| 16 | 25.11.1971 | Übernahme der Quadranten-Konvention, Art. 23",
      "| 17 | 09.06.1973 | Vorgangsprinzip, Art. 47",
      "| 18 | 14.02.1975 | Akteneinsicht, Art. 60",
      "| 19 | 22.09.1976 | Notverordnungsrecht, Art. 34",
      "| 20 | 06.05.1978 | Bewohnervertretungen, Art. 24",
      "| 21 | 31.10.1979 | Gleichberechtigung, Art. 3 Abs. 2 Satz 2",
      "| 22 | 17.03.1981 | Fernmeldegeheimnis, Neufassung Art. 10",
      "| 23 | 28.08.1982 | Begründungspflicht, Art. 56",
      "| 24 | 04.04.1984 | Bildungszugang nach Bedarf, Art. 7 Abs. 2",
      "| 25 | 03.10.1986 | Mandatsbundgesetz; Wegfall des Kontrollratsvorbehalts",
      "| 26 | 15.05.1988 | Unterrichtungsrecht der Mandatsmächte, Art. 20 Abs. 2",
      "| 27 | 20.01.1990 | Berichtspflicht Friedensvertrag, Art. 69",
      "| 28 | 11.11.1991 | Ordnung des Sendewesens, Art. 5 Abs. 2",
      "| 29 | 26.06.1993 | Fortgeltungsklausel, Art. 68",
      "| 30 | 08.02.1995 | Archivordnung, Art. 59 Satz 2",
      "| 31 | 01.01.1996 | Sektor-Reform; Anpassung der Art. 22, 23, 66",
      "Artikel 71 ist seit 1947 unverändert.",
    ],
  },
  {
    id: "gg-beilage",
    shortTitle: "Beilage",
    title: "Einliegendes Blatt (Handschrift)",
    body: [
      "Zwischen Seite 12 und 13 liegt ein kariertes Blatt, in Herberts kleiner Schrift beschrieben:",
      "",
      "„Art. 68 — 1993 eingefügt. Vorher stand da nichts, weil vorher niemand damit gerechnet hat.“",
      "„Art. 71 — nie geändert. Muß man auch nicht. Man muß ihn nur nicht anwenden.“",
      "„1947: Übergangszeit. 1997: immer noch Übergangszeit. Fünfzig Jahre sind eine Zeit, keine Übergangszeit.“",
      "",
      "Darunter, quer:",
      "",
      "„Das Bemerkenswerte an diesem Buch ist nicht, was drinsteht. Es ist, daß der Änderungsnachweis inzwischen länger ist als die Präambel.“",
    ],
  },
];

registerLibraryBook({
  id: "grundgesetz",
  title: "Grundgesetz für das Mandatsgebiet Mitteleuropa",
  subtitle: "Textausgabe mit Änderungsnachweis · 14., berichtigte Auflage · Stand 1. Januar 1996",
  author: "Mandatsrat, Abteilung Rechtsangelegenheiten (Hrsg.)",
  year: "1996",
  blurb:
    "Amtliche Textausgabe. In Kraft gesetzt 1947 durch den Alliierten Kontrollrat, gültig „für eine Übergangszeit“ — seither einunddreißig Änderungsgesetze.",
  chapters: grundgesetzChapters,
  uiText: LIBRARY_UI_TEXT,
  locationHint: "Bewohnerbibliothek 1101, Gebäude E71",
  lendable: true,
});
