# Neues Leihbuch: Das Grundgesetz des Mandatsgebiets Mitteleuropa

Herbert bekommt einen weiteren Titel in den Bestand: die amtliche Textausgabe des Grundgesetzes. Ausleihbar wie alle anderen Bücher, am Lesetisch lesbar, mit vollständigem Kapitelinhalt.

## Das Dokument

**Titel:** Grundgesetz für das Mandatsgebiet Mitteleuropa — Textausgabe mit Änderungsnachweis
**Herausgeber:** Mandatsrat, Abteilung Rechtsangelegenheiten
**Jahr:** 1996 (14., berichtigte Auflage)

Ton: kein Behörden-Klamauk, sondern nüchterne Gesetzessprache, wie eine echte Textausgabe. Die Komik entsteht allein daraus, dass ein Provisorium fünfzig Jahre lang fortgeschrieben wurde.

### Aufbau (Kapitel im Lesemodus)

1. **Vorbemerkung des Herausgebers** — kurze Einordnung: in Kraft gesetzt 1947 durch Proklamation Nr. 4 des Alliierten Kontrollrats, seither 31 Änderungsgesetze; seit 1986 ändert der Mandatsrat selbst.
2. **Präambel** — Parallele zum realen GG 1949: Das Grundgesetz gilt "für eine Übergangszeit", bis ein Friedensvertrag mit dem Deutschen Reich in Kraft getreten ist und sich das deutsche Volk in freier Entscheidung eine Verfassung gibt. Im Mandatsgebiet ist daraus eine Formel geworden, die niemand mehr streicht.
3. **I. Die Grundrechte** (Art. 1–17) — Menschenwürde, Freiheit der Person, Gleichheit, Glaube, Meinung, Versammlung, Petition. Östlicher Einschlag: Recht auf Arbeit, auf Wohnraum, auf Bildung, auf ärztliche Versorgung — jeweils "nach Maßgabe der Gesetze und im Rahmen der Versorgungsplanung". Eigentum ist gewährleistet, Grund und Boden sowie Wohnraum stehen unter Verwaltungsvorbehalt. Schrankenformeln wörtlich juristisch gebaut.
4. **II. Das Mandatsgebiet und seine Ordnung** (Art. 18–29) — Rechtsnatur als Provisorium, Verhältnis zu den vier Mandatsmächten, Verwaltungssprache Deutsch, Sektorengliederung, Fortgeltung älteren Rechts.
5. **III. Der Mandatsrat** (Art. 30–45) — Zusammensetzung, Verordnungsbefugnis, Verhältnis zur Bewohnervertretung; keine unmittelbare Volkswahl, sondern ein entsandtes Gremium.
6. **IV. Verwaltung und Rechtsweg** (Art. 46–60) — Behördenaufbau, Vorgangsprinzip, Widerspruch und Verwaltungsgericht, Fristen, Zuständigkeitsvermutung.
7. **V. Übergangs- und Schlussbestimmungen** (Art. 61–72) — Fortgeltungsklausel, Aufhebung des Kontrollratsvorbehalts 1986, die Kernbestimmung: Das Grundgesetz tritt außer Kraft an dem Tage, an dem eine von dem deutschen Volke in freier Entscheidung beschlossene Verfassung in Kraft tritt.
8. **Änderungsnachweis** — chronologische Liste der 31 Änderungsgesetze 1949–1996 in tabellarischer Form; sichtbar, wie aus dem Provisorium Dauerrecht wurde (u. a. 1971 Quadranten-Konvention, 1986 Ablösung des Kontrollratsvorbehalts, 1996 Sektor-Reform).
9. **Herberts Beilage** — ein einliegendes handschriftliches Blatt: Herbert hat sich notiert, in welchem Jahr welcher Artikel sein "vorläufig" verloren hat.

Lore-Bindung: Mandatsfrieden 1946, Vier-Mächte-Verwaltung, Kontrollrat bis 1986, Mandatsbund ab 1986, Quadranten-Konvention 1971, Sektor-Reform 1996. Keine Widersprüche zur bestehenden Chronologie.

## Technische Umsetzung

- `src/game/libraryE71Books.ts`: neuer Eintrag `grundgesetz` mit `itemId: "buchGrundgesetz"`, Kurzname "Grundgesetz (Leihbuch)", Katalogtext.
- `src/game/types.ts`: `buchGrundgesetz` zur `InventoryItemId`-Union hinzufügen.
- `src/game/books/libraryBooks.ts`: Kapitel-Array `grundgesetzChapters` und `registerLibraryBook({...})` analog zu den bestehenden Titeln, mit `LIBRARY_UI_TEXT`, `lendable: true`.
- Keine neuen Bilder (Textausgabe ohne Illustration) — alternativ auf Wunsch zwei generierte Abbildungen (Titelblatt, Stempelseite).
- Kein Eingriff in Dialoge oder Szenen: Herbert und der Lesetisch lesen `LIBRARY_BOOKS` automatisch.
