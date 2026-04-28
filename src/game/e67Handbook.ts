/**
 * Inhalt des "E67-Handbuch (Auszug, 7. revidierte Fassung)".
 *
 * Tonfall: wohlwollend bürokratisch, mit Querverweisen auf Paragraphen,
 * die nicht alle abgedruckt sind. Wird vom HandbookOverlay als scrollbares
 * Buch mit Kapitelnavigation gerendert.
 */

export interface HandbookChapter {
  id: string;
  /** Kurzer Eintrag im Inhaltsverzeichnis. */
  shortTitle: string;
  /** Vollständige Überschrift im Lesebereich. */
  title: string;
  /**
   * Absätze des Kapitels. Inline-Markup (sehr sparsam):
   *   "**fett**" wird als <strong> gerendert, "*kursiv*" als <em>.
   *   Eine Zeile, die mit "- " beginnt, wird als Listeneintrag gerendert
   *   (mehrere aufeinanderfolgende „- “-Zeilen bilden eine Liste).
   *   Eine Zeile "> " ist ein eingerückter Hinweiskasten.
   *   Eine Zeile mit "|" am Anfang gehört zu einer einfachen Tabelle,
   *   genau drei Spalten, getrennt durch "|". Erste so beginnende Zeile in
   *   Folge ist die Kopfzeile.
   */
  body: string[];
}

export const HANDBOOK_TITLE =
  "E67-Handbuch — Auszug, 7. revidierte Fassung";

export const HANDBOOK_SUBTITLE =
  "Bewohner-Exemplar · bitte griffbereit halten · nicht im direkten Lichteinfall";

export const HANDBOOK_CHAPTERS: HandbookChapter[] = [
  {
    id: "p1",
    shortTitle: "§1 Willkommen",
    title: "§1 Willkommen in E67",
    body: [
      "Sie wohnen jetzt hier. Wir freuen uns.",
      "Bitte bewahren Sie dieses Heft griffbereit auf — am besten **sichtbar**, aber **nicht im direkten Lichteinfall** (siehe §17 Abs. 4 lit. b: Vergilbungsschutz).",
      "Dieses Heft ersetzt nicht das vollständige Bewohner-Kompendium (24 Bände, 1991, vergriffen), enthält aber „die für den Alltag wesentlichen 7 % der Regelungen“ (Vorwort der Leitstelle, gez. I. Bauerfeind).",
      "> Wenn Sie etwas Wichtiges nicht finden, ist es entweder in §B (Anhang) oder es war nie wichtig.",
    ],
  },
  {
    id: "p2",
    shortTitle: "§2 Bewohner-Ausweis",
    title: "§2 Der Bewohner-Ausweis",
    body: [
      "Der Bewohner-Ausweis ist Ihr wichtigstes Dokument. Bitte behandeln Sie ihn entsprechend.",
      "- Stets bei sich tragen — auch in der eigenen Wohnung („für den Fall der Fälle, den wir alle nicht herbeiwünschen“).",
      "- **Niemals knicken.** Ein geknickter Ausweis gilt nach §2 Abs. 3 als „eingeschränkt lesbar“ und führt zu einer freundlichen Erinnerung der Leitstelle.",
      "- Bei Verlust: 001 wählen, *nicht vor 09:30* und *nicht nach 16:45*. Außerhalb dieser Zeiten greift §11 (siehe dort, nicht abgedruckt).",
      "- Der Ausweis öffnet **alle Innentüren des Quadranten 26**, mit Ausnahme von Türen, die §6 unterstehen.",
      "**§2 Abs. 7 — Bewohner-Code.**",
      "Auf der Rückseite Ihres Ausweises ist ein 4-stelliger Bewohner-Code geprägt. Dieser ist im Regelfall identisch mit Ihrer **Wohnungsnummer modulo 10 000**, ausgenommen Wohnungen mit ungerader Quersumme; in diesen Fällen gilt der Code „Wohnungsnummer minus 1000“.",
      "> Hinweis: Sie können Ihren Code jederzeit auf der Rückseite Ihres Ausweises nachlesen. Eine Übermittlung per Telefon ist aus Sicherheitsgründen ausgeschlossen — selbst durch die Leitstelle.",
    ],
  },
  {
    id: "p3",
    shortTitle: "§3 Wann 001?",
    title: "§3 Wann wähle ich 001?",
    body: [
      "Die folgende Tabelle ist nicht abschließend. Im Zweifel: lieber freundlich gar nicht wählen als falsch.",
      "| Situation | 001 wählen? | Hinweis",
      "| Es klopft nebenan, niemand öffnet | Ja, sofern es **dreimal** klopft *und* länger als 20 Sekunden anhält. Bei nur zweimal: erst eigene Tür öffnen, freundlich rufen, dann ggf. wählen. | §3.1",
      "| Schmerz-Radio rauscht „auffällig harmonisch“ | Nein. Zeichen guter Resonanz-Hygiene. Bitte genießen. | §3.2 / §9",
      "| Ozongeruch im Treppenhaus | Erst Fenster (falls vorhanden) öffnen, dann **001**, **niemals zuerst 002** (002 existiert nicht mehr seit der Sektor-Reform 1996, vgl. §B). | §3.3",
      "| Aufzug bleibt zwischen Etagen stehen | **Nicht 001.** Dafür ist der gelbe Aufzugnotruf zuständig (gedrückt halten, nicht tippen). 001 erst, wenn der gelbe Knopf nach 4 Minuten nicht reagiert. | §3.4",
      "| Nachbar öffnet plötzlich nicht mehr | Ja, aber höflich. Bitte nicht „vermisst“ sagen — die Leitstelle bevorzugt „derzeit nicht erreichbar“. | §3.5",
      "| Sie selbst fühlen sich „nicht wie sich selbst“ | 001, ruhig sprechen, **nicht** das Wort „dringend“ verwenden — es löst eine andere Eskalationsstufe aus, die Sie vermutlich nicht möchten. | §3.6",
      "| Schleuse oder Innentür nimmt Ihren Code nicht an | **Nicht 001.** Lesen Sie §2 Abs. 7 erneut. Der Code steht auf Ihrem Ausweis. | §3.7",
      "*„Im Zweifel wählen Sie lieber gar nicht als falsch. Insa hört trotzdem zu.“*",
    ],
  },
  {
    id: "p4",
    shortTitle: "§4 Terminal",
    title: "§4 Terminal-Benutzung (CentralOS 2.3)",
    body: [
      "Ihr Wohnungsterminal ist ein freundliches Werkzeug. Sprechen Sie freundlich mit ihm.",
      "- Anmeldung: Bewohner-Code (siehe §2 Abs. 7), gefolgt von **Enter**, **nicht Return** (auf älteren Tastaturen identisch — bei neueren Geräten siehe §4 Abs. 9, nicht abgedruckt).",
      "- Befehle bitte **kleinschreiben**. Großbuchstaben werden „aus Höflichkeit toleriert, aber nicht garantiert ausgeführt“.",
      "- `help` ist Ihr Freund. `man` ist Ihr **älterer** Freund.",
      "- Mails der Leitstelle gelten als **gelesen, sobald sie zugestellt sind**, unabhängig davon, ob Sie sie tatsächlich gelesen haben (§4 Abs. 12 — die berühmte „Lesefiktion“).",
      "- `cancel` ist nur für Wartungsvorgänge gedacht. Verwenden Sie es **nicht** auf eigenen Kalendereinträgen — das ergäbe „eine philosophisch unklare Situation“ (§4 Abs. 17).",
      "> Bei Eingabefehlern: Drei Sekunden warten. Das Terminal verzeiht alles, was es nicht versteht.",
    ],
  },
  {
    id: "p5",
    shortTitle: "§5 Kantine 26",
    title: "§5 Kantine 26 — Öffnungs- und Schließzeiten",
    body: [
      "Die Kantine 26 versorgt den Quadranten zuverlässig zu folgenden Zeiten:",
      "- Mo–Do: **11:30–13:45** und **17:30–19:00**.",
      "- Fr: **11:30–13:15** (verkürzt wegen Reinigung der B2-Linie).",
      "- Sa/So: **geschlossen** (Beschluss der Bewohnerversammlung 11/1996, bestätigt 11/1997).",
      "**Ausnahmetage.** Jeder zweite Mittwoch im Monat, sofern dieser nicht auf einen Feiertag fällt — dann gilt der **darauffolgende Donnerstag** als Ausnahmetag, sofern dieser nicht selbst ein Ausnahmetag wäre, in welchem Fall §5 Abs. 6 lit. d greift (nicht abgedruckt).",
      "**Mitbringen erlaubt:** eigene Tasse („1 Stück, nicht mehr“).",
      "**Mitbringen verboten:** eigenes Besteck (aus „Resonanz-Hygiene-Gründen“, vgl. §9).",
      "> Bitte sprechen Sie an den B2-Automaten leise. Die Geräte „bevorzugen es so“.",
    ],
  },
  {
    id: "p6",
    shortTitle: "§6 Türen & Schleusen",
    title: "§6 Türen, Schleusen und Sektorgrenzen",
    body: [
      "Nicht jede Tür ist gleich. Bitte beachten Sie:",
      "- **Innentüren Quadrant 26:** Bewohner-Ausweis genügt.",
      "- **Sektorschleuse E67 → E71:** Manueller Code, 8-stellig, einmalig durch die Leitstelle vergeben (vgl. §6 Abs. 4 — *„Bringschuld der Bewohnerin/des Bewohners“*).",
      "- **Wartungstüren (5er-Etage):** Wartungskarte, **kein** Bewohnerzugang.",
      "**§6 Abs. 9 — Lobby-Schleuse Etage 1.** Im **Tagesmodus** (werktags 06:00–22:00) gilt: Bewohner-Ausweis **zusätzlich** Eingabe des Bewohner-Codes (§2 Abs. 7). Außerhalb dieser Zeit (Nachtmodus) genügt der Ausweis allein.",
      "> Die Schleuse ist freundlich, aber unnachgiebig. Sie weist Sie höflich zurück, sollten Ausweis oder Code fehlen. Sie hat keine Eile.",
      "**§6 Abs. 12 — Eskalation.** Nach **drei** fehlerhaften Eingaben innerhalb von 60 Sekunden meldet die Schleuse den Vorgang automatisch an die Leitstelle. Diese ruft Sie ggf. persönlich zurück. Bitte unterbrechen Sie diesen Rückruf nicht.",
    ],
  },
  {
    id: "p7",
    shortTitle: "§7 Resonanz-Hygiene",
    title: "§7 Resonanz-Hygiene",
    body: [
      "Bitte verbreiten Sie „auffällig harmonische Geräusche“ nicht weiter. Diese stehen dem **Quadranten** zu, nicht dem Einzelnen.",
      "Empfohlen: max. 2 Stunden tägliche Nutzung des Schmerz-Radios. Empfehlung — keine Pflicht.",
      "> *„Hören Sie länger, hören Sie dünner.“* — Stadtwerke-Plakat, 1994.",
    ],
  },
  {
    id: "p8",
    shortTitle: "§8 Versammlung",
    title: "§8 Bewohnerversammlung",
    body: [
      "Die Bewohnerversammlung findet **bei Bedarf** statt. Bedarf wird durch die Leitstelle festgestellt.",
      "Ergebnisse werden im Schwarzen Brett der Lobby ausgehängt — sofern Aushangkapazität verfügbar ist.",
    ],
  },
  {
    id: "pB",
    shortTitle: "§B Begriffe",
    title: "Anhang B — Begriffe, die in diesem Heft nicht mehr verwendet werden",
    body: [
      "- *„Notfall“* — ersetzt durch „Anliegen erhöhter Priorität“.",
      "- *„allein“* — ersetzt durch „vorübergehend ohne sichtbare Begleitung“.",
      "- *„002“* — existiert nicht mehr.",
      "- *„Stille“* — ohne Ersatz.",
      "> Diese Liste wird laufend erweitert. Eine Erweiterung gilt rückwirkend ab dem Zeitpunkt, an dem sie hätte gelten sollen.",
    ],
  },
  {
    id: "pNote",
    shortTitle: "Letzte Seite",
    title: "Letzte Seite — handschriftlich",
    body: [
      "Auf der Innenseite des Rückumschlags hat jemand mit Bleistift, in eckiger Handschrift, notiert:",
      "> §6 Abs. 4: „Bringschuld“. Heißt: keiner schickt dir den Code. Du musst fragen. Insa fragt nie zurück.",
      "> §6 Abs. 9: Schleuse Lobby. Code steht auf der Karte. Hat sie schon damals immer vergessen.",
      "> §6 Abs. 12: Drei Mal falsch und sie ruft an. Klingt schlimmer als es ist. Sie ist freundlich.",
      "Darunter, in einer anderen, runderen Handschrift, eilig:",
      "> P. — wenn du das hier liest: §3.6 ist ernst gemeint. Sag nicht „dringend“. — B.",
    ],
  },
];
