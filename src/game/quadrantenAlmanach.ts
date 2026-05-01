/**
 * Inhalt des "Quadranten-Almanach 1997, Bewohner-Ausgabe".
 *
 * Im Spiel auffindbar im Bücherregal von Layards Wohnung. In-Game-Pendant
 * zur Repo-Wahrheitsquelle `LORE.md`: enthält **nur**, was eine Figur
 * 1997 wissen würde, im bewohner-bürokratischen Tonfall.
 *
 * Bei Konflikten zwischen diesem Buch und `LORE.md` hat `LORE.md` Vorrang.
 * Die hier abgedruckten Texte dürfen Lore vereinfachen, aber nicht
 * widersprechen.
 */

import type { HandbookChapter } from "./e67Handbook";

export type AlmanachChapter = HandbookChapter;

export const ALMANACH_TITLE =
  "Quadranten-Almanach 1997 — Bewohner-Ausgabe";

export const ALMANACH_SUBTITLE =
  "Mandatsgebiet Mitteleuropa · 18. fortlaufend revidierte Auflage · zur freien Entnahme im Quadranten";

export const ALMANACH_UI_TEXT = {
  ariaLabel: "Quadranten-Almanach",
  closeLabel: "Almanach schließen",
  contents: "Inhalt",
  chaptersUnit: (n: number) => `${n} Kapitel`,
  edition: "18. rev. Auflage",
  pagerStart: "— Anfang —",
  pagerEnd: "— Ende —",
  pagerOf: (idx: number, total: number) => `Seite ${idx} / ${total}`,
  chapterSelectLabel: "Kapitel",
} as const;

export const ALMANACH_CHAPTERS: AlmanachChapter[] = [
  {
    id: "vorwort",
    shortTitle: "Vorwort",
    title: "Vorwort der Konvention",
    body: [
      "Der vorliegende Almanach erscheint seit 1972 in jährlich revidierter Auflage. Er versteht sich als **freundliche Orientierungshilfe** für Bewohner des Mandatsgebiets Mitteleuropa und der angeschlossenen Konventionsstaaten.",
      "Er ersetzt **nicht** das *Bewohner-Kompendium* (24 Bände, 1991, vergriffen) und auch nicht das **E67-Handbuch** Ihres Quadranten. Er beantwortet Fragen, die das Handbuch *nicht stellt*: woher die Welt kommt, in der Sie wohnen, und warum sie heute so geordnet ist.",
      "> Lesen Sie ihn in einer Sitzung — oder, was wir empfehlen, in vielen kleinen. Der Almanach hat Geduld.",
      "*„Wir sind nicht überall zuständig. Wir sind nur überall.“*",
      "— Geleitwort der Quadranten-Konvention, 7. revidierte Fassung",
    ],
  },
  {
    id: "divergenz",
    shortTitle: "1924 — Wende in Moskau",
    title: "1924 — Eine Personalentscheidung in Moskau",
    body: [
      "Im Januar 1924 starb in Moskau ein Mann, dessen Nachfolge das Jahrhundert geprägt hat: **Wladimir Iljitsch Uljanow**, genannt Lenin.",
      "Im innerparteilichen Verfahren, das auf seinen Tod folgte, setzte sich nicht der Generalsekretär Stalin durch, sondern **Nikolai Bucharin**, der Vertreter eines wirtschaftlich gemischten, kleinteilig geduldigen Sozialismus.",
      "Die *Neue Ökonomische Politik* wurde verlängert. Bäuerliches Eigentum blieb bestehen. Es kam **nicht** zu Zwangskollektivierungen großen Stils, **nicht** zu einem stalinistischen Lager-System, **nicht** zu den Säuberungen der 30er Jahre.",
      "Das hat zwei Folgen, die uns bis heute betreffen:",
      "- Erstens entwickelte sich die Sowjetunion langsamer und industriell schwächer als manche im Westen befürchtet hatten.",
      "- Zweitens — und das wirkt bis in jeden Quadranten hinein — fehlte dem westlichen Antikommunismus der **akute Schrecken**. Die Blöcke trieben nie ganz auseinander.",
      "*„Es ist nicht die Geduld des Apparats, die uns rettet. Es ist die Abwesenheit eines Schreckens, vor dem geflohen werden müsste.“* — Trotzki, 1939, in einem Brief nach London.",
    ],
  },
  {
    id: "krieg",
    shortTitle: "1939–1946",
    title: "1939–1946 — Krieg und Mandat",
    body: [
      "Über die Jahre 1939 bis 1946 ist viel geschrieben worden. Der vorliegende Almanach beschränkt sich auf das, was für das Verständnis der heutigen Verwaltungsordnung **unentbehrlich** ist.",
      "Der Krieg endete 1946. Mitteleuropa wurde unter eine **gemeinsame Vier-Mächte-Verwaltung** gestellt: Vereinigte Staaten, Vereinigtes Königreich, Frankreich und die Sowjetunion. Anders als zuvor erwartet wurde **keine harte Teilung** vereinbart, sondern ein einziges, gemeinsam verwaltetes Gebiet — das **Mandatsgebiet Mitteleuropa**.",
      "Die ersten Quadranten wurden zwischen 1948 und 1953 errichtet, zunächst in den Trümmerfeldern. Sie folgten von Anfang an einem gemeinsamen geometrischen Raster.",
      "> Der Krieg im Pazifik endete 1946 ohne den Einsatz von Kernwaffen. Diese Tatsache wird im internationalen Schriftverkehr bis heute mit Sorgfalt erwähnt.",
      "Auf nähere Schilderungen der Kriegshandlungen verzichtet der Almanach. Wer wissen möchte, was genau wo geschah, findet im **Sektor-Archiv** entsprechende Bände — auf Antrag, gegen Lichtbildausweis.",
    ],
  },
  {
    id: "korrespondenz",
    shortTitle: "Korrespondenz",
    title: "Die lange Korrespondenz (1948–1965)",
    body: [
      "Statt einer Frontstellung zwischen den Blöcken entwickelte sich, was Diplomaten beider Seiten **„Korrespondenz“** zu nennen begannen: ein semi-offizieller Austausch auf wissenschaftlicher, verwaltungstechnischer und kultureller Ebene.",
      "Statistiker reisten zwischen Moskau und Stockholm. Stadtplaner aus Prag berieten Kollegen in Lyon. Mehrere internationale Normen für Sozialversicherung, Industriemaße und Postwesen entstanden in diesen Jahren — viele davon werden heute noch verwendet.",
      "- **1953** — Erste gemeinsame Postkonferenz Wien.",
      "- **1956** — Reformkonferenz Leningrad. Die Sowjetunion verabschiedet eine Charta der Mischwirtschaft.",
      "- **1961** — Verabschiedung der *Pan-Europäischen Aktenzeichen-Norm* (PEAN). Sektor 28 führt sie 1963 ein.",
      "*Korrespondenz ist nicht Freundschaft, aber sie verhindert, dass aus Fremdheit Krieg wird.*",
    ],
  },
  {
    id: "konvention",
    shortTitle: "Konvention 1971",
    title: "Die Quadranten-Konvention von 1971",
    body: [
      "Im Frühjahr 1971 unterzeichneten Vertreter von rund dreißig Staaten in Bern ein technokratisches Abkommen, das die Welt nicht in Aufregung versetzte und sie gerade deshalb veränderte: die **Quadranten-Konvention**.",
      "Die Konvention vereinheitlichte Verwaltungsstrukturen über die alten Blockgrenzen hinweg:",
      "- Adressen werden **Koordinaten** (Sektor / Quadrant / Etage / Wohnung).",
      "- Behörden werden **nummeriert**, nicht benannt.",
      "- Formulare folgen einem gemeinsamen Schema (PEAN-71).",
      "- Einheitliche Notrufnummern in allen Konventionsstaaten.",
      "Die Konvention wurde im Mandatsgebiet, in Skandinavien, in der Tschechoslowakei und in Teilen der westlichen Sowjetunion umgesetzt. Die Vereinigten Staaten **traten der Konvention nicht bei** und entwickelten eigene Standards.",
      "> Hinweis: Wenn Sie ein amerikanisches Formular in die Hand bekommen, wundern Sie sich nicht — sie haben dort ein anderes System. Bringen Sie es zur Leitstelle. Wir helfen.",
    ],
  },
  {
    id: "stillstand",
    shortTitle: "1980–1996",
    title: "Stillstand als Stabilität (1980–1996)",
    body: [
      "Die 80er Jahre waren ruhig. Es war eine Ruhe, die manche heute als **Stillstand** bezeichnen — der Almanach möchte das nicht entscheiden.",
      "**1986** wurde das Mandatsgebiet in einen lockeren Staatenbund umgewandelt. Die vier Mandatsmächte traten formal zurück. Der Verwaltungsapparat blieb unverändert in Funktion. Niemandem fiel ein Grund ein, ihn zu ändern.",
      "**1989** wurde das **ZENTRAL.NETZ** in Betrieb genommen, ein staatlich kuratiertes Bote- und Verzeichnissystem auf bernsteinfarbenen Terminals. Es ersetzte die letzten verbliebenen Telex-Strecken. Das Betriebssystem heißt **CENTRALOS**.",
      "**1996 — Sektor-Reform.** Quadranten werden zu Sektoren zusammengefasst. Die alte Notrufnummer 002 wird abgeschafft (vgl. E67-Handbuch §3 Abs. 3). Das Bewohner-Kompendium erscheint in seiner 7. revidierten Fassung.",
      "*„Wir leben in einer Welt, in der nichts mehr passieren muss. Manche fühlen sich darin geborgen. Andere fühlen weniger.“*",
    ],
  },
  {
    id: "geographie",
    shortTitle: "Wo Sie wohnen",
    title: "Wo Sie wohnen",
    body: [
      "Sie wohnen im **Mandatsgebiet Mitteleuropa**. Das ist seit 1986 ein selbstverwalteter Staatenbund, der wirtschaftlich integriert und politisch bewusst klein gehalten ist.",
      "Das Mandatsgebiet umfasst, in heutigen Begriffen: das ehemalige Deutschland, Österreich, das Sudetenland, Teile des westlichen Polen sowie eine Reihe historisch zusammengehöriger Mittelgebirgsregionen.",
      "Es ist **kein Nationalstaat**. Es ist eine fortgeschriebene Verwaltungsordnung. Das ist für viele Bewohner gewöhnungsbedürftig; es hat aber den Vorteil, dass kaum jemand für etwas zuständig ist, was im Alltag stören würde.",
      "Ihr Quadrant **E67** liegt in **Sektor 28**. Sektor 28 zählt rund 700 Quadranten und gehört zu den älteren, dichter besiedelten Sektoren des Mandatsgebiets.",
      "**Außerhalb des Mandatsgebiets** existieren weitere Konventionsstaaten (Skandinavien, Tschechoslowakei, Teile Polens, Teile der Sowjetunion) sowie nicht-konventionierte Regionen (Vereinigte Staaten, China, große Teile des Globalen Südens). Reisen ist möglich, aber selten.",
    ],
  },
  {
    id: "alltag",
    shortTitle: "Alltag im Sektor",
    title: "Alltag im Sektor",
    body: [
      "Der Sektor versorgt Sie. Bitte versorgen Sie ihn ebenfalls.",
      "- **Bewohner-Ausweis:** stets bei sich tragen. Codiert nach §2 Abs. 7 des E67-Handbuchs.",
      "- **Nährpasten B1–B5:** Standardversorgung. B2 ist die staatlich empfohlene Tagesration. B3 schmeckt für viele besser; B5 nur auf Verschreibung.",
      "- **Schichten A/B/C:** Verwaltungs-Schichtmodell. Ihre Schicht entnehmen Sie Ihrem Ausweis.",
      "- **Telefon:** Bakelit-Apparat in der Wohnung. Notruf 001.",
      "- **Rohrpost:** für Schriftverkehr innerhalb des Sektors. Knotenpunkt im Postamt 28.",
      "- **ZENTRAL.NETZ-Terminal:** für Verzeichnisabfragen, Botenmail, Aktenzeichen-Suche.",
      "> Im Zweifel: höflich bleiben, langsam sprechen, das Aktenzeichen mitführen.",
    ],
  },
  {
    id: "tech",
    shortTitle: "Was es gibt",
    title: "Was es gibt — und was nicht",
    body: [
      "Der Almanach legt Wert auf Klarheit. Die folgende Tabelle erspart Rückfragen.",
      "| Es gibt | Es gibt nicht | Hinweis",
      "| CENTRALOS, ZENTRAL.NETZ | offenes Datennetz | Konvention 1971, Anhang VII",
      "| Festnetztelefon, Rohrpost | Mobiltelefone | Funkamateur-Geräte sind etwas anderes",
      "| UKW-Radio, Tonband, Vinyl | Streaming, Digitalmusik | siehe „Skurrile Geräte“",
      "| Schwarzweißfernsehen (vereinzelt Farbe) | private Satellitentechnik | dem Sektor vorbehalten",
      "| Solarpanels für Notstrom | Heimcomputer im Massenmarkt | Bastler ausgenommen",
      "| Bürokratische Druckerzeugnisse | private Kameras zur Massenüberwachung | dem Sektor vorbehalten",
      "*Was es nicht gibt, vermissen die meisten nicht. Was es gibt, schätzen viele zu wenig.*",
    ],
  },
  {
    id: "skurrile",
    shortTitle: "Skurrile Geräte",
    title: "Skurrile Geräte und Bastler-Hobbys",
    body: [
      "Ein Sektor ist mehr als seine Verwaltung. Der Almanach würdigt an dieser Stelle einige der freundlicheren **Bastler-Subkulturen**, die im Mandatsgebiet seit den 70er Jahren beheimatet sind.",
      "- **Rohrpost-Modellnetze.** Privatpersonen bauen in Kellern Miniatur-Rohrpoststrecken nach. Eigene Vereinszeitschriften, jährliches Treffen in Sektor 12.",
      "- **Sektor-Funk.** Amateurfunk auf den hierfür freigegebenen Frequenzbändern. Viele Quadrantendächer tragen heute eine selbstgebaute Antenne.",
      "- **Aktenvereine.** Sammler historischer Formulare, besonders solcher aus der Zeit vor der PEAN-71. Eine ernsthafte Subkultur.",
      "- **Schmerz-Radio.** Ein Funkgerät, das auf 104,6 MHz arbeitet und — nach Aussage seiner Hörer — *Empfindungen* überträgt, vorwiegend unangenehme. Erfunden Mitte der 70er vom Funkamateur **Cornel Marteau**. In den 80ern als „Therapie-Spielzeug“ kurz im Handel, danach vom Markt verschwunden. Geräte stehen heute bei wenigen Sonderlingen, in Trödelläden und gelegentlich in Bewohner-Wohnungen.",
      "> Hinweis zur **Resonanz-Hygiene** (das ist die offizielle Bezeichnung): wer Schmerz-Radio hört, sollte dies in Maßen tun. Bei *Resonanz-Überlastung* — also wenn Sie zu viel Fremdschmerz aufgenommen haben — ist die Sektorärztin zuständig, **nicht** die Leitstelle. Es handelt sich um einen medizinischen, keinen sicherheitsrelevanten Vorgang.",
      "Das Schmerz-Radio ist im Übrigen behördlich nicht reguliert. Es kommt in keinem Paragraphen vor. Es kommt auch in den meisten Wohnungen nicht vor.",
    ],
  },
  {
    id: "schluss",
    shortTitle: "Schlusswort",
    title: "Schlusswort",
    body: [
      "Der Almanach endet hier. Er endet, wie er begonnen hat: mit einem freundlichen Hinweis.",
      "Sie wohnen in einem Sektor, der Sie nicht braucht, der Sie aber ungern verlieren würde. Verwaltung ist die Form, in der diese Welt sich um Sie kümmert. Wenn Sie das anstrengend finden, sind Sie nicht allein. Wenn Sie das tröstlich finden, auch nicht.",
      "*„Wir wünschen Ihnen einen ruhigen Quadranten und eine geduldige Schicht.“*",
      "— Quadranten-Konvention, Geleitwort, 7. revidierte Fassung",
    ],
  },
];