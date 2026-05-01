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
    id: "herkunft",
    shortTitle: "Herkunft des Mandats",
    title: "Wie das Mandatsgebiet entstanden ist",
    body: [
      "Mitteleuropa hat eine lange, oft umständliche Geschichte. Der Almanach beschränkt sich auf die Linien, die **bis heute spürbar** sind, wenn Sie morgens Ihren Quadranten verlassen.",
      "Aus den Kriegen der ersten Jahrhunderthälfte ging Mitteleuropa **erschöpft** hervor. An die Stelle der alten Nationalstaaten trat 1946 eine **gemeinsame Verwaltung der vier Schutzmächte** — Vereinigte Staaten, Vereinigtes Königreich, Frankreich und Sowjetunion —, der **Mandatsrat**. Sein Auftrag war zunächst der Wiederaufbau, dann die Verstetigung.",
      "In den Jahren 1948 bis 1953 wurden die ersten **Quadranten** in den Trümmerfeldern errichtet, von Anfang an nach einem gemeinsamen geometrischen Raster. Wer heute durch einen Sektor geht, geht über Pläne, die in jenen Jahren gezeichnet wurden.",
      "Es ist eine Eigenart des Mandatsgebiets, dass es **kein Nationalstaat** ist und nie einer geworden ist. Das wirkt für Reisende ungewohnt; für Bewohner ist es selbstverständlich. Mehr dazu im Kapitel *„Wo Sie wohnen“*.",
    ],
  },
  {
    id: "korrespondenz",
    shortTitle: "Korrespondenz",
    title: "Die lange Korrespondenz (1948–1965)",
    body: [
      "Die Jahre nach dem Wiederaufbau gelten heute als die Zeit der **Korrespondenz**. Über die Grenzen der vier Schutzmächte hinweg entwickelte sich ein nüchterner, fast ein wenig beamtisch geführter Austausch in Wissenschaft, Verwaltung und Kultur.",
      "Statistiker reisten zwischen Stockholm, Prag und Lyon. Stadtplaner berieten einander von Sektor zu Sektor. Aus diesen Gesprächen sind die **internationalen Normen** hervorgegangen, die heute den Alltag im Mandatsgebiet tragen — von der Sozialversicherung über Industriemaße bis zum Postwesen.",
      "- **1953** — Erste gemeinsame Postkonferenz Wien.",
      "- **1956** — Reformkonferenz. Verabschiedung der Charta einer **gemischten Wirtschaftsordnung**, die staatliche Planung und privates Eigentum nebeneinander zulässt.",
      "- **1961** — Verabschiedung der *Pan-Europäischen Aktenzeichen-Norm* (PEAN). Sektor 28 führt sie 1963 ein.",
      "*Korrespondenz ist keine Freundschaft. Sie ist die geübte Höflichkeit von Verwaltungen, die nicht aufhören, miteinander zu schreiben.*",
    ],
  },
  {
    id: "konvention",
    shortTitle: "Konvention 1971",
    title: "Die Quadranten-Konvention von 1971",
    body: [
      "Im Frühjahr 1971 unterzeichneten Vertreter von rund dreißig Staaten in Bern ein technokratisches Abkommen, das die Welt nicht in Aufregung versetzte und sie gerade deshalb veränderte: die **Quadranten-Konvention**.",
      "Die Konvention vereinheitlichte Verwaltungsstrukturen über alle bisherigen Grenzen hinweg:",
      "- Adressen werden **Koordinaten** (Sektor / Quadrant / Etage / Wohnung).",
      "- Behörden werden **nummeriert**, nicht benannt.",
      "- Formulare folgen einem gemeinsamen Schema (PEAN-71).",
      "- Einheitliche Notrufnummern in allen Konventionsstaaten.",
      "Die Konvention gilt im Mandatsgebiet, in Skandinavien, in der Tschechoslowakei, in Teilen Polens und in den westlichen Verwaltungsbezirken der Sowjetunion. Einige Staaten — darunter die Vereinigten Staaten und die Volksrepublik China — sind ihr nicht beigetreten und führen eigene Standards.",
      "> Hinweis: Sollte Ihnen ein nicht-konventioniertes Formular in die Hand fallen, wundern Sie sich nicht über das ungewohnte Format. Bringen Sie es zur Leitstelle. Wir helfen.",
    ],
  },
  {
    id: "jahrzehnte",
    shortTitle: "1980–1996",
    title: "Jahrzehnte der Verstetigung (1980–1996)",
    body: [
      "Die 80er Jahre verliefen im Mandatsgebiet **ohne große Erschütterungen**. Manche bezeichnen diese Zeit als Stillstand, andere als die ersten Jahre echter Stabilität — der Almanach möchte das nicht entscheiden.",
      "**1986** wurde das Mandatsgebiet in einen **lockeren Staatenbund** umgewandelt. Der Mandatsrat zog sich aus der laufenden Verwaltung zurück; sein Apparat blieb unverändert in Funktion. Es bestand kein Anlass, ihn zu ändern.",
      "**1989** ging das **ZENTRAL.NETZ** in Betrieb, ein staatlich kuratiertes Verzeichnis- und Botensystem auf bernsteinfarbenen Terminals. Es löste die letzten verbliebenen Telex-Strecken ab. Das Betriebssystem heißt **CENTRALOS**.",
      "**1996 — Sektor-Reform.** Quadranten werden zu Sektoren zusammengefasst. Die alte Notrufnummer 002 wird abgeschafft (vgl. E67-Handbuch §3 Abs. 3). Das Bewohner-Kompendium erscheint in seiner 7. revidierten Fassung.",
      "*„Wir leben in einer Welt, in der wenig passieren muss. Manche finden das tröstlich. Andere weniger.“*",
    ],
  },
  {
    id: "geographie",
    shortTitle: "Wo Sie wohnen",
    title: "Wo Sie wohnen",
    body: [
      "Sie wohnen im **Mandatsgebiet Mitteleuropa** — seit 1986 ein selbstverwalteter Staatenbund, wirtschaftlich integriert und politisch bewusst klein gehalten.",
      "Das Mandatsgebiet erstreckt sich grob zwischen Rhein und Weichsel und umfasst die mitteleuropäischen Landschaften beiderseits der alten Mittelgebirge sowie die Donau-Region bis östlich von Wien. Eine genaue Karte hängt in jedem Postamt aus.",
      "Es ist **kein Nationalstaat**, sondern eine fortgeschriebene Verwaltungsordnung. Für viele Bewohner ist das gewöhnungsbedürftig; es hat aber den Vorteil, dass kaum jemand für etwas zuständig ist, was im Alltag stören würde.",
      "Ihr Quadrant **E67** liegt in **Sektor 28**. Sektor 28 zählt rund 700 Quadranten und gehört zu den älteren, dichter besiedelten Sektoren des Mandatsgebiets.",
      "**Jenseits des Mandatsgebiets** liegen die übrigen Konventionsstaaten — Skandinavien, die Tschechoslowakei, Teile Polens, die westlichen Verwaltungsbezirke der Sowjetunion — sowie nicht-konventionierte Regionen wie die Vereinigten Staaten oder die Volksrepublik China. Reisen ist möglich, aber selten und antragspflichtig.",
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
    shortTitle: "Technik im Alltag",
    title: "Technik im Alltag",
    body: [
      "Der Almanach gibt einen knappen Überblick über die Geräte, denen Sie in einem mitteleuropäischen Quadranten regelmäßig begegnen. Andere Geräte gibt es ebenfalls; sie spielen im Alltag aber selten eine Rolle.",
      "- **CENTRALOS / ZENTRAL.NETZ.** Das staatlich kuratierte Verzeichnis- und Botensystem auf bernsteinfarbenen Terminals. Zugang über die Terminal-Stationen in Postämtern und Verwaltungsstellen, in einzelnen Wohnungen auch privat.",
      "- **Festnetztelefon und Rohrpost.** Die beiden tragenden Säulen des Schriftverkehrs. Das Telefon für das Dringliche, die Rohrpost für das, was eine Unterschrift braucht.",
      "- **UKW-Radio, Tonband, Vinyl.** Die übliche Hör-Ausstattung. Bandkopien werden seit Jahrzehnten von Hand zu Hand weitergegeben.",
      "- **Fernsehen.** Schwarzweiß ist die Regel, Farbgeräte gibt es vereinzelt. Programm: drei Sektor-Kanäle und ein Konventions-Kanal.",
      "- **Solarpanels.** Auf den Sims- und Dachflächen vieler Quadranten. Reichen für rund 48 Stunden Notstrom.",
      "- **Heimcomputer.** Außerhalb der Bastlerkreise nicht weit verbreitet. Wer rechnet, geht ins Postamt oder zur Sektor-Verwaltung.",
      "*Es ist eine geordnete Technik. Sie hält, was auf ihr steht — und das oft länger, als ihre Hersteller versprochen haben.*",
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